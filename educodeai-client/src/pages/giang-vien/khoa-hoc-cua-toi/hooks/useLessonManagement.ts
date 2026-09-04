import { useState, useCallback, useEffect, useRef } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { BaiHocDetail } from '../types';
import * as api from '@/services/khoa-hoc-cua-toi.service';
import { useToastStandalone } from '../components/ui/Toast';
import * as mediaApi from '@/services/media.service';

const getGiangVienId = (): number => {
  try {
    const u = JSON.parse(localStorage.getItem('user_info') || '{}');
    return u.maNguoiDung ?? u.id ?? 1;
  } catch { return 1; }
};

interface UseLessonManagementProps {
  maChuong: number;
  maKhoaHoc: number;
  initialLessons: BaiHocDetail[];
  onRefreshCourse: () => Promise<void>;
  onNotify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const useLessonManagement = ({ maChuong, maKhoaHoc, initialLessons, onRefreshCourse, onNotify }: UseLessonManagementProps) => {
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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<BaiHocDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [previewLesson, setPreviewLesson] = useState<BaiHocDetail | null>(null);

  useEffect(() => {
    setLessons([...initialLessons].sort((a, b) => a.thuTu - b.thuTu));
    setLoading(false);
    setError(null);
  }, [initialLessons]);

  const loadLessons = useCallback(async (imLang = false) => {
    if (!maChuong || !maKhoaHoc) return;
    try {
      if (!imLang) setLoading(true);
      setError(null);
      const detail = await api.getChiTietKhoaHoc(maGiangVien, maKhoaHoc);
      const chuong = detail.danhSachChuong.find(c => c.maChuong === maChuong);
      const dsBaiHoc = chuong?.danhSachBaiHoc ?? [];
      setLessons([...dsBaiHoc].sort((a, b) => a.thuTu - b.thuTu));
    } catch {
      if (!imLang) setError('Không thể tải bài học.');
    } finally { if (!imLang) setLoading(false); }
  }, [maChuong, maKhoaHoc, maGiangVien]);

  // Poll trạng thái phụ đề khi có bài học đang xử lý (Processing_Subtitle).
  // Worker AI chạy nền và cập nhật DB + invalidate cache; FE không có SignalR nên
  // phải tự refetch định kỳ để thấy badge chuyển "Đang tạo..." → "✓ CC".
  const dangPoll = lessons.some(l => l.videoStatus === 'Processing_Subtitle');
  const loadLessonsRef = useRef(loadLessons);
  loadLessonsRef.current = loadLessons;
  useEffect(() => {
    if (!dangPoll) return;
    const timer = setInterval(() => { void loadLessonsRef.current(true); }, 8000);
    return () => clearInterval(timer);
  }, [dangPoll]);

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
      // Đọc lại dữ liệu sau khi lưu để đồng bộ với thứ tự thực tế trong DB/cache.
      await loadLessons(true);
      showToast('success', 'Sắp xếp bài học thành công!');
    } catch {
      showToast('error', 'Lỗi sắp xếp. Đã khôi phục thứ tự cũ.');
      setLessons([...lessons]);
    }
  }, [lessons, maGiangVien, maChuong, showToast]);

  const handleSave = async (type: 'Video' | 'File' | 'VideoUpload', dto: any) => {
    try {
      setSaving(true);
      if (editTarget) {
        if (type === 'Video' || type === 'VideoUpload') {
          // Hiện tại chỉ cho phép đổi tiêu đề/mô tả nếu edit, chưa hỗ trợ replace video file trực tiếp
          await api.capNhatBaiHoc(maGiangVien, editTarget.maBaiHoc, dto);
        } else {
          await api.capNhatBaiHocFile(editTarget.maBaiHoc, dto);
        }
        if (dto.maChuong !== maChuong) {
          onNotify('success', 'Đã chuyển bài học sang chương mới.');
          await onRefreshCourse();
        } else {
          setLessons(prev => prev.map(l => l.maBaiHoc === editTarget.maBaiHoc
            ? { ...l, tieuDe: dto.tieuDe, moTa: dto.moTa, thoiLuong: dto.thoiLuong || l.thoiLuong, linkVideo: (type === 'Video' ? dto.linkVideo : l.linkVideo) }
            : l));
          showToast('success', 'Cập nhật bài học thành công! (Tải lại trang để thấy file mới nhất)');
        }
      } else {
        let res: any;
        if (type === 'Video') {
           res = await api.themBaiHoc(maGiangVien, maChuong, dto);
           setLessons(prev => [...prev, { maBaiHoc: res.maBaiHoc, tieuDe: res.tieuDe, moTa: res.moTa, linkVideo: res.linkVideo, thoiLuong: res.thoiLuong || 0, thuTu: res.thuTu, loaiBaiHoc: 'Video', videoSource: 'youtube' }]);
           showToast('success', 'Thêm bài học thành công!');
        } else if (type === 'File') {
           res = await api.themBaiHocFile(maChuong, dto);
           setLessons(prev => [...prev, { maBaiHoc: res.maBaiHoc, tieuDe: res.tieuDe, moTa: res.moTa, linkVideo: res.linkVideo, thoiLuong: res.thoiLuong || 0, thuTu: res.thuTu, loaiBaiHoc: 'File' }]);
           showToast('success', 'Thêm bài học thành công!');
        } else if (type === 'VideoUpload') {
           setUploadProgress(0);
           // 1. Lấy chữ ký
           const sig = await mediaApi.layChuKyUploadVideo();

           // 2. Đẩy lên Cloudinary
           const uploadResult = await mediaApi.uploadVideoToCloudinary(dto.file, sig, (p) => setUploadProgress(p));

           // 3. Tạo bài học với metadata Cloudinary
           const duration = Math.round(uploadResult.duration || 0);
           const sizeMb = Math.round((uploadResult.bytes || 0) / 1048576);
           
           const finalDto = {
               ...dto,
               linkVideo: uploadResult.secure_url,
               thoiLuong: duration,
               videoSource: 'cloudinary',
               videoPublicId: uploadResult.public_id,
               videoSizeMb: sizeMb
           };
           
           res = await api.themBaiHoc(maGiangVien, maChuong, finalDto);

           setLessons(prev => [...prev, { 
               maBaiHoc: res.maBaiHoc, tieuDe: dto.tieuDe, moTa: dto.moTa, 
               linkVideo: uploadResult.secure_url, 
               thoiLuong: duration, 
               thuTu: dto.thuTu, loaiBaiHoc: 'Video',
               videoSource: 'cloudinary', videoPublicId: uploadResult.public_id
           }]);
           showToast('success', 'Tải video và thêm bài học thành công!');
        }
      }
      setModalOpen(false); setEditTarget(null); setUploadProgress(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally { setSaving(false); setUploadProgress(null); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await api.xoaBaiHoc(maGiangVien, deleteTarget.maBaiHoc);
      setLessons(prev => prev.filter(l => l.maBaiHoc !== deleteTarget.maBaiHoc));
      // Backend báo rõ kết quả xóa tài nguyên Cloudinary (video + phụ đề). Nếu có phần
      // sót lại (message cảnh báo dọn tay) thì hiện toast "warning" thay vì "success".
      const coCanhBao = res.message.includes('KHÔNG xóa được');
      showToast(coCanhBao ? 'warning' : 'success', res.message || `Đã xóa bài học "${deleteTarget.tieuDe}".`);
      setDeleteTarget(null);
    } catch {
      showToast('error', 'Lỗi xóa bài học.');
    } finally { setDeleting(false); }
  };

  return {
    lessons, loading, error, modalOpen, editTarget, saving, deleteTarget, deleting, previewLesson,
    uploadProgress, setLessons,
    setModalOpen, setEditTarget, setDeleteTarget, setPreviewLesson,
    loadLessons, handleDragEnd, handleSave, handleConfirmDelete,
    ToastContainer
  };
};
