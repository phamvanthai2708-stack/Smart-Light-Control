import React, { useState, useCallback } from 'react';
import {
  FlatList, View, Text, TouchableOpacity, StyleSheet,
  Image, ScrollView, TextInput, Modal
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import {
  Product, Category, initDatabase, fetchProducts, fetchCategories,
  searchProductsByNameOrCategory, fetchProductsByPriceRange, addToCart
} from '../database/database';

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { product: Product };
  Cart: undefined;
  Checkout: { cartItems: any[]; totalAmount: number };
  OrderHistory: undefined;
  Profile: undefined;
};

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const getImageSource = (img: string) => {
  if (!img) return { uri: 'https://via.placeholder.com/110' };
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

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: '< 5tr', min: 0, max: 5000000 },
  { label: '5 - 15tr', min: 5000000, max: 15000000 },
  { label: '15 - 25tr', min: 15000000, max: 25000000 },
  { label: '> 25tr', min: 25000000, max: Infinity },
];

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useFocusEffect(
    useCallback(() => {
      initDatabase(() => loadAll());
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    const stored = await AsyncStorage.getItem('loggedInUser');
    if (stored) {
      const u = JSON.parse(stored);
      setUserId(u.id);
    }
  };

  const loadAll = async () => {
    const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
    setCategories(cats);
    setProducts(prods.reverse());
  };

  const handleSearch = async (kw: string) => {
    setSearchKeyword(kw);
    if (kw.trim() === '') {
      const prods = await fetchProducts();
      setProducts(prods.reverse());
    } else {
      const results = await searchProductsByNameOrCategory(kw);
      setProducts(results.reverse());
    }
  };

  const handleFilterByPriceRange = (index: number) => {
    setSelectedPriceRange(index);
  };

  const handleApplyCustomFilter = async () => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || 999999999;
    const results = await fetchProductsByPriceRange(min, max);
    setProducts(results);
    setShowFilter(false);
  };

  const handleAddToCart = async (product: Product) => {
    if (!userId) {
      (navigation as any).navigate('LoginSqlite');
      return;
    }
    await addToCart(userId, product.id);
    setCartCount(prev => prev + 1);
  };

  const filteredProducts = products.filter((p) => {
    const range = PRICE_RANGES[selectedPriceRange];
    const inPriceRange = p.price >= range.min && p.price <= range.max;
    const inCategory = selectedCategory === null || p.categoryId === selectedCategory;
    return inPriceRange && inCategory;
  });

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product: item })}>
        <Image source={getImageSource(item.img)} style={styles.productImg} />
      </TouchableOpacity>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toLocaleString()} đ</Text>
      <TouchableOpacity style={styles.btnCart} onPress={() => handleAddToCart(item)}>
        <Text style={styles.btnCartText}>🛒 Thêm giỏ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Banner */}
        <Image source={require('../images/hinh1.jpg')} style={styles.banner} />

        {/* Header user */}
        <Header />

        {/* Thanh tìm kiếm */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm sản phẩm, danh mục..."
            value={searchKeyword}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.btnFilter} onPress={() => setShowFilter(true)}>
            <Text style={styles.btnFilterText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCartHeader} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.btnFilterText}>🛒</Text>
          </TouchableOpacity>
        </View>

        {/* Lọc theo danh mục */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          <TouchableOpacity
            style={[styles.catChip, selectedCategory === null && styles.catChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.catChipText, selectedCategory === null && styles.catChipTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lọc theo khoảng giá */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceScroll}>
          {PRICE_RANGES.map((range, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.priceChip, selectedPriceRange === index && styles.priceChipActive]}
              onPress={() => handleFilterByPriceRange(index)}
            >
              <Text style={[styles.priceChipText, selectedPriceRange === index && styles.priceChipTextActive]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tiêu đề section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🛍️ Sản Phẩm ({filteredProducts.length})</Text>
        </View>

        {/* Danh sách sản phẩm */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>}
        />
      </ScrollView>

      {/* Modal lọc khoảng giá tùy chỉnh */}
      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <View style={styles.filterOverlay}>
          <View style={styles.filterBox}>
            <Text style={styles.filterTitle}>⚙️ Lọc sản phẩm</Text>
            <Text style={styles.filterLabel}>Giá từ (đ)</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="VD: 5000000"
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
            />
            <Text style={styles.filterLabel}>Đến (đ)</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="VD: 20000000"
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
            />
            <View style={styles.filterBtns}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowFilter(false)}>
                <Text style={styles.filterBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnApply} onPress={handleApplyCustomFilter}>
                <Text style={styles.filterBtnText}>✅ Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  banner: { width: '100%', height: 150, resizeMode: 'cover' },
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: 12, gap: 8 },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12,
    padding: 10, backgroundColor: '#fff', fontSize: 14,
  },
  btnFilter: { backgroundColor: '#7C3AED', padding: 10, borderRadius: 10 },
  btnCartHeader: { backgroundColor: '#10B981', padding: 10, borderRadius: 10 },
  btnFilterText: { fontSize: 16 },
  catScroll: { paddingHorizontal: 12, marginBottom: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#E5E7EB', marginRight: 8,
  },
  catChipActive: { backgroundColor: '#7C3AED' },
  catChipText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  catChipTextActive: { color: '#fff' },
  priceScroll: { paddingHorizontal: 12, marginBottom: 10 },
  priceChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#E5E7EB', marginRight: 8,
  },
  priceChipActive: { backgroundColor: '#10B981' },
  priceChipText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  priceChipTextActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
  productList: { paddingHorizontal: 8 },
  productCard: {
    flex: 1, backgroundColor: '#fff', margin: 6, borderRadius: 14,
    padding: 10, alignItems: 'center', elevation: 2,
  },
  productImg: { width: 120, height: 110, borderRadius: 10, marginBottom: 8 },
  productName: { fontWeight: 'bold', fontSize: 13, color: '#1F2937', textAlign: 'center', marginBottom: 4 },
  productPrice: { color: '#7C3AED', fontWeight: 'bold', fontSize: 13, marginBottom: 8 },
  btnCart: { backgroundColor: '#7C3AED', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  btnCartText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 30, padding: 20 },
  // Modal filter
  filterOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  filterTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  filterLabel: { fontSize: 14, color: '#374151', marginBottom: 6, fontWeight: '600' },
  filterInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, marginBottom: 14, backgroundColor: '#F9FAFB' },
  filterBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnCancel: { flex: 1, backgroundColor: '#6B7280', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnApply: { flex: 1, backgroundColor: '#7C3AED', padding: 12, borderRadius: 10, alignItems: 'center' },
  filterBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default HomeScreen;
