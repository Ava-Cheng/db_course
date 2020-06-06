var crypto = require('crypto');

// 設置cookie
function setCookie(res,name,admin_no) {
    // httpOnly 確保只透過HTTP(S) 傳送Cookie，而不透過用戶端JavaScript 傳送
    return res.cookie("admin", {"name":name,"no":admin_no},  {maxAge: 1000*60*60*60 , httpOnly: true});//登陸成功後將使用者和密碼寫入Cookie，maxAge為cookie過期時間;
}

//ERROR顯示以及跳轉
function errorPrint(text, error) {
    console.log(text, error);
    res.redirect('/');
}

// 管理員登入
exports.admin_login = function (req, res) {
    // 如果已經登入則直接跳轉
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        res.render('admin_login', {
            page_title: "管理員登入",
            admin_name:""
        });
    }else{
        res.redirect('/admin/member_tickets');
    }
    
}

// 執行管理員登入
exports.admin_do_login = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var md5 = crypto.createHash('md5');
    var inputPassword = input.password;
    var inputEmail = input.email;
    inputPassword = md5.update(inputPassword).digest('hex');
    req.getConnection(function (err, connection) {
        // 依據email撈出管理員帳號相對應資料
        connection.query("SELECT * FROM Admin WHERE Email =?", [inputEmail], function (err, rows) {
            if (err) {
                console.log("Error Selecting（routes：/admin/admin_do_login): %s ", err);
            } else if (rows == "") {
                // 查無使用者，跳回登入頁面
                res.redirect('/admin/login');
            } else {
                var admin_no = rows[0].No;
                var password = rows[0].Password;
                if (password != inputPassword) {
                    // 密碼輸入錯誤
                    res.redirect('/admin/login');
                } else {
                    // 依據email撈出管理員姓名相對應資料
                    connection.query("SELECT * FROM Admin_Name WHERE Admin_No =?", [admin_no], function (err, rows) {
                        var name=rows[0].Name;
                        setCookie(res,name,admin_no);
                        res.redirect('/admin/member_tickets');
                    })
                }
            }
        })
    })
    
}

// 會員門票檢視
exports.member_tickets = function (req, res) {
    //如果cookies不存在，直接輸入網址，則導回登入頁面
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        res.redirect('/admin/login');
    }else{
        res.render('member_tickets', {
            page_title: "會員門票檢視",
            admin_name:req.cookies.admin.name
        });
    }
}

// 管理員帳號資料
exports.admin_account_view = function (req, res) {
    //如果cookies不存在，直接輸入網址，則導回登入頁面
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        res.redirect('/admin/login');
    }else{
        req.getConnection(function (err, connection) {
            // 依據No去找出相關管理員資料
            // TODO:No要依據登入去做改變
            no=req.cookies.admin.no;
            connection.query('SELECT * FROM Admin Inner join Admin_Member on Admin_Member.Admin_No ' +
                'Inner join Admin_Name on Admin_Name.Admin_No ' +
                'WHERE Admin.No = ? AND Admin_Member.Admin_No = ? AND Admin_Name.Admin_No = ?', [1,1,1], function (err, rows) {
                    // 生日格式轉換為YYYY/MM/DD才可以帶入input date
                    var rowsToJson = (JSON.parse((JSON.stringify(rows)).slice(1, -1)));
                    var Birth = (rowsToJson.Birth).slice(0, -14);
                    if (err) {
                        errorPrint("Error Selecting (routes：/admin/account_view）: %s ", err);
                    } else {
                        res.render('admin_account_view', {
                            page_title: "管理員帳號管理",
                            data: rows,
                            birth: Birth,
                            admin_name:req.cookies.admin.name
                        });
                    }
                }
            )
        })
    }
};

// 執行管理員帳號資料編輯
exports.admin_account_view_save = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    // TODO:no之後要自動帶入
    var no=req.cookies.admin.no;
    // 不一定會更改密碼
    if(input.password==""){
        var admin_data = {
            Email: input.email
        };
    }else{
        var md5 = crypto.createHash('md5');
        var password = input.password;
        password = md5.update(password).digest('hex');
        var admin_data = {
            Email: input.email,
            Password: password
        };
    }
    var admin_name_data = {
        Name: input.name
    };
    var admin_member_data = {
        Birth: input.birth,
        Phone: input.phone
    };
    req.getConnection(function (err, connection) {
        connection.query("UPDATE Admin set ? WHERE No = ? ", [admin_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/admin/account_view_save）: %s ", err);
            }
        });
        connection.query("UPDATE Admin_Member set ? WHERE Admin_No = ? ", [admin_member_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/admin/account_view_save）: %s ", err);
            }
        });
        connection.query("UPDATE Admin_Name set ? WHERE Admin_No = ? ", [admin_name_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/admin/account_view_save）: %s ", err);
            }
        });
        res.render('member_tickets', {
            page_title: "會員門票檢視",
            admin_name:req.cookies.admin.name
        });
    })
}

//判斷登入資訊是否正確，顯示錯誤訊息
exports.errorMsg = function (req, res) {
    var md5 = crypto.createHash('md5');
    var email = String(req.body.email);
    var inputPassword = req.body.password;
    inputPassword = md5.update(inputPassword).digest('hex');
    req.getConnection(function (err, connection) {
        // 依據email撈出管理員帳號相對應資料
        connection.query("SELECT * FROM Admin WHERE Email = ?", [email], function (err, rows) {
            if (err) {
                console.log("Error Selecting（routes：/admin/error_msg）: %s ", err);
            } 
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
        })
    })
}