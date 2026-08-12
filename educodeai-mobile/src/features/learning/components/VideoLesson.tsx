import { Pressable, StyleSheet, Text, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import type { Lesson } from '../types/learning.types';

function getYouTubeId(value?: string | null) {
  if (!value) return null;
  const match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/i);
  return match?.[1] ?? null;
}

function DirectVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => { instance.loop = false; });
  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />;
}

export function VideoLesson({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const youtubeId = lesson.videoSource?.toLowerCase() === 'youtube' || !lesson.videoSource ? getYouTubeId(lesson.linkVideo) : null;
  return <View style={styles.container}>{youtubeId ? <YoutubePlayer height={220} play={false} videoId={youtubeId} /> : <DirectVideo uri={lesson.linkVideo ?? ''} />}<Text style={styles.caption}>{lesson.tieuDe}</Text><Pressable style={styles.button} onPress={onComplete}><Text style={styles.buttonText}>Đánh dấu đã xem</Text></Pressable>{!youtubeId && <Text style={styles.muted}>Video trực tiếp được phát bằng trình phát native.</Text>}</View>;
}
const styles = StyleSheet.create({ container: { backgroundColor: '#111827', borderRadius: 16, overflow: 'hidden' }, video: { width: '100%', height: 220 }, caption: { color: '#fff', fontWeight: '700', padding: 12 }, button: { minHeight: 44, marginHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#f69050' }, buttonText: { color: '#fff', fontWeight: '700' }, muted: { color: '#d1d5db', textAlign: 'center', padding: 12 }, empty: { minHeight: 160, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', borderRadius: 16 } });
