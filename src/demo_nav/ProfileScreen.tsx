import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById, updateUser, User } from '../database/database';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await AsyncStorage.getItem('loggedInUser');
        if (stored) {
          const loggedUser = JSON.parse(stored);
          const freshUser = await getUserById(loggedUser.id);
          if (freshUser) {
            setUser(freshUser);
            setFullname(freshUser.fullname ?? '');
            setPhone(freshUser.phone ?? '');
            setAddress(freshUser.address ?? '');
          }
        }
      };
      load();
    }, [])
  );

  const handleSave = async () => {
    if (!user) return;
    if (password && password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      const updatedUser: User = {
        ...user,
        fullname: fullname.trim(),
        phone: phone.trim(),
        address: address.trim(),
        password: password.trim() || user.password,
      };
      await updateUser(updatedUser);
      await AsyncStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setPassword('');
      setConfirmPassword('');
      setEditMode(false);
      Alert.alert('✅ Thành công', 'Cập nhật thông tin thành công!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>🔒 Vui lòng đăng nhập</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Avatar + tên */}
      <View style={styles.heroSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#7C3AED' : '#0EA5E9' }]}>
          <Text style={styles.roleText}>{user.role === 'admin' ? '🔑 Admin' : '👤 User'}</Text>
        </View>
      </View>

      {/* Thông tin */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👤 Thông tin cá nhân</Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Text style={styles.editBtn}>{editMode ? '❌ Hủy' : '✏️ Sửa'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Tài khoản</Text>
        <View style={styles.readonlyField}>
          <Text style={styles.readonlyText}>{user.username}</Text>
        </View>

        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={[styles.input, !editMode && styles.readonlyInput]}
          value={fullname}
          onChangeText={setFullname}
          placeholder="Nhập họ và tên..."
          editable={editMode}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, !editMode && styles.readonlyInput]}
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại..."
          keyboardType="phone-pad"
          editable={editMode}
        />

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={[styles.input, !editMode && styles.readonlyInput]}
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ..."
          multiline
          editable={editMode}
        />
      </View>

      {/* Đổi mật khẩu */}
      {editMode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Đổi mật khẩu (tùy chọn)</Text>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Để trống nếu không muốn đổi..."
            secureTextEntry
          />
          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới..."
            secureTextEntry
          />
        </View>
      )}

      {editMode && (
        <TouchableOpacity
          style={[styles.btnSave, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.btnSaveText}>{loading ? '⏳ Đang lưu...' : '✅ Lưu thay đổi'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  heroSection: {
    alignItems: 'center', backgroundColor: '#7C3AED',
    paddingTop: 40, paddingBottom: 30,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#7C3AED' },
  username: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  section: { backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  editBtn: { color: '#7C3AED', fontWeight: 'bold', fontSize: 14 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    padding: 12, marginBottom: 12, backgroundColor: '#F9FAFB', color: '#1F2937',
  },
  readonlyInput: { backgroundColor: '#F3F4F6', color: '#9CA3AF' },
  readonlyField: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, marginBottom: 12, backgroundColor: '#F3F4F6',
  },
  readonlyText: { color: '#9CA3AF' },
  btnSave: {
    backgroundColor: '#7C3AED', margin: 16, padding: 16,
    borderRadius: 14, alignItems: 'center', elevation: 4,
  },
  btnSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#6B7280' },
});
