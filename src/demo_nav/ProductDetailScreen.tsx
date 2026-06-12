import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeStackParamList } from './HomeScreen';
import { addToCart } from '../database/database';

type ProductDetailRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;
type Nav = NativeStackNavigationProp<HomeStackParamList>;

const getImageSource = (img: string) => {
  if (!img) return { uri: 'https://via.placeholder.com/300' };
  if (img.startsWith('file://') || img.startsWith('http')) return { uri: img };
  switch (img) {
    case 'hinh1.jpg': return require('../images/hinh1.jpg');
    case 'hinh2.jpg': return require('../images/hinh2.jpg');
    case 'hinh3.jpg': return require('../images/hinh3.jpg');
    case 'hinh4.jpg': return require('../images/hinh4.jpg');
    case 'hinh5.jpg': return require('../images/hinh5.jpg');
    default: return require('../images/hinh1.jpg');
  }
};

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<Nav>();
  const { product } = route.params;

  const handleAddToCart = async () => {
    const stored = await AsyncStorage.getItem('loggedInUser');
    if (!stored) {
      Alert.alert('Chưa đăng nhập', 'Bạn cần đăng nhập để thêm vào giỏ hàng', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => (navigation as any).navigate('LoginSqlite') },
      ]);
      return;
    }
    const user = JSON.parse(stored);
    await addToCart(user.id, product.id);
    Alert.alert('✅ Đã thêm vào giỏ hàng', `${product.name} đã được thêm!`, [
      { text: 'Tiếp tục mua', style: 'cancel' },
      { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Image source={getImageSource(product.img)} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
        <View style={styles.divider} />
        <Text style={styles.descTitle}>Mô tả sản phẩm</Text>
        <Text style={styles.desc}>
          {product.name} là sản phẩm chất lượng cao với mức giá {product.price.toLocaleString()} đ. 
          Sản phẩm đang có sẵn hàng và sẵn sàng giao đến tận nơi cho bạn.
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã sản phẩm:</Text>
          <Text style={styles.infoVal}>#{product.id}</Text>
        </View>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.btnCart} onPress={handleAddToCart}>
          <Text style={styles.btnCartText}>🛒 Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnBuy} onPress={async () => {
          const stored = await AsyncStorage.getItem('loggedInUser');
          if (!stored) {
            Alert.alert('Chưa đăng nhập', 'Bạn cần đăng nhập!', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Đăng nhập', onPress: () => (navigation as any).navigate('LoginSqlite') },
            ]);
            return;
          }
          const user = JSON.parse(stored);
          await addToCart(user.id, product.id);
          navigation.navigate('Cart');
        }}>
          <Text style={styles.btnBuyText}>⚡ Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  content: { backgroundColor: '#fff', margin: 12, borderRadius: 16, padding: 18, elevation: 2 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  price: { fontSize: 26, fontWeight: 'bold', color: '#7C3AED', marginBottom: 14 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 14 },
  descTitle: { fontWeight: 'bold', fontSize: 15, color: '#1F2937', marginBottom: 6 },
  desc: { color: '#6B7280', lineHeight: 22, marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#6B7280' },
  infoVal: { color: '#1F2937', fontWeight: '600' },
  actionBar: {
    flexDirection: 'row', margin: 12, gap: 10,
  },
  btnCart: {
    flex: 1, borderWidth: 2, borderColor: '#7C3AED', padding: 14,
    borderRadius: 12, alignItems: 'center',
  },
  btnCartText: { color: '#7C3AED', fontWeight: 'bold', fontSize: 15 },
  btnBuy: {
    flex: 1, backgroundColor: '#7C3AED', padding: 14,
    borderRadius: 12, alignItems: 'center', elevation: 3,
  },
  btnBuyText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

export default ProductDetailScreen;
