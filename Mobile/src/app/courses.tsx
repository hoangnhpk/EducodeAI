import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, StatusBar, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../configs/api';

const COLORS = {
  primary: '#fb873f',
  primaryGradient: ['#ff9955', '#fb873f'] as const,
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
};

export default function CoursesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/KhoaHoc/all');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = activeFilter === 'Tất cả' 
    ? courses 
    : courses.filter(c => c.linhVuc?.includes(activeFilter) || c.kyNangChinh?.includes(activeFilter));

  const formatPrice = (price: number) => {
    if (!price || price === 0) return 'Miễn phí';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khám phá Khóa học</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['Tất cả', 'BackEnd', 'FrontEnd', 'Database', 'Mobile', 'AI'].map((filter, index) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity key={index} onPress={() => setActiveFilter(filter)}>
                {isActive ? (
                  <LinearGradient colors={COLORS.primaryGradient} style={[styles.filterTag, { borderWidth: 0 }]}>
                    <Text style={[styles.filterTagText, { color: COLORS.white }]}>{filter}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterTag}>
                    <Text style={styles.filterTagText}>{filter}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {filteredCourses.map((c) => (
            <TouchableOpacity key={c.maKhoaHoc} style={[styles.courseCard, SHADOWS.small]} onPress={() => router.push({ pathname: '/course-detail', params: { id: c.maKhoaHoc } })}>
              <View style={styles.imgWrapper}>
                <Image source={{ uri: c.hinhAnh || 'https://via.placeholder.com/500x300' }} style={styles.courseImg} />
                {c.laKhoaHocMoi && (
                  <View style={styles.badgeLabel}>
                    <Text style={styles.badgeText}>New</Text>
                  </View>
                )}
              </View>
              <View style={styles.courseInfo}>
                <View>
                  <Text style={styles.courseTitle} numberOfLines={2}>{c.tenKhoaHoc}</Text>
                  <Text style={styles.courseAuthor}>{c.giangVien?.hoTen || 'EducodeAI'}</Text>
                </View>
                <View style={styles.courseStats}>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.ratingText}>{c.diemDanhGiaTB?.toFixed(1) || '0.0'}</Text>
                  </View>
                  <Text style={styles.priceText}>{formatPrice(c.giaTien)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filteredCourses.length === 0 && (
            <Text style={{ textAlign: 'center', color: COLORS.gray, marginTop: 40 }}>Không tìm thấy khoá học nào.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark },
  
  filterScrollWrapper: { marginBottom: 15 },
  filterScroll: { paddingHorizontal: 20 },
  filterTag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.lightGray, marginRight: 10 },
  filterTagText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },

  container: { flex: 1, paddingHorizontal: 20 },
  
  courseCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 15, borderRadius: 20, marginBottom: 15 },
  imgWrapper: { position: 'relative' },
  courseImg: { width: 100, height: 100, borderRadius: 15 },
  badgeLabel: { position: 'absolute', top: 5, left: 5, backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', color: COLORS.white },
  
  courseInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  courseTitle: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  courseAuthor: { fontSize: 13, color: COLORS.gray },
  courseStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontSize: 13, fontWeight: '700', color: COLORS.dark },
  priceText: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
});
