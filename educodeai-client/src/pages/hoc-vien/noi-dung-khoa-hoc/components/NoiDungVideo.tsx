import React from 'react';

interface Props {
  videoUrl?: string | null;
}

export const NoiDungVideo: React.FC<Props> = ({ videoUrl }) => {

  const embedUrl = React.useMemo(() => {
    if (!videoUrl) return '';
    return videoUrl.includes('?')
      ? videoUrl + '&autoplay=1'
      : videoUrl + '?autoplay=1';
  }, [videoUrl]);


  if (!videoUrl) {
    return (
      <div className="cp-video-frame">
        <div className="cp-video-inner">
          <i className="fas fa-play-circle"></i>
          <div style={{ marginBottom: 4 }}>{videoUrl ? 'Video đang phát' : 'Chưa có video'}</div>
          <div style={{ fontSize: '.85rem', opacity: 0.9 }}>
            Video player sẽ được tích hợp tại đây (YouTube, HTML5...)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-tab-pane active" style={{ display: 'block' }}>
      <div id="cpVideoContainer">
        <div className="cp-video-frame" style={{ background: '#000', padding: 0 }}>
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title="Video Player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              aspectRatio: '16/9',
              width: '100%',
              borderRadius: '8px'
            }}
          />
        </div>
      </div>
    </div>
  );
};
