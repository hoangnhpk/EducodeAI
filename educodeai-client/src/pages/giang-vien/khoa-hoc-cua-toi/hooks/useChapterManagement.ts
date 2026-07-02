import { useState, useCallback } from 'react';
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

  const handleSave = async (tenChuong: string) => {
    try {
      setSaving(true);
      const dto = { tenChuong, thuTu: editTarget ? editTarget.thuTu : chapters.length + 1 };
      if (editTarget) {
        await api.capNhatChuong(maGiangVien, editTarget.maChuong, dto);
        setChapters(prev => prev.map(c => c.maChuong === editTarget.maChuong ? { ...c, tenChuong } : c));
        showToast('success', 'Cập nhật chương thành công!');
      } else {
        const res = await api.themChuong(maGiangVien, maKhoaHoc, dto);
        const newCh: ChuongHocDetail = { maChuong: res.maChuong, tenChuong: res.tenChuong, thuTu: res.thuTu, danhSachBaiHoc: [] };
        setChapters(prev => [...prev, newCh]);
        setHighlightId(res.maChuong);
        setTimeout(() => setHighlightId(null), 2000);
        showToast('success', 'Thêm chương thành công!');
      }
      setModalOpen(false);
      setEditTarget(null);
      onRefresh?.();
    } catch {
      showToast('error', 'Có lỗi xảy ra. Vui lòng thử lại.');
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
