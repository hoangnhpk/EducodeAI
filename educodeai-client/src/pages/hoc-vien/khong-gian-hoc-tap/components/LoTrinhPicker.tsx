import type { SkillTreeLoTrinhOption } from '@/services/khong-gian-hoc-tap.service';

type Props = {
  danhSach: SkillTreeLoTrinhOption[];
  maLoTrinhDangChon?: number | null;
  onChon: (maLoTrinh: number) => void;
};

function nhanTrangThai(trangThai: string) {
  if (trangThai === 'Đã lưu') return 'Đã lưu';
  if (trangThai === 'Hoạt động') return 'Đang học';
  return trangThai;
}

export default function LoTrinhPicker({ danhSach, maLoTrinhDangChon, onChon }: Props) {
  if (danhSach.length === 0) return null;

  return (
    <section className="kght-lo-trinh-picker" aria-label="Chọn lộ trình">
      <h2 className="kght-lo-trinh-picker__title">
        <i className="bi bi-bookmark-star" aria-hidden />
        Lộ trình đã lưu ({danhSach.length})
      </h2>
      <p className="kght-lo-trinh-picker__hint">
        Các lộ trình bạn lưu từ Khám phá — chọn để xem bản đồ skill tree và tiến độ.
      </p>
      <div className="kght-lo-trinh-picker__list" role="list">
        {danhSach.map((lt) => {
          const active = maLoTrinhDangChon === lt.maLoTrinh;
          return (
            <button
              key={lt.maLoTrinh}
              type="button"
              role="listitem"
              className={`kght-lo-trinh-card${active ? ' is-active' : ''}`}
              onClick={() => onChon(lt.maLoTrinh)}
              aria-pressed={active}
            >
              <span className={`kght-lo-trinh-card__badge kght-lo-trinh-card__badge--${lt.trangThai === 'Đã lưu' ? 'saved' : 'active'}`}>
                {nhanTrangThai(lt.trangThai)}
              </span>
              <span className="kght-lo-trinh-card__name">{lt.tenLoTrinh}</span>
              <span className="kght-lo-trinh-card__meta">
                {lt.tongSoKhoaHoc > 0 ? `${lt.tongSoKhoaHoc} khóa học` : 'Chưa có khóa'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
