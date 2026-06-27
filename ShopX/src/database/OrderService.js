import DBService from "./DBService";
import OrderItemService from "./OrderItemService";
import ProductService from "./ProductService";

class OrderService {

    // CREATE TABLE
    static async createOrderTable() {
        const db = await DBService.getDB();
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                mobile TEXT,
                address TEXT,
                total_items INTEGER,
                mrp REAL,
                discount REAL,
                total_amount REAL,
                payment_mode TEXT,
                payment_status TEXT,
                order_status TEXT,
                created_at TEXT
            );
        `);
    }

    // PLACE ORDER
    static async placeOrder(order) {
        const db = await DBService.getDB();
        const result = await db.executeSql(
            `INSERT INTO orders 
            (user_id, username, mobile, address, total_items, mrp, discount, total_amount,
             payment_mode, payment_status, order_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                order.userId,
                order.userName,
                order.mobile,
                order.address,
                order.total_items,
                order.mrp,
                order.discount,
                order.total_amount,
                order.payment_mode,
                order.payment_status,
                "PLACED",
                new Date().toISOString()
            ]
        );

        return result[0].insertId;
    }

    // GET ALL ORDERS
    static async getOrdersByUser(userId) {
        const db = await DBService.getDB();
        const result = await db.executeSql(
            `SELECT * FROM orders WHERE user_id=? ORDER BY id DESC`,
            [userId]
        );
        return result[0].rows.raw();
    }

    // UPDATE ORDER STATUS
    static async updateOrderStatus(orderId, status) {
        const db = await DBService.getDB();
        await db.executeSql(
            `UPDATE orders SET order_status=? WHERE id=?`,
            [status, orderId]
        );
    }

    // CANCEL ORDER
    static async cancelOrder(orderId) {
        const db = await DBService.getDB();

        // 1. Update order status
        await db.executeSql(
            `UPDATE orders SET order_status='CANCELLED', payment_status='UNPAID'  WHERE id=?`,
            [orderId]
        );

        // 2. Fetch items for this order to restore stock
        const items = await OrderItemService.getOrderItems(orderId);
        for (const item of items) {
            if (item.product_id) {
                await ProductService.restoreStock(item.product_id, item.qty);
            }
        }
    }

    // CLEAR COMPLETED & CANCELLED
    static async clearHistory() {
        const db = await DBService.getDB();
        await db.executeSql(
            `DELETE FROM orders WHERE order_status IN ('DELIVERED','CANCELLED')`
        );
    }

    static async GetAllOrders() {
        const db = await DBService.getDB();
        const result = await db.executeSql(`SELECT COUNT(*) AS total_products FROM orders`)
        return result;
    }
}

export default OrderService;
