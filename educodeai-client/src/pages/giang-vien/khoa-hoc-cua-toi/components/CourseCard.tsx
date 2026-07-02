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
  onDuplicate?: (maKhoaHoc: number) => void;
  onPublish?: (maKhoaHoc: number) => void;
  onHide?: (maKhoaHoc: number) => void;
  isDeleting?: boolean;
}

const statusConfig = {
  Draft:     { label: 'Nháp', cls: 'khm-badge-draft' },
  Published: { label: 'Đang dạy', cls: 'khm-badge-published' },
  Archived:  { label: 'Lưu trữ', cls: 'khm-badge-archived' },
};

const CourseCard: React.FC<Props> = ({ course, onEdit, onManage, onArchive, onDuplicate, onPublish, onHide, isDeleting }) => {
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
            <span>📚</span> {course.soChuong ?? 0} chương
          </span>
          <span className="khm-course-card-meta-item">
            <span>📝</span> {course.soBaiHoc ?? 0} bài
          </span>
          <span className="khm-course-card-meta-item">
            <span>⏱</span> {course.thoiLuongGio}h
          </span>
          <span className="khm-course-card-meta-item">
            <span>⭐</span> {course.diemDanhGiaTB?.toFixed(1) ?? '—'}
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
            title="Chỉnh sửa thông tin"
          >
            ✏️
          </button>
          {onDuplicate && (
            <button
              className="khm-btn khm-btn-outline khm-btn-sm"
              onClick={() => onDuplicate(course.maKhoaHoc)}
              title="Nhân bản khóa học"
            >
              📋
            </button>
          )}
          {onPublish && course.trangThai === 'Draft' && (
            <button
              className="khm-btn khm-btn-outline khm-btn-sm"
              onClick={() => onPublish(course.maKhoaHoc)}
              title="Xuất bản khóa học"
              style={{ color: 'var(--khm-success)', borderColor: 'var(--khm-success)' }}
            >
              🚀
            </button>
          )}
          {onHide && course.trangThai === 'Published' && (
            <button
              className="khm-btn khm-btn-outline khm-btn-sm"
              onClick={() => onHide(course.maKhoaHoc)}
              title="Ẩn khóa học"
              style={{ color: 'var(--khm-warning)', borderColor: 'var(--khm-warning)' }}
            >
              👁️
            </button>
          )}
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
