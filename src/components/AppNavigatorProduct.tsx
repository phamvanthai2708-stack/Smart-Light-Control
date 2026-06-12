import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Sanpham3Sqlite from './Sanpham3Sqlite';
import ProductDetailScreen from './ProductDetailScreen';
import { Product } from '../database/database';

export type RootStackParamList = {
  Sanpham3Sqlite: undefined;
  ProductDetail: { product: Product };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigatorProduct() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Sanpham3Sqlite" component={Sanpham3Sqlite} options={{ title: 'Sản phẩm' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
    </Stack.Navigator>
  );
}
