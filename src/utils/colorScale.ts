// Continuous Color Scale and Numerical Criteria Engine for NSight 4D Mapping

export interface ColorScaleResult {
  hex: string;
  label: string;
  category: string;
  intensity: '강' | '중' | '약' | '중립';
  score: number;
}

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function lerpRgb(hex1: string, hex2: string, t: number): string {
  const factor = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = r1 + (r2 - r1) * factor;
  const g = g1 + (g2 - g1) * factor;
  const b = b1 + (b2 - b1) * factor;
  return rgbToHex(r, g, b);
}

/**
 * Maps a continuous score (-1.0 ~ +1.0) into a continuous gradient color
 * ensuring that different magnitudes with the same sign produce distinctly different hues.
 */
export function getContinuousColor(score: number, isPolitics: boolean): ColorScaleResult {
  const clamped = Math.max(-1.0, Math.min(1.0, Number(score) || 0));

  if (isPolitics) {
    let hex = '#FFFFFF';
    let label = '중립/중도';
    let category = '중립';
    let intensity: '강' | '중' | '약' | '중립' = '중립';

    if (clamped < -0.08) {
      category = '진보';
      if (clamped <= -0.6) {
        intensity = '강';
        // [-1.0, -0.6] -> #1E3A8A (Deep Navy Blue) to #2563EB (Vivid Royal Blue)
        const t = (clamped - -1.0) / 0.4;
        hex = lerpRgb('#1E3A8A', '#2563EB', t);
        label = `진보 성향 (강, ${clamped.toFixed(2)})`;
      } else if (clamped <= -0.25) {
        intensity = '중';
        // [-0.6, -0.25] -> #2563EB to #60A5FA (Sky Blue)
        const t = (clamped - -0.6) / 0.35;
        hex = lerpRgb('#2563EB', '#60A5FA', t);
        label = `진보 성향 (중, ${clamped.toFixed(2)})`;
      } else {
        intensity = '약';
        // [-0.25, -0.08] -> #60A5FA to #BFDBFE (Light Pastel Ice Blue)
        const t = (clamped - -0.25) / 0.17;
        hex = lerpRgb('#60A5FA', '#E0F2FE', t);
        label = `온건 진보 (약, ${clamped.toFixed(2)})`;
      }
    } else if (clamped > 0.08) {
      category = '보수';
      if (clamped >= 0.6) {
        intensity = '강';
        // [0.6, 1.0] -> #DC2626 (Vivid Red) to #991B1B (Deep Crimson)
        const t = (clamped - 0.6) / 0.4;
        hex = lerpRgb('#DC2626', '#991B1B', t);
        label = `보수 성향 (강, +${clamped.toFixed(2)})`;
      } else if (clamped >= 0.25) {
        intensity = '중';
        // [0.25, 0.6] -> #F87171 to #DC2626
        const t = (clamped - 0.25) / 0.35;
        hex = lerpRgb('#F87171', '#DC2626', t);
        label = `보수 성향 (중, +${clamped.toFixed(2)})`;
      } else {
        intensity = '약';
        // [0.08, 0.25] -> #FFE4E6 to #F87171
        const t = (clamped - 0.08) / 0.17;
        hex = lerpRgb('#FFE4E6', '#F87171', t);
        label = `온건 보수 (약, +${clamped.toFixed(2)})`;
      }
    } else {
      // Near Zero [-0.08, 0.08] -> Near Pure Crisp White
      intensity = '중립';
      hex = '#FFFFFF';
      label = `중립/중도 (${clamped >= 0 ? '+' : ''}${clamped.toFixed(2)})`;
    }

    return { hex, label, category, intensity, score: clamped };
  }

  // General / Economy / Tech domain gradient:
  // Negative (-1.0 ~ 0): Red/Coral gradient based on magnitude
  // Neutral (0): Crisp White
  // Positive (0 ~ +1.0): Emerald/Green gradient based on magnitude
  let hex = '#FFFFFF';
  let label = '중립/기준';
  let category = '중립';
  let intensity: '강' | '중' | '약' | '중립' = '중립';

  if (clamped < -0.08) {
    category = '우려/부정';
    if (clamped <= -0.6) {
      intensity = '강';
      const t = (clamped - -1.0) / 0.4;
      hex = lerpRgb('#991B1B', '#DC2626', t);
      label = `규제/악재 (강, ${clamped.toFixed(2)})`;
    } else if (clamped <= -0.25) {
      intensity = '중';
      const t = (clamped - -0.6) / 0.35;
      hex = lerpRgb('#DC2626', '#F87171', t);
      label = `규제/우려 (중, ${clamped.toFixed(2)})`;
    } else {
      intensity = '약';
      const t = (clamped - -0.25) / 0.17;
      hex = lerpRgb('#F87171', '#FFE4E6', t);
      label = `경미한 우려 (약, ${clamped.toFixed(2)})`;
    }
  } else if (clamped > 0.08) {
    category = '진흥/긍정';
    if (clamped >= 0.6) {
      intensity = '강';
      const t = (clamped - 0.6) / 0.4;
      hex = lerpRgb('#059669', '#064E3B', t);
      label = `진흥/호재 (강, +${clamped.toFixed(2)})`;
    } else if (clamped >= 0.25) {
      intensity = '중';
      const t = (clamped - 0.25) / 0.35;
      hex = lerpRgb('#34D399', '#059669', t);
      label = `진흥/호재 (중, +${clamped.toFixed(2)})`;
    } else {
      intensity = '약';
      const t = (clamped - 0.08) / 0.17;
      hex = lerpRgb('#ECFDF5', '#34D399', t);
      label = `온건 호재 (약, +${clamped.toFixed(2)})`;
    }
  } else {
    intensity = '중립';
    hex = '#FFFFFF';
    label = `중립/기준 (${clamped >= 0 ? '+' : ''}${clamped.toFixed(2)})`;
  }

  return { hex, label, category, intensity, score: clamped };
}

/**
 * Checks if the current axes configuration is politics domain
 */
export function isPoliticsDomain(colorAxis?: string, xAxis?: string): boolean {
  const text = `${colorAxis || ''} ${xAxis || ''}`;
  return text.includes('보수') || text.includes('진보') || text.includes('정치') || text.includes('정당');
}
