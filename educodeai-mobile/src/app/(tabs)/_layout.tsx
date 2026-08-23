import { Tabs } from 'expo-router';
import { colors } from '../../shared/theme/tokens';
export default function TabsLayout() { return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}><Tabs.Screen name="account" options={{ title: 'Tài khoản' }} /></Tabs>; }
