import { useState, useEffect, useCallback, useRef } from 'react';
import type { KhoaHocListItem } from '../types';
import * as api from '@/services/khoa-hoc-cua-toi.service';
import { useToastStandalone } from '../components/ui/Toast';

export const FILTERS = ['Tất cả', 'Hoạt động', 'Đã xóa'];
export const FILTER_LABELS: Record<string, string> = {
  'Tất cả': 'Tất cả',
  'Hoạt động': 'Hoạt động',
  'Đã xóa': 'Đã xóa',
};
type CategoryFilter = 'Tất cả' | string;
const PAGE_SIZE = 9;

const getGiangVienId = (): number => {
  try {
    const raw = localStorage.getItem('user_info');
    if (raw) {
      const u = JSON.parse(raw);
      return u.maNguoiDung ?? u.id ?? 1;
    }
  } catch { /* ignore */ }
  return 1;
};

export const useCourseList = () => {
  const maGiangVien = getGiangVienId();
  const { showToast, ToastContainer } = useToastStandalone();

  const [courses, setCourses] = useState<KhoaHocListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('Tất cả');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<KhoaHocListItem | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDanhSachKhoaHoc(maGiangVien);
      setCourses(data);
    } catch {
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [maGiangVien]);

  useEffect(() => { void loadCourses(); }, [loadCourses]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  // Pagination reset
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, categoryFilter, debouncedSearch]);

  const handleConfirmArchive = async () => {
    if (!confirmTarget) return;
    try {
      setDeletingId(confirmTarget.maKhoaHoc);
      setConfirmTarget(null);
      await api.xoaKhoaHoc(maGiangVien, confirmTarget.maKhoaHoc);
      showToast('success', 'Khóa học đã được đưa vào thùng rác.');
      void loadCourses();
    } catch {
      showToast('error', 'Lỗi xóa khóa học. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (maKhoaHoc: number) => {
    try {
      await api.restoreKhoaHoc(maGiangVien, maKhoaHoc);
      showToast('success', 'Đã khôi phục khóa học thành công.');
      void loadCourses();
    } catch {
      showToast('error', 'Lỗi khôi phục khóa học.');
    }
  };

  // Derived state
  const categories = ['Tất cả', ...Array.from(new Set(courses.map(c => c.linhVuc)))];

  const filtered = courses.filter(c => {
    let matchFilter = true;
    if (filter === 'Hoạt động') matchFilter = c.trangThai === 'Hoạt động';
    else if (filter === 'Đã xóa') matchFilter = c.trangThai === 'Đã xóa';
    
    const matchCategory = categoryFilter === 'Tất cả' || c.linhVuc === categoryFilter;
    const matchSearch = !debouncedSearch ||
      c.tenKhoaHoc.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.linhVuc.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchFilter && matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedCourses = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalStudents = courses.reduce((s, c) => s + c.soHocVien, 0);
  const avgRating = courses.length > 0
    ? (courses.reduce((s, c) => s + c.diemDanhGiaTB, 0) / courses.length).toFixed(1)
    : '—';
  const totalCert = courses.filter(c => c.coChungChi).length;

  return {
    // State
    courses, loading, error, searchQuery, filter, categoryFilter, currentPage,
    deletingId, confirmTarget, debouncedSearch,
    
    // Derived
    categories, filtered, paginatedCourses, totalPages, totalStudents, avgRating, totalCert,
    
    // Setters & Actions
    setFilter, setCategoryFilter, setCurrentPage, setConfirmTarget,
    handleSearchChange, handleConfirmArchive, handleRestore, loadCourses,
    
    // UI
    ToastContainer, showToast
  };
};
