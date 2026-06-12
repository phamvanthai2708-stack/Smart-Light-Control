import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Alert, Modal
} from 'react-native';
import { fetchUsers, updateUserRole, deleteUser, User } from '../../../database/database';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('user');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    const ok = await updateUserRole(selectedUser.id, newRole);
    if (ok) {
      Alert.alert('✅ Thành công', `Đã cập nhật vai trò thành ${newRole}`);
    }
    setShowModal(false);
    loadUsers();
  };

  const handleDelete = (user: User) => {
    if (user.role === 'admin') {
      Alert.alert('Không thể xóa', 'Không thể xóa tài khoản Admin!');
      return;
    }
    Alert.alert('Xác nhận xóa', `Xóa người dùng "${user.username}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          await deleteUser(user.id);
          loadUsers();
        }
      },
    ]);
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
        {item.fullname ? <Text style={styles.fullname}>{item.fullname}</Text> : null}
        <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? '#7C3AED' : '#0EA5E9' }]}>
          <Text style={styles.roleText}>{item.role === 'admin' ? '🔑 Admin' : '👤 User'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnRole} onPress={() => openRoleModal(item)}>
          <Text style={styles.btnText}>⚙️ Vai trò</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDel} onPress={() => handleDelete(item)}>
          <Text style={styles.btnText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Quản lý Người Dùng</Text>
      <Text style={styles.count}>Tổng: {users.length} người dùng</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        ListEmptyComponent={<Text style={styles.empty}>Không có người dùng nào</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Modal cập nhật vai trò - dùng nút bấm thay vì Picker */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>⚙️ Cập nhật vai trò</Text>
            <Text style={styles.modalSubtitle}>
              Người dùng: <Text style={{ fontWeight: 'bold' }}>{selectedUser?.username}</Text>
            </Text>

            {/* Chọn vai trò bằng nút bấm */}
            <View style={styles.roleOptions}>
              <TouchableOpacity
                style={[styles.roleOption, newRole === 'user' && styles.roleOptionActive]}
                onPress={() => setNewRole('user')}
              >
                <Text style={[styles.roleOptionText, newRole === 'user' && styles.roleOptionTextActive]}>
                  👤 User
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, newRole === 'admin' && styles.roleOptionAdminActive]}
                onPress={() => setNewRole('admin')}
              >
                <Text style={[styles.roleOptionText, newRole === 'admin' && styles.roleOptionTextActive]}>
                  🔑 Admin
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.btnSaveText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleUpdateRole}>
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
  card: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 14,
    borderRadius: 12, marginBottom: 10, elevation: 1, alignItems: 'center',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1 },
  username: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' },
  fullname: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  roleText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  actions: { gap: 6 },
  btnRole: { backgroundColor: '#10B981', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnDel: { backgroundColor: '#EF4444', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  modalSubtitle: { color: '#6B7280', marginBottom: 16 },
  roleOptions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleOption: {
    flex: 1, padding: 14, borderRadius: 10, borderWidth: 2,
    borderColor: '#D1D5DB', alignItems: 'center', backgroundColor: '#F9FAFB',
  },
  roleOptionActive: { borderColor: '#0EA5E9', backgroundColor: '#E0F2FE' },
  roleOptionAdminActive: { borderColor: '#7C3AED', backgroundColor: '#EDE9FE' },
  roleOptionText: { fontSize: 15, fontWeight: 'bold', color: '#6B7280' },
  roleOptionTextActive: { color: '#1F2937' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  btnSave: { flex: 1, backgroundColor: '#7C3AED', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { flex: 1, backgroundColor: '#6B7280', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontWeight: 'bold' },
});
