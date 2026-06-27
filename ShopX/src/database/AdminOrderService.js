import DBService from './DBService'
class AdminOrderService {
    static async getAllOrderData() {
        const db = await DBService.getDB();

        const [result] = await db.executeSql(`SELECT * FROM orders ORDER BY id DESC`);

        return result.rows.raw();
    }

    static async getOrderItems(orderId) {
        const db = await DBService.getDB();

        const [result] = await db.executeSql(`SELECT product_name, qty, mrp, price, total FROM order_items WHERE order_id = ?`,
            [orderId]
        );

        return result.rows.raw();
    }

    static async UpdateOrderStatus(orderId, orderStatus, paymentStatus) {
        const db = await DBService.getDB();

        await db.executeSql(`UPDATE orders SET order_status = ?, payment_status = ?
       WHERE id = ?`,
            [orderStatus, paymentStatus, orderId])
    }

    static async getOrderStatus(orderId) {
        const db = await DBService.getDB();
        const [result] = await db.executeSql(`SELECT order_status, payment_status FROM orders WHERE id = ?`, [orderId])
        if (result.rows.length > 0) {
            return result.rows.item(0);
        }
        return null;
    }

    static async getTodayOrders() {
        const db = await DBService.getDB();
        const [result] = await db.executeSql(`SELECT * FROM orders WHERE DATE(created_at) = DATE('now','localtime')`);
        return result.rows.raw();
    }
}

export default AdminOrderService