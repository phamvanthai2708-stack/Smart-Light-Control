import { ImageSourcePropType } from 'react-native';

export interface Product1 {
  id: string;
  name: string;
  price: string;
  image: ImageSourcePropType;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    categoryId: number;
}

export type HomeStackParamList = {
    Home: undefined;
    Details: { product: Product1 };
    Accessory: undefined;
    Fashion: undefined;
    Categories: undefined;
    About: undefined;
    AdminDashboard: undefined;
    CategoryManagement: undefined;
    UserManagement: undefined;
    AddUser: undefined;
    EditUser: { userId: number };
    ProductManagement: undefined;
};
