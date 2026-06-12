import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Image
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createOrder, clearCart, CartItem } from '../database/database';
import { HomeStackParamList } from './HomeScreen';

type CheckoutRouteProp = RouteProp<HomeStackParamList, 'Checkout'>;
type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function CheckoutScreen() {
  const route = useRoute<CheckoutRouteProp>();
  const navigation = useNavigation<Nav>();
  const { cartItems, totalAmount } = route.params;

  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const getImgSource = (img: string) => {
    if (img && (img.startsWith('http') || img.startsWith('file://'))) return { uri: img };
    return { uri: 'https://via.placeholder.com/50' };
  };

  const handleOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng!');
      return;
    }
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('loggedInUser');
      if (!stored) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập!');
        return;
      }
      const user = JSON.parse(stored);
      const orderItemsData = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.productPrice ?? 0,
      }));

      const orderId = await createOrder(user.id, totalAmount, address.trim(), orderItemsData);
      if (orderId) {
        await clearCart(user.id);
        Alert.alert(
          '🎉 Đặt hàng thành công!',
          `Mã đơn hàng: #${orderId}\nĐịa chỉ: ${address}\nTổng tiền: ${totalAmount.toLocaleString()} đ`,
          [{ text: 'Xem đơn hàng', onPress: () => navigation.navigate('OrderHistory') },
           { text: 'Về trang chủ', onPress: () => navigation.navigate('Home') }]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đặt hàng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.title}>💳 Thanh Toán</Text>

      {/* Tóm tắt đơn hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛍️ Sản phẩm đặt mua ({cartItems.length})</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image source={getImgSource(item.productImg ?? '')} style={styles.itemImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
            </View>
            <Text style={styles.itemTotal}>
              {((item.productPrice ?? 0) * item.quantity).toLocaleString()} đ
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>{totalAmount.toLocaleString()} đ</Text>
        </View>
      </View>

      {/* Thông tin giao hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Thông tin giao hàng</Text>
        <Text style={styles.inputLabel}>Địa chỉ giao hàng *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ giao hàng..."
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />
        <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ghi chú cho người giao hàng..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Phương thức thanh toán */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💵 Phương thức thanh toán</Text>
        <View style={styles.payMethod}>
          <Text style={styles.payIcon}>💵</Text>
          <Text style={styles.payText}>Thanh toán khi nhận hàng (COD)</Text>
        </View>
      </View>

      {/* Nút đặt hàng */}
      <TouchableOpacity
        style={[styles.btnOrder, loading && { opacity: 0.7 }]}
        onPress={handleOrder}
        disabled={loading}
      >
        <Text style={styles.btnOrderText}>
          {loading ? '⏳ Đang xử lý...' : `🛒 Đặt hàng — ${totalAmount.toLocaleString()} đ`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1F2937', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  section: { backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemImg: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  itemName: { fontWeight: 'bold', color: '#1F2937', fontSize: 14 },
  itemQty: { color: '#6B7280', fontSize: 13 },
  itemTotal: { fontWeight: 'bold', color: '#7C3AED', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#7C3AED' },
  inputLabel: { fontSize: 14, color: '#374151', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
    padding: 12, marginBottom: 12, backgroundColor: '#F9FAFB',
    textAlignVertical: 'top', color: '#1F2937',
  },
  payMethod: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F0FDF4', borderRadius: 10, borderWidth: 1, borderColor: '#10B981' },
  payIcon: { fontSize: 24, marginRight: 12 },
  payText: { fontSize: 15, color: '#065F46', fontWeight: '600' },
  btnOrder: {
    backgroundColor: '#7C3AED', margin: 16, padding: 16,
    borderRadius: 14, alignItems: 'center', elevation: 4,
  },
  btnOrderText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
