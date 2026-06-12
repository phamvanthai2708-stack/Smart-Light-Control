import { FlatList, StyleSheet, Image, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Product, Category, initDatabase, fetchProducts, fetchCategories, addProduct, updateProduct, deleteProduct, searchProductsByNameOrCategory } from '../database/database';

const SanphamSqlite = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    initDatabase(() => {
      loadData(); // chỉ gọi sau khi transaction xong
    });
  }, []);

  const loadData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods.reverse()); // Đảo ngược mảng để hiển thị sản phẩm mới lên đầu
  };

  const handleSearch = async (text: string) => {
    setSearchKeyword(text);
    if (text.trim() === '') {
      loadData();
    } else {
      const results = await searchProductsByNameOrCategory(text);
      setProducts(results.reverse());
    }
  }

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và giá sản phẩm');
      return;
    }

    if (editingId) {
      await updateProduct({
        id: editingId,
        name,
        price: parseFloat(price),
        img: 'hinh1.jpg', // Tạm thời để mặc định
        categoryId: categoryId,
      });
      setEditingId(null);
    } else {
      await addProduct({
        name,
        price: parseFloat(price),
        img: 'hinh1.jpg', // Tạm thời để mặc định
        categoryId: categoryId,
      });
    }

    setName('');
    setPrice('');
    loadData();
  }

  const handleEdit = (item: Product) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price.toString());
    setCategoryId(item.categoryId);
  }

  const handleDelete = async (id: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xoá sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", onPress: async () => {
          await deleteProduct(id);
          loadData();
        } 
      }
    ]);
  }

  //hàm này để ánh xạ với hình ảnh là uri hoặc ảnh tĩnh từ thư mục images, tránh lỗi khi dùng <Image source.../>
  const getImageSource = (img: string) => {
    if (img && img.startsWith('file://')) {
      return { uri: img }; // Ảnh từ thư viện
    }
    if (img && img.startsWith('http')) {
      return { uri: img }; // Ảnh từ mạng
    }
 
    // Ảnh tĩnh từ assets
    switch (img) {
      case 'hinh1.jpg':
        return require('../images/hinh1.jpg');
      case 'hinh2.jpg':
        return require('../images/hinh2.jpg');
      case 'hinh3.jpg':
        return require('../images/hinh3.jpg');
      case 'hinh4.jpg':
        return require('../images/hinh4.jpg');
      case 'hinh5.jpg':
        return require('../images/hinh5.jpg');
      default:
        try {
          return require('../images/hinh1.jpg'); // fallback nếu ảnh không tồn tại
        } catch(e) {
          return { uri: 'https://via.placeholder.com/150' };
        }
    }
  };

  //  hàm renderItem để hiển thị từng sản phẩm
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
        <TouchableOpacity>
            <Image source={getImageSource(item.img)} style={styles.image} />
        </TouchableOpacity>
      <View style={styles.cardInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString()} đ</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Text style={styles.icon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.icon}>❌</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
 
  return (
    <View style={styles.container}>
         <Text style={styles.title}>Quản lý sản phẩm</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên sản phẩm"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Giá sản phẩm"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
        <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>
               {editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Tìm theo tên sản phẩm hoặc loại"
          value={searchKeyword}
          onChangeText={handleSearch}
         />
       <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Không có sản phẩm nào</Text>}
      />
    </View>
  )
}

export default SanphamSqlite

const styles = StyleSheet.create({
container: { padding: 16, paddingBottom: 100, flex: 1, backgroundColor: '#fff' },
title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: {
    height: 40, borderWidth: 1, borderColor: '#aaa',
    borderRadius: 6, paddingHorizontal: 10, marginBottom: 10,
  },
  card: {
    flexDirection: 'row', borderWidth: 1,
    borderColor: '#ccc', borderRadius: 8,
    marginBottom: 12, overflow: 'hidden',
  },
  image: { width: 80, height: 80 },
  cardInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  productName: { fontWeight: 'bold', fontSize: 16 },
  productPrice: { color: '#000' },
  iconRow: { flexDirection: 'row', marginTop: 10 },
  icon: { fontSize: 20, marginRight: 10 },
  button: {
    backgroundColor: '#28a', padding: 10,
    borderRadius: 6, alignItems: 'center', marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
})
