import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import { HomeStackParamList } from './HomeScreen';
import ProductDetailScreen from './ProductDetailScreen';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import ProfileScreen from './ProfileScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Chi tiết sản phẩm', headerTintColor: '#7C3AED' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: true, title: 'Giỏ hàng', headerTintColor: '#7C3AED' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: true, title: 'Thanh toán', headerTintColor: '#7C3AED' }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ headerShown: true, title: 'Lịch sử mua hàng', headerTintColor: '#7C3AED' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: true, title: 'Hồ sơ cá nhân', headerTintColor: '#7C3AED' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackScreen;
