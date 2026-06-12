import SQLite from 'react-native-sqlite-storage';

// Bật chế độ Promise để dùng async/await cho code gọn và dễ đọc hơn (thay vì dùng callback lồng nhau)
SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

// 2. Import và khởi tạo
export const getDBConnection = async () => {
  if (db) {
    return db; // Nếu đã kết nối rồi thì dùng lại
  }
  
  try {
    db = await SQLite.openDatabase({
      name: 'MyDatabase.db',
      location: 'default',
    });
    console.log('✅ Database opened successfully');
    return db;
  } catch (error) {
    console.log('❌ Error opening database:', error);
    throw Error('Failed to get DB connection');
  }
};

// 3. Tạo bảng
export const createTables = async (db: SQLite.SQLiteDatabase) => {
  const queryProducts = `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    img TEXT,
    categoryId INTEGER
  )`;

  // Tạo thêm bảng categories để phục vụ phần JOIN ở bước 8
  const queryCategories = `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`;

  try {
    await db.executeSql(queryProducts);
    await db.executeSql(queryCategories);
    console.log('✅ Tables created successfully');
  } catch (error) {
    console.log('❌ Error creating tables:', error);
  }
};

// 4. Thêm dữ liệu
export const addProduct = async (
  db: SQLite.SQLiteDatabase,
  name: string,
  price: number,
  img: string,
  categoryId: number
) => {
  const insertQuery = `INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)`;
  const values = [name, price, img, categoryId];
  try {
    await db.executeSql(insertQuery, values);
    console.log('✅ Thêm sản phẩm thành công!');
  } catch (error) {
    console.log('❌ Lỗi thêm sản phẩm:', error);
  }
};

// Hỗ trợ thêm Danh mục (category) mẫu
export const addCategory = async (db: SQLite.SQLiteDatabase, name: string) => {
  const insertQuery = `INSERT INTO categories (name) VALUES (?)`;
  try {
    await db.executeSql(insertQuery, [name]);
    console.log('✅ Thêm danh mục thành công!');
  } catch (error) {
    console.log('❌ Lỗi thêm danh mục:', error);
  }
};

// 5. Lấy dữ liệu
export const getProducts = async (db: SQLite.SQLiteDatabase) => {
  try {
    const products: any[] = [];
    const results = await db.executeSql('SELECT * FROM products');
    
    // SQLite-storage trả về mảng các ResultSet
    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) {
        products.push(result.rows.item(i));
      }
    });
    
    console.log('📦 Danh sách sản phẩm:', products);
    return products;
  } catch (error) {
    console.log('❌ Lỗi lấy danh sách sản phẩm:', error);
    return [];
  }
};

// 6. Cập nhật dữ liệu
export const updateProduct = async (
  db: SQLite.SQLiteDatabase,
  id: number,
  name: string,
  price: number
) => {
  const updateQuery = `UPDATE products SET name = ?, price = ? WHERE id = ?`;
  const values = [name, price, id];
  try {
    await db.executeSql(updateQuery, values);
    console.log('✅ Đã cập nhật sản phẩm', id);
  } catch (error) {
    console.log('❌ Lỗi cập nhật sản phẩm:', error);
  }
};

// 7. Xóa dữ liệu
export const deleteProduct = async (db: SQLite.SQLiteDatabase, id: number) => {
  const deleteQuery = `DELETE FROM products WHERE id = ?`;
  try {
    await db.executeSql(deleteQuery, [id]);
    console.log('✅ Đã xóa sản phẩm', id);
  } catch (error) {
    console.log('❌ Lỗi xóa sản phẩm:', error);
  }
};

// 8. Tìm kiếm trên nhiều bảng (JOIN + LIKE)
export const searchProducts = async (db: SQLite.SQLiteDatabase, keyword: string) => {
  const searchQuery = `
    SELECT products.*, categories.name AS categoryName
    FROM products
    JOIN categories ON products.categoryId = categories.id
    WHERE products.name LIKE ? OR products.price LIKE ? OR categories.name LIKE ?
  `;
  
  // %keyword% có nghĩa là chứa từ khóa ở bất kỳ vị trí nào
  const searchPattern = `%${keyword}%`; 
  const values = [searchPattern, searchPattern, searchPattern];

  try {
    const searchResults: any[] = [];
    const results = await db.executeSql(searchQuery, values);
    
    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) {
        searchResults.push(result.rows.item(i));
      }
    });
    
    console.log(`🔍 Kết quả tìm kiếm cho "${keyword}":`, searchResults);
    return searchResults;
  } catch (error) {
    console.log('❌ Lỗi tìm kiếm:', error);
    return [];
  }
};
