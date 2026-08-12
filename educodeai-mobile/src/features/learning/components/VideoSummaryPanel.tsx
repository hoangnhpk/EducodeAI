import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { getVideoInteractive, type VideoInteractiveChapter } from '../services/video-summary.service';

export function VideoSummaryPanel({ lessonId }: { lessonId: number }) {
  const [chapters, setChapters] = useState<VideoInteractiveChapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const load = async () => { setLoading(true); setChapters(await getVideoInteractive(lessonId)); setLoaded(true); setLoading(false); };
  useEffect(() => { setChapters([]); setLoaded(false); }, [lessonId]);
  return <View style={styles.container}><Text style={styles.title}>Tóm tắt Video AI</Text>{!loaded && <Pressable style={styles.button} onPress={() => void load()}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Tạo tóm tắt</Text>}</Pressable>}{loaded && !chapters.length && <Text style={styles.muted}>Chưa có tóm tắt cho video này. Bạn vẫn có thể tiếp tục học.</Text>}{chapters.map((chapter) => <View key={chapter.maChapter} style={styles.chapter}><Text style={styles.chapterTitle}>{chapter.kienThucChinh}</Text><Text style={styles.time}>{chapter.thoiGianBatDau}s – {chapter.thoiGianKetThuc}s</Text></View>)}</View>;
}
const styles = StyleSheet.create({ container: { marginTop: 16, padding: 16, backgroundColor: '#f3effe', borderRadius: 16 }, title: { color: '#7c3aed', fontSize: 17, fontWeight: '800', marginBottom: 12 }, button: { minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8b5cf6', borderRadius: 10 }, buttonText: { color: '#fff', fontWeight: '700' }, muted: { color: '#6b7280', lineHeight: 22 }, chapter: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#ddd6fe' }, chapterTitle: { color: '#4c1d95', fontWeight: '700' }, time: { color: '#7c3aed', marginTop: 3, fontSize: 12 } });
