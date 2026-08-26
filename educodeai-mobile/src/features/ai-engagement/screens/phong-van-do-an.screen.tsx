import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../shared/configs/api';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';

const COLORS = {
  primary: '#F69050',
  aiAccent: '#8B5CF6',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
};

interface InterviewMessage {
  role: 'assistant' | 'user';
  content: string;
  score?: number;
  feedback?: string;
}

interface TraLoiPhongVanResponse {
  soCauHienTai: number;
  tongSoCau: number;
  daKetThuc: boolean;
  diemCauVua: number;
  nhanXet: string;
  cauHoiTiepTheo: string | null;
}

interface ChiTietCauHoi {
  soCau: number;
  cauHoi: string;
  cauTraLoi: string;
  diem: number;
  nhanXet: string;
}

interface KetQuaPhongVan {
  maDoAn: number;
  tongDiem: number;
  daDat: boolean;
  nhanXetTong: string;
  maChungChi?: string | null;
  chiTietCauHoi: ChiTietCauHoi[];
}

const QUESTION_TIME_SECONDS = 5 * 60;

function formatRemainingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function PhongVanDoAnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId?: string | string[];
    cauHoiDauTien?: string | string[];
    tenDoAn?: string | string[];
  }>();
  const sessionId = getSingleParam(params.sessionId);
  const firstQuestion = getSingleParam(params.cauHoiDauTien);
  const projectName = getSingleParam(params.tenDoAn) || 'Đồ án của bạn';

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [answer, setAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(QUESTION_TIME_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<KetQuaPhongVan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    if (firstQuestion) {
      setMessages([{ role: 'assistant', content: firstQuestion }]);
    }
  }, [firstQuestion]);

  useEffect(() => {
    if (isFinished || isSubmitting || isLoadingResult) return;
    const timer = setInterval(() => {
      setRemainingSeconds(current => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, isLoadingResult, isSubmitting]);

  const confirmLeave = useCallback(() => {
    Alert.alert(
      'Rời phiên phỏng vấn?',
      'Tiến độ của phiên hiện tại có thể không được lưu.',
      [
        { text: 'Ở lại', style: 'cancel' },
        { text: 'Rời đi', style: 'destructive', onPress: () => router.back() },
      ],
    );
  }, [router]);

  const loadResult = useCallback(async () => {
    if (!sessionId || requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setIsLoadingResult(true);
    setErrorMessage(null);
    try {
      const response = await api.get<KetQuaPhongVan>('/SinhDoAnAI/ket-qua', {
        params: { sessionId },
        timeout: 120000,
      });
      setResult(response.data);
    } catch {
      setErrorMessage('Không thể tải kết quả phỏng vấn. Vui lòng thử lại.');
    } finally {
      requestInFlightRef.current = false;
      setIsLoadingResult(false);
    }
  }, [sessionId]);

  const submitAnswer = useCallback(async () => {
    const trimmedAnswer = answer.trim();
    if (!sessionId || !trimmedAnswer || isFinished || requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    setAnswer('');
    setMessages(current => [...current, { role: 'user', content: trimmedAnswer }]);

    try {
      const response = await api.post<TraLoiPhongVanResponse>(
        '/SinhDoAnAI/tra-loi-phong-van',
        {
          sessionId,
          soCauHienTai: questionNumber,
          cauTraLoi: trimmedAnswer,
        },
        { timeout: 120000 },
      );
      const data = response.data;
      const nextMessages: InterviewMessage[] = [{
        role: 'assistant',
        content: data.nhanXet,
        score: data.diemCauVua,
        feedback: data.nhanXet,
      }];
      if (!data.daKetThuc && data.cauHoiTiepTheo) {
        nextMessages.push({ role: 'assistant', content: data.cauHoiTiepTheo });
      }
      setMessages(current => [...current, ...nextMessages]);
      setQuestionNumber(data.soCauHienTai + 1);
      setTotalQuestions(data.tongSoCau);
      setRemainingSeconds(QUESTION_TIME_SECONDS);
      setIsFinished(data.daKetThuc);
      if (data.daKetThuc) {
        requestInFlightRef.current = false;
        setIsSubmitting(false);
        await loadResult();
        return;
      }
    } catch {
      setAnswer(trimmedAnswer);
      setErrorMessage('Không thể gửi câu trả lời. Nội dung đã được giữ để bạn thử lại.');
    } finally {
      requestInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }, [answer, isFinished, loadResult, questionNumber, sessionId]);

  const missingSession = !sessionId || !firstQuestion;

  if (missingSession) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <AnimatedPressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Quay lại">
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Phỏng vấn đồ án</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={52} color={COLORS.aiAccent} />
          <Text style={styles.stateTitle}>Chưa có phiên phỏng vấn</Text>
          <Text style={styles.stateText}>
            Hãy bắt đầu từ bước nộp đồ án để máy chủ tạo session và câu hỏi đầu tiên.
          </Text>
          <AnimatedPressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Quay lại</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <AnimatedPressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Quay lại">
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </AnimatedPressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Phỏng vấn đồ án</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{projectName}</Text>
        </View>
        <AnimatedPressable style={styles.iconButton} onPress={confirmLeave} accessibilityLabel="Rời phỏng vấn">
          <Ionicons name="close" size={25} color={COLORS.danger} />
        </AnimatedPressable>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressCopy}>
          <Text style={styles.progressText}>Câu {Math.min(questionNumber, totalQuestions ?? questionNumber)}{totalQuestions ? `/${totalQuestions}` : ''}</Text>
          <Text style={[styles.timerText, remainingSeconds <= 60 && styles.timerDanger]}>{formatRemainingTime(remainingSeconds)}</Text>
        </View>
        {totalQuestions && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, ((questionNumber - (isFinished ? 1 : 0)) / totalQuestions) * 100)}%` }]} />
          </View>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
        {messages.map((message, index) => (
          <View
            key={`${message.role}-${index}`}
            style={[styles.messageRow, message.role === 'user' ? styles.userRow : styles.assistantRow]}
          >
            {message.role === 'assistant' && (
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={18} color={COLORS.surface} />
              </View>
            )}
            <View style={[styles.messageBubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={message.role === 'user' ? styles.userMessageText : styles.assistantMessageText}>
                {message.content}
              </Text>
              {message.score !== undefined && (
                <Text style={styles.scoreText}>Điểm câu trả lời: {message.score}/20</Text>
              )}
            </View>
          </View>
        ))}

        {(isSubmitting || isLoadingResult) && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={COLORS.aiAccent} />
            <Text style={styles.loadingText}>{isLoadingResult ? 'Đang tải kết quả...' : 'AI đang đánh giá...'}</Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
            {isFinished && (
              <AnimatedPressable style={styles.retryButton} onPress={() => void loadResult()} disabled={isLoadingResult}>
                <Text style={styles.retryText}>Thử lại</Text>
              </AnimatedPressable>
            )}
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <Ionicons name={result.daDat ? 'checkmark-circle' : 'information-circle'} size={40} color={result.daDat ? COLORS.success : COLORS.aiAccent} />
            <Text style={styles.resultTitle}>Kết quả: {result.tongDiem}/100</Text>
            <Text style={styles.resultText}>{result.nhanXetTong}</Text>
            {result.maChungChi && <Text style={styles.certificateText}>Mã chứng chỉ: {result.maChungChi}</Text>}
          </View>
        )}
      </ScrollView>

      {!isFinished && (
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={answer}
            onChangeText={setAnswer}
            placeholder="Nhập câu trả lời của bạn..."
            placeholderTextColor={COLORS.textMuted}
            editable={!isSubmitting}
            multiline
            maxLength={5000}
          />
          <AnimatedPressable
            style={[styles.sendButton, (!answer.trim() || isSubmitting) && styles.disabledButton]}
            onPress={() => void submitAnswer()}
            disabled={!answer.trim() || isSubmitting}
            accessibilityLabel="Gửi câu trả lời"
          >
            <Ionicons name="send" size={20} color={COLORS.surface} />
          </AnimatedPressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? 24 : 0 },
  header: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { marginTop: 2, fontSize: 13, color: COLORS.textMuted, maxWidth: 220 },
  progressArea: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  progressCopy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { color: COLORS.text, fontWeight: '700' },
  timerText: { color: COLORS.aiAccent, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerDanger: { color: COLORS.danger },
  progressTrack: { height: 6, marginTop: 8, overflow: 'hidden', borderRadius: 3, backgroundColor: COLORS.border },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.aiAccent },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 24 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  stateTitle: { marginTop: 16, fontSize: 20, fontWeight: '700', color: COLORS.text },
  stateText: { marginTop: 8, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  primaryButton: { marginTop: 20, minHeight: 44, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 10, backgroundColor: COLORS.primary },
  primaryButtonText: { color: COLORS.surface, fontWeight: '700' },
  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '92%' },
  assistantRow: { alignSelf: 'flex-start', alignItems: 'flex-end' },
  userRow: { alignSelf: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: COLORS.aiAccent },
  messageBubble: { flexShrink: 1, padding: 14, borderRadius: 16 },
  assistantBubble: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 6 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 6 },
  assistantMessageText: { color: COLORS.text, fontSize: 16, lineHeight: 23 },
  userMessageText: { color: COLORS.surface, fontSize: 16, lineHeight: 23 },
  scoreText: { marginTop: 8, color: COLORS.aiAccent, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  loadingText: { marginLeft: 10, color: COLORS.textMuted },
  errorState: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#FEF2F2' },
  errorText: { flex: 1, marginHorizontal: 8, color: COLORS.text },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  retryText: { color: COLORS.danger, fontWeight: '700' },
  resultCard: { marginTop: 16, padding: 20, alignItems: 'center', borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  resultTitle: { marginTop: 10, fontSize: 22, fontWeight: '700', color: COLORS.text },
  resultText: { marginTop: 8, color: COLORS.textMuted, lineHeight: 22, textAlign: 'center' },
  certificateText: { marginTop: 12, color: COLORS.success, fontWeight: '700' },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  input: { flex: 1, minHeight: 48, maxHeight: 120, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, color: COLORS.text, backgroundColor: '#F3F4F6', fontSize: 16 },
  sendButton: { width: 44, height: 44, marginLeft: 10, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.aiAccent },
  disabledButton: { opacity: 0.5 },
});
