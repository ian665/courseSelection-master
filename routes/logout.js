var express = require('express');
var router = express.Router();

router.get('/' , (req , res) => {

    req.session.destroy();
    return res.json({msg: "登出成功"});
});

module.exports = router;