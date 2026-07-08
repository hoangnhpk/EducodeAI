import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function TabLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
