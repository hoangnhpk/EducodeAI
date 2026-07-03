import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { BsGlobe2, BsTrophy, BsTrophyFill } from 'react-icons/bs';
import { formatDemNguoc, layBangXepHang, layBangXepHangToanWeb } from '@/services/thu-thach.service';
import { getAnhDaiDienUrl, layChuCaiAvatar, layMauAvatar } from '@/utils/avatarHelper';
import type { BangXepHangResponse, LoaiBangXepHang } from '../types';
import DanhHieuBadge from './DanhHieuBadge';
import { layStyleDanhHieu } from '../danhHieuTheme';

type Tab = LoaiBangXepHang;

interface LeaderboardProps {
  className?: string;
  data?: BangXepHangResponse | null;
  refreshKey?: number;
  titleSync?: { tenDanhHieu: string; maCodeDanhHieu: string } | null;
  onLoaded?: (data: BangXepHangResponse) => void;
}

function formatTuan(batDau: string, ketThuc: string): string {
  const d1 = new Date(batDau);
  const d2 = new Date(ketThuc);
  const fmt = (d: Date) =>
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${fmt(d1)} – ${fmt(new Date(d2.getTime() - 1))}`;
}

function medalClass(hang: number): string {
  if (hang === 1) return 'tt-lb__rank--gold';
  if (hang === 2) return 'tt-lb__rank--silver';
  if (hang === 3) return 'tt-lb__rank--bronze';
  return '';
}

function formatThoiGianHoc(phut: number): string {
  const gio = Math.floor(phut / 60);
  const du = phut % 60;
  if (gio === 0) return `${du} phút`;
  if (du === 0) return `${gio} giờ`;
  return `${gio} giờ ${du} phút`;
}

function capNhatDanhHieuCuaToi(
  data: BangXepHangResponse | null,
  tenDanhHieu: string,
  maCodeDanhHieu: string,
): BangXepHangResponse | null {
  if (!data) return data;
  return {
    ...data,
    danhSach: data.danhSach.map((item) =>
      item.laToi ? { ...item, tenDanhHieu, maCodeDanhHieu } : item
    ),
  };
}

function LbAvatar({ hoTen, anhDaiDien }: { hoTen: string; anhDaiDien?: string | null }) {
  const [loiAnh, setLoiAnh] = useState(false);
  const url = getAnhDaiDienUrl(anhDaiDien);
  const initials = layChuCaiAvatar(hoTen);
  const mau = layMauAvatar(hoTen);

  if (url && !loiAnh) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setLoiAnh(true)}
      />
    );
  }

  return (
    <span
      className="tt-lb__avatar-initials"
      style={{ background: mau.bg, color: mau.color }}
    >
      {initials}
    </span>
  );
}

export default function Leaderboard({
  className = '',
  data: dataProp,
  refreshKey = 0,
  titleSync = null,
  onLoaded,
}: LeaderboardProps) {
  const [tab, setTab] = useState<Tab>('tuan');
  const [dataTuan, setDataTuan] = useState<BangXepHangResponse | null>(dataProp ?? null);
  const [dataToanWeb, setDataToanWeb] = useState<BangXepHangResponse | null>(null);
  const [loading, setLoading] = useState(!dataProp);
  const [error, setError] = useState<string | null>(null);
  const [toanWebStale, setToanWebStale] = useState(true);

  const data = tab === 'tuan' ? dataTuan : dataToanWeb;

  const taiBangTuan = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await layBangXepHang();
      setDataTuan(res);
      onLoaded?.(res);
    } catch {
      setError('Không tải được bảng xếp hạng.');
      if (!silent) setDataTuan(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [onLoaded]);

  const taiBangToanWeb = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await layBangXepHangToanWeb();
      setDataToanWeb(res);
      setToanWebStale(false);
    } catch {
      setError('Không tải được bảng xếp hạng.');
      if (!silent) setDataToanWeb(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const taiDuLieu = useCallback(async (silent = false) => {
    if (tab === 'tuan') {
      await taiBangTuan(silent);
    } else {
      await taiBangToanWeb(silent);
    }
  }, [tab, taiBangTuan, taiBangToanWeb]);

  useEffect(() => {
    if (dataProp) {
      setDataTuan(dataProp);
      if (tab === 'tuan') {
        setLoading(false);
        setError(null);
      }
    }
  }, [dataProp, tab]);

  useEffect(() => {
    if (refreshKey > 0) {
      void taiBangTuan(true);
      setToanWebStale(true);
      if (tab === 'toan_web') {
        void taiBangToanWeb(true);
      }
    }
  }, [refreshKey, tab, taiBangTuan, taiBangToanWeb]);

  useEffect(() => {
    if (!dataProp) {
      void taiBangTuan();
    }
  }, [dataProp, taiBangTuan]);

  useEffect(() => {
    if (tab === 'toan_web' && (toanWebStale || !dataToanWeb)) {
      void taiBangToanWeb();
    }
  }, [tab, toanWebStale, dataToanWeb, taiBangToanWeb]);

  useEffect(() => {
    if (!titleSync) return;
    setDataTuan((prev) => capNhatDanhHieuCuaToi(prev, titleSync.tenDanhHieu, titleSync.maCodeDanhHieu));
    setDataToanWeb((prev) => capNhatDanhHieuCuaToi(prev, titleSync.tenDanhHieu, titleSync.maCodeDanhHieu));
  }, [titleSync]);

  const handleDoiTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    setError(null);
    if (next === 'tuan' && dataTuan) {
      setLoading(false);
    } else if (next === 'toan_web' && dataToanWeb && !toanWebStale) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  const ruleText = tab === 'tuan'
    ? 'Xếp theo EXP tuần · Hòa EXP thì xếp theo tổng thời gian học trong tuần (ai học nhiều giờ hơn đứng trên, không tính ai nhận điểm trước)'
    : 'Top 50 học viên có tổng EXP cao nhất toàn hệ thống · Không reset, điểm cao hơn xếp trên';

  const emptyText = tab === 'tuan'
    ? 'Chưa có hoạt động học tập tuần này. Hoàn thành nhiệm vụ và nhận EXP để lên bảng!'
    : 'Chưa có học viên nào tích lũy EXP. Hãy hoàn thành nhiệm vụ để lên top server!';

  return (
    <section className={`tt-leaderboard ${className}`.trim()}>
      <div className="tt-leaderboard__head">
        <div className="tt-leaderboard__title-block">
          <div className="tt-leaderboard__title-row">
            {tab === 'tuan' ? (
              <BsTrophyFill className="tt-leaderboard__icon" size={20} aria-hidden />
            ) : (
              <BsGlobe2 className="tt-leaderboard__icon tt-leaderboard__icon--global" size={20} aria-hidden />
            )}
            <div>
              <h2 className="tt-leaderboard__title">
                {tab === 'tuan' ? 'Bảng xếp hạng tuần' : 'Bảng xếp hạng toàn web'}
              </h2>
              {data && !loading && tab === 'tuan' && data.ngayBatDau && data.ngayKetThuc && (
                <p className="tt-leaderboard__period">
                  {formatTuan(data.ngayBatDau, data.ngayKetThuc)}
                  {' · '}
                  Làm mới sau {formatDemNguoc(data.giayConLaiDenLamMoi ?? 0)}
                </p>
              )}
              {data && !loading && tab === 'toan_web' && (
                <p className="tt-leaderboard__period">
                  Xếp hạng vĩnh viễn theo tổng EXP · Top 50 server
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="tt-leaderboard__tabs" role="tablist" aria-label="Loại bảng xếp hạng">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'tuan'}
            className={`tt-leaderboard__tab${tab === 'tuan' ? ' tt-leaderboard__tab--active' : ''}`}
            onClick={() => handleDoiTab('tuan')}
          >
            Tuần
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'toan_web'}
            className={`tt-leaderboard__tab${tab === 'toan_web' ? ' tt-leaderboard__tab--active' : ''}`}
            onClick={() => handleDoiTab('toan_web')}
          >
            Toàn web
          </button>
        </div>
      </div>

      {!loading && !error && data && (
        <p className="tt-leaderboard__rule">{ruleText}</p>
      )}

      {loading && (
        <div className="tt-leaderboard__loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="tt-lb-skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="tt-leaderboard__error">
          <p>{error}</p>
          <button type="button" onClick={() => void taiDuLieu()}>Thử lại</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {data.hangCuaToi != null && (
            <div className="tt-leaderboard__mine">
              <span>Hạng của bạn</span>
              <strong>#{data.hangCuaToi}</strong>
              <span className="tt-leaderboard__mine-exp">{data.expCuaToi.toLocaleString('vi-VN')} EXP</span>
            </div>
          )}

          {data.danhSach.length === 0 ? (
            <p className="tt-leaderboard__empty">{emptyText}</p>
          ) : (
            <ol className="tt-leaderboard__list">
              {data.danhSach.map((item) => (
                <li
                  key={item.maNguoiDung}
                  className={`tt-lb-row${item.laToi ? ' tt-lb-row--me' : ''}`}
                >
                  <span
                    className={[
                      'tt-lb__rank',
                      item.maCodeDanhHieu ? 'tt-lb__rank--badge' : medalClass(item.hang),
                    ].filter(Boolean).join(' ')}
                    title={item.hang <= 3 ? `Hạng ${item.hang}` : undefined}
                  >
                    {item.maCodeDanhHieu ? (
                      <DanhHieuBadge maCode={item.maCodeDanhHieu} size={26} />
                    ) : item.hang <= 3 ? (
                      <BsTrophy size={14} />
                    ) : (
                      item.hang
                    )}
                  </span>
                  <div className="tt-lb__avatar">
                    <LbAvatar hoTen={item.hoTen} anhDaiDien={item.anhDaiDien} />
                  </div>
                  <div className="tt-lb__info">
                    <strong className="tt-lb__name">{item.hoTen}</strong>
                    {item.tenDanhHieu && (
                      <span
                        className="tt-lb__badge"
                        style={
                          item.maCodeDanhHieu
                            ? { color: layStyleDanhHieu(item.maCodeDanhHieu).accent } as CSSProperties
                            : undefined
                        }
                      >
                        {item.tenDanhHieu}
                      </span>
                    )}
                  </div>
                  <div className="tt-lb__side">
                    <span className="tt-lb__exp">{item.exp.toLocaleString('vi-VN')} EXP</span>
                    {tab === 'tuan' && item.gioHocPhut != null && (
                      <span className="tt-lb__study-time" title="Tổng thời gian học trong tuần">
                        {formatThoiGianHoc(item.gioHocPhut)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
