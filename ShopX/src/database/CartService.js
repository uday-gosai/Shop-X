import DBService from "./DBService"

class CartService{

    static async createCartTable(){
        const db = await DBService.getDB();

        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS cart(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            qty INTEGER,
            created_at TEXT,
            updated_at TEXT,
            UNIQUE(user_id, product_id))`);
    }

    //First Time Add (Manual Qty)
    static async addToCart(user_id, product_id, qty){
        const db = await DBService.getDB();
        const now = new Date().toISOString();

        const result = await db.executeSql(
            `SELECT qty FROM cart WHERE user_id=? AND product_id=?`,
            [user_id, product_id]
        );

        if(result[0].rows.length === 0){
            //Insert First Time
            await db.executeSql(
                `INSERT INTO cart (user_id, product_id, qty, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)`,
                [user_id, product_id, qty, now, now]
            );
            console.log("Insert Cart Value")
        }else{
            //If already exist -> overwite qty
            await db.executeSql(
                `UPDATE cart SET qty=?, updated_at=? WHERE user_id=? AND product_id=?`,
                [qty, now, user_id, product_id]
            );
            console.log("Update Cart Value")
        }
    }

    //Increment qty (+ Button)
    static async incrementQty(user_id, product_id){
        const db = await DBService.getDB();
        
        await db.executeSql(
            `UPDATE cart SET qty = qty + 1, updated_at=?
            WHERE user_id=? AND product_id=?`,
            [new Date().toISOString(), user_id, product_id]
        );
    }

    //Decrement qty (- button)
    static async decrementQty(user_id, product_id){
        const db = await DBService.getDB();

        await db.executeSql(
            `UPDATE cart SET qty = qty - 1, updated_at=?
            WHERE user_id=? AND product_id=?`,
            [new Date().toISOString(), user_id, product_id]
        );
    }

    //Update Qty Manually
    static async UpdateQty(user_id, product_id, qty){
        const db= await DBService.getDB();
        
        await db.executeSql(
            `UPDATE cart SET qty=?, updated_at=?
            WHERE user_id=? AND product_id=?`,
            [qty, new Date().toISOString(), user_id, product_id]
        );
    }

    //Remove cart Item
    static async RemoveItem(user_id, product_id){
        const db = await DBService.getDB();

        await db.executeSql(
            `DELETE FROM cart WHERE user_id=? AND product_id=?`,
            [user_id,product_id]
        );
    }

    //Remove All cart Items
    static async RemoveAll(user_id){
        const db = await DBService.getDB();

        await db.executeSql(
            `DELETE FROM cart WHERE user_id=?`,
            [user_id]
        );
    }

    //Get cart items (with product data)
    static async getUserCart(user_id){
        const db = await DBService.getDB();

        const result = await db.executeSql(
            `SELECT c.id as cart_id,
            c.qty,
            p.*
            FROM cart c 
            JOIN products p ON p.id = c.product_id
            WHERE c.user_id=?`,
            [user_id]
        );

        return result[0].rows.raw();
    }
}

export default CartService;