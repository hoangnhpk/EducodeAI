import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { CourseNodeData } from '../utils/skillTreeLayout';

type CourseFlowNode = Node<CourseNodeData, 'course'>;

function CourseSkillNodeComponent({ data }: NodeProps<CourseFlowNode>) {
  if (!data?.node) return null;
  const n = data.node;
  const isNext = n.laBuocTiepTheo;
  const status = n.trangThai;

  return (
    <div
      className={`kght-skill-node kght-skill-node--${status}${isNext ? ' kght-skill-node--next' : ''}`}
    >
      {isNext && <span className="kght-skill-node__pill">👉 Học tiếp</span>}
      {status === 'done' && (
        <span className="kght-skill-node__badge-done" aria-hidden>
          <i className="bi bi-check-lg" />
        </span>
      )}
      {status === 'locked' && (
        <span className="kght-skill-node__lock" aria-hidden>
          <i className="bi bi-lock-fill" />
        </span>
      )}
      {status === 'not_registered' && (
        <span className="kght-skill-node__enroll" aria-hidden>
          <i className="bi bi-cart-plus" />
        </span>
      )}
      <div className="kght-skill-node__title">{n.tenKhoaHoc}</div>
      {status === 'in_progress' && (
        <>
          <div className="kght-skill-node__progress" role="progressbar" aria-valuenow={n.phanTramTienDo}>
            <div className="kght-skill-node__progress-bar" style={{ width: `${n.phanTramTienDo}%` }} />
          </div>
          <div className="kght-skill-node__pct">{n.phanTramTienDo}%</div>
        </>
      )}
      {status === 'done' && (
        <div className="kght-skill-node__sub">Hoàn thành</div>
      )}
      {status === 'locked' && (
        <div className="kght-skill-node__sub">Chưa mở — hoàn thành khóa trước</div>
      )}
      {status === 'not_registered' && (
        <div className="kght-skill-node__sub kght-skill-node__sub--enroll">Chưa đăng ký</div>
      )}
      <Handle type="target" position={Position.Top} className="kght-skill-handle" />
      <Handle type="source" position={Position.Bottom} className="kght-skill-handle" />
    </div>
  );
}

export default memo(CourseSkillNodeComponent);
