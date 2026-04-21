import React, { useState, useCallback } from 'react';
import type { PlaylistAnalyzeResult, YouTubeVideoItem, ChuongHocDetail } from '../types';
import * as api from '../api/khoaHocApi';
import EmptyState from '../components/ui/EmptyState';
import { useToastStandalone } from '../components/ui/Toast';

const STEPS = ['Nhập URL', 'Chọn video', 'Cài đặt', 'Hoàn thành'];

interface Props {
  maKhoaHoc: number;
  existingChapters?: ChuongHocDetail[];
  onSuccess: () => void;
  onCancel: () => void;
}

const PlaylistImportPage: React.FC<Props> = ({
  maKhoaHoc, existingChapters = [], onSuccess, onCancel,
}) => {
  const { showToast, ToastContainer } = useToastStandalone();

  const [step, setStep] = useState(0);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistAnalyzeResult | null>(null);
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchVideo, setSearchVideo] = useState('');
  const [importGroups, setImportGroups] = useState<{
    id: string;
    mode: 'new' | 'existing';
    newChapterName: string;
    targetChapterId: number | null;
    videoIds: string[];
  }[]>([]);
  const [activeGroupModal, setActiveGroupModal] = useState<string | null>(null); // which group is opening the video selector modal

  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<{ success: number; total: number; message?: string } | null>(null);
  const [importError, setImportError] = useState('');

  // ---- Step 1: Analyze ----
  const handleAnalyze = useCallback(async () => {
    const urlTrim = url.trim();
    if (!urlTrim.includes('youtube.com') && !urlTrim.includes('youtu.be')) {
      setUrlError('Vui lòng nhập link playlist YouTube hợp lệ.');
      return;
    }
    if (!urlTrim.includes('list=')) {
      setUrlError('URL này không chứa playlist. Hãy nhập đúng link playlist YouTube.');
      return;
    }
    setUrlError('');
    try {
      setAnalyzing(true);
      const result = await api.analyzePlaylist({ playlistUrl: urlTrim });
      setPlaylist(result);
      const vids = await api.getPlaylistVideos(result.playlistId);
      setVideos(vids);
      setSelectedIds(new Set(vids.map(v => v.videoId)));
      setImportGroups([
        { id: '1', mode: 'new', newChapterName: result.title?.substring(0, 80) || 'Chương mới', targetChapterId: null, videoIds: vids.map(v => v.videoId) }
      ]);
      setStep(1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUrlError(msg || 'Không thể phân tích playlist. Vui lòng kiểm tra lại URL.');
    } finally {
      setAnalyzing(false);
      setLoadingVideos(false);
    }
  }, [url]);

  // ---- Step 2: Selection ----
  const toggleVideo = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === videos.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(videos.map(v => v.videoId)));
  };

  const filteredVideos = videos.filter(v =>
    !searchVideo || v.title.toLowerCase().includes(searchVideo.toLowerCase()),
  );
  const formatDur = (s: number) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ---- Step 3: Import ----
  const handleImport = async () => {
    // Validate
    if (importGroups.length === 0) { showToast('warning', 'Vui lòng thêm ít nhất 1 chương để import.'); return; }
    
    let totalVideos = 0;
    for (const g of importGroups) {
      if (g.mode === 'new' && !g.newChapterName.trim()) { showToast('warning', 'Vui lòng nhập tên chương mới.'); return; }
      if (g.mode === 'existing' && !g.targetChapterId) { showToast('warning', 'Vui lòng chọn chương có sẵn.'); return; }
      if (g.videoIds.length === 0) { showToast('warning', 'Mỗi chương phải có ít nhất 1 video.'); return; }
      totalVideos += g.videoIds.length;
    }
    
    if (totalVideos === 0) { showToast('warning', 'Vui lòng chọn ít nhất 1 video để import.'); return; }

    try {
      setImporting(true);
      setStep(2);
      setImportProgress({ current: 0, total: importGroups.length });
      
      let totalSuccess = 0;
      for (let i = 0; i < importGroups.length; i++) {
        const g = importGroups[i];
        const result = await api.importPlaylist({
          maKhoaHoc,
          playlistId: playlist!.playlistId,
          videos: g.videoIds.map(id => videos.find(v => v.videoId === id)!).filter(Boolean),
          targetChapterId: g.mode === 'existing' ? g.targetChapterId : null,
          newChapterName: g.mode === 'new' ? g.newChapterName.trim() : undefined,
        });
        totalSuccess += result.importedCount ?? 0;
        setImportProgress({ current: i + 1, total: importGroups.length });
      }

      setImportResult({
        success: totalSuccess,
        total: totalVideos,
        message: 'Hoàn tất import nội dung!',
      });
      setStep(3);
    } catch {
      setImportError('Import thất bại ở một số chương. Vui lòng kiểm tra lại khóa học.');
      setStep(3);
    } finally {
      setImporting(false);
    }
  };

  const handleNextToStep3 = () => {
    // Cleanup import groups: if any video in the groups is not in selectedIds anymore, remove it.
    const selArr = Array.from(selectedIds);
    setImportGroups(prev => {
      let ng = prev.map(g => ({ ...g, videoIds: g.videoIds.filter(id => selectedIds.has(id)) }));
      if (ng.length === 0) {
        // If empty, auto-create one
        ng = [{ id: Date.now().toString(), mode: 'new', newChapterName: 'Chương mới', targetChapterId: null, videoIds: selArr }];
      } else {
        // Automatically put unassigned videos into the first group if we want? Actually, it's better to let user decide
      }
      return ng;
    });
    setStep(2);
  };

  return (
    <div className="khm-wrapper">
      <ToastContainer />
      <div className="khm-page" style={{ maxWidth: 820 }}>
        {/* Breadcrumb */}
        <div className="khm-breadcrumb">
          <button onClick={onCancel}>Khóa học của tôi</button>
          <span className="khm-breadcrumb-sep">›</span>
          <span className="khm-breadcrumb-current">Import YouTube Playlist</span>
        </div>

        <div className="khm-page-header" style={{ marginBottom: 28 }}>
          <div>
            <h1 className="khm-page-title">Import YouTube Playlist</h1>
            <p className="khm-page-subtitle">Tự động tạo bài học từ playlist YouTube</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="khm-step-indicator">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="khm-step">
                <div className={`khm-step-circle ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`khm-step-label ${i < step ? 'done' : i === step ? 'active' : ''}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`khm-step-line ${i < step ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ---- STEP 0: URL Input ---- */}
        {step === 0 && (
          <div className="khm-form-section fade-in">
            <div className="khm-form-section-header">
              <div className="khm-form-section-icon">🔗</div>
              <h3 className="khm-form-section-title">Nhập link playlist YouTube</h3>
            </div>
            <div className="khm-form-section-body">
              <div className="khm-alert khm-alert-info" style={{ marginBottom: 20 }}>
                💡 Paste link playlist YouTube công khai vào đây. Ví dụ:
                <code style={{ display: 'block', marginTop: 6, fontSize: '0.78rem', opacity: 0.8 }}>
                  https://www.youtube.com/playlist?list=PLxxxxxx
                </code>
              </div>

              <div className="khm-url-input-wrap">
                <input
                  className={`khm-url-input ${urlError ? 'error' : ''}`}
                  placeholder="Dán link playlist YouTube vào đây..."
                  value={url}
                  onChange={e => { setUrl(e.target.value); setUrlError(''); }}
                  onKeyDown={e => e.key === 'Enter' && void handleAnalyze()}
                  disabled={analyzing}
                />
                <button
                  className="khm-btn khm-btn-primary"
                  onClick={() => void handleAnalyze()}
                  disabled={analyzing || !url.trim()}
                  style={{ minWidth: 130 }}
                >
                  {analyzing
                    ? <><span className="khm-spinner khm-spinner-sm" /> Đang phân tích...</>
                    : '🔍 Phân tích'}
                </button>
              </div>
              {urlError && <div className="khm-form-error" style={{ marginTop: 8 }}>⚠ {urlError}</div>}
            </div>
          </div>
        )}

        {/* ---- STEP 1: Video Selection ---- */}
        {step === 1 && playlist && (
          <div className="fade-in">
            {/* Playlist info */}
            <div className="khm-playlist-card">
              {playlist.thumbnailUrl && (
                <img src={playlist.thumbnailUrl} alt={playlist.title} className="khm-playlist-thumb" />
              )}
              <div style={{ flex: 1 }}>
                <h3 className="khm-playlist-info-title">{playlist.title}</h3>
                <div className="khm-playlist-info-meta">
                  {playlist.channelTitle && <span>📺 {playlist.channelTitle}</span>}
                  <span>🎬 {playlist.videoCount} video</span>
                  <span className="khm-badge khm-badge-yt">YouTube</span>
                </div>
              </div>
            </div>

            {/* Selection controls */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                <input type="checkbox" className="khm-checkbox"
                  checked={selectedIds.size === videos.length && videos.length > 0}
                  onChange={toggleAll}
                />
                Chọn tất cả
              </label>
              <span className="khm-badge khm-badge-primary" style={{ marginLeft: 'auto' }}>
                Đã chọn {selectedIds.size}/{videos.length} video
              </span>
              <div className="khm-search-box" style={{ maxWidth: 220 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  className="khm-search-input"
                  placeholder="Lọc video..."
                  value={searchVideo}
                  onChange={e => setSearchVideo(e.target.value)}
                  style={{ paddingLeft: 30, paddingTop: 7, paddingBottom: 7 }}
                />
              </div>
            </div>

            {loadingVideos ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <span className="khm-spinner khm-spinner-lg" />
                <p style={{ marginTop: 12, color: 'var(--khm-gray-500)', fontSize: '0.875rem' }}>Đang tải danh sách video...</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <EmptyState icon="🎬" title="Không tìm thấy video" description="Thử từ khóa khác" />
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
                {filteredVideos.map((v, idx) => (
                  <div
                    key={v.videoId}
                    className={`khm-video-item ${selectedIds.has(v.videoId) ? 'selected' : ''}`}
                    onClick={() => toggleVideo(v.videoId)}
                  >
                    <input type="checkbox" className="khm-checkbox"
                      checked={selectedIds.has(v.videoId)}
                      onChange={() => toggleVideo(v.videoId)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="khm-video-thumb-wrap">
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt={v.title} className="khm-video-thumb" />
                        : <div className="khm-list-item-thumb-placeholder">▶</div>}
                      {v.duration > 0 && (
                        <span className="khm-video-duration">{formatDur(v.duration)}</span>
                      )}
                    </div>
                    <div className="khm-video-item-info">
                      <div className="khm-video-item-title">{v.title}</div>
                      <div className="khm-video-item-meta">Video #{idx + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <button className="khm-btn khm-btn-outline" onClick={() => setStep(0)}>← Quay lại</button>
              <button
                className="khm-btn khm-btn-primary"
                onClick={handleNextToStep3}
                disabled={selectedIds.size === 0}
              >
                Tiếp theo ({selectedIds.size} video) →
              </button>
            </div>
          </div>
        )}

        {/* ---- STEP 2: Settings + Import ---- */}
        {step === 2 && !importing && (
          <div className="khm-form-section fade-in">
            <div className="khm-form-section-header">
              <div className="khm-form-section-icon">📁</div>
              <h3 className="khm-form-section-title">Cài đặt phân bổ dữ liệu</h3>
            </div>
            <div className="khm-form-section-body">
              <div className="khm-alert khm-alert-info" style={{ marginBottom: 20 }}>
                💡 Hiện có <strong>{selectedIds.size} video</strong> đã lọc. Bạn có thể chia số video này vào một hoặc nhiều chương.
              </div>

              {importGroups.map((g, idx) => (
                <div key={g.id} style={{ border: '2px dashed var(--khm-gray-200)', borderRadius: 12, padding: 16, marginBottom: 16, position: 'relative' }}>
                  {importGroups.length > 1 && (
                    <button 
                      onClick={() => setImportGroups(p => p.filter(x => x.id !== g.id))}
                      style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--khm-danger)', cursor: 'pointer', fontWeight: 700 }}
                    >✕ Xóa</button>
                  )}
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>Chương {idx + 1}</h4>
                  
                  {existingChapters.length > 0 && (
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <label style={{ display: 'flex', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input type="radio" checked={g.mode === 'new'} onChange={() => {
                          setImportGroups(p => p.map(x => x.id === g.id ? { ...x, mode: 'new' } : x));
                        }} /> Tạo mới
                      </label>
                      <label style={{ display: 'flex', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input type="radio" checked={g.mode === 'existing'} onChange={() => {
                          setImportGroups(p => p.map(x => x.id === g.id ? { ...x, mode: 'existing' } : x));
                        }} /> Sẵn có
                      </label>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      {g.mode === 'new' ? (
                        <input className="khm-form-input" placeholder="Tên chương mới..." value={g.newChapterName} onChange={e => {
                          setImportGroups(p => p.map(x => x.id === g.id ? { ...x, newChapterName: e.target.value } : x));
                        }} />
                      ) : (
                        <select className="khm-form-select" value={g.targetChapterId ?? ''} onChange={e => {
                          setImportGroups(p => p.map(x => x.id === g.id ? { ...x, targetChapterId: Number(e.target.value) } : x));
                        }}>
                          <option value="">-- Chọn chương --</option>
                          {existingChapters.map(c => <option key={c.maChuong} value={c.maChuong}>{c.tenChuong}</option>)}
                        </select>
                      )}
                    </div>
                    <div>
                      <button className="khm-btn khm-btn-outline" onClick={() => setActiveGroupModal(g.id)}>
                        🎥 Chọn Video ({g.videoIds.length})
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button className="khm-btn khm-btn-ghost" onClick={() => {
                setImportGroups(p => [...p, { id: Date.now().toString(), mode: 'new', newChapterName: 'Chương ' + (p.length + 1), targetChapterId: null, videoIds: [] }]);
              }} style={{ width: '100%', border: '2px dashed var(--khm-gray-300)', padding: 12 }}>
                + Thêm khối chương
              </button>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 24 }}>
                <button className="khm-btn khm-btn-outline" onClick={() => setStep(1)}>← Quay lại lọc video</button>
                <button className="khm-btn khm-btn-primary" onClick={() => void handleImport()}>
                  ⬇ Import {importGroups.reduce((acc, g) => acc + g.videoIds.length, 0)} video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Importing progress */}
        {step === 2 && importing && (
          <div className="khm-form-section fade-in">
            <div className="khm-form-section-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <span className="khm-spinner khm-spinner-lg" style={{ margin: '0 auto 20px', display: 'block' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Đang import chương {importProgress.current}/{importProgress.total}...</h4>
              <p style={{ color: 'var(--khm-gray-500)', fontSize: '0.875rem' }}>
                Tiến trình này có thể mất một lúc, vui lòng không tắt trang...
              </p>
              <div className="khm-progress" style={{ maxWidth: 300, margin: '20px auto 0' }}>
                <div className="khm-progress-bar" style={{ width: `${(importProgress.current / (importProgress.total || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ---- STEP 3: Result ---- */}
        {step === 3 && (
          <div className="khm-form-section fade-in">
            <div className="khm-form-section-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
              {importError ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--khm-danger)' }}>Import thất bại</h4>
                  <p style={{ color: 'var(--khm-gray-500)', marginBottom: 24 }}>{importError}</p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button className="khm-btn khm-btn-outline" onClick={() => { setStep(2); setImportError(''); }}>Trở lại Cài đặt import</button>
                    <button className="khm-btn khm-btn-ghost" onClick={onCancel}>Hủy</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--khm-success)', marginBottom: 8 }}>
                    Import thành công!
                  </h4>
                  <p style={{ color: 'var(--khm-gray-600)', marginBottom: 8 }}>
                    Đã thêm tổng cộng <strong>{importResult?.success}</strong>/{importResult?.total} bài học.
                  </p>
                  {importResult?.message && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--khm-gray-400)', marginBottom: 24 }}>{importResult.message}</p>
                  )}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button className="khm-btn khm-btn-primary" onClick={onSuccess}>
                      Hoàn tất & Làm mới danh sách →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Select Videos for Chapter GROUP Modal */}
      {activeGroupModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 500, borderRadius: 12, padding: 20, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Chọn video cho chương này</h3>
            <div style={{ marginBottom: 12, padding: '0 8px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <input 
                  type="checkbox" 
                  className="khm-checkbox" 
                  checked={(() => {
                    if (!activeGroupModal) return false;
                    const actGrp = importGroups.find(g => g.id === activeGroupModal);
                    const otherIds = new Set(importGroups.filter(g => g.id !== activeGroupModal).flatMap(g => g.videoIds));
                    const availableIds = Array.from(selectedIds).filter(id => !otherIds.has(id));
                    return availableIds.length > 0 && actGrp?.videoIds.length === availableIds.length;
                  })()}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setImportGroups(p => {
                      const otherIds = new Set(p.filter(g => g.id !== activeGroupModal).flatMap(g => g.videoIds));
                      const availableIds = Array.from(selectedIds).filter(id => !otherIds.has(id));
                      return p.map(g => {
                        if (g.id === activeGroupModal) {
                          return { ...g, videoIds: checked ? availableIds : [] };
                        }
                        return g;
                      });
                    });
                  }} 
                />
                Chọn tất cả {
                  activeGroupModal 
                  ? Array.from(selectedIds).filter(id => !importGroups.filter(g => g.id !== activeGroupModal).flatMap(g => g.videoIds).includes(id)).length 
                  : 0
                } video chưa gán
              </label>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--khm-gray-200)', borderRadius: 8, padding: 8 }}>
              {Array.from(selectedIds).map(vid => {
                const vi = videos.find(x => x.videoId === vid);
                if (!vi) return null;
                const actGrp = importGroups.find(g => g.id === activeGroupModal);
                const isSelected = actGrp?.videoIds.includes(vid) ?? false;
                // Optional: show if it's already assigned elsewhere
                const otherGrp = importGroups.find(g => g.id !== activeGroupModal && g.videoIds.includes(vid));

                return (
                  <label key={vid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', cursor: otherGrp ? 'not-allowed' : 'pointer', borderBottom: '1px solid var(--khm-gray-100)', background: isSelected ? 'var(--khm-gray-50)' : 'transparent', opacity: otherGrp ? 0.6 : 1 }}>
                    <input type="checkbox" className="khm-checkbox" checked={isSelected} disabled={!!otherGrp} onChange={(e) => {
                      if (otherGrp) return; // double protection
                      const checked = e.target.checked;
                      setImportGroups(p => p.map(g => {
                        if (g.id === activeGroupModal) {
                          return { ...g, videoIds: checked ? [...g.videoIds, vid] : g.videoIds.filter(id => id !== vid) };
                        }
                        return g;
                      }));
                    }} />
                    <img src={vi.thumbnailUrl} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} alt="" />
                    <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 600 }}>{vi.title.substring(0, 60)}{vi.title.length > 60 ? '...' : ''}</div>
                      {otherGrp && <div style={{ fontSize: '0.75rem', color: 'var(--khm-danger)' }}>⚠ Đã gài ở: {otherGrp.mode === 'new' ? otherGrp.newChapterName : (existingChapters.find(c => c.maChuong === otherGrp.targetChapterId)?.tenChuong ?? 'Chương sãn có')}</div>}
                    </div>
                  </label>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="khm-btn khm-btn-primary" onClick={() => setActiveGroupModal(null)}>Xong</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistImportPage;
