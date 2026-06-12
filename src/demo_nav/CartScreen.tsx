import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Alert, Image
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCartItems, removeFromCart, updateCartQuantity, CartItem } from '../database/database';
import { HomeStackParamList } from './HomeScreen';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await AsyncStorage.getItem('loggedInUser');
        if (stored) {
          const user = JSON.parse(stored);
          setUserId(user.id);
          const items = await fetchCartItems(user.id);
          setCartItems(items);
        }
      };
      load();
    }, [])
  );

  const loadCart = async () => {
    if (userId) {
      const items = await fetchCartItems(userId);
      setCartItems(items);
    }
  };

  const handleUpdateQty = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      handleRemove(item);
      return;
    }
    await updateCartQuantity(item.id, newQty);
    loadCart();
  };

  const handleRemove = (item: CartItem) => {
    Alert.alert('Xóa sản phẩm', `Xóa "${item.productName}" khỏi giỏ?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          await removeFromCart(item.id);
          loadCart();
        }
      },
    ]);
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.productPrice ?? 0) * item.quantity, 0
  );

  const getImgSource = (img: string) => {
    if (img && (img.startsWith('http') || img.startsWith('file://'))) return { uri: img };
    return { uri: 'https://via.placeholder.com/70' };
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={getImgSource(item.productImg ?? '')} style={styles.img} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.productName}</Text>
        <Text style={styles.price}>{(item.productPrice ?? 0).toLocaleString()} đ</Text>
      </View>
      <View style={styles.qtyControl}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQty(item, -1)}>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQty(item, 1)}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!userId) {
    return (
      <View style={styles.emptyCenter}>
        <Text style={styles.emptyText}>🔒 Vui lòng đăng nhập để xem giỏ hàng</Text>
        <TouchableOpacity style={styles.btnLogin} onPress={() => (navigation as any).navigate('LoginSqlite')}>
          <Text style={styles.btnLoginText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Giỏ Hàng ({cartItems.length})</Text>
      {cartItems.length === 0 ? (
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Giỏ hàng đang trống</Text>
          <TouchableOpacity style={styles.btnShop} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnLoginText}>🛍️ Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 160 }}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalAmount}>{totalAmount.toLocaleString()} đ</Text>
            </View>
            <TouchableOpacity
              style={styles.btnCheckout}
              onPress={() => navigation.navigate('Checkout', { cartItems, totalAmount })}
            >
              <Text style={styles.btnCheckoutText}>Thanh toán →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1F2937', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginTop: 10, borderRadius: 14, padding: 12, elevation: 2, alignItems: 'center' },
  img: { width: 70, height: 70, borderRadius: 10, marginRight: 12 },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 14, color: '#1F2937' },
  price: { color: '#7C3AED', marginTop: 4, fontWeight: 'bold' },
  qtyControl: { alignItems: 'center', gap: 4 },
  qtyBtn: { backgroundColor: '#EDE9FE', borderRadius: 8, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#7C3AED' },
  qtyText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginVertical: 2 },
  removeBtn: { marginTop: 4 },
  removeBtnText: { fontSize: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB', elevation: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 16, color: '#6B7280', fontWeight: 'bold' },
  totalAmount: { fontSize: 20, color: '#7C3AED', fontWeight: 'bold' },
  btnCheckout: { backgroundColor: '#7C3AED', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnCheckoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  btnLogin: { backgroundColor: '#7C3AED', padding: 14, borderRadius: 12, paddingHorizontal: 30 },
  btnShop: { backgroundColor: '#7C3AED', padding: 14, borderRadius: 12, paddingHorizontal: 30 },
  btnLoginText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
