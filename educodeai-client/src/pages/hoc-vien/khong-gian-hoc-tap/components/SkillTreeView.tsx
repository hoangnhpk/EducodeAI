import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CourseSkillNode from './CourseSkillNode';
import CourseDetailDrawer from './CourseDetailDrawer';
import LoTrinhPicker from './LoTrinhPicker';
import {
  buildFlowFromSkillTree,
  type CourseNodeData,
} from '../utils/skillTreeLayout';
import {
  laySkillTree,
  type SkillTreeNode,
  type SkillTreeResponse,
} from '@/services/khong-gian-hoc-tap.service';

const nodeTypes = { course: CourseSkillNode };

type Props = {
  maLoTrinh?: number;
  onLoTrinhChange?: (maLoTrinh: number | undefined) => void;
};

export default function SkillTreeView({ maLoTrinh, onLoTrinhChange }: Props) {
  const [tree, setTree] = useState<SkillTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SkillTreeNode | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CourseNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await laySkillTree(maLoTrinh);
        if (cancelled) return;
        setTree(data);
        const { nodes: flowNodes, edges: flowEdges } = buildFlowFromSkillTree(data.nodes, data.edges);
        setNodes(flowNodes);
        setEdges(flowEdges);
        setSelected(null);
      } catch (err: unknown) {
        if (!cancelled) {
          const ax = err as { response?: { status?: number; data?: { message?: string } } };
          const status = ax.response?.status;
          if (status === 404) {
            setError(
              'API bản đồ chưa có trên server. Hãy dừng và chạy lại backend (dotnet run) rồi tải lại trang.'
            );
          } else if (status === 401) {
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          } else if (status != null && status >= 400) {
            const msg =
              (ax.response?.data as { message?: string })?.message ||
              `Lỗi máy chủ (${status}). Hãy restart backend rồi tải lại.`;
            setError(msg);
          } else if (!ax.response) {
            const detail = err instanceof Error ? err.message : '';
            setError(
              detail.includes('muted') || detail.includes('is not defined')
                ? 'Lỗi hiển thị bản đồ trên trình duyệt. Đã sửa — tải lại trang (Ctrl+F5).'
                : 'Không kết nối được API. Kiểm tra backend (dotnet run) và VITE_API_URL trong .env.'
            );
          } else {
            setError('Không tải được bản đồ lộ trình. Thử tải lại trang.');
          }
          console.error('[SkillTree]', err);
          setTree(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [maLoTrinh, setNodes, setEdges]);

  // Đồng bộ lại khi backend trả về lộ trình khác với lộ trình được yêu cầu.
  // maLoTrinh được nhớ trong localStorage; nếu lộ trình đó đã bị xóa, backend sẽ
  // fallback sang lộ trình khác — trước đây chỉ đồng bộ khi chưa chọn gì (!maLoTrinh)
  // nên picker vẫn hiện lộ trình cũ trong khi bản đồ là của lộ trình khác.
  useEffect(() => {
    if (tree?.maLoTrinh && tree.maLoTrinh !== maLoTrinh) {
      onLoTrinhChange?.(tree.maLoTrinh);
    }
  }, [tree?.maLoTrinh, maLoTrinh, onLoTrinhChange]);

  const onNodeClick = useCallback((_: unknown, node: Node<CourseNodeData>) => {
    setSelected(node.data.node);
  }, []);

  const nextNode = useMemo(
    () => tree?.nodes.find((n) => n.laBuocTiepTheo) ?? null,
    [tree]
  );

  const focusNext = useCallback(() => {
    if (!nextNode) return;
    setSelected(nextNode);
  }, [nextNode]);

  if (loading) {
    return (
      <div className="kght-state">
        <div className="kght-spinner" aria-hidden />
        <p>Đang tải bản đồ...</p>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="kght-state kght-state--error">
        <p>{error ?? 'Chưa có dữ liệu lộ trình.'}</p>
      </div>
    );
  }

  const maDangChon = maLoTrinh ?? tree.maLoTrinh ?? undefined;
  const danhSachDaLuu = tree.danhSachLoTrinh ?? [];

  const picker =
    danhSachDaLuu.length > 0 ? (
      <LoTrinhPicker
        danhSach={danhSachDaLuu}
        maLoTrinhDangChon={maDangChon}
        onChon={(id) => onLoTrinhChange?.(id)}
      />
    ) : null;

  if (tree.nodes.length === 0) {
    return (
      <div className="kght-map-wrap">
        {picker}
        <div className="kght-state">
          <p>
            {danhSachDaLuu.length > 0
              ? 'Lộ trình này chưa có khóa học để hiển thị trên bản đồ. Thử chọn lộ trình khác ở trên.'
              : tree.moTaChung || 'Chưa có lộ trình đã lưu. Hãy lưu lộ trình từ Khám phá.'}
          </p>
          {danhSachDaLuu.length === 0 && (
            <Link to="/khoa-hoc-ai-cua-toi" className="kght-btn kght-btn--ghost" style={{ marginTop: 12 }}>
              Đi tới Lộ trình của tôi
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="kght-map-wrap">
      {picker}
      <div className="kght-map-heading">
        <h2 className="kght-map-heading__title">{tree.tenLoTrinh}</h2>
      </div>
      <div className="kght-map-stats">
        <div className="kght-mini-stat">
          <span className="kght-mini-stat__label">Đã hoàn thành</span>
          <strong>
            {tree.soKhoaHoanThanh} / {tree.tongSoKhoaHoc} khóa
          </strong>
        </div>
        <div className="kght-mini-stat">
          <span className="kght-mini-stat__label">Tiến độ tổng</span>
          <strong>{tree.phanTramTong}%</strong>
          <div className="kght-progress kght-progress--inline">
            <div className="kght-progress__bar" style={{ width: `${tree.phanTramTong}%` }} />
          </div>
        </div>
        {tree.tongThoiGianTuan > 0 && (
          <div className="kght-mini-stat">
            <span className="kght-mini-stat__label">Thời gian lộ trình</span>
            <strong>{tree.tongThoiGianTuan} tuần</strong>
          </div>
        )}
      </div>

      {nextNode && (
        <div className="kght-ai-chip">
          {nextNode.trangThai === 'not_registered' ? (
            <>
              🤖 Bước tiếp theo: đăng ký <b>{nextNode.tenKhoaHoc}</b> để tiếp tục lộ trình.
            </>
          ) : (
            <>
              🤖 AI Coach: Tiếp tục <b>{nextNode.tenKhoaHoc}</b> để mở các khóa phía sau.
            </>
          )}
          <button type="button" className="kght-ai-chip__btn" onClick={focusNext}>
            Xem
          </button>
        </div>
      )}

      <div className="kght-flow-panel">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.5, minZoom: 0.5, maxZoom: 1.1 }}
          minZoom={0.35}
          maxZoom={1.4}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} size={1} color="#e2e8f0" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              const st = (n.data as CourseNodeData)?.node?.trangThai;
              if (st === 'done') return '#ea580c';
              if (st === 'in_progress') return '#f69050';
              if (st === 'not_registered') return '#fdba74';
              return '#cbd5e1';
            }}
            maskColor="rgba(249, 250, 251, 0.85)"
          />
        </ReactFlow>
      </div>

      <p className="kght-map-hint">
        💡 Kéo để di chuyển bản đồ · Cuộn chuột để zoom · Bấm vào khóa để xem chi tiết
      </p>

      <CourseDetailDrawer
        course={selected}
        maLoTrinh={tree.maLoTrinh}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
