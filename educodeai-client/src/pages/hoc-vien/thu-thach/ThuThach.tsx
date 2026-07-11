import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  formatDemNguoc,
  layThuThachTuan,
  nhanThuongNhiemVu,
  deoDanhHieu,
} from '@/services/thu-thach.service';
import type { ThuThachTuanResponse, BangXepHangResponse } from './types';
import StatsBar from './components/StatsBar';
import TaskCard from './components/TaskCard';
import TitleCollection from './components/TitleCollection';
import Leaderboard from './components/Leaderboard';
import './ThuThach.css';

export default function ThuThach() {
  const [data, setData] = useState<ThuThachTuanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [bangXepHang, setBangXepHang] = useState<BangXepHangResponse | null>(null);
  const [lbRefresh, setLbRefresh] = useState(0);

  const [tick, setTick] = useState(0);

  const taiDuLieu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await layThuThachTuan();
      setData(raw);
    } catch {
      setError('Không tải được thử thách tuần. Vui lòng thử lại sau.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void taiDuLieu();
  }, [taiDuLieu]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((t) => t + 1), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const demNguoc = useMemo(() => {
    if (!data) return '—';
    const base = data.giayConLaiDenLamMoi - tick * 60;
    return formatDemNguoc(base);
  }, [data, tick]);

  const titleSync = useMemo(() => {
    if (!data) return null;
    const dh = data.danhSachDanhHieu.find((d) => d.dangDeo)
      ?? data.danhSachDanhHieu.find((d) => d.maDanhHieu === data.maDanhHieuDangDeo);
    if (!dh) return null;
    return { tenDanhHieu: dh.tenDanhHieu, maCodeDanhHieu: dh.maCode };
  }, [data]);

  const handleClaim = async (maMau: number) => {
    setClaiming(maMau);
    try {
      const res = await nhanThuongNhiemVu(maMau);
      setData(res.bangNhiemVu);
      if (res.bangXepHang) {
        setBangXepHang(res.bangXepHang);
      } else {
        setLbRefresh((n) => n + 1);
      }
      if (res.danhHieuMoiMoKhoa) {
        void Swal.fire({
          icon: 'success',
          title: 'Mở khóa danh hiệu mới!',
          text: res.danhHieuMoiMoKhoa,
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        void Swal.fire({
          icon: 'success',
          title: `+${res.expNhanDuoc} EXP`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Không thể nhận thưởng. Vui lòng thử lại.';
      void Swal.fire({ icon: 'error', title: 'Lỗi', text: msg });
    } finally {
      setClaiming(null);
    }
  };

  const handleDeoDanhHieu = async (maDanhHieu: number) => {
    if (!data) return;

    const prev = data;
    const prevBxh = bangXepHang;
    const danhSachDanhHieu = data.danhSachDanhHieu.map((d) => ({
      ...d,
      dangDeo: d.maDanhHieu === maDanhHieu,
    }));
    const tenMoi = danhSachDanhHieu.find((d) => d.maDanhHieu === maDanhHieu)?.tenDanhHieu
      ?? data.huyHieuHienTai;
    const maCodeMoi = danhSachDanhHieu.find((d) => d.maDanhHieu === maDanhHieu)?.maCode ?? '';

    setData({
      ...data,
      danhSachDanhHieu,
      huyHieuHienTai: tenMoi,
      maDanhHieuDangDeo: maDanhHieu,
    });

    setBangXepHang((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        danhSach: prev.danhSach.map((item) =>
          item.laToi
            ? { ...item, tenDanhHieu: tenMoi, maCodeDanhHieu: maCodeMoi }
            : item
        ),
      };
    });

    try {
      const next = await deoDanhHieu(maDanhHieu);
      setData(next);
    } catch {
      setData(prev);
      setBangXepHang(prevBxh);
      void Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể đổi danh hiệu.' });
    }
  };

  return (
    <div className="tt-page">
      <div className="tt-board">
        <header className="tt-board__header">
          <h1 className="tt-board__title">Bảng nhiệm vụ học tập</h1>
          <p className="tt-board__subtitle">
            Theo dõi chỉ tiêu tuần này và nhận EXP khi hoàn thành nhiệm vụ.
          </p>
        </header>

        {loading && (
          <div className="tt-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="tt-skeleton" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="tt-error">
            <p>{error}</p>
            <button type="button" onClick={() => void taiDuLieu()}>Thử lại</button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <StatsBar
              huyHieu={data.huyHieuHienTai}
              maCodeDanhHieu={
                data.danhSachDanhHieu.find((d) => d.dangDeo)?.maCode
                ?? data.danhSachDanhHieu.find((d) => d.maDanhHieu === data.maDanhHieuDangDeo)?.maCode
              }
              tongExp={data.tongExp}
              demNguoc={demNguoc}
            />

            <div className="tt-task-list">
              {data.danhSachNhiemVu.map((task) => (
                <TaskCard
                  key={task.maMau}
                  task={task}
                  dangNhan={claiming === task.maMau}
                  onClaim={() => void handleClaim(task.maMau)}
                />
              ))}
            </div>

            {data.danhSachDanhHieu.length > 0 && (
              <TitleCollection
                danhSach={data.danhSachDanhHieu}
                tongExp={data.tongExp}
                onEquip={handleDeoDanhHieu}
              />
            )}

            <Leaderboard
              data={bangXepHang}
              refreshKey={lbRefresh}
              titleSync={titleSync}
              onLoaded={setBangXepHang}
            />

            <p className="tt-quote">
              <em>Kiến thức là phần thưởng lớn nhất, nhưng một chút EXP cũng không hại gì!</em>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
