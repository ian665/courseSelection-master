var express = require('express');
var router = express.Router();
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

router.post('/' , async (req, res) => {

    var sid = req.session.sid;
    var cid = req.body.cid;

    //整理課程資訊
    var courseInfo;

    try {

        let data = await queryAsync("SELECT * FROM course WHERE cid = ?" , [cid]);

        if(data.length === 0) {

            return res.json({msg: "課程不存在"});

        } else {

            courseInfo = data[0];
        }
    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    //整理學生資訊
    var studentInfo;

    try {

        let data = await queryAsync("SELECT * FROM students WHERE sid = ?" , [sid]);

        if(data.length === 0) {

            return res.json({msg: "帳號不存在"});

        } else {

            studentInfo = data[0];
        }
    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    //判斷是否加選課程
    try {

        let data = await queryAsync("SELECT * FROM course_selection WHERE sid = ? AND cid = ?" , [sid , cid]);

        if(data.length === 0) {

            return  res.json({msg: "未加選此課程"});
        }
    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    //判斷是否會低於學分下限
    // if(studentInfo.credit - courseInfo.credit < 9) {
    //
    //     return  res.json({msg: "退選後學分不可低於最低學分限制 (9 學分)"});
    // }

    //刪除課表及selection資料，更新學生已選學分

    try {

        await queryAsync("DELETE FROM course_selection WHERE sid = ? AND cid = ?" , [sid , cid]);
        await queryAsync("DELETE FROM student_timetable WHERE sid = ? AND cid = ?" , [sid , cid]);
        await queryAsync("UPDATE students SET credit = ? WHERE sid = ?" , [studentInfo.credit - courseInfo.credit , sid]);

    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    return res.json({msg: "退選成功"});
});

module.exports = router;