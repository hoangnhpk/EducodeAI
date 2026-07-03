import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, StatusBar, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#fb873f',
  primaryLight: '#fff3ed',
  dark: '#0f172a',
  bg: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#e2e8f0',
};

const SHADOWS = {
  small: { shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
};

export default function SearchScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Tự động focus vào ô tìm kiếm khi mở trang
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const renderEmptyState = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
      <View style={styles.recentList}>
        {['React Native cơ bản', 'Lộ trình Frontend', 'Cấu trúc dữ liệu'].map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.recentItem} onPress={() => setSearchText(item)}>
            <Ionicons name="time-outline" size={20} color={COLORS.gray} />
            <Text style={styles.recentText}>{item}</Text>
            <Ionicons name="close" size={18} color={COLORS.lightGray} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Khám phá chủ đề</Text>
      <View style={styles.tagWrapper}>
        {['ReactJS', 'NodeJS', 'Python', 'AI / Machine Learning', 'UI/UX Design', 'DevOps'].map((tag, idx) => (
          <TouchableOpacity key={idx} style={styles.tagBtn} onPress={() => setSearchText(tag)}>
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderResults = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.contentContainer}>
      <Text style={styles.resultCount}>Tìm thấy 2 kết quả cho "{searchText}"</Text>
      
      {[
        { id: 1, title: 'Thực chiến ReactJS từ Zero', author: 'Huy Hoàng', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80' },
        { id: 2, title: 'React Native Pro cho người đi làm', author: 'Quốc Hùng', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80' }
      ].map((c) => (
        <TouchableOpacity key={c.id} style={[styles.courseCard, SHADOWS.small]} onPress={() => router.push('/course-detail')}>
          <Image source={{ uri: c.img }} style={styles.courseImg} />
          <View style={styles.courseInfo}>
            <View>
              <Text style={styles.courseTitle} numberOfLines={2}>{c.title}</Text>
              <Text style={styles.courseAuthor}>{c.author}</Text>
            </View>
            <View style={styles.courseStats}>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
              <Text style={styles.priceText}>799.000đ</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.gray} style={{ marginRight: 10 }} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Tìm khóa học, giảng viên..."
            placeholderTextColor={COLORS.gray}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.lightGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchText.length > 0 ? renderResults() : renderEmptyState()}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, height: 50, borderRadius: 25, paddingHorizontal: 15, ...SHADOWS.small },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.dark },

  contentContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 15 },
  
  recentList: { backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 15, ...SHADOWS.small },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  recentText: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.dark },
  
  tagWrapper: { flexDirection: 'row', flexWrap: 'wrap' },
  tagBtn: { backgroundColor: COLORS.white, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, marginRight: 10, marginBottom: 10, ...SHADOWS.small },
  tagText: { fontSize: 14, color: COLORS.dark, fontWeight: '500' },

  resultCount: { fontSize: 14, color: COLORS.gray, marginBottom: 15 },
  courseCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 15, borderRadius: 20, marginBottom: 15 },
  courseImg: { width: 90, height: 90, borderRadius: 15 },
  courseInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  courseTitle: { fontSize: 15, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  courseAuthor: { fontSize: 13, color: COLORS.gray },
  courseStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontSize: 13, fontWeight: '700', color: COLORS.dark },
  priceText: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
});
