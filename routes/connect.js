var mysql = require('mysql');

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'courseselectiondb'
});

db.connect((err) => {

    if(err) {

        console.error('Error connecting to the database' , err.message);

    } else {

        console.log('Connected to the database');
    }
});

module.exports = db;