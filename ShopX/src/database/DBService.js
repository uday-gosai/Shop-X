import SQLite from 'react-native-sqlite-storage';

//Enable Promise for clean Async/Await

SQLite.enablePromise(true);

class DBService {
  static db = null;

  //Open database only once
  static async initDB() {
    if (this.db) return this.db;

    try {
      this.db = await SQLite.openDatabase({
        name: 'smart_Shop.db',
        location: 'default',
      });

      return this.db;
    } catch (error) {
      console.log('DB open error:', error);
      throw error;
    }
  }

  //Get database anywhere in app
  static async getDB() {
    if (!this.db) {
      return await this.initDB();
    }
    return this.db;
  }
}

export default DBService;