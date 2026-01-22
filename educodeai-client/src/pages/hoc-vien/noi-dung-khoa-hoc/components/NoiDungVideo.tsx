import YouTube from 'react-youtube';
import type { YouTubeEvent } from 'react-youtube';
import axiosClient from '@/configs/axios';
import Swal from 'sweetalert2';
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
  const [thoiLuongVideo, setThoiLuongVideo] = useState(0);
  const [thoiGianHienTai, setThoiGianHienTai] = useState(0);
  
  const daLuuTienDoRef = useRef(false);
  const dangCanhBaoRef = useRef(false);
  
  const lastValidVideoTimeRef = useRef(0);
  const lastRealTimeRef = useRef(Date.now());

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
    } catch (loi) { console.error(loi); }
  }, [thoiLuongVideo, maBaiHoc, maNguoiDung, onVideoCompleted]);

  // Hàm xử lý khi phát hiện gian lận (tách ra để tái sử dụng)
  const xuLyGianLan = (lastValidTime: number) => {
    dangCanhBaoRef.current = true;
    playerRef.current.pauseVideo();

    Swal.fire({
      icon: 'error',
          title: 'Phát hiện gian lận!',
          html: `
            Hệ thống chỉ ghi nhận thời gian học thực tế.<br/>
            Vui lòng không tua video!
          `,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          backdrop: `rgba(0,0,0,0.7)`,
          customClass: { container: 'swal-z-index-fix' }
    }).then(() => {
      playerRef.current.seekTo(lastValidTime, true);
      playerRef.current.playVideo();
      
      // Reset mốc thời gian để tránh lặp lỗi
      lastRealTimeRef.current = Date.now();
      lastValidVideoTimeRef.current = lastValidTime;
      
      dangCanhBaoRef.current = false;
    });
  };

  const khiSanSang = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setDaSanSang(true);
    setThoiLuongVideo(playerRef.current.getDuration() || 0);
    lastValidVideoTimeRef.current = 0;
    lastRealTimeRef.current = Date.now();
  };

  const khiTrangThaiThayDoi = (event: YouTubeEvent) => {
    if (event.data === 0) { // Kết thúc
      luuTienDo(playerRef.current?.getDuration() || 0);
    }
    
    // Khi bấm Play (1), kiểm tra xem trong lúc Pause người dùng có tua đi đâu xa không?
    if (event.data === 1) {
      const currentVideoTime = playerRef.current.getCurrentTime();
      // Nếu vị trí hiện tại xa hơn vị trí cũ quá 2 giây -> GIAN LẬN
      if (!daXem && (currentVideoTime - lastValidVideoTimeRef.current > 2)) {
         xuLyGianLan(lastValidVideoTimeRef.current);
         return;
      }

      // Nếu hợp lệ thì mới reset mốc thời gian thực
      lastRealTimeRef.current = Date.now();
      // Không update lastValidVideoTimeRef ở đây để đảm bảo tính liên tục
    }
  };

  useEffect(() => {
    if (!daSanSang || daLuuTienDoRef.current) return;

    const interval = setInterval(() => {
      if (!playerRef.current) return;
      if (dangCanhBaoRef.current) return;
      
      // Nếu video đang Pause hoặc Buffer thì không check, chỉ cập nhật lại mốc thực tế
      const playerState = playerRef.current.getPlayerState();
      if (playerState !== 1) { // 1 là Playing
         lastRealTimeRef.current = Date.now();
         return;
      }

      const currentVideoTime = playerRef.current.getCurrentTime() || 0;
      const currentRealTime = Date.now();
      
      // --- FIX LỖI 1: CHẶN TÍCH LŨY THỜI GIAN KHI TREO TAB ---
      // Tính thời gian thực trôi qua, NHƯNG KHÔNG ĐƯỢC QUÁ 2 giây (Cap limit)
      // Dù bạn treo tab 1 tiếng, hệ thống chỉ tính là bạn vừa xem 2 giây thôi.
      let realTimePassed = (currentRealTime - lastRealTimeRef.current) / 1000;
      if (realTimePassed > 3) realTimePassed = 1; // Nếu > 3s nghĩa là lag/treo tab -> reset về 1s chuẩn
      
      const videoTimePassed = currentVideoTime - lastValidVideoTimeRef.current;
      const playbackRate = playerRef.current.getPlaybackRate() || 1;

      // Ngưỡng cho phép
      const allowedProgress = (realTimePassed * playbackRate) + 2; // Giảm buffer xuống 1.5s cho chặt

      if (!daXem && videoTimePassed > allowedProgress) {
        xuLyGianLan(lastValidVideoTimeRef.current);
        return;
      }
      
      // Update trạng thái hợp lệ
      // Chỉ update khi video chạy xuôi (videoTimePassed > 0)
      if (videoTimePassed <= allowedProgress && videoTimePassed > -5) { 
          lastValidVideoTimeRef.current = currentVideoTime;
          lastRealTimeRef.current = currentRealTime;
          setThoiGianHienTai(currentVideoTime);
      } else if (videoTimePassed < -5) {
          // Trường hợp tua ngược lại để xem lại bài -> Cho phép và cập nhật mốc mới
          lastValidVideoTimeRef.current = currentVideoTime;
          lastRealTimeRef.current = currentRealTime;
          setThoiGianHienTai(currentVideoTime);
      }

      if (thoiLuongVideo > 0 && currentVideoTime >= thoiLuongVideo * 0.95) {
        luuTienDo(currentVideoTime);
      }
    }, 700); 

    return () => clearInterval(interval);
  }, [daSanSang, thoiLuongVideo, luuTienDo, daXem]);

  // Reset khi đổi bài
  useEffect(() => {
    daLuuTienDoRef.current = false;
    dangCanhBaoRef.current = false;
    lastValidVideoTimeRef.current = 0;
    lastRealTimeRef.current = Date.now();
    setDaSanSang(false);
    setThoiLuongVideo(0);
    setThoiGianHienTai(0);
  }, [videoId]);

  if (!videoId) return <div className="cp-video-frame"><div className="cp-video-inner">Chưa có video</div></div>;

  return (
    <div className="cp-tab-pane active" style={{ display: 'block', height: '100%' }}>
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
        <div style={{ padding: '10px', background: '#f8f9fa', textAlign: 'center' }}>
             {Math.floor(thoiGianHienTai / 60)}:{Math.floor(thoiGianHienTai % 60).toString().padStart(2, '0')} /{' '}
            {Math.floor(thoiLuongVideo / 60)}:{Math.floor(thoiLuongVideo % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  );
};