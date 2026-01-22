import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeEvent } from 'react-youtube'; // ← sửa ở đây

interface Props {
  videoUrl?: string | null;
  onSeekTo8Min?: () => void; // Callback tùy chọn khi tua đến/vượt 8 phút
}

export const NoiDungVideo: React.FC<Props> = ({ videoUrl, onSeekTo8Min }) => {
  const playerRef = useRef<any>(null); // any tạm thời để tránh lỗi type strict
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const targetTime = 8 * 60; // 8 phút = 480 giây

  // Extract video ID từ URL
  const getVideoId = (url?: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(videoUrl);

  // Options cho player
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setIsReady(true);

    // Check thời gian mỗi giây
    const interval = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime() as number;
        setCurrentTime(time);

        if (time >= targetTime) {
          onSeekTo8Min?.();
        }
      }
    }, 999);

    return () => clearInterval(interval);
  };

  // Optional: Phát hiện seek khi state thay đổi (PLAYING)
  const onStateChange = (event: YouTubeEvent) => {
    if (event.data === 1 && playerRef.current) { // 1 = PLAYING
      const time = playerRef.current.getCurrentTime() as number;
      if (time >= targetTime) {
        console.log('Video đang phát từ vị trí đã tua:', time);
      }
    }
  };

  if (!videoId) {
    return (
      <div className="cp-video-frame">
        <div className="cp-video-inner">
          <i className="fas fa-play-circle"></i>
          <div style={{ marginBottom: 4 }}>Chưa có video hoặc URL không hợp lệ</div>
          <div style={{ fontSize: '.85rem', opacity: 0.9 }}>
            Video player sẽ được tích hợp tại đây (YouTube, HTML5...)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-tab-pane active" style={{ display: 'block', height: '100%' }}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        className="cp-video-frame w-100 h-100"
        iframeClassName="w-100 h-100" 
        style={{ aspectRatio: '16/9', borderRadius: '8px' }}
      />

      {/* Debug thời gian (tùy chọn) */}
      {isReady && (
        <div style={{ padding: '10px', margin: '0 0 40px 0', background: '#f8f9fa', textAlign: 'center' }}>
          Thời gian hiện tại: {Math.floor(currentTime / 60)}:
          {Math.floor(currentTime % 60).toString().padStart(2, '0')}
          {currentTime >= targetTime && (
            <span style={{ color: 'green', marginLeft: '10px' }}>
              ✓ Đã tua đến/vượt 8 phút!
            </span>
          )}
        </div>
      )}
    </div>
  );
};