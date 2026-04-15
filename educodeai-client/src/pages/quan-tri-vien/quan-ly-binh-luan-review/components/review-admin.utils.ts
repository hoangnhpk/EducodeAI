import type { ReviewTrangThai } from './ReviewAdmin.types';

export const formatDate = (dateString: string): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));

export const getRelativeTime = (dateString: string): string => {
  const now = Date.now();
  const time = new Date(dateString).getTime();
  const diffMinutes = Math.floor((now - time) / 60000);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatDate(dateString);
};

export const getTrangThaiLabel = (trangThai: ReviewTrangThai) => {
  switch (trangThai) {
    case 'DaDuyet':
      return 'Đã duyệt';
    case 'TuChoi':
      return 'Từ chối';
    default:
      return 'Chờ duyệt';
  }
};

export const getTrangThaiClass = (trangThai: ReviewTrangThai) => {
  switch (trangThai) {
    case 'DaDuyet':
      return 'approved';
    case 'TuChoi':
      return 'rejected';
    default:
      return 'pending';
  }
};

export const truncateText = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
