import { Position, type Edge, type Node } from '@xyflow/react';
import type { SkillTreeEdge, SkillTreeNode } from '@/services/khong-gian-hoc-tap.service';

export const SKILL_NODE_WIDTH = 220;
export const SKILL_NODE_HEIGHT = 96;

const V_GAP = 128;
/** Lệch ngang nhẹ — đủ tạo đường S, không gây chéo dây */
const SIDE_OFFSET = 155;

export type CourseNodeData = {
  node: SkillTreeNode;
};

/**
 * Đặt node theo đúng thứ tự thuTu (đường serpentine).
 * Mỗi cạnh chỉ nối bước kế tiếp → không còn dây chéo kiểu X.
 */
function computePositions(sorted: SkillTreeNode[]): Map<number, { x: number; y: number }> {
  const positions = new Map<number, { x: number; y: number }>();

  sorted.forEach((n, i) => {
    let x = 0;
    if (i > 0) {
      x = i % 2 === 1 ? SIDE_OFFSET : -SIDE_OFFSET;
    }
    positions.set(n.maKhoaHoc, { x, y: i * V_GAP });
  });

  return positions;
}

export function buildFlowFromSkillTree(
  apiNodes: SkillTreeNode[] | undefined,
  _apiEdges?: SkillTreeEdge[]
): { nodes: Node<CourseNodeData>[]; edges: Edge[] } {
  const safeNodes = apiNodes ?? [];
  if (safeNodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const sorted = [...safeNodes].sort((a, b) => a.thuTu - b.thuTu);
  const posMap = computePositions(sorted);

  const nodes: Node<CourseNodeData>[] = sorted.map((n) => {
    const pos = posMap.get(n.maKhoaHoc) ?? { x: 0, y: 0 };
    return {
      id: String(n.maKhoaHoc),
      type: 'course',
      position: {
        x: pos.x - SKILL_NODE_WIDTH / 2,
        y: pos.y,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      data: { node: n },
    };
  });

  const edges: Edge[] = sorted.slice(0, -1).map((from, i) => {
    const to = sorted[i + 1];
    const locked = to.trangThai === 'locked';
    const muted = locked || to.trangThai === 'not_registered';
    return {
      id: `e-${from.maKhoaHoc}-${to.maKhoaHoc}`,
      source: String(from.maKhoaHoc),
      target: String(to.maKhoaHoc),
      type: 'smoothstep',
      pathOptions: { borderRadius: 36, offset: 8 },
      animated: !muted,
      style: {
        stroke: locked ? '#CBD5E1' : muted ? '#FDBA74' : '#F69050',
        strokeWidth: locked ? 1.5 : 2.5,
        strokeDasharray: locked ? '6 4' : undefined,
      },
    };
  });

  return { nodes, edges };
}
