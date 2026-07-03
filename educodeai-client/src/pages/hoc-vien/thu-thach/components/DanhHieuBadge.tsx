import { useId } from 'react';
import { layStyleDanhHieu, layTierTuMaCode } from '../danhHieuTheme';

interface DanhHieuBadgeProps {
  maCode: string;
  size?: number;
  locked?: boolean;
  className?: string;
}

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    const b = ((i * 72 - 90 + 36) * Math.PI) / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} ${cx + r * 0.42 * Math.cos(b)},${cy + r * 0.42 * Math.sin(b)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} />;
}

function Hex({ cx, cy, r, fill, stroke, sw = 1.5 }: {
  cx: number; cy: number; r: number; fill: string; stroke: string; sw?: number;
}) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 30) * Math.PI) / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
}

function SpikeHex({ cx, cy, r, fill, stroke, sw = 1.5 }: {
  cx: number; cy: number; r: number; fill: string; stroke: string; sw?: number;
}) {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const rad = i % 2 === 0 ? r : r * 0.72;
    const a = ((30 * i - 30) * Math.PI) / 180;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
}

function Laurel({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round">
      <path d={`M${cx - 14} ${cy + 6} Q${cx - 10} ${cy + 2} ${cx - 6} ${cy + 4}`} />
      <path d={`M${cx - 12} ${cy + 10} Q${cx - 8} ${cy + 6} ${cx - 4} ${cy + 8}`} />
      <path d={`M${cx + 14} ${cy + 6} Q${cx + 10} ${cy + 2} ${cx + 6} ${cy + 4}`} />
      <path d={`M${cx + 12} ${cy + 10} Q${cx + 8} ${cy + 6} ${cx + 4} ${cy + 8}`} />
    </g>
  );
}

function Gem({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.28} fill="rgba(255,255,255,0.55)" />
    </>
  );
}

function Wings({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g fill={color} opacity={0.92}>
      <path d={`M${cx - 10} ${cy} Q${cx - 28} ${cy - 18} ${cx - 30} ${cy + 4} Q${cx - 22} ${cy + 8} ${cx - 10} ${cy + 6} Z`} />
      <path d={`M${cx + 10} ${cy} Q${cx + 28} ${cy - 18} ${cx + 30} ${cy + 4} Q${cx + 22} ${cy + 8} ${cx + 10} ${cy + 6} Z`} />
    </g>
  );
}

function Crown({ cx, cy, fill, stroke }: { cx: number; cy: number; fill: string; stroke: string }) {
  return (
    <path
      d={`M${cx - 12} ${cy + 4} L${cx - 8} ${cy - 6} L${cx - 4} ${cy + 1} L${cx} ${cy - 10} L${cx + 4} ${cy + 1} L${cx + 8} ${cy - 6} L${cx + 12} ${cy + 4} Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  );
}

function Banner({ cx, cy, fill, ribbon }: { cx: number; cy: number; fill: string; ribbon: string }) {
  return (
    <g>
      <path d={`M${cx - 7} ${cy} L${cx + 7} ${cy} L${cx + 5} ${cy + 10} L${cx} ${cy + 14} L${cx - 5} ${cy + 10} Z`} fill={fill} />
      <path d={`M${cx} ${cy + 14} L${cx} ${cy + 22}`} stroke={ribbon} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy + 23} r={2.2} fill={ribbon} />
    </g>
  );
}

function TierArt({
  tier,
  palette,
  idPrefix,
}: {
  tier: number;
  palette: ReturnType<typeof layStyleDanhHieu>;
  idPrefix: string;
}) {
  const cx = 40;
  const cy = 42;
  const dark = palette.icon;
  const mid = palette.accent;
  const light = palette.glow;
  const fillId = `${idPrefix}-fill-${tier}`;
  const glowId = `${idPrefix}-glow-5`;
  const fill = `url(#${fillId})`;

  return (
    <>
      <defs>
        <linearGradient id={fillId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        {tier >= 5 && (
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {tier >= 5 && (
        <circle cx={cx} cy={cy} r={30} fill={light} opacity={0.22} filter={`url(#${glowId})`} />
      )}

      {tier >= 5 && <Wings cx={cx} cy={cy - 2} color={mid} />}
      {tier >= 4 && <Laurel cx={cx} cy={cy + 10} color={dark} />}
      {tier >= 3 && <Laurel cx={cx} cy={cy + 12} color={mid} />}

      {tier === 1 && <Hex cx={cx} cy={cy} r={18} fill={fill} stroke={mid} />}
      {tier === 2 && <SpikeHex cx={cx} cy={cy} r={20} fill={fill} stroke={mid} />}
      {tier >= 3 && <SpikeHex cx={cx} cy={cy} r={20} fill={fill} stroke={mid} sw={2} />}

      {tier >= 4 && <Gem cx={cx} cy={cy - 24} r={3.5} fill={light} />}
      {tier >= 4 && <Gem cx={cx} cy={cy + 22} r={3} fill={light} />}
      {tier >= 5 && <Gem cx={cx} cy={cy + 2} r={2.2} fill={light} />}

      <Star cx={cx} cy={cy + 1} r={tier >= 5 ? 9 : tier >= 3 ? 8 : 7} fill="rgba(255,255,255,0.92)" />

      {tier >= 5 && <Crown cx={cx} cy={cy - 22} fill={light} stroke={dark} />}
      {tier >= 4 && <Banner cx={cx} cy={cy + 24} fill={mid} ribbon={light} />}

      {tier >= 5 && (
        <>
          <circle cx={cx - 20} cy={cy - 18} r={1.2} fill="#fff" opacity={0.9} />
          <circle cx={cx + 22} cy={cy - 14} r={1} fill="#fff" opacity={0.8} />
          <circle cx={cx + 16} cy={cy - 24} r={1.4} fill="#fff" opacity={0.85} />
        </>
      )}
    </>
  );
}

export default function DanhHieuBadge({
  maCode,
  size = 48,
  locked = false,
  className = '',
}: DanhHieuBadgeProps) {
  const uid = useId().replace(/:/g, '');
  const tier = layTierTuMaCode(maCode);
  const palette = layStyleDanhHieu(maCode);

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`tt-danh-hieu-badge${locked ? ' tt-danh-hieu-badge--locked' : ''} ${className}`.trim()}
      aria-hidden
    >
      <TierArt tier={tier} palette={palette} idPrefix={`bh-${uid}`} />
    </svg>
  );
}
