import DBService from "./DBService";

class OrderItemService {

    static async createOrderItemTable() {
        const db = await DBService.getDB();

        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS order_items(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            qty INTEGER,
            mrp REAL,
            price REAL, 
            total REAL);`);
    }

    static async addOrderItem(orderId, item) {
        console.log("addOrderItem", orderId, item)
        const db = await DBService.getDB();
        await db.executeSql(
            `INSERT INTO order_items
            (order_id, product_id, product_name, qty, mrp, price, total)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderId, item.id, item.name, item.qty, item.mrp, item.price, item.price * item.qty]
        )
    }

    static async getOrderItems(orderId) {
        const db = await DBService.getDB();
        const orderItems = await db.executeSql(
            `SELECT * FROM order_items WHERE order_id=?`,
            [orderId]
        );
        return orderItems[0].rows.raw();
    }
}

export default OrderItemService;