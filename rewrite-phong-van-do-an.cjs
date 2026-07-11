const fs = require('fs');
const path = require('path');

const fileContent = `import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, Animated, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../configs/api';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  success: '#10b981',
  userBubble: '#fb873f',
  aiBubble: '#ffffff',
};

interface IMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  isTyping?: boolean;
  diem?: number;
  nhanXet?: string;
}

export default function PhongVanDoAnScreen() {
  const router = useRouter();
  const { sessionId, tenDoAn, cauHoiDauTien } = useLocalSearchParams<{ sessionId: string, tenDoAn: string, cauHoiDauTien: string }>();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [soCauHienTai, setSoCauHienTai] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [daKetThuc, setDaKetThuc] = useState(false);
  const [tongDiemTamThoi, setTongDiemTamThoi] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);

  const scrollViewRef = useRef<ScrollView>(null);
  const waveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (cauHoiDauTien) {
      setMessages([{ id: 'q-1', role: 'ai', content: cauHoiDauTien }]);
    }
  }, [cauHoiDauTien]);

  useEffect(() => {
    if (isLoading || daKetThuc) return;
    if (timeLeft <= 0) {
      handleSend("(Học viên đã hết thời gian trả lời)");
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isLoading, daKetThuc]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSend = async (autoText?: string) => {
    const text = autoText ?? inputText.trim();
    if (!text || isLoading || daKetThuc) return;

    const userMsg: IMessage = { id: \`u-\${Date.now()}\`, role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const typingId = \`typing-\${Date.now()}\`;
    setMessages(prev => [...prev, { id: typingId, role: 'ai', content: '', isTyping: true }]);

    try {
      const res = await api.post('/SinhDoAnAI/tra-loi-phong-van', {
        sessionId,
        soCauHienTai,
        cauTraLoi: text,
      });

      const { diemCauVua, nhanXet, cauHoiTiepTheo, daKetThuc: done } = res.data;
      setTongDiemTamThoi(prev => prev + (diemCauVua || 0));

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);
        const newMsgs: IMessage[] = [
          { id: \`fb-\${Date.now()}\`, role: 'ai', content: nhanXet, diem: diemCauVua, nhanXet }
        ];
        if (!done && cauHoiTiepTheo) {
          newMsgs.push({ id: \`q-\${soCauHienTai + 1}\`, role: 'ai', content: cauHoiTiepTheo });
        }
        return [...filtered, ...newMsgs];
      });

      setSoCauHienTai(prev => prev + 1);
      setTimeLeft(300);

      if (done) {
        setDaKetThuc(true);
        setTimeout(() => {
          Alert.alert('Hoàn thành', 'Phỏng vấn kết thúc. Tổng điểm: ' + (tongDiemTamThoi + (diemCauVua||0)), [
            { text: 'OK', onPress: () => router.replace('/sinh-do-an') }
          ]);
        }, 1500);
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, { id: \`err-\${Date.now()}\`, role: 'ai', content: 'Lỗi kết nối. Vui lòng thử lại!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return \`\${m}:\${s}\`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Bảo Vệ Đồ Án</Text>
          <Text style={styles.headerSub}>Điểm: {tongDiemTamThoi} | Còn: {formatTime(timeLeft)}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        style={styles.chatContainer} 
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.infoBadge}>
          <Text style={styles.infoText}>Chủ đề: {tenDoAn}</Text>
        </View>

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          if (msg.isTyping) {
            return (
              <View key={msg.id} style={[styles.messageWrapper, styles.aiWrapper]}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="hardware-chip" size={16} color={COLORS.primary} />
                </View>
                <View style={[styles.bubble, styles.aiBubble]}>
                  <Text style={{ color: COLORS.gray }}>AI đang suy nghĩ...</Text>
                </View>
              </View>
            );
          }
          return (
            <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
              {!isUser && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="hardware-chip" size={16} color={COLORS.primary} />
                </View>
              )}
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={isUser ? styles.userText : styles.aiText}>{msg.content}</Text>
                {msg.diem !== undefined && (
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                    <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Điểm: {msg.diem}/10</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.micBtn}>
            <Animated.View style={[styles.micIconInner, { transform: [{ scale: isLoading ? waveAnim : 1 }] }]}>
               <Ionicons name="mic" size={24} color={COLORS.white} />
            </Animated.View>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập câu trả lời..."
            placeholderTextColor={COLORS.gray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading && !daKetThuc}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
            <Ionicons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  headerSub: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  chatContainer: { flex: 1, padding: 15 },
  infoBadge: { alignSelf: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 20 },
  infoText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  messageWrapper: { flexDirection: 'row', marginBottom: 15, maxWidth: '85%' },
  userWrapper: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  aiWrapper: { alignSelf: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 4 },
  bubble: { padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: COLORS.userBubble, borderTopRightRadius: 4 },
  aiBubble: { backgroundColor: COLORS.aiBubble, borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  userText: { color: COLORS.white, fontSize: 15, lineHeight: 22 },
  aiText: { color: COLORS.dark, fontSize: 15, lineHeight: 22 },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  micBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  micIconInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, minHeight: 44, maxHeight: 100, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});
`;

fs.writeFileSync(path.join(__dirname, 'Mobile', 'src', 'app', 'phong-van-do-an.tsx'), fileContent);
console.log('Done rewriting phong-van-do-an.tsx');
