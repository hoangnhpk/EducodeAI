import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CourseLearningService } from '../services/course-learning.service';
import type { Lesson, QuizAnswer } from '../types/learning.types';

type NormalizedQuestion = { id: number; text: string; options: string[]; correctIndex: number };

function parseQuestions(json: string | undefined): NormalizedQuestion[] {
  try {
    const parsed = JSON.parse(json || '[]');
    const source = Array.isArray(parsed) ? parsed : parsed?.['Câu hỏi'] ?? [];
    return source.map((item: Record<string, unknown>, index: number) => {
      const legacyOptions = Array.isArray(item.LuaChon) ? item.LuaChon : [item.dapAnA, item.dapAnB, item.dapAnC, item.dapAnD];
      const answer = String(item.dapAnDung ?? item.DapAnDung ?? '').trim().toUpperCase();
      const letters: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      const numeric = Number(answer);
      const correctIndex = answer in letters ? letters[answer] : Number.isInteger(numeric) && numeric >= 0 && numeric <= 3 ? numeric : 0;
      return { id: Number(item.id ?? item.Id ?? index + 1), text: String(item.cauHoi ?? item.NoiDung ?? ''), options: [0, 1, 2, 3].map((i) => String(legacyOptions[i] ?? '')), correctIndex };
    });
  } catch { return []; }
}

export function QuizPanel({ lesson, userId }: { lesson: Lesson; userId?: number }) {
  const questions = useMemo(() => parseQuestions(lesson.thongTinQuiz?.duLieuCauHoiJSON), [lesson.thongTinQuiz?.duLieuCauHoiJSON]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number; passed: boolean } | null>(null);
  const [message, setMessage] = useState('');
  const submit = async () => {
    if (!userId || !lesson.thongTinQuiz || submitting || !questions.length) return;
    setSubmitting(true); setMessage('');
    const detail: QuizAnswer[] = questions.flatMap((question, index) => answers[index] === undefined ? [] : [{ IdCauHoi: question.id, IndexLuaChon: answers[index] }]);
    const correct = questions.reduce((total, question, index) => total + (answers[index] === question.correctIndex ? 1 : 0), 0);
    const score = correct / questions.length * 100;
    try {
      await CourseLearningService.saveQuizResult({ MaBaiHoc: lesson.id, MaBaiTap: lesson.thongTinQuiz.maBaiTap, MaNguoiDung: userId, DiemSo: score, SoCauDung: correct, TongSoCau: questions.length, DaDat: score >= lesson.thongTinQuiz.diemCanDat, ChiTietLamBai: detail });
      setResult({ correct, total: questions.length, passed: score >= lesson.thongTinQuiz.diemCanDat });
    } catch { setMessage('Không thể nộp bài, vui lòng thử lại.'); }
    finally { setSubmitting(false); }
  };
  if (!questions.length) return <Text style={styles.empty}>Chưa có dữ liệu câu hỏi.</Text>;
  return <View style={styles.container}>{questions.map((question, index) => <View key={question.id} style={styles.question}><Text style={styles.title}>{index + 1}. {question.text}</Text>{question.options.filter(Boolean).map((answer, answerIndex) => <Pressable key={answerIndex} onPress={() => !result && setAnswers((value) => ({ ...value, [index]: answerIndex }))} style={[styles.answer, answers[index] === answerIndex && styles.selected, result && answerIndex === question.correctIndex && styles.correct]}><Text>{answer}</Text></Pressable>)}</View>)}{result ? <Text style={[styles.result, result.passed ? styles.pass : styles.fail]}>Kết quả: {result.correct}/{result.total} câu đúng — {result.passed ? 'Đạt' : 'Chưa đạt'}</Text> : <Pressable disabled={submitting} style={styles.submit} onPress={() => void submit()}>{submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Nộp bài</Text>}</Pressable>}{!!message && <Text style={styles.message}>{message}</Text>}</View>;
}
const styles = StyleSheet.create({ container: { marginTop: 16 }, question: { padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 }, title: { fontWeight: '700', marginBottom: 10 }, answer: { padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginTop: 8 }, selected: { borderColor: '#f69050', backgroundColor: '#fef3ec' }, correct: { borderColor: '#10b981', backgroundColor: '#ecfdf5' }, submit: { minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f69050', borderRadius: 10 }, submitText: { color: '#fff', fontWeight: '700' }, result: { padding: 14, borderRadius: 10, fontWeight: '700' }, pass: { color: '#047857', backgroundColor: '#ecfdf5' }, fail: { color: '#b91c1c', backgroundColor: '#fef2f2' }, message: { marginTop: 10, color: '#6b7280' }, empty: { color: '#6b7280', marginTop: 12 } });
