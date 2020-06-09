var crypto = require('crypto');

//ERROR顯示以及跳轉
function errorPrint(text, error) {
    console.log(text, error);
    res.redirect('/');
}

// 會員註冊
exports.user_reg = function (req, res) {
    if (!req.cookies.information || req.cookies.information == undefined) {
        full_name="";
        identity="";
    }else{
        full_name=req.cookies.information.name;
        identity=req.cookies.information.identity;
    }
    res.render('user_reg', {
        page_title: "會員註冊",
        full_name:full_name,
        identity:identity
    });
};

// 執行會員註冊
exports.user_save_reg = function (req, res) {
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
            if (err) {
                errorPrint("Error Selecting（routes：/user_save_reg）: %s ", err);
            }else{
                var no = Number(rows[0].No)+1;
                // 第一次新增會撈不到
                if (String(rows[0])=="undefined"){
                    no=1
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
                        errorPrint("Error inserting（routes：/user_reg): %s ", err);
                    }
                });
                connection.query("INSERT INTO User_Name set ? ", user_name_data, function (err, rows) {
                    if (err) {
                        errorPrint("Error inserting（routes：/user_reg): %s ", err);
                    } 
                });
                connection.query("INSERT INTO User_Member set ? ", user_member_data, function (err, rows) {
                    if (err) {
                        errorPrint("Error inserting（routes：/user_reg): %s ", err);
                    } 
                });
                // TODO:改為登陸
                res.redirect('/');
            }
        })
    })
};

// 管理員註冊
exports.admin_reg = function (req, res) {
    if (!req.cookies.information || req.cookies.information == undefined) {
        full_name="";
        identity="";
    }else{
        full_name=req.cookies.information.name;
        identity=req.cookies.information.identity;
    }
    res.render('admin_reg', {
        page_title: "管理員註冊",
        full_name:full_name,
        identity:identity
    });
};

// 執行管理員註冊
exports.admin_save_reg = function (req, res) {
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
        connection.query("SELECT No FROM `Admin` ORDER BY No DESC LIMIT 0 , 1", function (err, rows) {
            if (err) {
                errorPrint("Error Selecting（routes：/reg/admin_save）: %s ", err);
            }else{
                // 第一次新增會撈不到
                if (String(rows[0])=="undefined"){
                    no=1
                }else{
                    var no = Number(rows[0].No)+1;
                }
                var admin_data = {
                    Email: email,
                    Password: password
                };
                var admin_name_data = {
                    Admin_No: no,
                    Name: name
                };
                var admin_member_data = {
                    Admin_No: no,
                    Birth: birth,
                    Phone: phone,
                    Sex: sex
                };
                connection.query("INSERT INTO Admin set ? ", admin_data, function (err, rows) {
                    if (err) {
                        errorPrint("Error inserting（routes：/reg/admin): %s ", err);
                    }
                });
                connection.query("INSERT INTO Admin_Name set ? ", admin_name_data, function (err, rows) {
                    if (err) {
                        errorPrint("Error inserting（routes：/reg/admin): %s ", err);
                    } 
                });
                connection.query("INSERT INTO Admin_Member set ? ", admin_member_data, function (err, rows) {
                    if (err) {
                        errorPrint("Error inserting（routes：/reg/admin): %s ", err);
                    } 
                });
                res.redirect('/admin/login');
            }
        })
    })
};

//註冊Email有無重複判斷，顯示錯誤訊息
exports.errorMsg = function (req, res) {
    var email = req.body.email;
    var no = req.body.no;
    var status = req.body.status;
    req.getConnection(function (err, connection) {
        if(status=="reg"){
            //依據email撈出User用來檢查是否有重複註冊
            connection.query("SELECT * FROM User WHERE email =?", [email], function (err, rows) {
                if (err) {
                    errorPrint("Error Selecting（routes：/reg/error_msg）: %s ", err);
                } 
                if (rows[0] != undefined) {
                    res.send({ msg: "此帳號已存在，請直接登入。" });
                }
            })
        }else{
            //依據email撈出User用來檢查是否有重複註冊
            connection.query("SELECT * FROM User WHERE email =? AND No!=?", [email,no], function (err, rows) {
                if (err) {
                    errorPrint("Error Selecting（routes：/reg/error_msg）: %s ", err);
                } 
                if (rows[0] != undefined) {
                    res.send({ msg: "此帳號已存在，請直接登入。" });
                }
            })
        }
        
    })
}