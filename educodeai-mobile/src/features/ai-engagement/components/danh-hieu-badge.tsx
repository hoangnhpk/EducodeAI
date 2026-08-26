import React, { useId, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Polygon,
  Stop,
} from 'react-native-svg';
import { layStyleDanhHieu, layTierTuMaCode, type DanhHieuPalette } from './danh-hieu-theme';

interface DanhHieuBadgeProps {
  maCode: string;
  size?: number;
  locked?: boolean;
}

function starPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    const b = ((i * 72 - 90 + 36) * Math.PI) / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} ${cx + r * 0.42 * Math.cos(b)},${cy + r * 0.42 * Math.sin(b)}`;
  }).join(' ');
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 30) * Math.PI) / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
}

function spikeHexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 12 }, (_, i) => {
    const rad = i % 2 === 0 ? r : r * 0.72;
    const a = ((30 * i - 30) * Math.PI) / 180;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(' ');
}

function TierArt({
  tier,
  palette,
  idPrefix,
}: {
  tier: number;
  palette: DanhHieuPalette;
  idPrefix: string;
}) {
  const cx = 40;
  const cy = 42;
  const dark = palette.icon;
  const mid = palette.accent;
  const light = palette.glow;
  const fillId = `${idPrefix}-fill`;

  return (
    <>
      <Defs>
        <LinearGradient id={fillId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={light} />
          <Stop offset="55%" stopColor={mid} />
          <Stop offset="100%" stopColor={dark} />
        </LinearGradient>
      </Defs>

      {tier >= 5 && <Circle cx={cx} cy={cy} r={30} fill={light} opacity={0.22} />}

      {tier >= 5 && (
        <G fill={mid} opacity={0.92}>
          <Path d={`M${cx - 10} ${cy} Q${cx - 28} ${cy - 18} ${cx - 30} ${cy + 4} Q${cx - 22} ${cy + 8} ${cx - 10} ${cy + 6} Z`} />
          <Path d={`M${cx + 10} ${cy} Q${cx + 28} ${cy - 18} ${cx + 30} ${cy + 4} Q${cx + 22} ${cy + 8} ${cx + 10} ${cy + 6} Z`} />
        </G>
      )}

      {tier >= 4 && (
        <G fill="none" stroke={dark} strokeWidth={1.4} strokeLinecap="round">
          <Path d={`M${cx - 14} ${cy + 16} Q${cx - 10} ${cy + 12} ${cx - 6} ${cy + 14}`} />
          <Path d={`M${cx - 12} ${cy + 20} Q${cx - 8} ${cy + 16} ${cx - 4} ${cy + 18}`} />
          <Path d={`M${cx + 14} ${cy + 16} Q${cx + 10} ${cy + 12} ${cx + 6} ${cy + 14}`} />
          <Path d={`M${cx + 12} ${cy + 20} Q${cx + 8} ${cy + 16} ${cx + 4} ${cy + 18}`} />
        </G>
      )}

      {tier >= 3 && tier < 4 && (
        <G fill="none" stroke={mid} strokeWidth={1.4} strokeLinecap="round">
          <Path d={`M${cx - 14} ${cy + 18} Q${cx - 10} ${cy + 14} ${cx - 6} ${cy + 16}`} />
          <Path d={`M${cx - 12} ${cy + 22} Q${cx - 8} ${cy + 18} ${cx - 4} ${cy + 20}`} />
          <Path d={`M${cx + 14} ${cy + 18} Q${cx + 10} ${cy + 14} ${cx + 6} ${cy + 16}`} />
          <Path d={`M${cx + 12} ${cy + 22} Q${cx + 8} ${cy + 18} ${cx + 4} ${cy + 20}`} />
        </G>
      )}

      {tier === 1 && (
        <Polygon points={hexPoints(cx, cy, 18)} fill={`url(#${fillId})`} stroke={mid} strokeWidth={1.5} />
      )}
      {tier === 2 && (
        <Polygon points={spikeHexPoints(cx, cy, 20)} fill={`url(#${fillId})`} stroke={mid} strokeWidth={1.5} />
      )}
      {tier >= 3 && (
        <Polygon points={spikeHexPoints(cx, cy, 20)} fill={`url(#${fillId})`} stroke={mid} strokeWidth={2} />
      )}

      {tier >= 4 && (
        <>
          <Circle cx={cx} cy={cy - 24} r={3.5} fill={light} />
          <Circle cx={cx - 0.9} cy={cy - 24.9} r={1} fill="rgba(255,255,255,0.55)" />
          <Circle cx={cx} cy={cy + 22} r={3} fill={light} />
          <Circle cx={cx - 0.75} cy={cy + 21.25} r={0.85} fill="rgba(255,255,255,0.55)" />
        </>
      )}
      {tier >= 5 && (
        <Circle cx={cx} cy={cy + 2} r={2.2} fill={light} />
      )}

      <Polygon
        points={starPoints(cx, cy + 1, tier >= 5 ? 9 : tier >= 3 ? 8 : 7)}
        fill="rgba(255,255,255,0.92)"
      />

      {tier >= 5 && (
        <Path
          d={`M${cx - 12} ${cy - 18} L${cx - 8} ${cy - 28} L${cx - 4} ${cy - 21} L${cx} ${cy - 32} L${cx + 4} ${cy - 21} L${cx + 8} ${cy - 28} L${cx + 12} ${cy - 18} Z`}
          fill={light}
          stroke={dark}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      )}

      {tier >= 4 && (
        <G>
          <Path
            d={`M${cx - 7} ${cy + 24} L${cx + 7} ${cy + 24} L${cx + 5} ${cy + 34} L${cx} ${cy + 38} L${cx - 5} ${cy + 34} Z`}
            fill={mid}
          />
          <Path
            d={`M${cx} ${cy + 38} L${cx} ${cy + 46}`}
            stroke={light}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Circle cx={cx} cy={cy + 47} r={2.2} fill={light} />
        </G>
      )}

      {tier >= 5 && (
        <>
          <Circle cx={cx - 20} cy={cy - 18} r={1.2} fill="#fff" opacity={0.9} />
          <Circle cx={cx + 22} cy={cy - 14} r={1} fill="#fff" opacity={0.8} />
          <Circle cx={cx + 16} cy={cy - 24} r={1.4} fill="#fff" opacity={0.85} />
        </>
      )}
    </>
  );
}

/** Huy hiệu SVG — khớp web `DanhHieuBadge.tsx`. */
export function DanhHieuBadge({ maCode, size = 48, locked = false }: DanhHieuBadgeProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const idPrefix = useMemo(() => `bh-${rawId}`, [rawId]);
  const tier = layTierTuMaCode(maCode);
  const palette = layStyleDanhHieu(maCode);

  return (
    <View style={[styles.wrap, locked && styles.locked, { width: size, height: size }]}>
      <Svg viewBox="0 0 80 80" width={size} height={size}>
        <TierArt tier={tier} palette={palette} idPrefix={idPrefix} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  locked: { opacity: 0.35 },
});
