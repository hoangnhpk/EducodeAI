import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import YoutubePlayer, { PLAYER_STATES, type YoutubeIframeRef } from 'react-native-youtube-iframe';
import type { Lesson } from '../types/learning.types';

function getYouTubeId(value?: string | null) { if (!value) return null; const match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/i); return match?.[1] ?? null; }

function DirectVideo({ uri, onComplete, onTimeUpdate, initialTime = 0 }: { uri: string; onComplete: () => void; onTimeUpdate?: (seconds: number) => void; initialTime?: number }) {
  const player = useVideoPlayer(uri, (instance) => { instance.loop = false; instance.timeUpdateEventInterval = 1; instance.currentTime = initialTime; instance.play(); instance.addListener('playToEnd', onComplete); });
  const lastTime = useRef(0);
  useEffect(() => { const subscription = player.addListener('timeUpdate', ({ currentTime }) => { if (currentTime - lastTime.current > 3) player.currentTime = lastTime.current; else if (currentTime >= lastTime.current) { lastTime.current = currentTime; onTimeUpdate?.(currentTime); } }); return () => subscription.remove(); }, [player]);
  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />;
}

function YoutubeVideo({ videoId, onComplete, onTimeUpdate, initialTime = 0 }: { videoId: string; onComplete: () => void; onTimeUpdate?: (seconds: number) => void; initialTime?: number }) {
  const playerRef = useRef<YoutubeIframeRef | null>(null); const lastTime = useRef(0); const playing = useRef(false);
  useEffect(() => { const timer = setInterval(async () => { if (!playing.current || !playerRef.current) return; const current = await playerRef.current.getCurrentTime(); if (current - lastTime.current > 3) { playerRef.current.seekTo(lastTime.current, false); return; } if (current >= lastTime.current) { lastTime.current = current; onTimeUpdate?.(current); } }, 1000); return () => clearInterval(timer); }, [onTimeUpdate]);
  return <YoutubePlayer ref={playerRef} height={220} play forceAndroidAutoplay videoId={videoId} onChangeState={(state: string) => { playing.current = state === PLAYER_STATES.PLAYING; if (state === PLAYER_STATES.PLAYING && initialTime > 0 && lastTime.current === 0) { playerRef.current?.seekTo(initialTime, false); lastTime.current = initialTime; } if (state === PLAYER_STATES.ENDED) onComplete(); }} />;
}

export function VideoLesson({ lesson, onComplete, onTimeUpdate }: { lesson: Lesson; onComplete: () => void; onTimeUpdate?: (seconds: number) => void }) {
  const youtubeId = lesson.videoSource?.toLowerCase() === 'youtube' || !lesson.videoSource ? getYouTubeId(lesson.linkVideo) : null;
  return <View style={styles.container}>{lesson.linkVideo ? (youtubeId ? <YoutubeVideo videoId={youtubeId} onComplete={onComplete} onTimeUpdate={onTimeUpdate} initialTime={lesson.thoiGianDaXem ?? 0} /> : <DirectVideo uri={lesson.linkVideo} onComplete={onComplete} onTimeUpdate={onTimeUpdate} initialTime={lesson.thoiGianDaXem ?? 0} />) : <Text style={styles.empty}>Video chưa sẵn sàng.</Text>}{lesson.phuDeVideo ? <View style={styles.transcript}><Text style={styles.transcriptTitle}>Nội dung video</Text><Text style={styles.transcriptText}>{lesson.phuDeVideo}</Text></View> : null}</View>;
}

const styles = StyleSheet.create({ container: { backgroundColor: '#111827', borderRadius: 16, overflow: 'hidden', minHeight: 180 }, video: { width: '100%', height: 220 }, empty: { color: '#fff', textAlign: 'center', padding: 32 }, transcript: { backgroundColor: '#1f2937', padding: 14 }, transcriptTitle: { color: '#f9fafb', fontWeight: '800' }, transcriptText: { color: '#d1d5db', lineHeight: 20, marginTop: 6 } });
