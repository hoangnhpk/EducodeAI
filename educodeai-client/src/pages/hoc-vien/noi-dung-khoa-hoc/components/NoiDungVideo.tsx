import YouTube from 'react-youtube';
import type { YouTubeEvent } from 'react-youtube';
import axiosClient from '@/configs/axios';
import Swal from 'sweetalert2'; // 1. Import SweetAlert2

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Props {
  videoUrl?: string | null;
  maBaiHoc: number;
  maNguoiDung: number;
  daXem?: boolean;
  onVideoCompleted?: (maBaiHoc: number) => void;
}

export const NoiDungVideo: React.FC<Props> = ({ videoUrl, maBaiHoc, maNguoiDung, daXem, onVideoCompleted }) => {
  const playerRef = useRef<any>(null);
  const [daSanSang, setDaSanSang] = useState(false);
  const dangCanhBaoRef = useRef(false);
  const [thoiLuongVideo, setThoiLuongVideo] = useState(0);
  const [thoiGianHienTai, setThoiGianHienTai] = useState(0);

  // (Đã xóa state hienCanhBao vì Swal tự quản lý giao diện)

  const daLuuTienDoRef = useRef(false);
  const lastValidTimeRef = useRef(0);

  const videoId = useMemo(() => {
    if (!videoUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, [videoUrl]);

  const tuyChinh = useMemo(() => ({
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  }), []);

  const luuTienDo = useCallback(async (thoiGianThuc: number) => {
    if (daLuuTienDoRef.current || thoiLuongVideo === 0) return;
    daLuuTienDoRef.current = true;

    try {
      await axiosClient.post('/NoiDungKhoaHoc/luu-tien-do', {
        MaBaiHoc: maBaiHoc,
        MaNguoiDung: maNguoiDung,
        DaXem: true,
        ThoiGianHoc: Math.max(Math.round(thoiGianThuc), 1),
      });
      onVideoCompleted?.(maBaiHoc);
    } catch (loi) {
      console.error('❌ Lỗi lưu tiến độ:', loi);
    }
  }, [thoiLuongVideo, maBaiHoc, maNguoiDung, onVideoCompleted]);

  const khiSanSang = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setDaSanSang(true);
    setThoiLuongVideo(playerRef.current.getDuration() || 0);
  };

  const khiTrangThaiThayDoi = (event: YouTubeEvent) => {
    if (event.data === 0) {
      const duration = playerRef.current?.getDuration() || 0;
      luuTienDo(duration);
    }
  };

  useEffect(() => {
    if (!daSanSang || daLuuTienDoRef.current) return;

    const interval = setInterval(() => {
      if (!playerRef.current) return;

      // Nếu đang hiện cảnh báo thì không check gì cả, dừng vòng lặp này
      if (dangCanhBaoRef.current) return;

      const currentTime = playerRef.current.getCurrentTime() || 0;
      const timeDiff = currentTime - lastValidTimeRef.current;

      // --- LOGIC MỚI: ĐỢI THÔNG BÁO XONG MỚI RESET ---
      if (!daXem && timeDiff > 120) {
        dangCanhBaoRef.current = true;
        playerRef.current.pauseVideo();

        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo tua!',
          text: 'Bạn không được tua quá 2 phút. Hệ thống sẽ đưa bạn về vị trí cũ.',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          position: 'center',
          backdrop: `rgba(0,0,0,0.6)`,
          customClass: { container: 'swal-z-index-fix' }
        }).then(() => {
          playerRef.current.seekTo(lastValidTimeRef.current, true);
          playerRef.current.playVideo();
          dangCanhBaoRef.current = false;
        });

        return;
      }

      lastValidTimeRef.current = currentTime;
      setThoiGianHienTai(currentTime);

      if (thoiLuongVideo > 0 && currentTime >= thoiLuongVideo * 0.95) {
        luuTienDo(currentTime);
      }
    }, 999);

    return () => clearInterval(interval);
  }, [daSanSang, thoiLuongVideo, luuTienDo]);

  useEffect(() => {
    daLuuTienDoRef.current = false;
    dangCanhBaoRef.current = false; // Reset cờ
    lastValidTimeRef.current = 0;
    setDaSanSang(false);
    setThoiLuongVideo(0);
    setThoiGianHienTai(0);
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="cp-video-frame">
        <div className="cp-video-inner">Chưa có video</div>
      </div>
    );
  }

  return (
    <div className="cp-tab-pane active" style={{ display: 'block', height: '100%' }}>
      {/* (Đã xóa phần Overlay HTML thủ công ở đây) */}

      <YouTube
        videoId={videoId}
        opts={tuyChinh}
        onReady={khiSanSang}
        onStateChange={khiTrangThaiThayDoi}
        className="cp-video-frame w-100 h-100"
        iframeClassName="w-100 h-100"
        style={{ aspectRatio: '16/9', borderRadius: '8px' }}
      />

      {daSanSang && (
        <div style={{ padding: '10px', margin: '0 0 40px 0', background: '#f8f9fa', textAlign: 'center' }}>
          <div>
            Thời gian: {Math.floor(thoiGianHienTai / 60)}:{Math.floor(thoiGianHienTai % 60).toString().padStart(2, '0')} /{' '}
            {Math.floor(thoiLuongVideo / 60)}:{Math.floor(thoiLuongVideo % 60).toString().padStart(2, '0')}
          </div>
          {/* {thoiGianHienTai >= thoiLuongVideo * 0.98 && thoiLuongVideo > 0 && (
            <span style={{ color: 'green' }}>✓ Đã xem hết video!</span>
          )} */}
        </div>
      )}
    </div>
  );
};