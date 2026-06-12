import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, Modal, ScrollView
} from 'react-native';
import {
  fetchCategories, addCategory, updateCategory, deleteCategory,
  fetchProductsByCategory, addProduct, deleteProduct,
  Category, Product
} from '../../../database/database';

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catName, setCatName] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Modal sản phẩm của danh mục
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);

  // Form thêm sản phẩm
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImg, setProductImg] = useState('');

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục!'); return; }
    if (editingCat) {
      await updateCategory(editingCat.id, catName.trim());
      setEditingCat(null);
    } else {
      await addCategory(catName.trim());
    }
    setCatName('');
    loadCategories();
  };

  const handleDeleteCategory = (cat: Category) => {
    Alert.alert('Xác nhận', `Xóa danh mục "${cat.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          await deleteCategory(cat.id);
          loadCategories();
        }
      },
    ]);
  };

  const openProductModal = async (cat: Category) => {
    setSelectedCat(cat);
    const prods = await fetchProductsByCategory(cat.id);
    setProducts(prods);
    setShowProductModal(true);
  };

  const handleAddProductToCategory = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và giá sản phẩm!');
      return;
    }
    if (!selectedCat) return;
    await addProduct({
      name: productName.trim(),
      price: parseFloat(productPrice),
      img: productImg.trim() || 'hinh1.jpg',
      categoryId: selectedCat.id,
    });
    setProductName('');
    setProductPrice('');
    setProductImg('');
    const prods = await fetchProductsByCategory(selectedCat.id);
    setProducts(prods);
  };

  const handleDeleteProduct = (p: Product) => {
    Alert.alert('Xác nhận', `Xóa sản phẩm "${p.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          await deleteProduct(p.id);
          if (selectedCat) {
            const prods = await fetchProductsByCategory(selectedCat.id);
            setProducts(prods);
          }
        }
      },
    ]);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.card}>
      <Text style={styles.catName}>{item.name}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnView} onPress={() => openProductModal(item)}>
          <Text style={styles.btnText}>📦 Sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnEdit} onPress={() => { setEditingCat(item); setCatName(item.name); }}>
          <Text style={styles.btnText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDel} onPress={() => handleDeleteCategory(item)}>
          <Text style={styles.btnText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Quản lý Danh Mục</Text>

      {/* Form thêm/sửa */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tên danh mục..."
          value={catName}
          onChangeText={setCatName}
        />
        <View style={styles.formBtns}>
          <TouchableOpacity style={styles.btnSave} onPress={handleSaveCategory}>
            <Text style={styles.btnSaveText}>{editingCat ? '✅ Cập nhật' : '➕ Thêm mới'}</Text>
          </TouchableOpacity>
          {editingCat && (
            <TouchableOpacity style={styles.btnCancel} onPress={() => { setEditingCat(null); setCatName(''); }}>
              <Text style={styles.btnSaveText}>❌ Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategory}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có danh mục nào</Text>}
      />

      {/* Modal xem/thêm sản phẩm theo danh mục */}
      <Modal visible={showProductModal} animationType="slide" onRequestClose={() => setShowProductModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📦 {selectedCat?.name}</Text>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.form}>
              <Text style={styles.formLabel}>Thêm sản phẩm vào danh mục:</Text>
              <TextInput style={styles.input} placeholder="Tên sản phẩm..." value={productName} onChangeText={setProductName} />
              <TextInput style={styles.input} placeholder="Giá (VD: 5000000)..." keyboardType="numeric" value={productPrice} onChangeText={setProductPrice} />
              <TextInput style={styles.input} placeholder="URL hình ảnh (tùy chọn)..." value={productImg} onChangeText={setProductImg} />
              <TouchableOpacity style={styles.btnSave} onPress={handleAddProductToCategory}>
                <Text style={styles.btnSaveText}>➕ Thêm sản phẩm</Text>
              </TouchableOpacity>
            </View>

            {products.map((p) => (
              <View key={p.id} style={styles.productCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productPrice}>{p.price.toLocaleString()} đ</Text>
                </View>
                <TouchableOpacity style={styles.btnDel} onPress={() => handleDeleteProduct(p)}>
                  <Text style={styles.btnText}>🗑️ Xóa</Text>
                </TouchableOpacity>
              </View>
            ))}
            {products.length === 0 && <Text style={styles.empty}>Chưa có sản phẩm nào trong danh mục này</Text>}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F3F4F6' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 16, marginTop: 8 },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2, marginBottom: 16 },
  formLabel: { fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#F9FAFB' },
  formBtns: { flexDirection: 'row', gap: 10 },
  btnSave: { flex: 1, backgroundColor: '#7C3AED', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { flex: 1, backgroundColor: '#6B7280', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, elevation: 1 },
  catName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  btnView: { flex: 1, backgroundColor: '#0EA5E9', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnEdit: { flex: 1, backgroundColor: '#10B981', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnDel: { flex: 1, backgroundColor: '#EF4444', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 20 },
  modalContainer: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  closeBtn: { fontSize: 22, color: '#6B7280', padding: 4 },
  productCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  productName: { fontWeight: 'bold', fontSize: 15, color: '#1F2937' },
  productPrice: { color: '#7C3AED', marginTop: 2 },
});
