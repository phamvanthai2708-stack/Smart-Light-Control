import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import { getUserByCredentials } from '../../database/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../HomeScreen';
import { BottomTabParamList } from '../AppTabs';

const LoginSqlite = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const tabNavigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const stackNavigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    try {
      const user = await getUserByCredentials(username.trim(), password.trim());
      if (user) {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));
        Alert.alert('🎉 Đăng nhập thành công!', `Xin chào, ${user.username}!`, [
          {
            text: 'OK',
            onPress: () => {
              if (user.role === 'admin') {
                tabNavigation.navigate('AdminTab');
              } else {
                tabNavigation.navigate('HomeTab');
              }
            },
          },
        ]);
      } else {
        Alert.alert('❌ Lỗi', 'Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🔒</Text>
        <Text style={styles.title}>Đăng Nhập</Text>
        <Text style={styles.subtitle}>Chào mừng trở lại!</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Tên đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên đăng nhập..."
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu..."
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.btnLogin, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnLoginText}>{loading ? '⏳ Đang xử lý...' : '🔓 Đăng Nhập'}</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.btnSignup}
          onPress={() => tabNavigation.navigate('SignupSqlite')}
        >
          <Text style={styles.btnSignupText}>📝 Chưa có tài khoản? Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>💡 Tài khoản admin mặc định:</Text>
        <Text style={styles.hintVal}>Username: admin | Password: 123456</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F3F4F6', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 4 },
  label: { fontSize: 14, color: '#374151', fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    padding: 14, marginBottom: 16, backgroundColor: '#F9FAFB',
    fontSize: 15, color: '#1F2937',
  },
  btnLogin: {
    backgroundColor: '#7C3AED', padding: 15,
    borderRadius: 12, alignItems: 'center', elevation: 3,
  },
  btnLoginText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 10, color: '#9CA3AF' },
  btnSignup: {
    borderWidth: 2, borderColor: '#7C3AED', padding: 13,
    borderRadius: 12, alignItems: 'center',
  },
  btnSignupText: { color: '#7C3AED', fontWeight: 'bold', fontSize: 15 },
  hint: { marginTop: 24, padding: 14, backgroundColor: '#EDE9FE', borderRadius: 10, alignItems: 'center' },
  hintText: { color: '#5B21B6', fontWeight: '600', marginBottom: 4 },
  hintVal: { color: '#7C3AED', fontSize: 13, fontWeight: 'bold' },
});

export default LoginSqlite;
