import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import YoutubePlayer, { PLAYER_STATES, type YoutubeIframeRef } from 'react-native-youtube-iframe';
import type { Lesson } from '../types/learning.types';

function getYouTubeId(value?: string | null) { if (!value) return null; const match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/i); return match?.[1] ?? null; }

function DirectVideo({ uri, onComplete }: { uri: string; onComplete: () => void }) {
  const player = useVideoPlayer(uri, (instance) => { instance.loop = false; instance.timeUpdateEventInterval = 1; instance.play(); instance.addListener('playToEnd', onComplete); });
  const lastTime = useRef(0);
  useEffect(() => { const subscription = player.addListener('timeUpdate', ({ currentTime }) => { if (currentTime - lastTime.current > 3) player.currentTime = lastTime.current; else if (currentTime >= lastTime.current) lastTime.current = currentTime; }); return () => subscription.remove(); }, [player]);
  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />;
}

function YoutubeVideo({ videoId, onComplete }: { videoId: string; onComplete: () => void }) {
  const playerRef = useRef<YoutubeIframeRef | null>(null); const lastTime = useRef(0); const playing = useRef(false);
  useEffect(() => { const timer = setInterval(async () => { if (!playing.current || !playerRef.current) return; const current = await playerRef.current.getCurrentTime(); if (current - lastTime.current > 3) { playerRef.current.seekTo(lastTime.current, false); return; } if (current >= lastTime.current) lastTime.current = current; }, 1000); return () => clearInterval(timer); }, []);
  return <YoutubePlayer ref={playerRef} height={220} play forceAndroidAutoplay videoId={videoId} onChangeState={(state: string) => { playing.current = state === PLAYER_STATES.PLAYING; if (state === PLAYER_STATES.ENDED) onComplete(); }} />;
}

export function VideoLesson({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const youtubeId = lesson.videoSource?.toLowerCase() === 'youtube' || !lesson.videoSource ? getYouTubeId(lesson.linkVideo) : null;
  return <View style={styles.container}>{lesson.linkVideo ? (youtubeId ? <YoutubeVideo videoId={youtubeId} onComplete={onComplete} /> : <DirectVideo uri={lesson.linkVideo} onComplete={onComplete} />) : null}</View>;
}

const styles = StyleSheet.create({ container: { backgroundColor: '#111827', borderRadius: 16, overflow: 'hidden', minHeight: 180 }, video: { width: '100%', height: 220 } });
