import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimatedPressable } from '../../../shared/components/animated-pressable';
import { aiRoadmapService, DuLieuYeuCauLoTrinh, KetQuaLoTrinhAI, LoTrinhAICuaToiDTO } from '../services/ai-roadmap.service';

const C = { orange: '#F69050', purple: '#8B5CF6', bg: '#F9FAFB', white: '#FFF', text: '#111827', muted: '#6B7280', border: '#E5E7EB', danger: '#EF4444' };
const initialForm: DuLieuYeuCauLoTrinh = { trinhDo: 'Người mới', phongCachHoc: 'video', mucTieuNgheNghiep: '', thoiGianHoc: '12', mucDoCamKet: '10', kienThucHienCo: '', kinhNghiem: '', khoKhan: '' };

export default function LoTrinhAIScreen() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<KetQuaLoTrinhAI | null>(null);
  const [history, setHistory] = useState<LoTrinhAICuaToiDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try { setHistory(await aiRoadmapService.getAllLoTrinh()); }
    catch { setError('Không thể tải lịch sử lộ trình.'); }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);
  const update = (key: keyof DuLieuYeuCauLoTrinh, value: string) => setForm(current => ({ ...current, [key]: value }));

  const create = async () => {
    if (!form.mucTieuNgheNghiep.trim()) { setError('Vui lòng nhập mục tiêu nghề nghiệp.'); return; }
    const weeks = Number(form.thoiGianHoc);
    const hours = Number(form.mucDoCamKet);
    if (!Number.isFinite(weeks) || weeks <= 0 || !Number.isFinite(hours) || hours <= 0) {
      setError('Số tuần và số giờ học mỗi tuần phải lớn hơn 0.');
      return;
    }
    setLoading(true); setError(null);
    try { setResult(await aiRoadmapService.taoLoTrinh(form)); await loadHistory(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tạo lộ trình AI. Vui lòng thử lại.'); }
    finally { setLoading(false); }
  };

  const openHistory = async (id: number) => {
    setLoading(true); setError(null);
    try { const detail = await aiRoadmapService.getChiTietLoTrinh(id); setResult({ ...detail.roadmap, maLoTrinh: id }); }
    catch { setError('Không thể tải chi tiết lộ trình.'); }
    finally { setLoading(false); }
  };

  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={s.header}><AnimatedPressable style={s.icon} onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={C.text} /></AnimatedPressable><Text style={s.title}>Lộ trình AI</Text><View style={s.icon} /></View>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.heading}>Tạo lộ trình cá nhân</Text><Text style={s.sub}>AI đề xuất các giai đoạn học dựa trên mục tiêu của bạn.</Text>
      <Field label="Mục tiêu nghề nghiệp *" value={form.mucTieuNgheNghiep} onChange={v => update('mucTieuNgheNghiep', v)} placeholder="Ví dụ: Frontend Developer" />
      <Field label="Trình độ hiện tại" value={form.trinhDo} onChange={v => update('trinhDo', v)} />
      <Field label="Phong cách học" value={form.phongCachHoc} onChange={v => update('phongCachHoc', v)} />
      <Field label="Số tuần dự kiến" value={form.thoiGianHoc || ''} onChange={v => update('thoiGianHoc', v)} keyboardType="numeric" />
      <Field label="Giờ học mỗi tuần" value={form.mucDoCamKet || ''} onChange={v => update('mucDoCamKet', v)} keyboardType="numeric" />
      <Field label="Kiến thức hiện có" value={form.kienThucHienCo} onChange={v => update('kienThucHienCo', v)} multiline />
      <Field label="Kinh nghiệm thực tế" value={form.kinhNghiem} onChange={v => update('kinhNghiem', v)} multiline />
      <Field label="Khó khăn hiện tại" value={form.khoKhan} onChange={v => update('khoKhan', v)} multiline />
      {error && <Text style={s.error}>{error}</Text>}
      <AnimatedPressable style={[s.button, loading && s.disabled]} onPress={() => void create()} disabled={loading}>{loading ? <ActivityIndicator color={C.white} /> : <Text style={s.buttonText}>Tạo lộ trình</Text>}</AnimatedPressable>
      {result && <View style={s.result}><Text style={s.resultTitle}>{result.tenLoTrinh}</Text><Text style={s.sub}>{result.mucTieu} · {result.tongThoiGian}</Text>{result.loTrinh.map(stage => <View key={`${stage.giaiDoan}-${stage.tenGiaiDoan}`} style={s.stage}><View style={s.dot} /><View style={s.stageBody}><Text style={s.stageTitle}>Giai đoạn {stage.giaiDoan}: {stage.tenGiaiDoan}</Text><Text style={s.sub}>{stage.thoiGian} · {stage.mucTieu}</Text>{stage.noiDung?.map(item => <Text key={item.chuDe} style={s.item}>• {item.chuDe}: {item.moTa}</Text>)}</View></View>)}</View>}
      <Text style={s.heading}>Lịch sử</Text>{historyLoading ? <ActivityIndicator color={C.purple} /> : history.length === 0 ? <Text style={s.sub}>Bạn chưa có lộ trình nào.</Text> : history.map(item => <AnimatedPressable key={item.maLoTrinh} style={s.history} onPress={() => void openHistory(item.maLoTrinh)}><View><Text style={s.historyTitle}>{item.mucTieuNgheNghiep}</Text><Text style={s.sub}>{item.trangThai} · {new Date(item.ngayTao).toLocaleDateString('vi-VN')}</Text></View><Ionicons name="chevron-forward" size={20} color={C.muted} /></AnimatedPressable>)}
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Field({ label, value, onChange, placeholder, multiline, keyboardType }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; keyboardType?: 'default' | 'numeric' }) {
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput style={[s.input, multiline && s.multiline]} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.muted} multiline={multiline} keyboardType={keyboardType} /></View>;
}
const s = StyleSheet.create({ screen:{flex:1,backgroundColor:C.bg,paddingTop:Platform.OS==='android'?24:0},header:{minHeight:64,flexDirection:'row',alignItems:'center',backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border,paddingHorizontal:12},icon:{width:44,height:44,alignItems:'center',justifyContent:'center'},title:{flex:1,textAlign:'center',fontSize:20,fontWeight:'700',color:C.text},content:{padding:16,paddingBottom:40},heading:{fontSize:22,fontWeight:'800',color:C.text,marginTop:10,marginBottom:6},sub:{color:C.muted,lineHeight:21},field:{marginTop:14},label:{fontWeight:'600',color:C.text,marginBottom:6},input:{minHeight:48,borderWidth:1,borderColor:C.border,borderRadius:12,backgroundColor:C.white,paddingHorizontal:14,color:C.text,fontSize:16},multiline:{minHeight:84,paddingTop:12,textAlignVertical:'top'},error:{color:C.danger,marginTop:12},button:{minHeight:50,marginTop:18,borderRadius:12,backgroundColor:C.orange,alignItems:'center',justifyContent:'center'},disabled:{opacity:.6},buttonText:{color:C.white,fontWeight:'800',fontSize:16},result:{marginTop:24,borderWidth:1,borderColor:C.border,borderRadius:16,backgroundColor:C.white,padding:18},resultTitle:{fontSize:21,fontWeight:'800',color:C.text},stage:{flexDirection:'row',marginTop:18},dot:{width:14,height:14,borderRadius:7,backgroundColor:C.purple,marginTop:4,marginRight:12},stageBody:{flex:1},stageTitle:{fontWeight:'700',color:C.text,fontSize:16},item:{marginTop:7,color:C.text,lineHeight:20},history:{minHeight:64,marginTop:10,padding:14,borderRadius:12,backgroundColor:C.white,borderWidth:1,borderColor:C.border,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},historyTitle:{fontWeight:'700',color:C.text} });
