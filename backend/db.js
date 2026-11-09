
const mysql = require('mysql2');
require('dotenv').config();

const isRailway = process.env.MYSQLHOST;

const db = mysql.createConnection({
  host: isRailway ? process.env.MYSQLHOST : 'localhost',
  port: isRailway ? process.env.MYSQLPORT : 3306,
  user: isRailway ? process.env.MYSQLUSER : 'root',
  password: isRailway ? process.env.MYSQLPASSWORD : '',
  database: isRailway ? process.env.MYSQLDATABASE : 'recipe_sharing',
});

db.connect((error) => {
  if (error) {
    console.error('MySQL connection failed:', error.message);
    return;
  }

  console.log(
    isRailway
      ? 'Railway MySQL connected successfully!'
      : 'Local MySQL connected successfully!'
  );
});

module.exports = db;
