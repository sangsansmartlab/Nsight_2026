import dotenv from 'dotenv';
dotenv.config();

export interface KeyStatus {
  id: number;
  envVar: string;
  isConfigured: boolean;
  maskedKey: string;
  requestCount: number;
  rateLimitCount: number;
  isCoolingDown: boolean;
  cooldownUntil: number;
}

class GroqKeyPoolManager {
  private keySlots: {
    id: number;
    envVar: string;
    key: string;
    requestCount: number;
    rateLimitCount: number;
    cooldownUntil: number;
  }[] = [];

  private currentIndex: number = 0;

  constructor() {
    this.initKeys();
  }

  public initKeys() {
    this.keySlots = [];
    const envVarNames = [
      'GROQ_API_KEY_1',
      'GROQ_API_KEY_2',
      'GROQ_API_KEY_3',
      'GROQ_API_KEY_4',
      'GROQ_API_KEY_5'
    ];

    envVarNames.forEach((envVar, idx) => {
      const rawKey = (process.env[envVar] || '').trim();
      this.keySlots.push({
        id: idx + 1,
        envVar,
        key: rawKey,
        requestCount: 0,
        rateLimitCount: 0,
        cooldownUntil: 0
      });
    });

    // Fallback: If only GROQ_API_KEY exists, fill in slot 1
    const defaultKey = (process.env.GROQ_API_KEY || '').trim();
    if (defaultKey && !this.keySlots[0].key) {
      this.keySlots[0].key = defaultKey;
    }
  }

  /**
   * Retrieves the next available Groq API key using Round-Robin scheduling with cooldown check
   */
  public getNextKey(): { key: string; slotId: number } | null {
    const configuredSlots = this.keySlots.filter((slot) => slot.key.length > 0);
    if (configuredSlots.length === 0) {
      return null;
    }

    const now = Date.now();
    // Try to find an available slot starting from currentIndex
    for (let i = 0; i < configuredSlots.length; i++) {
      const candidateSlot = configuredSlots[(this.currentIndex + i) % configuredSlots.length];
      if (candidateSlot.cooldownUntil <= now) {
        this.currentIndex = (this.currentIndex + i + 1) % configuredSlots.length;
        candidateSlot.requestCount += 1;
        return { key: candidateSlot.key, slotId: candidateSlot.id };
      }
    }

    // If all configured keys are in cooldown, pick the one with earliest cooldown expiry
    const earliestSlot = configuredSlots.reduce((prev, curr) =>
      prev.cooldownUntil < curr.cooldownUntil ? prev : curr
    );
    earliestSlot.requestCount += 1;
    return { key: earliestSlot.key, slotId: earliestSlot.id };
  }

  /**
   * Marks a specific key as rate-limited (HTTP 429) and puts it into cooldown for 60 seconds
   */
  public reportRateLimit(slotId: number, cooldownSeconds = 60) {
    const slot = this.keySlots.find((s) => s.id === slotId);
    if (slot) {
      slot.rateLimitCount += 1;
      slot.cooldownUntil = Date.now() + cooldownSeconds * 1000;
      console.warn(`[GroqKeyManager] Key Slot #${slotId} hit rate limit. Cooling down for ${cooldownSeconds}s.`);
    }
  }

  /**
   * Returns metadata and health status of all 5 key slots (Keys are securely masked)
   */
  public getStatus(): KeyStatus[] {
    const now = Date.now();
    return this.keySlots.map((slot) => {
      const isConfigured = slot.key.length > 5;
      const maskedKey = isConfigured
        ? `${slot.key.substring(0, 4)}...${slot.key.slice(-4)}`
        : 'Not Set';

      return {
        id: slot.id,
        envVar: slot.envVar,
        isConfigured,
        maskedKey,
        requestCount: slot.requestCount,
        rateLimitCount: slot.rateLimitCount,
        isCoolingDown: slot.cooldownUntil > now,
        cooldownUntil: slot.cooldownUntil
      };
    });
  }

  public getConfiguredCount(): number {
    return this.keySlots.filter((slot) => slot.key.length > 0).length;
  }
}

export const groqKeyManager = new GroqKeyPoolManager();
