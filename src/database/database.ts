import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

const getDb = async (): Promise<SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'myDatabase.db', location: 'default' });
  return db;
};

// ===================== TYPES =====================
export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
  fullname?: string;
  phone?: string;
  address?: string;
};

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  productName?: string;
  productPrice?: number;
  productImg?: string;
};

export type Order = {
  id: number;
  userId: number;
  totalAmount: number;
  status: string; // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  address: string;
  createdAt: string;
  username?: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  productName?: string;
  productImg?: string;
};

// ===================== SEED DATA =====================
const initialCategories: Category[] = [
  { id: 1, name: 'Điện thoại' },
  { id: 2, name: 'Laptop' },
  { id: 3, name: 'Đồng hồ' },
  { id: 4, name: 'Tai nghe' },
  { id: 5, name: 'Máy tính bảng' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'iPhone 15 Pro', price: 28000000, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80', categoryId: 1 },
  { id: 2, name: 'MacBook Air M2', price: 25500000, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80', categoryId: 2 },
  { id: 3, name: 'Apple Watch S9', price: 9500000, img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80', categoryId: 3 },
  { id: 4, name: 'AirPods Pro 2', price: 5800000, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80', categoryId: 4 },
  { id: 5, name: 'iPad Pro M4', price: 27000000, img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=300&q=80', categoryId: 5 },
];

// ===================== INIT DATABASE =====================
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const database = await getDb();

    // Thêm các cột mới vào bảng users nếu bảng đã tồn tại từ trước
    try { await database.executeSql('ALTER TABLE users ADD COLUMN fullname TEXT'); } catch(e) {}
    try { await database.executeSql('ALTER TABLE users ADD COLUMN phone TEXT'); } catch(e) {}
    try { await database.executeSql('ALTER TABLE users ADD COLUMN address TEXT'); } catch(e) {}

    database.transaction((tx) => {
      // Categories
      tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)');
      initialCategories.forEach((category) => {
        tx.executeSql('INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)', [category.id, category.name]);
      });

      // Products
      tx.executeSql(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          price REAL,
          img TEXT,
          categoryId INTEGER,
          FOREIGN KEY (categoryId) REFERENCES categories(id)
        )`);
      initialProducts.forEach((product) => {
        tx.executeSql('INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
          [product.id, product.name, product.price, product.img, product.categoryId]);
      });

      // Users
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT,
          role TEXT,
          fullname TEXT,
          phone TEXT,
          address TEXT
        )`,
        [],
        () => console.log('✅ Users table created'),
        (_, error) => console.error('❌ Error creating users table:', error)
      );
      tx.executeSql(
        `INSERT INTO users (username, password, role, fullname) 
         SELECT 'admin', '123456', 'admin', 'Administrator'
         WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')`,
        [],
        () => console.log('✅ Admin user added'),
        (_, error) => {
          console.log('Fallback insert admin');
          tx.executeSql(`INSERT INTO users (username, password, role) SELECT 'admin', '123456', 'admin' WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')`);
          return false;
        }
      );

      // Cart
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          productId INTEGER,
          quantity INTEGER DEFAULT 1,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (productId) REFERENCES products(id)
        )`
      );

      // Orders
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          totalAmount REAL,
          status TEXT DEFAULT 'pending',
          address TEXT,
          createdAt TEXT,
          FOREIGN KEY (userId) REFERENCES users(id)
        )`
      );

      // Order Items
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER,
          productId INTEGER,
          quantity INTEGER,
          price REAL,
          FOREIGN KEY (orderId) REFERENCES orders(id),
          FOREIGN KEY (productId) REFERENCES products(id)
        )`
      );

    },
      (error) => {
        console.error('❌ Transaction error:', error);
        if (onSuccess) onSuccess(); // Vẫn gọi onSuccess dù có lỗi để load sản phẩm
      },
      () => {
        console.log('✅ Database initialized');
        if (onSuccess) onSuccess();
      });

  } catch (error) {
    console.error('❌ initDatabase outer error:', error);
    if (onSuccess) onSuccess();
  }
};

// ===================== CATEGORIES CRUD =====================
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM categories');
    const items: Category[] = [];
    const rows = results[0].rows;
    for (let i = 0; i < rows.length; i++) items.push(rows.item(i));
    return items;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (name: string): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('INSERT INTO categories (name) VALUES (?)', [name]);
    return true;
  } catch (error) {
    console.error('❌ Error adding category:', error);
    return false;
  }
};

export const updateCategory = async (id: number, name: string): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    return true;
  } catch (error) {
    console.error('❌ Error updating category:', error);
    return false;
  }
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    return false;
  }
};

// ===================== PRODUCTS CRUD =====================
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM products');
    const items: Product[] = [];
    const rows = results[0].rows;
    for (let i = 0; i < rows.length; i++) items.push(rows.item(i));
    return items;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const database = await getDb();
    await database.executeSql(
      'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
      [product.name, product.price, product.img, product.categoryId]
    );
    console.log('✅ Product added');
  } catch (error) {
    console.error('❌ Error adding product:', error);
  }
};

export const updateProduct = async (product: Product) => {
  try {
    const database = await getDb();
    await database.executeSql(
      'UPDATE products SET name = ?, price = ?, categoryId = ?, img = ? WHERE id = ?',
      [product.name, product.price, product.categoryId, product.img, product.id]
    );
    console.log('✅ Product updated');
  } catch (error) {
    console.error('❌ Error updating product:', error);
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const database = await getDb();
    await database.executeSql('DELETE FROM products WHERE id = ?', [id]);
    console.log('✅ Product deleted');
  } catch (error) {
    console.error('❌ Error deleting product:', error);
  }
};

export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM products WHERE categoryId = ?', [categoryId]);
    const products: Product[] = [];
    for (let i = 0; i < results.rows.length; i++) products.push(results.rows.item(i));
    return products;
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    return [];
  }
};

export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT products.* FROM products
       JOIN categories ON products.categoryId = categories.id
       WHERE products.name LIKE ? OR categories.name LIKE ?`,
      [`%${keyword}%`, `%${keyword}%`]
    );
    const products: Product[] = [];
    for (let i = 0; i < results.rows.length; i++) products.push(results.rows.item(i));
    return products;
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return [];
  }
};

export const fetchProductsByPriceRange = async (minPrice: number, maxPrice: number): Promise<Product[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM products WHERE price >= ? AND price <= ?',
      [minPrice, maxPrice]
    );
    const products: Product[] = [];
    for (let i = 0; i < results.rows.length; i++) products.push(results.rows.item(i));
    return products;
  } catch (error) {
    console.error('❌ Error fetching products by price range:', error);
    return [];
  }
};

// ===================== USERS CRUD =====================
export const addUser = async (username: string, password: string, role: string): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role]);
    return true;
  } catch (error) {
    console.error('❌ Error adding user:', error);
    return false;
  }
};

export const updateUser = async (user: User) => {
  try {
    const db = await getDb();
    await db.executeSql(
      'UPDATE users SET username = ?, password = ?, role = ?, fullname = ?, phone = ?, address = ? WHERE id = ?',
      [user.username, user.password, user.role, user.fullname ?? null, user.phone ?? null, user.address ?? null, user.id]
    );
  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
};

export const updateUserRole = async (id: number, role: string): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return true;
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return false;
  }
};

export const deleteUser = async (id: number) => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM users WHERE id = ?', [id]);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM users');
    const users: User[] = [];
    for (let i = 0; i < results.rows.length; i++) users.push(results.rows.item(i));
    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
};

export const getUserByCredentials = async (username: string, password: string): Promise<User | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    return results.rows.length > 0 ? results.rows.item(0) : null;
  } catch (error) {
    console.error('❌ Error getting user by credentials:', error);
    return null;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM users WHERE id = ?', [id]);
    return results.rows.length > 0 ? results.rows.item(0) : null;
  } catch (error) {
    console.error('❌ Error getting user by id:', error);
    return null;
  }
};

// ===================== CART CRUD =====================
export const fetchCartItems = async (userId: number): Promise<CartItem[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT cart.*, products.name as productName, products.price as productPrice, products.img as productImg
       FROM cart JOIN products ON cart.productId = products.id
       WHERE cart.userId = ?`,
      [userId]
    );
    const items: CartItem[] = [];
    for (let i = 0; i < results.rows.length; i++) items.push(results.rows.item(i));
    return items;
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    return [];
  }
};

export const addToCart = async (userId: number, productId: number): Promise<boolean> => {
  try {
    const db = await getDb();
    const [existing] = await db.executeSql(
      'SELECT * FROM cart WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    if (existing.rows.length > 0) {
      await db.executeSql(
        'UPDATE cart SET quantity = quantity + 1 WHERE userId = ? AND productId = ?',
        [userId, productId]
      );
    } else {
      await db.executeSql(
        'INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, 1)',
        [userId, productId]
      );
    }
    return true;
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    return false;
  }
};

export const updateCartQuantity = async (cartId: number, quantity: number): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, cartId]);
    return true;
  } catch (error) {
    console.error('❌ Error updating cart quantity:', error);
    return false;
  }
};

export const removeFromCart = async (cartId: number): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM cart WHERE id = ?', [cartId]);
    return true;
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    return false;
  }
};

export const clearCart = async (userId: number): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM cart WHERE userId = ?', [userId]);
    return true;
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    return false;
  }
};

// ===================== ORDERS CRUD =====================
export const createOrder = async (userId: number, totalAmount: number, address: string, items: { productId: number; quantity: number; price: number }[]): Promise<number | null> => {
  try {
    const db = await getDb();
    const createdAt = new Date().toISOString();
    const [result] = await db.executeSql(
      'INSERT INTO orders (userId, totalAmount, status, address, createdAt) VALUES (?, ?, ?, ?, ?)',
      [userId, totalAmount, 'pending', address, createdAt]
    );
    const orderId = result.insertId;
    for (const item of items) {
      await db.executeSql(
        'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
    }
    return orderId;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return null;
  }
};

export const fetchOrdersByUser = async (userId: number): Promise<Order[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    const orders: Order[] = [];
    for (let i = 0; i < results.rows.length; i++) orders.push(results.rows.item(i));
    return orders;
  } catch (error) {
    console.error('❌ Error fetching orders by user:', error);
    return [];
  }
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT orders.*, users.username FROM orders
       JOIN users ON orders.userId = users.id
       ORDER BY orders.createdAt DESC`
    );
    const orders: Order[] = [];
    for (let i = 0; i < results.rows.length; i++) orders.push(results.rows.item(i));
    return orders;
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    return [];
  }
};

export const fetchOrderItems = async (orderId: number): Promise<OrderItem[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `SELECT order_items.*, products.name as productName, products.img as productImg
       FROM order_items JOIN products ON order_items.productId = products.id
       WHERE order_items.orderId = ?`,
      [orderId]
    );
    const items: OrderItem[] = [];
    for (let i = 0; i < results.rows.length; i++) items.push(results.rows.item(i));
    return items;
  } catch (error) {
    console.error('❌ Error fetching order items:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    return true;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return false;
  }
};
