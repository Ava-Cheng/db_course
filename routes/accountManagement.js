var crypto = require('crypto');

//註冊
exports.user_reg = function (req, res) {
    res.render('user_reg', {});
};

//執行註冊
exports.save_reg = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var md5 = crypto.createHash('md5');
    var name = input.name;
    var birth = input.birth;
    var phone = input.phone;
    var sex = input.sex;
    var email = input.email;
    var password = input.password;
    password = md5.update(password).digest('hex');
    req.getConnection(function (err, connection) {
        // 撈出最後一筆編號
        connection.query("SELECT No FROM `User` ORDER BY No DESC LIMIT 0 , 1", function (err, rows) {
            var no = Number(rows[0].No)+1;
            // 第一次新增會撈不到
            if (String(rows[0])=="undefined"){
                no=1
            }
            if (err) {
                console.log("Error Selecting（routes：/save_reg）: %s ", err);
            } 
            var user_data = {
                Email: email,
                Password: password
            };
            var user_name_data = {
                User_No: no,
                Name: name
            };
            var user_member_data = {
                User_No: no,
                Birth: birth,
                Phone: phone,
                Sex: sex
            };
            connection.query("INSERT INTO User set ? ", user_data, function (err, rows) {
                if (err) {
                    console.log("Error inserting（routes：/user_reg): %s ", err);
                    res.redirect('/user_reg');
                }
            });
            connection.query("INSERT INTO User_Name set ? ", user_name_data, function (err, rows) {
                if (err) {
                    console.log("Error inserting（routes：/user_reg): %s ", err);
                    res.redirect('/user_reg');
                } 
            });
            connection.query("INSERT INTO User_Member set ? ", user_member_data, function (err, rows) {
                if (err) {
                    console.log("Error inserting（routes：/user_reg): %s ", err);
                    res.redirect('/user_reg');
                } 
            });
            // TODO:改為登陸
            res.redirect('/');
        })
    })
};

//註冊Email有無重複判斷，顯示錯誤訊息
exports.accountManagement_errorMsg = function (req, res) {
    var email = req.body.email;
    req.getConnection(function (err, connection) {
        //依據email撈出User用來檢查是否有重複註冊
        connection.query("SELECT * FROM User WHERE email =?", [email], function (err, rows) {
            if (err) {
                console.log("Error Selecting（routes：/accountManagement/errorMsg）: %s ", err);
            } 
            if (rows[0] != undefined) {
                res.send({ msg: "此帳號已存在，請直接登入。" });
            }
        })
    })
}