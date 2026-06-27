import DBService from './DBService'

class ProductService {

    static async createTable() {
        const db = await DBService.getDB();

        // await db.executeSql(
        //     `ALTER TABLE products ADD COLUMN flash_discount_amount REAL`
        // )

        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS products(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            category TEXT,
            mrp REAL,
            discount_percent REAL,
            discount_amount REAL,
            selling_price REAL,
            is_flash_sale INTEGER,
            flash_discount_percent REAL,
            flash_discount_amount REAL,
            flash_price REAL,
            flash_start_time TEXT,
            flash_end_time TEXT,
            stock INTEGER,
            is_active INTEGER,
            image_uri TEXT,
            created_at TEXT)`);
    }

    static calculatePrices(mrp = 0, discount = 0) {
        const discountAmmount = (mrp * discount) / 100;
        const sellingPrice = mrp - discountAmmount;
        return { discountAmmount, sellingPrice };
    }

    static calculateFlashPrice(mrp = 0, flashPercent = 0) {
        const flashDiscountAmmount = (mrp * flashPercent) / 100;
        const flashSellingPrice = mrp - flashDiscountAmmount;
        return { flashDiscountAmmount, flashSellingPrice }

    }

    //Add Product
    static async addProduct(data) {
        console.log(data)
        const db = await DBService.getDB();

        const { discountAmmount, sellingPrice } = this.calculatePrices(data.mrp, data.discount_percent)

        const { flashDiscountAmmount, flashSellingPrice } = data.is_flash_sale
            ? this.calculateFlashPrice(data.mrp, data.flash_discount_percent)
            : this.calculateFlashPrice(data.mrp, 0);

        await db.executeSql(
            `INSERT INTO products (
        name,description, category,
        mrp, discount_percent, discount_amount, selling_price,
        is_flash_sale, flash_discount_percent, flash_discount_amount, flash_price,
        flash_start_time, flash_end_time,
        stock, is_active, image_uri, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.description,
                data.category,
                data.mrp,
                data.discount_percent,
                Math.floor(discountAmmount),
                Math.floor(sellingPrice),
                data.is_flash_sale ? 1 : 0,
                data.flash_discount_percent,
                Math.floor(flashDiscountAmmount),
                Math.floor(flashSellingPrice),
                data.flash_start_time,
                data.flash_end_time,
                data.stock,
                1,
                data.image_uri,
                new Date().toISOString()
            ]
        )
    }

    //LIST
    static async getAllProducts() {
        const db = await DBService.getDB();
        const res = await db.executeSql(`SELECT * FROM products ORDER BY id DESC`);
        return res[0].rows.raw();
    }


    //Get Active products
    static async getActiveProducts() {
        const db = await DBService.getDB();
        const result = await db.executeSql(
            `SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC`
        );
        return result[0].rows.raw();
    }

    //Flash Sale Product
    static async getFlashSaleProducts() {
        const db = await DBService.getDB();
        const res = await db.executeSql(
            `SELECT * FROM products WHERE is_flash_sale = 1 AND is_active = 1`
        );
        return res[0].rows.raw();
    }


    //DELETE
    static async deleteProduct(id) {
        const db = await DBService.getDB();
        await db.executeSql(`DELETE FROM products WHERE id=?`, [id])
    }

    //Update Product
    static async updateProduct(id, data) {
        const db = await DBService.getDB();

        const { discountAmmount, sellingPrice } = this.calculatePrices(data.mrp, data.discount_percent)

        const { flashDiscountAmmount, flashSellingPrice } = data.is_flash_sale
            ? this.calculateFlashPrice(data.mrp, data.flash_discount_percent)
            : this.calculateFlashPrice(data.mrp, 0)

        await db.executeSql(`
            UPDATE products SET 
            name=?,
            description=?,
            category=?,
            mrp=?,
            discount_percent=?,
            discount_amount=?,
            selling_price=?,
            is_flash_sale=?,
            flash_discount_percent=?,
            flash_discount_amount=?,
            flash_price=?,
            flash_start_time=?,
            flash_end_time=?,
            stock=?,
            image_uri=?
            WHERE id=?`,
            [
                data.name,
                data.description,
                data.category,
                data.mrp,
                data.discount_percent,
                Math.floor(discountAmmount),
                Math.floor(sellingPrice),
                data.is_flash_sale ? 1 : 0,
                data.flash_discount_percent,
                flashDiscountAmmount ? Math.floor(flashDiscountAmmount) : 0,
                flashSellingPrice ? Math.floor(flashSellingPrice) : 0,
                data.flash_start_time,
                data.flash_end_time,
                data.stock,
                data.image_uri,
                id
            ]);
    }

    // Reducestock
    static async reduceStock(productId, qty) {
        const db = await DBService.getDB();
        await db.executeSql(`UPDATE products SET stock = stock - ? WHERE id = ?`, [qty, productId])
    }

    // Restore stock (on cancellation)
    static async restoreStock(productId, qty) {
        const db = await DBService.getDB();
        await db.executeSql(`UPDATE products SET stock = stock + ? WHERE id = ?`, [qty, productId])
    }

    static async getLowStockItem() {
        const db = await DBService.getDB();
        // Fixed logic: count items with stock <= 10
        const result = await db.executeSql('SELECT * FROM products WHERE stock <= 10');
        return result[0].rows.raw();
    }

    static async getDashboardStats() {
        const db = await DBService.getDB();
        const [products] = await db.executeSql('SELECT COUNT(*) as total FROM products');
        const [orders] = await db.executeSql('SELECT COUNT(*) as total FROM orders');
        const [users] = await db.executeSql('SELECT COUNT(*) as total FROM users');
        const [lowStock] = await db.executeSql('SELECT COUNT(*) as total FROM products WHERE stock <= 10');

        // Today's Orders Count
        const [todayOrders] = await db.executeSql("SELECT COUNT(*) as total FROM orders WHERE DATE(created_at) = DATE('now','localtime')");

        // Today's Revenue
        const [revenue] = await db.executeSql("SELECT SUM(total_amount) as total FROM orders WHERE DATE(created_at) = DATE('now','localtime') AND payment_status = 'PAID'");

        return {
            totalProducts: products.rows.item(0).total,
            totalOrders: orders.rows.item(0).total,
            totalUsers: users.rows.item(0).total,
            lowStockCount: lowStock.rows.item(0).total,
            todayOrdersCount: todayOrders.rows.item(0).total,
            todayRevenue: revenue.rows.item(0).total || 0
        };
    }

    // Disable Flash Sale
    static async disableFlashSale(id) {
        const db = await DBService.getDB();
        await db.executeSql(
            `UPDATE products SET is_flash_sale = 0, flash_discount_percent = 0, flash_discount_amount = 0, flash_price = 0, flash_start_time = null, flash_end_time = null WHERE id = ?`,
            [id]
        );
    }

}

export default ProductService;