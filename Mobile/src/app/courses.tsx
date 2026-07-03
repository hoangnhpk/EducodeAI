import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

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

const MOCK_COURSES = [
  { id: 1, title: 'Lập trình C# ASP.NET Core API', author: 'Quốc Hùng', img: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=500&q=80', price: '799.000đ', rating: '4.8', badge: 'Best Seller' },
  { id: 2, title: 'Thực chiến ReactJS từ Zero', author: 'Huy Hoàng', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80', price: '599.000đ', rating: '4.9', badge: 'Hot' },
  { id: 3, title: 'Python Cơ bản & Nâng cao', author: 'Minh Tuấn', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80', price: '499.000đ', rating: '4.7', badge: null },
  { id: 4, title: 'AWS Cloud Practitioner', author: 'Lê Nam', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80', price: '899.000đ', rating: '5.0', badge: 'New' },
];

export default function CoursesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Tất cả');

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
          {['Tất cả', 'C# .NET', 'ReactJS', 'Python', 'AWS', 'DevOps'].map((filter, index) => {
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {MOCK_COURSES.map((c) => (
          <TouchableOpacity key={c.id} style={[styles.courseCard, SHADOWS.small]} onPress={() => router.push('/course-detail')}>
            <View style={styles.imgWrapper}>
              <Image source={{ uri: c.img }} style={styles.courseImg} />
              {c.badge && (
                <View style={styles.badgeLabel}>
                  <Text style={styles.badgeText}>{c.badge}</Text>
                </View>
              )}
            </View>
            <View style={styles.courseInfo}>
              <View>
                <Text style={styles.courseTitle} numberOfLines={2}>{c.title}</Text>
                <Text style={styles.courseAuthor}>{c.author}</Text>
              </View>
              <View style={styles.courseStats}>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.ratingText}>{c.rating}</Text>
                </View>
                <Text style={styles.priceText}>{c.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
