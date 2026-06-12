import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'

// ==========================================
// DỮ LIỆU MẪU (MẢNG CÁC SẢN PHẨM)
// ==========================================
const products = [
  { id: '1', name: 'Áo Thun Nam', price: '150.000đ', image: 'https://picsum.photos/200/300?random=1' },
  { id: '2', name: 'Quần Jean Nữ', price: '250.000đ', image: 'https://picsum.photos/200/300?random=2' },
  { id: '3', name: 'Giày Thể Thao', price: '500.000đ', image: 'https://picsum.photos/200/300?random=3' },
  { id: '4', name: 'Túi Xách Thời Trang', price: '300.000đ', image: 'https://picsum.photos/200/300?random=4' },
];

// ==========================================
// YÊU CẦU 2: TẠO COMPONENT CON (CARD)
// ==========================================
const ProductCard = ({ product }: { product: any }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price}</Text>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>Mua ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

// ==========================================
// COMPONENT CHÍNH
// ==========================================
const Layout1 = () => {
  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.headerText}>Logo</Text>
        </View>
        <View style={styles.banner}>
          <Text style={styles.headerText}>Banner Siêu Sale</Text>
        </View>
      </View>

      {/* --- BODY --- */}
      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* YÊU CẦU 1: LÀM BẰNG CÁCH DÙNG MẢNG TRỰC TIẾP */}
          <Text style={styles.sectionTitle}>1. Render trực tiếp từ mảng</Text>
          <View style={styles.gridContainer}>
            {products.map((item) => (
              <View key={`c1-${item.id}`} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Mua ngay</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* YÊU CẦU 2: LÀM BẰNG CÁCH DÙNG COMPONENT CON */}
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>2. Render qua Component con</Text>
          <View style={styles.gridContainer}>
            {products.map((item) => (
              <ProductCard key={`c2-${item.id}`} product={item} />
            ))}
          </View>

        </ScrollView>
      </View>

      {/* --- FOOTER --- */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Footer</Text>
      </View>
    </View>
  )
}

export default Layout1

const styles = StyleSheet.create({
  // LAYOUT TỔNG THỂ (Dựa trên ví dụ của bạn)
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    flex: 1.5, // Chỉnh lại tỉ lệ một chút để body rộng hơn
    backgroundColor: '#d1ef28',
  },
  logo: {
    flex: 1,
    backgroundColor: '#897cae',
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    flex: 6,
    backgroundColor: '#5d7639',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  body: {
    flex: 8, // Tăng không gian cho body để hiển thị lưới sản phẩm
    backgroundColor: '#e6f7ff',
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 30,
  },
  footer: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // STYLES CHO GRID VÀ PRODUCT CARD
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%', // Chiếm 48% chiều rộng để tạo thành 2 cột (còn lại khoảng trống giữa 2 cột)
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    // Đổ bóng cho card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Đổ bóng cho Android
  },
  productImage: {
    width: '100%',
    height: 120, // Cố định chiều cao ảnh
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0', // Màu nền dự phòng khi ảnh chưa tải
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
})
