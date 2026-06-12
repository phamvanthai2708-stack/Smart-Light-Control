import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigatorProduct';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;

  const getImageSource = (img: string) => {
    if (!img) return require('../images/hinh1.jpg');
    if (img.startsWith('file://') || img.startsWith('http')) {
      return { uri: img };
    }
    switch (img) {
      case 'hinh1.jpg': return require('../images/hinh1.jpg');
      case 'hinh2.jpg': return require('../images/hinh2.jpg');
      case 'hinh3.jpg': return require('../images/hinh3.jpg');
      case 'hinh4.jpg': return require('../images/hinh4.jpg');
      case 'hinh5.jpg': return require('../images/hinh5.jpg');
      default: return require('../images/hinh1.jpg');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={getImageSource(product.img)} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
      <Text style={styles.label}>Xem các sản phẩm khác:</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  price: {
    fontSize: 20,
    color: '#d00',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    alignSelf: 'flex-start',
  },
});

export default ProductDetailScreen;
