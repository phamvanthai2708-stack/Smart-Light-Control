import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import { addUser } from '../../database/database';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabParamList } from '../AppTabs';

const SignupSqlite = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<BottomTabParamList>>();

  const handleSignup = async () => {
    if (!username.trim() || !password.trim() || !fullname.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    setLoading(true);
    try {
      const success = await addUser(username.trim(), password.trim(), 'user');
      if (success) {
        Alert.alert('🎉 Đăng ký thành công!', 'Tài khoản của bạn đã được tạo!', [
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('LoginSqlite') },
        ]);
      } else {
        Alert.alert('❌ Lỗi', 'Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng ký!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>📝</Text>
        <Text style={styles.title}>Đăng Ký</Text>
        <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ và tên..."
          value={fullname}
          onChangeText={setFullname}
        />

        <Text style={styles.label}>Tên đăng nhập *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên đăng nhập..."
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mật khẩu *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ít nhất 6 ký tự..."
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Xác nhận mật khẩu *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu..."
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.btnSignup, loading && { opacity: 0.7 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.btnSignupText}>{loading ? '⏳ Đang xử lý...' : '✅ Tạo tài khoản'}</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.btnLogin}
          onPress={() => navigation.navigate('LoginSqlite')}
        >
          <Text style={styles.btnLoginText}>🔒 Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F3F4F6', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 4 },
  label: { fontSize: 14, color: '#374151', fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    padding: 14, marginBottom: 14, backgroundColor: '#F9FAFB',
    fontSize: 15, color: '#1F2937',
  },
  btnSignup: {
    backgroundColor: '#7C3AED', padding: 15,
    borderRadius: 12, alignItems: 'center', elevation: 3,
  },
  btnSignupText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 10, color: '#9CA3AF' },
  btnLogin: {
    borderWidth: 2, borderColor: '#7C3AED', padding: 13,
    borderRadius: 12, alignItems: 'center',
  },
  btnLoginText: { color: '#7C3AED', fontWeight: 'bold', fontSize: 15 },
});

export default SignupSqlite;
