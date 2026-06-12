import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeStackParamList } from './HomeScreen';
import { BottomTabParamList } from './AppTabs';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;
type TabNav = BottomTabNavigationProp<BottomTabParamList>;

const Header = () => {
  const [user, setUser] = useState<{ username: string; role: string; id: number } | null>(null);
  const homeNavigation = useNavigation<HomeNav>();
  const tabNavigation = useNavigation<TabNav>();

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const loggedInUser = await AsyncStorage.getItem('loggedInUser');
        setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
      };
      loadUser();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedInUser');
    setUser(null);
    tabNavigation.navigate('LoginSqlite');
  };

  return (
    <View style={styles.header}>
      {user ? (
        <>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfo}>
              Xin chào, <Text style={{ fontWeight: 'bold' }}>{user.username}</Text>
            </Text>
            <View style={styles.quickLinks}>
              {user.role === 'admin' && (
                <TouchableOpacity onPress={() => tabNavigation.navigate('AdminTab')}>
                  <Text style={styles.quickLinkText}>⚙️ Admin</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => homeNavigation.navigate('Profile')}>
                <Text style={styles.quickLinkText}>👤 Hồ sơ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => homeNavigation.navigate('OrderHistory')}>
                <Text style={styles.quickLinkText}>📦 Đơn hàng</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Đăng Xuất</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.guestContainer}>
          <Text style={styles.guestText}>Xin chào, Khách!</Text>
          <TouchableOpacity onPress={() => tabNavigation.navigate('LoginSqlite')} style={styles.loginButton}>
            <Text style={styles.loginText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#7C3AED',
  },
  userInfoContainer: { flex: 1 },
  userInfo: { color: 'white', fontSize: 15, marginBottom: 4 },
  quickLinks: { flexDirection: 'row', gap: 12 },
  quickLinkText: { color: '#E5E7EB', fontSize: 12 },
  logoutButton: {
    backgroundColor: '#EF4444', paddingVertical: 6,
    paddingHorizontal: 10, borderRadius: 8, marginLeft: 10,
  },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  guestContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', width: '100%',
  },
  guestText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  loginButton: {
    backgroundColor: '#10B981', paddingVertical: 6,
    paddingHorizontal: 12, borderRadius: 8,
  },
  loginText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});

export default Header;
