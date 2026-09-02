import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { ChatMessage, TroLyAIService } from '../services/tro-ly-ai.service';

const COLORS = {
  primary: '#F69050',
  primaryPressed: '#E67E22',
  aiAccent: '#8B5CF6',
  background: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  danger: '#EF4444',
};

const HISTORY_PREFIX = 'mobile_chat_history';
const MAX_HISTORY_MESSAGES = 50;
const MAX_CONTEXT_MESSAGES = 10;
const MAX_LESSON_CONTENT_LENGTH = 2000;

interface ChatBotProps {
  courseId?: number;
  courseName?: string;
  tieuDeBaiHoc?: string | null;
  noiDungBaiHoc?: string | null;
}

function createWelcomeMessage(courseName?: string): ChatMessage {
  const courseContext = courseName ? ` về khóa ${courseName}` : '';
  return {
    VaiTro: 'assistant',
    NoiDung: `Chào bạn! Mình là trợ lý AI EduCode. Bạn cần hỗ trợ gì${courseContext}?`,
  };
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<ChatMessage>;
  return (message.VaiTro === 'user' || message.VaiTro === 'assistant')
    && typeof message.NoiDung === 'string';
}

function parseHistory(value: string | null): ChatMessage[] | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every(isChatMessage)) return null;
    return parsed.slice(-MAX_HISTORY_MESSAGES);
  } catch {
    return null;
  }
}

export const ChatBot: React.FC<ChatBotProps> = ({
  courseId,
  courseName,
  tieuDeBaiHoc,
  noiDungBaiHoc,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const requestInFlightRef = useRef(false);
  const mountedRef = useRef(true);

  const historyKey = useMemo(() => {
    if (courseId !== undefined) return `${HISTORY_PREFIX}:course:${courseId}`;
    return `${HISTORY_PREFIX}:general`;
  }, [courseId]);

  const welcomeMessage = useMemo(() => createWelcomeMessage(courseName), [courseName]);

  const saveHistory = useCallback(async (nextMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(
        historyKey,
        JSON.stringify(nextMessages.slice(-MAX_HISTORY_MESSAGES)),
      );
    } catch {
      // Lỗi lưu cục bộ không được làm gián đoạn cuộc trò chuyện.
    }
  }, [historyKey]);

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const storedHistory = parseHistory(await AsyncStorage.getItem(historyKey));
      if (mountedRef.current) setMessages(storedHistory?.length ? storedHistory : [welcomeMessage]);
    } catch {
      if (mountedRef.current) setMessages([welcomeMessage]);
    } finally {
      if (mountedRef.current) setIsHistoryLoading(false);
    }
  }, [historyKey, welcomeMessage]);

  useEffect(() => {
    mountedRef.current = true;
    void loadHistory();

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();

    return () => {
      mountedRef.current = false;
      animation.stop();
    };
  }, [loadHistory, pulseAnim]);

  const sendQuestion = useCallback(async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);
    setFailedQuestion(null);
    setInputText('');

    const userMessage: ChatMessage = { VaiTro: 'user', NoiDung: trimmedQuestion };
    const nextHistory = [...messages, userMessage].slice(-MAX_HISTORY_MESSAGES);
    setMessages(nextHistory);

    try {
      const response = await TroLyAIService.tuVanHocTap({
        LichSuChat: nextHistory.slice(-MAX_CONTEXT_MESSAGES),
        TieuDeBaiHoc: tieuDeBaiHoc || courseName || null,
        NoiDungBaiHoc: noiDungBaiHoc?.slice(0, MAX_LESSON_CONTENT_LENGTH) || null,
      });
      const answer = response.data?.cauTraLoi?.trim();
      if (!answer) throw new Error('EMPTY_AI_RESPONSE');

      const finalHistory = [
        ...nextHistory,
        { VaiTro: 'assistant', NoiDung: answer } as ChatMessage,
      ].slice(-MAX_HISTORY_MESSAGES);
      if (mountedRef.current) setMessages(finalHistory);
      await saveHistory(finalHistory);
    } catch {
      if (mountedRef.current) {
        setErrorMessage('Không thể nhận phản hồi từ AI. Vui lòng thử lại.');
        setFailedQuestion(trimmedQuestion);
      }
    } finally {
      requestInFlightRef.current = false;
      if (mountedRef.current) setIsLoading(false);
    }
  }, [courseName, messages, noiDungBaiHoc, saveHistory, tieuDeBaiHoc]);

  const clearHistory = useCallback(() => {
    if (isLoading) return;
    Alert.alert('Xóa lịch sử trò chuyện?', 'Thao tác này chỉ xóa lịch sử trên thiết bị này.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const reset = [welcomeMessage];
          setMessages(reset);
          setErrorMessage(null);
          setFailedQuestion(null);
          void saveHistory(reset);
        },
      },
    ]);
  }, [isLoading, saveHistory, welcomeMessage]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.VaiTro === 'user';
    return (
      <View style={[styles.bubbleContainer, isUser ? styles.userContainer : styles.aiContainer]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={17} color={COLORS.white} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {isUser ? (
            <Text style={styles.userText}>{item.NoiDung}</Text>
          ) : (
            <Markdown style={markdownStyles}>{item.NoiDung}</Markdown>
          )}
        </View>
      </View>
    );
  }, []);

  const canSend = inputText.trim().length > 0 && !isLoading && !isHistoryLoading;

  return (
    <>
      <Animated.View style={[styles.floatingButtonWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <AnimatedPressable onPress={() => setIsOpen(true)} accessibilityLabel="Mở trợ lý AI">
          <View style={styles.floatingButton}>
            <Ionicons name="chatbubbles" size={28} color={COLORS.white} />
          </View>
        </AnimatedPressable>
      </Animated.View>

      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={() => setIsOpen(false)}>
        <BlurView intensity={20} tint="dark" style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.modalContent} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <View style={styles.headerIconBg}>
                  <Ionicons name="sparkles" size={20} color={COLORS.white} />
                </View>
                <View style={styles.headerCopy}>
                  <Text style={styles.headerText}>Trợ lý EduCode AI</Text>
                  <Text style={styles.headerSub}>{isLoading ? 'Đang xử lý câu hỏi' : 'Sẵn sàng hỗ trợ'}</Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                <AnimatedPressable onPress={clearHistory} style={styles.iconButton} disabled={isLoading} accessibilityLabel="Xóa lịch sử">
                  <Ionicons name="trash-outline" size={22} color={COLORS.gray} />
                </AnimatedPressable>
                <AnimatedPressable onPress={() => setIsOpen(false)} style={styles.iconButton} accessibilityLabel="Đóng trợ lý AI">
                  <Ionicons name="close" size={25} color={COLORS.gray} />
                </AnimatedPressable>
              </View>
            </View>

            {isHistoryLoading ? (
              <View style={styles.centerState}>
                <ActivityIndicator color={COLORS.aiAccent} />
                <Text style={styles.stateText}>Đang tải lịch sử...</Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(_, index) => `${historyKey}:${index}`}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
              />
            )}

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.aiAccent} />
                <Text style={styles.loadingText}>AI đang suy nghĩ...</Text>
              </View>
            )}

            {errorMessage && (
              <View style={styles.errorState}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.danger} />
                <Text style={styles.errorText}>{errorMessage}</Text>
                {failedQuestion && (
                  <AnimatedPressable onPress={() => void sendQuestion(failedQuestion)} disabled={isLoading} style={styles.retryButton}>
                    <Text style={styles.retryText}>Thử lại</Text>
                  </AnimatedPressable>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Hỏi AI về bài học này..."
                placeholderTextColor={COLORS.gray}
                value={inputText}
                onChangeText={setInputText}
                editable={!isLoading}
                multiline
                maxLength={2000}
              />
              <AnimatedPressable
                style={[styles.sendButton, !canSend && styles.disabledButton]}
                onPress={() => void sendQuestion(inputText)}
                disabled={!canSend}
                accessibilityLabel="Gửi câu hỏi"
              >
                <LinearGradient colors={[COLORS.aiAccent, '#7C3AED']} style={styles.sendGradient}>
                  <Ionicons name="send" size={18} color={COLORS.white} />
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButtonWrapper: { position: 'absolute', bottom: 30, right: 20, zIndex: 999 },
  floatingButton: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.aiAccent, elevation: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { height: '85%', backgroundColor: COLORS.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.aiAccent },
  headerCopy: { marginLeft: 10, flex: 1 },
  headerText: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 13, color: COLORS.gray, fontWeight: '500', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stateText: { marginTop: 10, color: COLORS.gray },
  bubbleContainer: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '90%' },
  userContainer: { alignSelf: 'flex-end' },
  aiContainer: { alignSelf: 'flex-start' },
  aiAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.aiAccent, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
  bubble: { padding: 14, borderRadius: 16, flexShrink: 1 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 6 },
  aiBubble: { backgroundColor: COLORS.white, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: COLORS.border },
  userText: { color: COLORS.white, fontSize: 16, lineHeight: 22 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  loadingText: { marginLeft: 10, color: COLORS.gray },
  errorState: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 10, backgroundColor: '#FEF2F2' },
  errorText: { flex: 1, marginHorizontal: 8, color: COLORS.text, fontSize: 14 },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  retryText: { color: COLORS.danger, fontWeight: '700' },
  inputContainer: { flexDirection: 'row', padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: COLORS.lightGray, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: COLORS.text, maxHeight: 120, minHeight: 48 },
  sendButton: { marginLeft: 10, marginBottom: 2 },
  disabledButton: { opacity: 0.5 },
  sendGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

const markdownStyles = StyleSheet.create({
  body: { color: COLORS.text, fontSize: 15, lineHeight: 23, flexShrink: 1 },
  paragraph: { flexShrink: 1 },
  code_inline: { backgroundColor: COLORS.lightGray, borderRadius: 6, padding: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: COLORS.aiAccent },
  code_block: { backgroundColor: COLORS.text, color: COLORS.white, borderRadius: 10, padding: 12, marginVertical: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  fence: { backgroundColor: COLORS.text, color: COLORS.white, borderRadius: 10, padding: 12, marginVertical: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  strong: { fontWeight: '700', color: COLORS.text },
  link: { color: COLORS.aiAccent, textDecorationLine: 'underline' },
});
