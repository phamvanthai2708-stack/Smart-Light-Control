import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Modal, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchOrdersByUser, fetchOrderItems, Order, OrderItem } from '../database/database';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: '⏳ Chờ xử lý',  color: '#F59E0B' },
  processing: { label: '⚙️ Đang xử lý', color: '#0EA5E9' },
  shipped:    { label: '🚚 Đang giao',   color: '#8B5CF6' },
  delivered:  { label: '✅ Đã giao',     color: '#10B981' },
  cancelled:  { label: '❌ Đã hủy',     color: '#EF4444' },
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await AsyncStorage.getItem('loggedInUser');
        if (stored) {
          const user = JSON.parse(stored);
          const data = await fetchOrdersByUser(user.id);
          setOrders(data);
        }
      };
      load();
    }, [])
  );

  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    const items = await fetchOrderItems(order.id);
    setOrderItems(items);
    setShowModal(true);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch { return iso; }
  };

  const getStatus = (status: string) => STATUS_MAP[status] ?? { label: status, color: '#6B7280' };

  const renderOrder = ({ item }: { item: Order }) => {
    const st = getStatus(item.status);
    return (
      <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>📦 Đơn hàng #{item.id}</Text>
          <View style={[styles.badge, { backgroundColor: st.color }]}>
            <Text style={styles.badgeText}>{st.label}</Text>
          </View>
        </View>
        <Text style={styles.date}>📅 {formatDate(item.createdAt)}</Text>
        <Text style={styles.address} numberOfLines={1}>📍 {item.address}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.total}>💰 {item.totalAmount.toLocaleString()} đ</Text>
          <Text style={styles.seeDetail}>Xem chi tiết ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Lịch Sử Mua Hàng</Text>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        />
      )}

      {/* Modal chi tiết */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết Đơn #{selectedOrder?.id}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <View style={styles.infoBox}>
              {(() => {
                const st = getStatus(selectedOrder.status);
                return (
                  <View style={[styles.badge, { backgroundColor: st.color, alignSelf: 'flex-start', marginBottom: 12 }]}>
                    <Text style={styles.badgeText}>{st.label}</Text>
                  </View>
                );
              })()}
              <Text style={styles.infoRow}>📅 Ngày đặt: <Text style={styles.infoVal}>{formatDate(selectedOrder.createdAt)}</Text></Text>
              <Text style={styles.infoRow}>📍 Địa chỉ: <Text style={styles.infoVal}>{selectedOrder.address}</Text></Text>
              <Text style={styles.infoRow}>💰 Tổng tiền: <Text style={[styles.infoVal, { color: '#7C3AED', fontWeight: 'bold' }]}>{selectedOrder.totalAmount.toLocaleString()} đ</Text></Text>
            </View>
          )}

          <Text style={styles.itemsTitle}>🛍️ Sản phẩm:</Text>
          {orderItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemQty}>Số lượng: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} đ</Text>
            </View>
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1F2937', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  date: { color: '#6B7280', fontSize: 13, marginBottom: 2 },
  address: { color: '#6B7280', fontSize: 13, marginBottom: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontWeight: 'bold', color: '#7C3AED', fontSize: 16 },
  seeDetail: { color: '#0EA5E9', fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  closeBtn: { fontSize: 22, color: '#6B7280', padding: 4 },
  infoBox: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  infoRow: { fontSize: 14, color: '#6B7280', marginBottom: 6 },
  infoVal: { color: '#1F2937' },
  itemsTitle: { fontWeight: 'bold', fontSize: 16, color: '#1F2937', marginBottom: 8 },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, alignItems: 'center', elevation: 1 },
  itemName: { fontWeight: 'bold', color: '#1F2937' },
  itemQty: { color: '#6B7280', fontSize: 13 },
  itemPrice: { fontWeight: 'bold', color: '#7C3AED' },
});
