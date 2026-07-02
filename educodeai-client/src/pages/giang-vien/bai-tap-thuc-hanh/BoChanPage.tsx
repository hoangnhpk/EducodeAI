import { useState, useEffect } from 'react';
import { BaiTapThucHanhService } from '@/services/bai-tap-thuc-hanh.service';

interface Props {
  onBaiHocChange: (id: number | null, title: string) => void;
}

export default function BoChanPage({ onBaiHocChange }: Props) {
  const [khoaHocs, setKhoaHocs] = useState<any[]>([]);
  const [chuongHocs, setChuongHocs] = useState<any[]>([]);
  const [baiHocs, setBaiHocs] = useState<any[]>([]);

  const [selKhoaHoc, setSelKhoaHoc] = useState<string>('');
  const [selChuong, setSelChuong] = useState<string>('');
  const [selBaiHoc, setSelBaiHoc] = useState<string>('');

  const [loadingKH, setLoadingKH] = useState(false);
  const [loadingCH, setLoadingCH] = useState(false);
  const [loadingBH, setLoadingBH] = useState(false);

  // Load danh sách khóa học ban đầu
  useEffect(() => {
    (async () => {
      setLoadingKH(true);
      try {
        const res = await BaiTapThucHanhService.getKhoaHocs();
        setKhoaHocs(res.data || res || []);
      } catch (err) {
        console.error('Lỗi load khóa học:', err);
      } finally {
        setLoadingKH(false);
      }
    })();
  }, []);

  // Khi chọn Khóa Học -> Load Chương
  const handleKhoaHocChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelKhoaHoc(val);
    setSelChuong('');
    setSelBaiHoc('');
    setChuongHocs([]);
    setBaiHocs([]);
    onBaiHocChange(null, '');

    if (val) {
      setLoadingCH(true);
      try {
        const res = await BaiTapThucHanhService.getChuongHocs(Number(val));
        setChuongHocs(res.data || res || []);
      } catch (err) {
        console.error('Lỗi load chương:', err);
      } finally {
        setLoadingCH(false);
      }
    }
  };

  // Khi chọn Chương -> Load Bài Học
  const handleChuongChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelChuong(val);
    setSelBaiHoc('');
    setBaiHocs([]);
    onBaiHocChange(null, '');

    if (val) {
      setLoadingBH(true);
      try {
        const res = await BaiTapThucHanhService.getBaiHocs(Number(val));
        setBaiHocs(res.data || res || []);
      } catch (err) {
        console.error('Lỗi load bài học:', err);
      } finally {
        setLoadingBH(false);
      }
    }
  };

  // Khi chọn Bài Học
  const handleBaiHocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelBaiHoc(val);
    if (val) {
      const bh = baiHocs.find((b) => String(b.maBaiHoc) === val);
      onBaiHocChange(Number(val), bh?.tieuDe || '');
    } else {
      onBaiHocChange(null, '');
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="btth-section-header">
        <h3 className="btth-section-title">
          <i className="bi bi-collection-play" style={{ marginRight: '8px' }} />
          Bước 1: Chọn bài học
        </h3>
      </div>

      <div className="row" style={{ marginTop: '16px' }}>
        {/* Khóa Học */}
        <div className="col-md-4">
          <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Chọn khóa học của bạn</label>
          <div className="select-wrapper">
            <select className="form-control" value={selKhoaHoc} onChange={handleKhoaHocChange} disabled={loadingKH}>
              <option value="">-- Chọn khóa học --</option>
              {khoaHocs.map((kh) => (
                <option key={kh.maKhoaHoc} value={kh.maKhoaHoc}>{kh.tenKhoaHoc}</option>
              ))}
            </select>
            {loadingKH && <div className="spinner-border spinner-border-sm select-spinner" role="status" />}
          </div>
        </div>

        {/* Chương Học */}
        <div className="col-md-4">
          <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Chọn chương</label>
          <div className="select-wrapper">
            <select
              className="form-control"
              value={selChuong}
              onChange={handleChuongChange}
              disabled={!selKhoaHoc || loadingCH}
            >
              <option value="">-- Chọn chương --</option>
              {chuongHocs.map((ch) => (
                <option key={ch.maChuong} value={ch.maChuong}>{ch.tenChuong}</option>
              ))}
            </select>
            {loadingCH && <div className="spinner-border spinner-border-sm select-spinner" role="status" />}
          </div>
        </div>

        {/* Bài Học */}
        <div className="col-md-4">
          <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Chọn bài học</label>
          <div className="select-wrapper">
            <select
              className="form-control"
              value={selBaiHoc}
              onChange={handleBaiHocChange}
              disabled={!selChuong || loadingBH}
            >
              <option value="">-- Chọn bài học --</option>
              {baiHocs.map((bh) => (
                <option key={bh.maBaiHoc} value={bh.maBaiHoc}>{bh.tieuDe}</option>
              ))}
            </select>
            {loadingBH && <div className="spinner-border spinner-border-sm select-spinner" role="status" />}
          </div>
        </div>
      </div>
    </div>
  );
}
