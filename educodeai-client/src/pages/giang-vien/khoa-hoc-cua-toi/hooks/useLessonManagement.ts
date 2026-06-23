import { useState, useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { BaiHocDetail } from '../types';
import * as api from '@/services/khoa-hoc-cua-toi.service';
import { useToastStandalone } from '../components/ui/Toast';

const getGiangVienId = (): number => {
  try {
    const u = JSON.parse(localStorage.getItem('user_info') || '{}');
    return u.maNguoiDung ?? u.id ?? 1;
  } catch { return 1; }
};

interface UseLessonManagementProps {
  maChuong: number;
  initialLessons: BaiHocDetail[];
}

export const useLessonManagement = ({ maChuong, initialLessons }: UseLessonManagementProps) => {
  const maGiangVien = getGiangVienId();
  const { showToast, ToastContainer } = useToastStandalone();

  const [lessons, setLessons] = useState<BaiHocDetail[]>(
    [...initialLessons].sort((a, b) => a.thuTu - b.thuTu)
  );
  const [loading, setLoading] = useState(!initialLessons.length && maChuong > 0);
  const [error, setError] = useState<string | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BaiHocDetail | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<BaiHocDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [previewLesson, setPreviewLesson] = useState<BaiHocDetail | null>(null);

  const loadLessons = useCallback(async () => {
    if (!maChuong) return;
    try {
      setLoading(true); setError(null);
      // Fallback API if you ever implement get-lessons-by-chapter.
      // Currently, chapters and lessons come from course details.
      await api.getChiTietKhoaHoc(maGiangVien, 0); 
    } catch {
      setError('Không thể tải bài học.');
    } finally { setLoading(false); }
  }, [maChuong, maGiangVien]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = lessons.findIndex(l => l.maBaiHoc === active.id);
    const newIdx = lessons.findIndex(l => l.maBaiHoc === over.id);
    const reordered = arrayMove(lessons, oldIdx, newIdx).map((l, i) => ({ ...l, thuTu: i + 1 }));
    setLessons(reordered);
    try {
      await api.reorderBaiHoc(maGiangVien, maChuong, {
        lessonOrders: reordered.map(l => ({ maBaiHoc: l.maBaiHoc, thuTu: l.thuTu })),
      });
      showToast('success', 'Sắp xếp bài học thành công!');
    } catch {
      showToast('error', 'Lỗi sắp xếp. Đã khôi phục thứ tự cũ.');
      setLessons([...lessons]);
    }
  }, [lessons, maGiangVien, maChuong, showToast]);

  const handleSave = async (type: 'Video' | 'File', dto: any) => {
    try {
      setSaving(true);
      if (editTarget) {
        if (type === 'Video') {
          await api.capNhatBaiHoc(maGiangVien, editTarget.maBaiHoc, dto);
        } else {
          await api.capNhatBaiHocFile(editTarget.maBaiHoc, dto);
        }
        setLessons(prev => prev.map(l => l.maBaiHoc === editTarget.maBaiHoc 
          ? { ...l, tieuDe: dto.tieuDe, moTa: dto.moTa, thoiLuong: dto.thoiLuong || 0, linkVideo: (type === 'Video' ? dto.linkVideo : l.linkVideo) } 
          : l));
        showToast('success', 'Cập nhật bài học thành công! (Tải lại trang để thấy file mới nhất)');
      } else {
        let res: any;
        if (type === 'Video') {
           res = await api.themBaiHoc(maGiangVien, maChuong, dto);
        } else {
           res = await api.themBaiHocFile(maChuong, dto);
        }
        setLessons(prev => [...prev, { maBaiHoc: res.maBaiHoc, tieuDe: res.tieuDe, moTa: res.moTa, linkVideo: res.linkVideo, thoiLuong: res.thoiLuong || 0, thuTu: res.thuTu, loaiBaiHoc: type }]);
        showToast('success', 'Thêm bài học thành công!');
      }
      setModalOpen(false); setEditTarget(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally { setSaving(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.xoaBaiHoc(maGiangVien, deleteTarget.maBaiHoc);
      setLessons(prev => prev.filter(l => l.maBaiHoc !== deleteTarget.maBaiHoc));
      showToast('success', `Đã xóa bài học "${deleteTarget.tieuDe}".`);
      setDeleteTarget(null);
    } catch {
      showToast('error', 'Lỗi xóa bài học.');
    } finally { setDeleting(false); }
  };

  return {
    lessons, loading, error, modalOpen, editTarget, saving, deleteTarget, deleting, previewLesson,
    setModalOpen, setEditTarget, setDeleteTarget, setPreviewLesson,
    loadLessons, handleDragEnd, handleSave, handleConfirmDelete,
    ToastContainer
  };
};
