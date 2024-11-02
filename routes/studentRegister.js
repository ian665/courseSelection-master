var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var db = require('./connect');

//使用Promise包裝query
function queryAsync(query, params) {

    return new Promise((resolve, reject) => {

        db.query(query, params, (err, results) => {

            if (err) {

                return reject(err);
            }

            resolve(results);
        });
    });
}

router.post('/' , async (req , res) =>{

    var sid = req.body.sid;

    try {

        var data = await queryAsync("SELECT * FROM students WHERE sid = ?" , [sid]);

        if(data.length !== 0) {

            return res.json({msg: "帳號已存在"});
        }
    } catch (err) {

        console.error(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    var name = req.body.name;
    var dept = req.body.dept;
    var grade = req.body.grade;
    var credit = 0;
    var password = req.body.password;
    var hashPassword = bcrypt.hashSync(password , 10);

    try {

        await queryAsync("INSERT INTO students VALUES (? , ? , ? , ? , ? , ?)" , [sid , name , dept , grade , credit , hashPassword]);
        return res.json({msg: "註冊成功"});

    } catch (err) {

        console.error(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }
});

module.exports = router;