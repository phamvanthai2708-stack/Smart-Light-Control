import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';

// Dữ liệu mẫu danh mục
const categories = [
  { id: 1, name: 'Tất cả' },
  { id: 2, name: 'Thời trang' },
  { id: 3, name: 'Phụ kiện' },
  { id: 4, name: 'Điện tử' },
];

const CategorySelector = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const handleSelectCategory = (categoryId: number) => {
    // Trong thực tế, bạn có thể truyền categoryId qua CategoriesScreen hoặc FashionScreen v.v.
    if (categoryId === 2) {
      navigation.navigate('Fashion');
    } else if (categoryId === 3) {
      navigation.navigate('Accessory');
    } else {
      navigation.navigate('Categories');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh mục nổi bật</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={styles.categoryItem}
            onPress={() => handleSelectCategory(cat.id)}
          >
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
  },
  scroll: {
    paddingLeft: 10,
  },
  categoryItem: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default CategorySelector;
