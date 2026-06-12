import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ScrollView, Image, Modal
} from 'react-native';
import {
  fetchProducts, addProduct, updateProduct, deleteProduct,
  fetchCategories, Product, Category
} from '../../../database/database';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [img, setImg] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
    setCategories(cats);
    setProducts(prods.reverse());
    if (cats.length > 0) setCategoryId(cats[0].id);
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và giá sản phẩm!');
      return;
    }
    const data = {
      name: name.trim(),
      price: parseFloat(price),
      img: img.trim() || 'https://via.placeholder.com/150',
      categoryId,
    };
    if (editingProduct) {
      await updateProduct({ ...data, id: editingProduct.id });
      Alert.alert('✅ Thành công', 'Đã cập nhật sản phẩm!');
    } else {
      await addProduct(data);
      Alert.alert('✅ Thành công', 'Đã thêm sản phẩm mới!');
    }
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setName(''); setPrice(''); setImg('');
    setEditingProduct(null); setShowForm(false);
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price.toString());
    setImg(p.img.startsWith('http') ? p.img : '');
    setCategoryId(p.categoryId);
    setShowForm(true);
  };

  const handleDelete = (p: Product) => {
    Alert.alert('Xác nhận xóa', `Xóa sản phẩm "${p.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          await deleteProduct(p.id);
          loadData();
        }
      },
    ]);
  };

  const getCatName = (id: number) => categories.find(c => c.id === id)?.name ?? 'N/A';

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const getImgSource = (imgUrl: string) => {
    if (imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('file://'))) return { uri: imgUrl };
    return { uri: 'https://via.placeholder.com/60' };
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={getImgSource(item.img)} style={styles.img} />
      <View style={styles.info}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString()} đ</Text>
        <Text style={styles.productCat}>📋 {getCatName(item.categoryId)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnEdit} onPress={() => handleEdit(item)}>
          <Text style={styles.btnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDel} onPress={() => handleDelete(item)}>
          <Text style={styles.btnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Quản lý Sản Phẩm</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Tìm kiếm sản phẩm..."
        value={searchKeyword}
        onChangeText={setSearchKeyword}
      />

      <TouchableOpacity style={styles.btnAdd} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.btnSaveText}>{showForm ? '✕ Đóng form' : '➕ Thêm sản phẩm mới'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Tên sản phẩm..." value={name} onChangeText={setName} />
          <TextInput
            style={styles.input}
            placeholder="Giá (VD: 5000000)..."
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            style={styles.input}
            placeholder="URL hình ảnh (tùy chọn)..."
            value={img}
            onChangeText={setImg}
          />

          {/* Chọn danh mục bằng nút bấm */}
          <Text style={styles.formLabel}>Danh mục:</Text>
          <TouchableOpacity style={styles.catSelector} onPress={() => setShowCatPicker(true)}>
            <Text style={styles.catSelectorText}>📋 {getCatName(categoryId)}</Text>
            <Text style={{ color: '#7C3AED' }}>▼</Text>
          </TouchableOpacity>

          <View style={styles.formBtns}>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={styles.btnSaveText}>{editingProduct ? '✅ Cập nhật' : '➕ Thêm'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={resetForm}>
              <Text style={styles.btnSaveText}>❌ Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        ListEmptyComponent={<Text style={styles.empty}>Không có sản phẩm nào</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Modal chọn danh mục */}
      <Modal visible={showCatPicker} transparent animationType="slide" onRequestClose={() => setShowCatPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📋 Chọn danh mục</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catOption, categoryId === cat.id && styles.catOptionActive]}
                onPress={() => { setCategoryId(cat.id); setShowCatPicker(false); }}
              >
                <Text style={[styles.catOptionText, categoryId === cat.id && styles.catOptionTextActive]}>
                  {cat.name}
                </Text>
                {categoryId === cat.id && <Text style={{ color: '#7C3AED' }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.btnClose} onPress={() => setShowCatPicker(false)}>
              <Text style={styles.btnSaveText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1F2937', marginBottom: 12, marginTop: 8 },
  searchInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 10, backgroundColor: '#fff', marginBottom: 10 },
  btnAdd: { backgroundColor: '#0EA5E9', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2, marginBottom: 14 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#F9FAFB' },
  catSelector: {
    borderWidth: 1, borderColor: '#7C3AED', borderRadius: 8, padding: 12,
    marginBottom: 12, backgroundColor: '#F5F3FF',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  catSelectorText: { color: '#7C3AED', fontWeight: '600' },
  formBtns: { flexDirection: 'row', gap: 10 },
  btnSave: { flex: 1, backgroundColor: '#0EA5E9', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { flex: 1, backgroundColor: '#6B7280', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, elevation: 1, alignItems: 'center' },
  img: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  productName: { fontWeight: 'bold', fontSize: 15, color: '#1F2937' },
  productPrice: { color: '#0EA5E9', marginTop: 2 },
  productCat: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  actions: { gap: 8 },
  btnEdit: { backgroundColor: '#10B981', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnDel: { backgroundColor: '#EF4444', padding: 8, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 30 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  catOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 10, marginBottom: 8, backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  catOptionActive: { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' },
  catOptionText: { fontSize: 15, color: '#374151', fontWeight: '600' },
  catOptionTextActive: { color: '#7C3AED' },
  btnClose: { backgroundColor: '#6B7280', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
});
