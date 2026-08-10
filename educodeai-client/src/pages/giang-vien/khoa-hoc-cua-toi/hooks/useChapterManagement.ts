import { useState, useCallback, useEffect } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { ChuongHocDetail } from '../types';
import * as api from '@/services/khoa-hoc-cua-toi.service';
import { useToastStandalone } from '../components/ui/Toast';

const getGiangVienId = (): number => {
  try {
    const u = JSON.parse(localStorage.getItem('user_info') || '{}');
    return u.maNguoiDung ?? u.id ?? 1;
  } catch { return 1; }
};

interface UseChapterManagementProps {
  maKhoaHoc: number;
  initialChapters: ChuongHocDetail[];
  onRefresh?: () => void;
}

export const useChapterManagement = ({ maKhoaHoc, initialChapters, onRefresh }: UseChapterManagementProps) => {
  const maGiangVien = getGiangVienId();
  const { showToast, ToastContainer } = useToastStandalone();

  const [chapters, setChapters] = useState<ChuongHocDetail[]>(
    [...initialChapters].sort((a, b) => a.thuTu - b.thuTu)
  );
  const [loading, setLoading] = useState(!initialChapters.length);
  const [error, setError] = useState<string | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ChuongHocDetail | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<ChuongHocDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [highlightId, setHighlightId] = useState<number | null>(null);

  useEffect(() => {
    setChapters([...initialChapters].sort((a, b) => a.thuTu - b.thuTu));
    setLoading(false);
  }, [initialChapters]);

  const loadChapters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const detail = await api.getChiTietKhoaHoc(maGiangVien, maKhoaHoc);
      setChapters([...detail.danhSachChuong].sort((a, b) => a.thuTu - b.thuTu));
    } catch {
      setError('Không thể tải danh sách chương.');
    } finally { setLoading(false); }
  }, [maGiangVien, maKhoaHoc]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = chapters.findIndex(c => c.maChuong === active.id);
    const newIndex = chapters.findIndex(c => c.maChuong === over.id);
    const reordered = arrayMove(chapters, oldIndex, newIndex).map((c, i) => ({ ...c, thuTu: i + 1 }));
    setChapters(reordered); // optimistic update
    try {
      await api.reorderChuong(maGiangVien, maKhoaHoc, {
        chapterOrders: reordered.map(c => ({ maChuong: c.maChuong, thuTu: c.thuTu })),
      });
      showToast('success', 'Sắp xếp chương thành công!');
    } catch {
      showToast('error', 'Lỗi sắp xếp chương. Đã khôi phục thứ tự cũ.');
      setChapters([...chapters]); // rollback
    }
  }, [chapters, maGiangVien, maKhoaHoc, showToast]);

  const handleSave = async (tenChuong: string | string[]) => {
    try {
      setSaving(true);
      if (editTarget) {
        const name = typeof tenChuong === 'string' ? tenChuong : tenChuong[0];
        await api.capNhatChuong(maGiangVien, editTarget.maChuong, { tenChuong: name, thuTu: editTarget.thuTu });
        setChapters(prev => prev.map(c => c.maChuong === editTarget.maChuong ? { ...c, tenChuong: name } : c));
        showToast('success', 'Cập nhật chương thành công!');
      } else {
        const names = Array.isArray(tenChuong) ? tenChuong : [tenChuong];
        const created: ChuongHocDetail[] = [];
        for (const [index, name] of names.entries()) {
          const res = await api.themChuong(maGiangVien, maKhoaHoc, { tenChuong: name, thuTu: chapters.length + index + 1 });
          created.push({ maChuong: res.maChuong, tenChuong: res.tenChuong, thuTu: res.thuTu, danhSachBaiHoc: [] });
        }
        setChapters(prev => [...prev, ...created]);
        if (created.length) {
          setHighlightId(created[created.length - 1].maChuong);
          setTimeout(() => setHighlightId(null), 2000);
        }
        showToast('success', `Đã thêm thành công ${created.length} chương mới.`);
      }
      setModalOpen(false);
      setEditTarget(null);
      onRefresh?.();
    } catch {
      showToast('error', 'Có lỗi xảy ra khi tạo chương. Các chương đã tạo trước đó vẫn được giữ lại.');
    } finally { setSaving(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.xoaChuong(maGiangVien, deleteTarget.maChuong);
      setChapters(prev => prev.filter(c => c.maChuong !== deleteTarget.maChuong));
      showToast('success', `Đã xóa chương "${deleteTarget.tenChuong}".`);
      setDeleteTarget(null);
      onRefresh?.();
    } catch {
      showToast('error', 'Lỗi xóa chương. Vui lòng thử lại.');
    } finally { setDeleting(false); }
  };

  return {
    chapters, loading, error, modalOpen, editTarget, saving, deleteTarget, deleting, highlightId,
    setModalOpen, setEditTarget, setDeleteTarget,
    loadChapters, handleDragEnd, handleSave, handleConfirmDelete,
    ToastContainer
  };
};
