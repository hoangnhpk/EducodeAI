import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TroLyAIService, ChatMessage } from '../services/tro-ly-ai.service';
import Markdown from 'react-native-markdown-display';
import { AnimatedPressable } from './animated-pressable';

const COLORS = {
  primary: '#fb873f',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  background: '#f8fafc',
  white: '#ffffff',
  text: '#1e293b',
  gray: '#64748b',
  lightGray: '#f1f5f9',
  border: '#e2e8f0',
  aiBubble: '#ffffff',
  userBubble: '#fb873f',
  success: '#10b981',
};

const SHADOWS = {
  glow: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 }
};

interface ChatBotProps {
  courseId?: number;
  courseName?: string;
  tieuDeBaiHoc?: string | null;
  noiDungBaiHoc?: string | null;
}

export const ChatBot: React.FC<ChatBotProps> = ({ courseId, courseName, tieuDeBaiHoc, noiDungBaiHoc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Pulse Animation cho nút float
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHistory();
    // Chạy pulse effect liên tục
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadHistory = async () => {
    try {
      const historyStr = await AsyncStorage.getItem('mobile_chat_history');
      if (historyStr) {
        setMessages(JSON.parse(historyStr));
      } else {
        setMessages([{ VaiTro: 'assistant', NoiDung: `Chào bạn! Mình là trợ lý AI thông minh của Educode. Bạn có câu hỏi nào về khóa ${courseName || ''} không?` }]);
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  const saveHistory = async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem('mobile_chat_history', JSON.stringify(newMessages));
    } catch (e) {}
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newUserMsg: ChatMessage = { VaiTro: 'user', NoiDung: inputText.trim() };
    const newHistory = [...messages, newUserMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const payloadHistory = newHistory.slice(-10);
      const res = await TroLyAIService.tuVanHocTap({
        LichSuChat: payloadHistory,
        TieuDeBaiHoc: tieuDeBaiHoc || courseName || null,
        NoiDungBaiHoc: noiDungBaiHoc ? noiDungBaiHoc.substring(0, 2000) : null
      });

      if (res && res.data) {
        const aiMsg: ChatMessage = { VaiTro: 'assistant', NoiDung: res.data.cauTraLoi || 'Lỗi phản hồi' };
        const finalHistory = [...newHistory, aiMsg];
        setMessages(finalHistory);
        saveHistory(finalHistory);
      }
    } catch (error) {
      const errorMsg: ChatMessage = { VaiTro: 'assistant', NoiDung: 'Xin lỗi, AI đang bận. Vui lòng thử lại sau.' };
      const finalHistory = [...newHistory, errorMsg];
      setMessages(finalHistory);
      saveHistory(finalHistory);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const clearHistory = () => {
    const reset = [{ VaiTro: 'assistant', NoiDung: 'Chào bạn! Mình là trợ lý AI. Cần hỗ trợ gì thêm không?' }];
    setMessages(reset as ChatMessage[]);
    saveHistory(reset as ChatMessage[]);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.VaiTro === 'user';
    return (
      <View style={[styles.bubbleContainer, isUser ? styles.userContainer : styles.aiContainer]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="hardware-chip" size={18} color={COLORS.white} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble, !isUser && styles.shadow]}>
          {isUser ? (
            <Text style={styles.userText}>{item.NoiDung}</Text>
          ) : (
            <Markdown style={markdownStyles}>{item.NoiDung}</Markdown>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <Animated.View style={[styles.floatingButtonWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <AnimatedPressable onPress={() => setIsOpen(true)}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.floatingButton}>
            <Ionicons name="chatbubbles" size={30} color="#fff" />
          </LinearGradient>
        </AnimatedPressable>
      </Animated.View>

      <Modal visible={isOpen} animationType="slide" transparent={true}>
        <BlurView intensity={20} tint="dark" style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.modalContent} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <LinearGradient colors={COLORS.primaryGradient} style={styles.headerIconBg}>
                  <Ionicons name="hardware-chip" size={20} color={COLORS.white} />
                </LinearGradient>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.headerText}>Trợ Lý EduCode AI</Text>
                  <Text style={styles.headerSub}>Luôn sẵn sàng hỗ trợ</Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                <AnimatedPressable onPress={clearHistory} style={{ marginRight: 15 }}>
                  <Ionicons name="trash-outline" size={24} color={COLORS.gray} />
                </AnimatedPressable>
                <AnimatedPressable onPress={() => setIsOpen(false)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.gray} />
                </AnimatedPressable>
              </View>
            </View>

            {/* Chat List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>AI đang suy nghĩ...</Text>
              </View>
            )}

            {/* Input Box */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Hỏi AI về bài học này..."
                placeholderTextColor={COLORS.gray}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <AnimatedPressable style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} onPress={handleSend} disabled={isLoading || !inputText.trim()}>
                <LinearGradient colors={COLORS.primaryGradient} style={styles.sendGradient}>
                  <Ionicons name="send" size={18} color={COLORS.white} style={{ marginLeft: 2 }} />
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
  floatingButtonWrapper: { position: 'absolute', bottom: 30, right: 20, zIndex: 999, ...SHADOWS.glow },
  floatingButton: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { height: '85%', backgroundColor: COLORS.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { flexDirection: 'row', alignItems: 'center' },
  headerIconBg: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: COLORS.success, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 10 },
  bubbleContainer: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '85%' },
  userContainer: { alignSelf: 'flex-end' },
  aiContainer: { alignSelf: 'flex-start' },
  aiAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginBottom: 5 },
  bubble: { padding: 15, borderRadius: 20 },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  userBubble: { backgroundColor: COLORS.userBubble, borderBottomRightRadius: 5 },
  aiBubble: { backgroundColor: COLORS.aiBubble, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: COLORS.border },
  userText: { color: COLORS.white, fontSize: 16, lineHeight: 22 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingLeft: 20 },
  loadingText: { marginLeft: 10, color: COLORS.gray, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: COLORS.lightGray, borderRadius: 20, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, fontSize: 16, color: COLORS.text, maxHeight: 120, minHeight: 48 },
  sendButton: { marginLeft: 12, marginBottom: 2 },
  sendGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }
});

const markdownStyles = StyleSheet.create({
  body: { color: COLORS.text, fontSize: 15, lineHeight: 24 },
  code_inline: { backgroundColor: COLORS.lightGray, borderRadius: 6, padding: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: COLORS.primary },
  code_block: { backgroundColor: COLORS.text, borderRadius: 12, padding: 12, marginVertical: 8 },
  fence: { backgroundColor: COLORS.text, borderRadius: 12, padding: 12, marginVertical: 8 },
  strong: { fontWeight: 'bold', color: COLORS.text },
  link: { color: COLORS.primary, textDecorationLine: 'underline' },
});
