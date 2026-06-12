import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../AdminStackScreen';
import Header from '../Header';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminDashboard() {
  const navigation = useNavigation<Nav>();

  const menuItems = [
    { label: '📋 Quản lý Danh mục', route: 'CategoryManagement' as const, color: '#7C3AED' },
    { label: '📦 Quản lý Sản phẩm', route: 'ProductManagement' as const, color: '#0EA5E9' },
    { label: '👥 Quản lý Người dùng', route: 'UserManagement' as const, color: '#10B981' },
    { label: '🛒 Quản lý Đơn hàng', route: 'OrderManagement' as const, color: '#F59E0B' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>⚙️ Trang Quản Trị</Text>
        <Text style={styles.subtitle}>Chào mừng Admin!</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.cardText}>{item.label}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 4, marginTop: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderRadius: 14, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  cardText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  arrow: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
});
