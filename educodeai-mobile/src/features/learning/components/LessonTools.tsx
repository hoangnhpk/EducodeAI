import { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthContext } from '../../auth/context/AuthContext';
import { CourseLearningService } from '../services/course-learning.service';
import type { Lesson } from '../types/learning.types';

export function LessonTools({ lesson }: { lesson: Lesson }) {
  const { user } = useContext(AuthContext);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const saveNote = async () => {
    if (!user?.maNguoiDung || !note.trim()) return;
    setSaving(true); setMessage('');
    try {
      await CourseLearningService.saveNote({ MaBaiHoc: lesson.id, MaNguoiDung: user.maNguoiDung, ThoiGianVideo: 0, NoiDung: note.trim() });
      setNote(''); setMessage('Đã lưu ghi chú.');
    } catch { setMessage('Không thể lưu ghi chú. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  return <View style={styles.container}>
    <Text style={styles.heading}>Ghi chú bài học</Text>
    <TextInput value={note} onChangeText={setNote} multiline placeholder="Viết ghi chú của bạn..." placeholderTextColor="#9ca3af" style={styles.input} />
    <Pressable disabled={saving || !note.trim()} onPress={() => void saveNote()} style={[styles.button, (saving || !note.trim()) && styles.disabled]}>
      {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Lưu ghi chú</Text>}
    </Pressable>
    {!!message && <Text style={styles.message}>{message}</Text>}
  </View>;
}

const styles = StyleSheet.create({ container: { marginTop: 24, padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' }, heading: { color: '#111827', fontWeight: '800', fontSize: 17, marginBottom: 12 }, input: { minHeight: 90, padding: 12, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, textAlignVertical: 'top' }, button: { minHeight: 44, marginTop: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#f69050' }, buttonText: { color: '#fff', fontWeight: '700' }, disabled: { opacity: 0.5 }, message: { color: '#6b7280', marginTop: 8 } });
