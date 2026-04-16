import React from 'react';
import type { KhoaHocListItem } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const getImageUrl = (url?: string): string => {
  if (!url) return 'https://placehold.co/600x340/6366f1/white?text=Khóa+Học';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

interface Props {
  course: KhoaHocListItem;
  onEdit: (maKhoaHoc: number) => void;
  onManage: (maKhoaHoc: number) => void;
  onArchive: (course: KhoaHocListItem) => void;
  isDeleting?: boolean;
}

const statusConfig = {
  Draft:     { label: 'Nháp', cls: 'khm-badge-draft' },
  Published: { label: 'Đang dạy', cls: 'khm-badge-published' },
  Archived:  { label: 'Lưu trữ', cls: 'khm-badge-archived' },
};

const CourseCard: React.FC<Props> = ({ course, onEdit, onManage, onArchive, isDeleting }) => {
  const st = statusConfig[course.trangThai as keyof typeof statusConfig] ?? statusConfig.Draft;

  return (
    <div className="khm-course-card">
      <img
        src={getImageUrl(course.hinhAnh)}
        alt={course.tenKhoaHoc}
        className="khm-course-card-img"
        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x340/6366f1/white?text=Khóa+Học'; }}
      />
      <div className="khm-course-card-body">
        <div className="khm-course-card-badges">
          <span className={`khm-badge ${st.cls}`}>{st.label}</span>
          {course.coChungChi && (
            <span className="khm-badge khm-badge-cert">🏆 Chứng chỉ</span>
          )}
          <span className="khm-badge khm-badge-primary">{course.linhVuc}</span>
        </div>

        <h3 className="khm-course-card-title">{course.tenKhoaHoc}</h3>

        <div className="khm-course-card-meta">
          <span className="khm-course-card-meta-item">
            <span>🎓</span> {course.soHocVien} HV
          </span>
          <span className="khm-course-card-meta-item">
            <span>⏱</span> {course.thoiLuongGio}h
          </span>
          <span className="khm-course-card-meta-item">
            <span>⭐</span> {course.diemDanhGiaTB?.toFixed(1) ?? '—'}
          </span>
          <span className="khm-course-card-meta-item">
            <span>📶</span> {course.trinhDo}
          </span>
        </div>

        <div className="khm-course-card-actions">
          <button
            className="khm-btn khm-btn-primary khm-btn-sm"
            onClick={() => onManage(course.maKhoaHoc)}
            style={{ flex: 1 }}
          >
            Quản lý
          </button>
          <button
            className="khm-btn khm-btn-outline khm-btn-sm"
            onClick={() => onEdit(course.maKhoaHoc)}
          >
            ✏️ Sửa
          </button>
          <button
            className="khm-btn khm-btn-ghost khm-btn-sm"
            onClick={() => onArchive(course)}
            disabled={isDeleting}
            title="Lưu trữ khóa học"
          >
            {isDeleting ? <span className="khm-spinner khm-spinner-sm" /> : '🗄'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
