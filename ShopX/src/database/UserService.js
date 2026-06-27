import DBService from "./DBService";

class UserService {
    static async createUserTable() {
        const db = await DBService.getDB();

        const query = `
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            is_logged_in INTEGER DEFAULT 0);`;

        await db.executeSql(query);
    }

    //Insert default Admin (Only once)
    static async createDefaultAdmin() {
        const db = await DBService.getDB();

        const result = await db.executeSql(
            `SELECT * FROM users WHERE role = 'ADMIN'`
        );

        if (result[0].rows.length === 0) {
            await db.executeSql(
                `INSERT INTO users (username, mobile, password, role)
                VALUES (?, ?, ?, ?)`,
                ['Admin', '9999999999', '111', 'ADMIN']
            );
        }
    }

    //Register new USER

    static async registerUser(username, mobile, password) {
        const db = await DBService.getDB();

        //Check duplicate user

        const check = await db.executeSql(
            `SELECT * FROM users WHERE username=? OR mobile=?`,
            [username, mobile]
        );

        if (check[0].rows.length > 0) {
            return { success: false, message: 'User already exists' }
        }

        await db.executeSql(
            `INSERT INTO users (username, mobile, password, role)
            VALUES (?, ?, ?, ?)`,
            [username, mobile, password, 'USER']
        );

        return { success: true, message: 'User registered successfully' }
    }

    //Get All users (except Password)
    static async getAllUsers() {
        const db = await DBService.getDB();
        const result = await db.executeSql(
            `SELECT id, username, mobile, role FROM users ORDER BY id DESC`
        );
        return result[0].rows.raw();
    }

    //Change user role
    static async updateUserRole(userId, newRole) {
        const db = await DBService.getDB();
        await db.executeSql(
            `UPDATE users SET role = ? Where id = ?`,
            [newRole, userId]
        )
    }

    //Delete user (Admin only)
    static async deleteUser(userId) {
        const db = await DBService.getDB();
        await db.executeSql(`DELETE FROM users WHERE id=?`, [userId]);
    }

    //Check admin count
    static async getAdminCount() {
        const db = await DBService.getDB();
        const result = await db.executeSql(
            `SELECT COUNT(*) as total FROM users WHERE role='ADMIN'`
        );

        return result[0].rows.item(0).total;
    }

    //Login USER
    static async loginUser(mobile, password) {
        const db = await DBService.getDB();

        const result = await db.executeSql(
            `SELECT * FROM users WHERE mobile=? AND password=?`,
            [mobile, password]
        );

        if (result[0].rows.length === 0) {
            return { success: false, message: 'Invalid credentials' }
        }

        const user = result[0].rows.item(0);

        await db.executeSql(
            `UPDATE users SET is_logged_in = 1 Where id=?`,
            [user.id]
        );

        return { success: true, message: 'Login successful', user }
    }

    //get Logged-in user
    static async getLoggedInUser() {
        const db = await DBService.getDB();
        const result = await db.executeSql(
            `SELECT * FROM users WHERE is_logged_in = 1`
        );

        if (result[0].rows.length === 0) {
            return null;
        }

        return result[0].rows.item(0);
    }

    //Logout USER

    static async logoutUser() {
        const db = await DBService.getDB();
        await db.executeSql(`UPDATE users SET is_logged_in =0`);
    }

    static async getTotalUsers() {
        const db = await DBService.getDB();
        const users = await db.executeSql(`SELECT * FROM users WHERE role='USER' `);

        return users[0].rows.raw();
    }

    // Update User Profile
    static async updateUser(userId, username, mobile) {
        const db = await DBService.getDB();

        // Check for duplicates (excluding current user)
        const check = await db.executeSql(
            `SELECT * FROM users WHERE (username=? OR mobile=?) AND id != ?`,
            [username, mobile, userId]
        );

        if (check[0].rows.length > 0) {
            return { success: false, message: 'Username or Mobile already taken' }
        }

        await db.executeSql(
            `UPDATE users SET username=?, mobile=? WHERE id=?`,
            [username, mobile, userId]
        );

        return { success: true, message: 'Profile updated successfully' };
    }
}

export default UserService;