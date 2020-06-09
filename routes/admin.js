var crypto = require('crypto');
var uuid = require('uuid');

// 設置cookie
function setCookie(res,name,admin_no) {
    // httpOnly 確保只透過HTTP(S) 傳送Cookie，而不透過用戶端JavaScript 傳送
    return res.cookie("admin", {"name":name,"no":admin_no},  {maxAge: 1000*60*60*60 , httpOnly: true});//登陸成功後將使用者和密碼寫入Cookie，maxAge為cookie過期時間;
}

// ERROR顯示以及跳轉
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
                errorPrint("Error Selecting（routes：/admin/admin_do_login): %s ", err);
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
                        if (err) {
                            errorPrint("Error Selecting（routes：/admin/admin_do_login): %s ", err);
                        } 
                        var name=rows[0].Name;
                        setCookie(res,name,admin_no);
                        res.redirect('/admin/member_tickets');
                    })
                }
            }
        })
    })
    
}

// 管理員登出
exports.admin_logout = function (req, res) {
    //刪除cookie
    res.clearCookie('admin');
    res.redirect('/admin/login');
};

// 判斷登入資訊是否正確，顯示錯誤訊息
exports.errorMsg = function (req, res) {
    var md5 = crypto.createHash('md5');
    var email = String(req.body.email);
    var inputPassword = req.body.password;
    inputPassword = md5.update(inputPassword).digest('hex');
    req.getConnection(function (err, connection) {
        // 依據email撈出管理員帳號相對應資料
        connection.query("SELECT * FROM Admin WHERE Email = ?", [email], function (err, rows) {
            if (err) {
                errorPrint("Error Selecting（routes：/admin/error_msg）: %s ", err);
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
                'WHERE Admin.No = ? AND Admin_Member.Admin_No = ? AND Admin_Name.Admin_No = ?', [no,no,no], function (err, rows) {
                    // 生日格式轉換為YYYY/MM/DD才可以帶入input date
                    var rowsToJson = (JSON.parse((JSON.stringify(rows)).slice(1, -1)));
                    var Birth = (rowsToJson.Birth).slice(0, -14);
                    if (err) {
                        errorPrint("Error Selecting (routes：/admin/account_view）: %s ", err);
                    } else {
                        res.render('admin_account_view', {
                            page_title: "帳號管理",
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
        res.redirect('/admin/member_tickets');
    })
}

// 會員門票查看
exports.member_tickets = function (req, res) {
    //如果cookies不存在，直接輸入網址，則導回登入頁面
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        res.redirect('/admin/login');
    }else{
        res.render('member_tickets', {
            page_title: "會員門票查看",
            admin_name:req.cookies.admin.name
        });
    }
}

// 會員資料查看
exports.member_data = function (req, res) {
    //如果cookies不存在，直接輸入網址，則導回登入頁面
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        res.redirect('/admin/login');
    }else{
        req.getConnection(function (err, connection) {
            // 撈出會員相關資料
            connection.query('SELECT * FROM User User INNER JOIN ( SELECT * FROM User_Name) User_Name ON User.No = User_Name.User_No ' +
                'INNER JOIN ( SELECT * FROM User_Member) User_Member ON User.No = User_Member.User_No ', function (err, rows) {
                    if (err) {
                        errorPrint("Error Selecting（routes：/admin/member_data): %s ", err);
                    } else{
                        res.render('member_data', {
                            page_title: "會員資料查看",
                            admin_name:req.cookies.admin.name,
                            data: rows
                        })
                    }
            });
        })
    }
}

// 設施查看
exports.facility_management = function (req, res) {
    //如果cookies不存在，直接輸入網址，則導回登入頁面
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        res.redirect('/admin/login');
    }else{
        req.getConnection(function (err, connection) {
            // 撈出設施相關資料
            connection.query('SELECT * FROM Facility Facility INNER JOIN ( SELECT * FROM Facility_Check) Facility_Check ON Facility.No=Facility_Check.No ' +
                'WHERE Facility_Check.Exist = ?', [1], function (err, rows) {
                    if (err) {
                        errorPrint("Error Selecting（routes：/admin/facility_management): %s ", err);
                    } else{
                        res.render('facility_management', {
                            page_title: "設施管理",
                            admin_name:req.cookies.admin.name,
                            data: rows
                        })
                    }
            });
        })
    }
}

// 設施新增
exports.facility_add = function (req, res) {
    //如果cookies不存在，直接輸入網址，則導回登入頁面
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        res.redirect('/admin/login');
    }else{
        global.filename ="";
        res.render('facility_add', {
            page_title: "設施新增",
            admin_name:req.cookies.admin.name
        })
    }
}

// 上傳圖片
exports.upload_images = function (req, res) {
    // 檔案名稱區要跨域使用
    var formidable = require('formidable');
    var fs = require('fs');
    // 創建一個新的傳入表單。
    var form = new formidable.IncomingForm()
    // 為輸入的表單字段設置編碼。
    form.encoding = 'utf-8';
    // 設置用於放置文件上傳的目錄。
    form.uploadDir = 'public/images/facility/';
    // 如果您希望寫入form.uploaddir的文件包含原始文件的擴展名，請設置
    form.keepExtensions = true;//保留後綴
    // 限制所有字段（文件除外）可以以字節為單位分配的內存量。如果超過此值，'error'則發出事件。默認大小為20MB。
    form.maxFieldsSize = 2 * 1024 * 1024;
    //處理圖片
    form.parse(req, function (err, fields, files){
        // 上傳格式判斷
        file_type=(files.facility_images.name).split(".")[1];
        // 存入
        var path = 'public/images/facility/'
        global.filename = uuid.v4()+'.'+file_type;
        fs.renameSync(files.facility_images.path, path+filename);
    })
}

// 執行設施新增
exports.facility_add_save = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var name = input.facility_name;
    var available_PER = input.available_PER;
    var info = input.info;
    req.getConnection(function (err, connection) {
        // 撈出最後一筆編號
        connection.query("SELECT No FROM `Facility` ORDER BY No DESC LIMIT 0 , 1", function (err, rows) {
            if (err) {
                errorPrint("Error Selecting（routes：/admin/facility_management/add_save）: %s ", err);
            }else{
                // 第一次新增會撈不到
                if (String(rows[0])=="undefined"){
                    no=1
                }else{
                    var no = Number(rows[0].No)+1;
                }
                var facility_data={
                    Name: name,
                    Info: info,
                    Available_PER: available_PER,
                    Images_Name: global.filename
                };
                var facility_check_data={
                    No:no,
                    Exist:1
                }
                connection.query("INSERT INTO Facility set ? ", facility_data, function (err, rows) {
                    if (err) {
                        errorPrint("Error inserting（routes：/admin/facility_management/add_save): %s ", err);
                    }
                });
                connection.query("INSERT INTO Facility_Check set ? ", facility_check_data, function (err, rows) {
                    if (err) {
                        errorPrint("Error inserting（routes：/admin/facility_management/add_save): %s ", err);
                    }
                });
                res.redirect('/admin/facility_management');
            }
        })
    })
}

// 設施修改
exports.facility_management_edit= function (req, res) {
    var no=req.params.no;
    //如果cookies不存在，直接輸入網址，則導回登入頁面
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        res.redirect('/admin/login');
    }else{
        global.filename ="";
        req.getConnection(function (err, connection) {
            // 撈出設施相關資料
            connection.query('SELECT * FROM Facility INNER JOIN Facility_Check ON Facility.No=Facility_Check.No ' +
                'WHERE Facility.No = ?', [no], function (err, rows) {
                    if (err) {
                        errorPrint("Error Selecting（routes：/admin/facility_management): %s ", err);
                    } else{
                        res.render('facility_edit', {
                            page_title: "設施編輯",
                            admin_name:req.cookies.admin.name,
                            data: rows
                        })
                    }
            });
        })
    }
}

// 執行設施修改
exports.facility_management_edit_save= function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var name = input.facility_name;
    var available_PER = input.available_PER;
    var info = input.info;
    var no = input.no;
    if(global.filename==''){
        var facility_data={
            Name: name,
            Info: info,
            Available_PER: available_PER
        };
    }else{
        var facility_data={
            Name: name,
            Info: info,
            Available_PER: available_PER,
            Images_Name: global.filename
        };
    }
    req.getConnection(function (err, connection) {
        connection.query("UPDATE Facility SET ? WHERE No = ? ", [facility_data,no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/admin/facility_management/edit_save）: %s ", err);
            }else{
                res.redirect('/admin/facility_management');
            }
        });
    })
}

// 執行設施刪除
exports.facility_management_delete_save= function (req, res) {
    var no=req.params.no;
    var facility_check_data={
        Exist: 0
    };
    req.getConnection(function (err, connection) {
        connection.query("UPDATE Facility_Check SET ? WHERE No = ? ", [facility_check_data,no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/admin/facility_management/del/:no）: %s ", err);
            }else{
                res.redirect('/admin/facility_management');
            }
        });
    })
}

// 設施錯誤訊息
exports.facility_errorMsg = function (req, res) {
    var name = req.body.facility_name;
    var status = req.body.status;
    var no = req.body.no;
    req.getConnection(function (err, connection) {
        if(status=="add"){
            //依據Name判斷是否有重複新增設施
            connection.query("SELECT * FROM Facility WHERE Name =?", [name], function (err, rows) {
                if (err) {
                    errorPrint("Error Selecting（routes：admin/facility_management/error_msg）: %s ", err);
                } 
                if (rows[0] != undefined) {
                    res.send({ msg: "此設施已存在。" });
                }
            })
        }else{
            //依據Name判斷是否有重複新增設施，排除自己
            connection.query("SELECT * FROM Facility WHERE Name =? AND No!=?", [name,no], function (err, rows) {
                if (err) {
                    errorPrint("Error Selecting（routes：admin/facility_management/error_msg）: %s ", err);
                } 
                if (rows[0] != undefined) {
                    res.send({ msg: "此設施已存在。" });
                }
            })
        }
    })
}