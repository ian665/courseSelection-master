var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var db = require('./connect');

router.post('/' , (req , res) =>{

    var tid = req.body.tid;
    var password = req.body.password;

    db.query("SELECT * FROM teachers WHERE tid = ?" , [tid] , (err , data) => {

        if(err) {

            console.log(err.message);
            return res.status(500).json({msg: "伺服器內部錯誤", login: false});

        } else if(data.length === 0){

            return res.json({msg: "帳號不存在", login: false});

        } else {

            var teacherInfo = data[0];

            if(bcrypt.compareSync(password , teacherInfo.password)) {

                req.session.tid = tid;
                return res.json({msg: "登入成功", login: true});

            } else {

                return res.json({msg: "密碼錯誤", login: false});
            }
        }
    });
});

module.exports = router;