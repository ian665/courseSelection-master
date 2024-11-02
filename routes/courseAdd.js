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

router.post('/' , async (req , res) => {

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

    //判斷系所是否相同
    if(studentInfo.dept !== courseInfo.dept) {

        return res.json({msg: "系所不一"});
    }

    //判斷是否超過學分上限
    if(studentInfo.credit + courseInfo > 30) {

        return res.json({msg: "超過學分上限"});
    }

    //判斷課程是否已滿
    if(courseInfo.max_quantity < courseInfo.current_quantity) {

        return res.json({msg: "課程已滿"});
    }

    //判斷課程衝堂
    try {

        let data = await queryAsync("SELECT * FROM student_timetable WHERE sid = ? AND timeid IN (SELECT timeid FROM course_timetable WHERE cid = ?)" , [sid , cid]);

        if(data.length !== 0) {

            return res.json({msg: "課程衝堂"});
        }
    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    //判斷是否加選同名課程
    try {

        let data = await queryAsync("SELECT * FROM course_selection WHERE sid = ? AND cname = ?" , [sid , courseInfo.name]);

        if(data.length !== 0) {

            return res.json({msg: "不可加選與已選課程同名的課程"});
        }
    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    console.log("Update course_selection");
    //新增course_selection
    try {

        await queryAsync("INSERT INTO course_selection (sid , cid , cname) VALUES (? , ? , ?)" , [sid , cid , courseInfo.name]);

    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    console.log("Update course and students");
    //更新course、students
    try {

        await queryAsync("UPDATE course SET current_quantity = ? WHERE cid = ?" , [courseInfo.current_quantity + 1 , cid]);
        await queryAsync("UPDATE students SET credit = ? WHERE sid = ?" , [studentInfo.credit + courseInfo.credit , sid]);

    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }


    console.log("Get timeTable");
    //整理課表
    var timeTable;

    try {

        timeTable = await queryAsync("SELECT * FROM course_timetable WHERE cid = ?" , [cid]);

    } catch (err) {

        console.log(err.message);
        return res.status(500).json({msg: "伺服器內部錯誤"});
    }

    console.log("Insert timeTable");
    //新增課表
    for(let i = 0 ; i < timeTable.length ; i++) {

        try {

            await queryAsync("INSERT INTO student_timetable (sid , cid , timeid , cname) VALUES (? , ? , ? , ?)" , [sid , cid , timeTable[i].timeid , courseInfo.name]);

        } catch (err) {

            console.log(err.message);
            return res.status(500).json({msg: "伺服器內部錯誤"});
        }
    }

    console.log("Final")
    return res.json({msg: "加選成功"});
});

module.exports = router;