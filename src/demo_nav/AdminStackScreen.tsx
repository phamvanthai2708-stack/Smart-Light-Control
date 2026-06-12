import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from './admin/AdminDashboard';
import CategoryManagement from './admin/categories/CategoryManagement';
import ProductManagement from './admin/products/ProductManagement';
import UserManagement from './admin/users/UserManagement';
import OrderManagement from './admin/orders/OrderManagement';

export type AdminStackParamList = {
  AdminDashboardScreen: undefined;
  CategoryManagement: undefined;
  ProductManagement: undefined;
  UserManagement: undefined;
  OrderManagement: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboardScreen" component={AdminDashboard} />
      <Stack.Screen
        name="CategoryManagement"
        component={CategoryManagement}
        options={{ headerShown: true, title: 'Quản lý Danh mục', headerTintColor: '#7C3AED' }}
      />
      <Stack.Screen
        name="ProductManagement"
        component={ProductManagement}
        options={{ headerShown: true, title: 'Quản lý Sản phẩm', headerTintColor: '#7C3AED' }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagement}
        options={{ headerShown: true, title: 'Quản lý Người dùng', headerTintColor: '#7C3AED' }}
      />
      <Stack.Screen
        name="OrderManagement"
        component={OrderManagement}
        options={{ headerShown: true, title: 'Quản lý Đơn hàng', headerTintColor: '#7C3AED' }}
      />
    </Stack.Navigator>
  );
}
