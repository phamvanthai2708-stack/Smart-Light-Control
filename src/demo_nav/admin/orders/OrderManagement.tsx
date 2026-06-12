import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Modal, ScrollView
} from 'react-native';

import { fetchAllOrders, fetchOrderItems, updateOrderStatus, Order, OrderItem } from '../../../database/database';

const STATUS_OPTIONS = [
  { label: '⏳ Chờ xử lý', value: 'pending' },
  { label: '⚙️ Đang xử lý', value: 'processing' },
  { label: '🚚 Đang giao', value: 'shipped' },
  { label: '✅ Đã giao', value: 'delivered' },
  { label: '❌ Đã hủy', value: 'cancelled' },
];

const getStatusLabel = (status: string) => STATUS_OPTIONS.find(s => s.value === status)?.label ?? status;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'processing': return '#0EA5E9';
    case 'shipped': return '#8B5CF6';
    case 'delivered': return '#10B981';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
  }
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [newStatus, setNewStatus] = useState('pending');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    const data = await fetchAllOrders();
    setOrders(data);
  };

  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    const items = await fetchOrderItems(order.id);
    setOrderItems(items);
    setShowDetailModal(true);
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    await updateOrderStatus(selectedOrder.id, newStatus);
    setShowStatusModal(false);
    loadOrders();
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch { return iso; }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>📦 Đơn #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.orderUser}>👤 {item.username ?? 'N/A'}</Text>
      <Text style={styles.orderDate}>📅 {formatDate(item.createdAt)}</Text>
      <Text style={styles.orderTotal}>💰 {item.totalAmount.toLocaleString()} đ</Text>
      <Text style={styles.orderAddr} numberOfLines={1}>📍 {item.address}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnDetail} onPress={() => openDetail(item)}>
          <Text style={styles.btnText}>🔍 Chi tiết</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnStatus} onPress={() => openStatusModal(item)}>
          <Text style={styles.btnText}>⚙️ Cập nhật</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Quản lý Đơn Hàng</Text>
      <Text style={styles.count}>Tổng: {orders.length} đơn hàng</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có đơn hàng nào</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Modal Chi tiết đơn */}
      <Modal visible={showDetailModal} animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📦 Chi tiết Đơn #{selectedOrder?.id}</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <View style={styles.orderInfo}>
              <Text style={styles.infoRow}>👤 Khách: <Text style={styles.infoVal}>{selectedOrder.username}</Text></Text>
              <Text style={styles.infoRow}>📅 Ngày: <Text style={styles.infoVal}>{formatDate(selectedOrder.createdAt)}</Text></Text>
              <Text style={styles.infoRow}>📍 Địa chỉ: <Text style={styles.infoVal}>{selectedOrder.address}</Text></Text>
              <Text style={styles.infoRow}>💰 Tổng tiền: <Text style={[styles.infoVal, { color: '#7C3AED', fontWeight: 'bold' }]}>{selectedOrder.totalAmount.toLocaleString()} đ</Text></Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status), alignSelf: 'flex-start', marginTop: 8 }]}>
                <Text style={styles.statusText}>{getStatusLabel(selectedOrder.status)}</Text>
              </View>
            </View>
          )}

          <Text style={styles.itemsTitle}>🛍️ Sản phẩm trong đơn:</Text>
          {orderItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemQty}>Số lượng: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} đ</Text>
            </View>
          ))}
          {orderItems.length === 0 && <Text style={styles.empty}>Không có sản phẩm</Text>}
        </ScrollView>
      </Modal>

      {/* Modal cập nhật trạng thái */}
      <Modal visible={showStatusModal} transparent animationType="fade" onRequestClose={() => setShowStatusModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>⚙️ Cập nhật trạng thái</Text>
            <Text style={styles.modalSubtitle}>Đơn #{selectedOrder?.id} - {selectedOrder?.username}</Text>
            <View style={{ marginBottom: 16 }}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.pickerInput,
                    { padding: 12, marginBottom: 8 },
                    newStatus === status.value && { borderColor: '#7C3AED', backgroundColor: '#EDE9FE' }
                  ]}
                  onPress={() => setNewStatus(status.value)}
                >
                  <Text style={{
                    color: newStatus === status.value ? '#7C3AED' : '#374151',
                    fontWeight: newStatus === status.value ? 'bold' : 'normal'
                  }}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowStatusModal(false)}>
                <Text style={styles.btnSaveText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleUpdateStatus}>
                <Text style={styles.btnSaveText}>✅ Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1F2937', marginBottom: 4, marginTop: 8 },
  count: { textAlign: 'center', color: '#6B7280', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  orderUser: { color: '#374151', marginTop: 2 },
  orderDate: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  orderTotal: { color: '#7C3AED', fontWeight: 'bold', marginTop: 4 },
  orderAddr: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnDetail: { flex: 1, backgroundColor: '#0EA5E9', padding: 8, borderRadius: 8, alignItems: 'center' },
  btnStatus: { flex: 1, backgroundColor: '#F59E0B', padding: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 30, padding: 20 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  closeBtn: { fontSize: 22, color: '#6B7280', padding: 4 },
  orderInfo: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  infoRow: { fontSize: 14, color: '#6B7280', marginBottom: 6 },
  infoVal: { color: '#1F2937' },
  itemsTitle: { fontWeight: 'bold', fontSize: 16, color: '#1F2937', marginBottom: 8 },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, alignItems: 'center', elevation: 1 },
  itemName: { fontWeight: 'bold', color: '#1F2937' },
  itemQty: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  itemPrice: { fontWeight: 'bold', color: '#7C3AED' },
  // Modal overlay
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', elevation: 10 },
  modalSubtitle: { color: '#6B7280', marginBottom: 16 },
  pickerInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 16, backgroundColor: '#F9FAFB' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  btnSave: { flex: 1, backgroundColor: '#F59E0B', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { flex: 1, backgroundColor: '#6B7280', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontWeight: 'bold' },
});
