const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sowmya@2004',
  database: 'recipe_sharing',
});

db.connect((error) => {
  if (error) {
    console.error('MySQL connection failed:', error.message);
    return;
  }

  console.log('MySQL connected successfully!');
});

module.exports = db;