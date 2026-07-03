import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a',
  darkLight: '#1e293b',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  glow: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }
};

export default function SinhDoAnScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  // Form States
  const [mucTieu, setMucTieu] = useState('Backend Developer (Node.js)');
  const [ngonNgu, setNgonNgu] = useState('ReactJS, NodeJS, MongoDB');
  const [capDo, setCapDo] = useState('Thực tế');

  const handleGenerate = async () => {
    if (!mucTieu || !ngonNgu || !capDo) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin!');
      return;
    }

    setStatus('loading');
    try {
      // NOTE: Đổi YOUR_IP_ADDRESS thành IP mạng LAN của máy tính chạy backend (VD: 192.168.1.10)
      const API_URL = 'http://192.168.1.10:5000/api/SinhDoAnAI/generate';

      const response = await axios.post(API_URL, {
        mucTieuNgheNghiep: mucTieu,
        ngonNguCongNghe: ngonNgu,
        capDo: capDo
      });

      setStatus('idle');
      // Đẩy sang trang kết quả và truyền data
      router.push({
        pathname: '/ket-qua-do-an',
        params: { data: JSON.stringify(response.data) }
      });
    } catch (error) {
      console.error("Lỗi khi sinh đồ án:", error);
      setStatus('idle');
      Alert.alert('Không thể kết nối Backend', 'Vui lòng kiểm tra địa chỉ API_URL trong code để trỏ đúng vào IP máy tính chạy Server.');

      // MOCK DATA ĐỂ DEMO GIAO DIỆN NẾU BACKEND CHƯA CHẠY
      const mockData = {
        tenDoAn: "Hệ thống Quản lý Bán hàng E-Commerce",
        moTa: "Xây dựng Backend hoàn chỉnh với các chức năng phân quyền, giỏ hàng, thanh toán và xử lý đơn hàng.",
        yeuCauChucNang: [
          "Xác thực người dùng bằng JWT",
          "Quản lý sản phẩm và danh mục (CRUD)",
          "Thêm sản phẩm vào giỏ hàng và đặt hàng",
          "Tích hợp cổng thanh toán VNPay/Momo",
          "Thống kê doanh thu theo tháng"
        ],
        cauTrucDatabase: "Users (id, name, email, password, role)\nProducts (id, name, price, stock, category_id)\nOrders (id, user_id, total, status, created_at)\nOrder_Items (id, order_id, product_id, quantity)"
      };
      router.push({
        pathname: '/ket-qua-do-an',
        params: { data: JSON.stringify(mockData) }
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sinh Đồ Án AI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.iconWrapper}>
          <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.iconGradient}>
            <Ionicons name="cube" size={40} color="#4f46e5" />
          </LinearGradient>
        </View>
        <Text style={styles.descText}>Nhập các thông tin dưới đây để AI tự động thiết kế kiến trúc đồ án chuẩn thực tế cho bạn.</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mục tiêu nghề nghiệp</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={mucTieu}
                onValueChange={(itemValue) => setMucTieu(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Backend Developer (Node.js)" value="Backend Developer (Node.js)" />
                <Picker.Item label="Frontend Developer (ReactJS)" value="Frontend Developer (ReactJS)" />
                <Picker.Item label="Fullstack Developer" value="Fullstack Developer" />
                <Picker.Item label="Mobile Developer" value="Mobile Developer" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngôn ngữ / Công nghệ</Text>
            <TextInput
              style={styles.textInput}
              value={ngonNgu}
              onChangeText={setNgonNgu}
              placeholder="VD: ReactJS, NodeJS, MongoDB"
              placeholderTextColor={COLORS.gray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cấp độ đồ án</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioBtn, capDo === 'Cơ bản' && styles.radioBtnActive]}
                onPress={() => setCapDo('Cơ bản')}
              >
                <Ionicons name={capDo === 'Cơ bản' ? "radio-button-on" : "radio-button-off"} size={20} color={capDo === 'Cơ bản' ? COLORS.primary : COLORS.gray} />
                <Text style={[styles.radioText, capDo === 'Cơ bản' && styles.radioTextActive]}>Cơ bản</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioBtn, capDo === 'Thực tế' && styles.radioBtnActive]}
                onPress={() => setCapDo('Thực tế')}
              >
                <Ionicons name={capDo === 'Thực tế' ? "radio-button-on" : "radio-button-off"} size={20} color={capDo === 'Thực tế' ? COLORS.primary : COLORS.gray} />
                <Text style={[styles.radioText, capDo === 'Thực tế' && styles.radioTextActive]}>Thực tế</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={handleGenerate} disabled={status === 'loading'} style={[styles.submitBtnWrapper, SHADOWS.glow]}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.submitBtn}>
            {status === 'loading' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color={COLORS.white} style={{ marginRight: 10 }} />
                <Text style={styles.submitBtnText}>AI đang phân tích...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Tạo Đồ Án Ngay</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  container: { flex: 1, paddingHorizontal: 20 },

  iconWrapper: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  iconGradient: { width: 80, height: 80, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  descText: { textAlign: 'center', color: COLORS.gray, fontSize: 15, lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },

  formContainer: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, ...SHADOWS.small, marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.darkLight, marginBottom: 10 },

  pickerWrapper: { borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 14, overflow: 'hidden', backgroundColor: COLORS.bg },
  picker: { height: 50, width: '100%' },

  textInput: { borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 14, height: 50, paddingHorizontal: 15, fontSize: 15, color: COLORS.dark, backgroundColor: COLORS.bg },

  radioGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  radioBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 14, marginRight: 10, backgroundColor: COLORS.bg },
  radioBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  radioText: { marginLeft: 8, fontSize: 15, color: COLORS.gray, fontWeight: '600' },
  radioTextActive: { color: COLORS.primary },

  submitBtnWrapper: { borderRadius: 16, overflow: 'hidden' },
  submitBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' }
});
