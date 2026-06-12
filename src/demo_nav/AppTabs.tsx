import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackScreen from './HomeStackScreen';
import AdminStackScreen from './AdminStackScreen';
import LoginSqlite from './dbSqlite/LoginSqlite';
import SignupSqlite from './dbSqlite/SignupSqlite';

export type BottomTabParamList = {
  HomeTab: undefined;
  AdminTab: undefined;
  SignupSqlite: undefined;
  LoginSqlite: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: 'Home User',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AdminTab"
        component={AdminStackScreen}
        options={{
          title: 'Home Admin',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="SignupSqlite"
        component={SignupSqlite}
        options={{
          title: 'Đăng ký',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📝</Text>
          ),
        }}
      />
      <Tab.Screen
        name="LoginSqlite"
        component={LoginSqlite}
        options={{
          title: 'Đăng nhập',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🔒</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
