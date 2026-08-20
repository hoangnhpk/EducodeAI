import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="dang-nhap" />
        <Stack.Screen name="trang-chu" />
        <Stack.Screen name="phong-van-do-an" />
        <Stack.Screen name="thu-thach" />
      </Stack>
    </AuthProvider>
  );
}
