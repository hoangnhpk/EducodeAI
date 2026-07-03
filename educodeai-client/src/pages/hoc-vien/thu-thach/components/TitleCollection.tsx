import { useState, type CSSProperties } from 'react';
import {
  BsCheckCircleFill,
  BsLockFill,
  BsStarFill,
  BsX,
} from 'react-icons/bs';
import type { DanhHieu } from '../types';
import { layStyleDanhHieu } from '../danhHieuTheme';
import DanhHieuBadge from './DanhHieuBadge';

interface TitleCollectionProps {
  danhSach: DanhHieu[];
  tongExp: number;
  onEquip: (maDanhHieu: number) => void | Promise<void>;
}

function layStyle(maCode: string) {
  return layStyleDanhHieu(maCode);
}

export default function TitleCollection({ danhSach, tongExp, onEquip }: TitleCollectionProps) {
  const [chonDanhHieu, setChonDanhHieu] = useState<DanhHieu | null>(null);

  const daMo = danhSach.filter((d) => d.daMoKhoa).length;
  const tiepTheo = danhSach.find((d) => !d.daMoKhoa);
  const expTruoc = [...danhSach].reverse().find((d) => d.expYeuCau <= tongExp)?.expYeuCau ?? 0;
  const expKe = tiepTheo?.expYeuCau ?? expTruoc;
  const phanTramKe = tiepTheo
    ? Math.min(100, Math.round(((tongExp - expTruoc) / (expKe - expTruoc)) * 100))
    : 100;

  const styleChon = chonDanhHieu ? layStyle(chonDanhHieu.maCode) : null;

  const handleXacNhanDeo = () => {
    if (!chonDanhHieu) return;
    const ma = chonDanhHieu.maDanhHieu;
    setChonDanhHieu(null);
    void onEquip(ma);
  };

  return (
    <section className="tt-titles">
      <div className="tt-titles__head">
        <div>
          <h2 className="tt-titles__heading">Kho danh hiệu</h2>
          <p className="tt-titles__sub">
            Đã mở khóa <strong>{daMo}/{danhSach.length}</strong> — chọn danh hiệu để đeo hiển thị
          </p>
        </div>
        {tiepTheo && (
          <div className="tt-titles__next">
            <span className="tt-titles__next-label">
              <BsStarFill size={12} /> Còn {Math.max(0, tiepTheo.expYeuCau - tongExp).toLocaleString('vi-VN')} EXP tới &quot;{tiepTheo.tenDanhHieu}&quot;
            </span>
            <div className="tt-titles__next-track">
              <div className="tt-titles__next-fill" style={{ width: `${phanTramKe}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="tt-titles__grid">
        {danhSach.map((dh) => {
          const style = layStyle(dh.maCode);
          const locked = !dh.daMoKhoa;
          const equipped = dh.dangDeo;

          return (
            <button
              key={dh.maDanhHieu}
              type="button"
              className={[
                'tt-title-card',
                locked ? 'is-locked' : 'is-unlocked',
                equipped ? 'is-equipped' : '',
              ].filter(Boolean).join(' ')}
              style={{
                '--tier-accent': style.accent,
                '--tier-bg': style.bg,
                '--tier-icon': style.icon,
                '--tier-glow': style.glow,
              } as CSSProperties}
              disabled={locked || equipped}
              onClick={() => {
                if (!locked && !equipped) setChonDanhHieu(dh);
              }}
            >
              {equipped && (
                <span className="tt-title-card__badge tt-title-card__badge--equipped tt-title-card__badge--top">
                  <BsCheckCircleFill size={11} /> Đang đeo
                </span>
              )}
              {!locked && !equipped && (
                <span className="tt-title-card__badge tt-title-card__badge--ready tt-title-card__badge--top">
                  Chọn đeo
                </span>
              )}

              <div className="tt-title-card__medal">
                {locked ? (
                  <>
                    <DanhHieuBadge maCode={dh.maCode} size={52} locked />
                    <span className="tt-title-card__lock">
                      <BsLockFill size={18} />
                    </span>
                  </>
                ) : (
                  <DanhHieuBadge maCode={dh.maCode} size={52} />
                )}
              </div>

              <h3 className="tt-title-card__name">{dh.tenDanhHieu}</h3>
              <p className="tt-title-card__exp">{dh.expYeuCau.toLocaleString('vi-VN')} EXP</p>

              {dh.moTa && <p className="tt-title-card__desc">{dh.moTa}</p>}
            </button>
          );
        })}
      </div>

      {chonDanhHieu && styleChon && (
        <div
          className="tt-title-modal-overlay"
          role="presentation"
          onClick={() => setChonDanhHieu(null)}
        >
          <div
            className="tt-title-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tt-title-modal-name"
            onClick={(e) => e.stopPropagation()}
            style={{
              '--tier-accent': styleChon.accent,
              '--tier-bg': styleChon.bg,
              '--tier-icon': styleChon.icon,
              '--tier-glow': styleChon.glow,
            } as CSSProperties}
          >
            <button
              type="button"
              className="tt-title-modal__close"
              aria-label="Đóng"
              onClick={() => setChonDanhHieu(null)}
            >
              <BsX size={22} />
            </button>

            <div className="tt-title-modal__medal">
              <DanhHieuBadge maCode={chonDanhHieu.maCode} size={72} />
            </div>

            <h3 id="tt-title-modal-name" className="tt-title-modal__name">
              {chonDanhHieu.tenDanhHieu}
            </h3>

            <p className="tt-title-modal__exp">
              Yêu cầu: {chonDanhHieu.expYeuCau.toLocaleString('vi-VN')} EXP
            </p>

            {chonDanhHieu.moTa && (
              <p className="tt-title-modal__desc">{chonDanhHieu.moTa}</p>
            )}

            <div className="tt-title-modal__actions">
              <button
                type="button"
                className="tt-title-modal__btn tt-title-modal__btn--cancel"
                onClick={() => setChonDanhHieu(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="tt-title-modal__btn tt-title-modal__btn--equip"
                onClick={handleXacNhanDeo}
              >
                Đeo danh hiệu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
