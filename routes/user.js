var crypto = require('crypto');

// 設置cookie
function setCookie_user(res,name,user_no) {
    // httpOnly 確保只透過HTTP(S) 傳送Cookie，而不透過用戶端JavaScript 傳送
    return res.cookie("information", {"name":name,"no":user_no,"identity":"user"},  {maxAge: 1000*60*60*60 , httpOnly: true});//登陸成功後將使用者和密碼寫入Cookie，maxAge為cookie過期時間;
}

// 會員登入
exports.user_login = function (req, res) {
    // 如果已經登入則直接跳轉
    if (!req.cookies.information || req.cookies.information == undefined) {
        res.render('user_login', {
            page_title: "會員登入",
            full_name:"",
            identity:""
        });
    }else{
        res.redirect('/user/order');
    }
}

// 執行會員登入
exports.user_do_login = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var md5 = crypto.createHash('md5');
    var inputPassword = input.password;
    var inputEmail = input.email;
    inputPassword = md5.update(inputPassword).digest('hex');
    req.getConnection(function (err, connection) {
        // 依據email撈出管理員帳號相對應資料
        connection.query("SELECT * FROM User WHERE Email =?", [inputEmail], function (err, rows) {
            if (err) {
                errorPrint("Error Selecting（routes：/user/user_do_login): %s ", err);
            } else if (rows == "") {
                // 查無使用者，跳回登入頁面
                res.redirect('/user/login');
            } else {
                var user_no = rows[0].No;
                var password = rows[0].Password;
                if (password != inputPassword) {
                    // 密碼輸入錯誤
                    res.redirect('/user/login');
                } else {
                    // 依據email撈出管理員姓名相對應資料
                    connection.query("SELECT * FROM User_Name WHERE User_No =?", [user_no], function (err, rows) {
                        if (err) {
                            errorPrint("Error Selecting（routes：/user/user_do_login): %s ", err);
                        } 
                        var name=rows[0].Name;
                        setCookie_user(res,name,user_no);
                        res.redirect('/user/order');
                    })
                }
            }
        })
    })
}

// 判斷登入資訊是否正確，顯示錯誤訊息
exports.errorMsg = function (req, res) {
    var md5 = crypto.createHash('md5');
    var email = String(req.body.email);
    var inputPassword = req.body.password;
    inputPassword = md5.update(inputPassword).digest('hex');
    req.getConnection(function (err, connection) {
        // 依據email撈出管理員帳號相對應資料
        connection.query("SELECT * FROM User WHERE Email = ?", [email], function (err, rows) {
            if (err) {
                errorPrint("Error Selecting（routes：/user/error_msg）: %s ", err);
            } else{
                if(inputPassword==undefined){
                    if (rows[0] != undefined) {
                        res.send({ msg: "此帳號已存在，請直接登入。" });
                    }
                }else{
                    if (rows == "") {
                        //查無使用者
                        res.send({ msg: "此帳號不存在，請前往註冊。" });
                    } else {
                        var password = rows[0].Password;
                        if (password != inputPassword) {
                            //密碼輸入錯誤
                            res.send({ msg: "密碼輸入錯誤，請再次確認。" });
                        } 
                    }
                }
            }
        })
    })
}

// 會員登出
exports.user_logout = function (req, res) {
    //刪除cookie
    res.clearCookie('information');
    res.redirect('/user/login');
};

// 會員目前訂單
exports.order = function (req, res) {
    // 如果已經登入則直接跳轉
    if (!req.cookies.information || req.cookies.information == undefined) {
        res.redirect('/user/login');
    }else{
        res.render('user_order', {
            page_title: "目前訂單",
            full_name:req.cookies.information.name,
            identity:req.cookies.information.identity
        });
    }
}

// 會員帳號資料
exports.user_account_view = function (req, res) {
    //如果cookies不存在，直接輸入網址，則導回登入頁面
    if (!req.cookies.information || req.cookies.information == undefined) {
        res.redirect('/user/login');
    }else{
        req.getConnection(function (err, connection) {
            // 依據No去找出相關管理員資料
            no=req.cookies.information.no;
            connection.query('SELECT * FROM User Inner join User_Member on User_Member.User_No ' +
                'Inner join User_Name on User_Name.User_No ' +
                'WHERE User.No = ? AND User_Member.User_No = ? AND User_Name.User_No = ?', [no,no,no], function (err, rows) {
                    // 生日格式轉換為YYYY/MM/DD才可以帶入input date
                    var rowsToJson = (JSON.parse((JSON.stringify(rows)).slice(1, -1)));
                    var Birth = (rowsToJson.Birth).slice(0, -14);
                    if (err) {
                        errorPrint("Error Selecting (routes：/user/account_view）: %s ", err);
                    } else {
                        res.render('user_account_view', {
                            page_title: "帳號管理",
                            data: rows,
                            birth: Birth,
                            full_name:req.cookies.information.name,
                            identity:req.cookies.information.identity
                        });
                    }
                }
            )
        })
    }
};

// 執行會員帳號資料編輯
exports.user_account_view_save = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var no=req.cookies.information.no;
    // 不一定會更改密碼
    if(input.password==""){
        var user_data = {
            Email: input.email
        };
    }else{
        var md5 = crypto.createHash('md5');
        var password = input.password;
        password = md5.update(password).digest('hex');
        var user_data = {
            Email: input.email,
            Password: password
        };
    }
    var user_name_data = {
        Name: input.name
    };
    var user_member_data = {
        Birth: input.birth,
        Phone: input.phone
    };
    req.getConnection(function (err, connection) {
        connection.query("UPDATE User set ? WHERE No = ? ", [user_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/user/account_view_save）: %s ", err);
            }
        });
        connection.query("UPDATE User_Member set ? WHERE User_No = ? ", [user_member_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/user/account_view_save）: %s ", err);
            }
        });
        connection.query("UPDATE User_Name set ? WHERE User_No = ? ", [user_name_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/user/account_view_save）: %s ", err);
            }
        });
        res.redirect('/user/order');
    })
}
