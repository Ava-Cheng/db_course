var crypto = require('crypto');
var moment = require('moment');

// 設置cookie
function setCookie_user(res,name,user_no) {
    // httpOnly 確保只透過HTTP(S) 傳送Cookie，而不透過用戶端JavaScript 傳送
    return res.cookie("information", {"name":name,"no":user_no,"identity":"user"},  {maxAge: 1000*60*60*60 , httpOnly: true});//登陸成功後將使用者和密碼寫入Cookie，maxAge為cookie過期時間;
}

// ERROR顯示以及跳轉
function errorPrint(text, error,res) {
    console.log(text, error);
    res.redirect('/');
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
                errorPrint("Error Selecting（routes：/user/user_do_login): %s ", err,res);
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
                            errorPrint("Error Selecting（routes：/user/user_do_login): %s ", err,res);
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
                errorPrint("Error Selecting（routes：/user/error_msg）: %s ", err,res);
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
                    var Birth = moment((JSON.parse(JSON.stringify(rows))[0].Birth).slice(0, -14)).add(1, 'days').format('YYYY-MM-DD');
                    if (err) {
                        errorPrint("Error Selecting (routes：/user/account_view）: %s ", err,res);
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
                errorPrint("Error Updating（routes：/user/account_view_save）: %s ", err,res);
            }
        });
        connection.query("UPDATE User_Member set ? WHERE User_No = ? ", [user_member_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/user/account_view_save）: %s ", err,res);
            }
        });
        connection.query("UPDATE User_Name set ? WHERE User_No = ? ", [user_name_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/user/account_view_save）: %s ", err,res);
            }
        });
        res.redirect('/user/order');
    })
}

// 預訂門票
exports.ticket = function (req, res) {
    // 如果已經登入則直接跳轉
    if (!req.cookies.information || req.cookies.information == undefined) {
        res.redirect('/user/login');
    }else{
        req.getConnection(function (err, connection) {
            // 依據No去找出相關管理員資料
            var no=req.cookies.information.no;
            connection.query('SELECT * FROM User Inner join User_Member on User_Member.User_No ' +
                'Inner join User_Name on User_Name.User_No ' +
                'WHERE User.No = ? AND User_Member.User_No = ? AND User_Name.User_No = ?', [no,no,no], function (err, rows) {
                res.render('ticket', {
                    page_title: "預訂門票",
                    full_name:req.cookies.information.name,
                    identity:req.cookies.information.identity,
                    data:rows,
                    User_No:no
                });
            });
        });
    }
}

// 門票人數確認
exports.ticket_num_check = function (req, res) {
    var book_date = req.body.book_date;
    var user_no = req.body.user_no;
    req.getConnection(function (err, connection) {
        // 計算每個日期加總
        connection.query("SELECT Date,count(Date) as Count FROM Ticket WHERE User_No=? GROUP BY Date",[user_no], function (err, rows) {
            if (err) {
                errorPrint("Error Selecting（routes：/user/ticket_save）: %s ", err,res);
            }else{
                var arrary_date=[];
                var arrary_count=[];
                var arrary_num=JSON.parse(JSON.stringify(rows)).length;
                for(var i=0;i<arrary_num;i++){
                    arrary_date.push(moment((JSON.parse(JSON.stringify(rows))[i].Date).slice(0, -14)).add(1, 'days').format('YYYY-MM-DD'));
                    arrary_count.push(JSON.parse(JSON.stringify(rows))[i].Count);
                }
                for(var i=0;i<arrary_num;i++){
                    connection.query('SELECT Date FROM Ticket WHERE No = ? AND  Date = ?', [user_no,book_date], function (err, rows) {
                        if(rows!=''){
                            res.send({ msg: "您已經預訂過囉。"});
                        }else if(book_date==arrary_date[5] &&  arrary_count[5]==500){// 500為自訂的入園人數
                            res.send({ msg: "當天預定人數已經額滿，請擇日選擇。"});
                        }
                    })
                    
                }
            }
        })
    })
}

// 執行預訂門票
exports.ticket_save = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var user_no=req.cookies.information.no;
    req.getConnection(function (err, connection) {
        // 撈出最後一筆編號
        connection.query("SELECT No FROM `Ticket` ORDER BY No DESC LIMIT 0 , 1", function (err, rows) {
            if (err) {
                errorPrint("Error Selecting（routes：/user/ticket_save）: %s ", err,res);
            }else{
                // 第一次新增會撈不到
                if (String(rows[0])=="undefined"){
                    no=1
                }else{
                    var no = Number(rows[0].No)+1;
                }
                var ticket_data = {
                    User_No: user_no,
                    Date:input.book_date
                }
                var ticket_check_data = {
                    No:no,
                    Exist: 1
                }
                connection.query("INSERT INTO Ticket set ?", [ticket_data], function (err, row) {
                    if (err) {
                        errorPrint("Error Updating（routes：/user/ticket_save）: %s ", err,res);
                    }
                });
                connection.query("INSERT INTO Ticket_Check set ?  ", [ticket_check_data], function (err, row) {
                    if (err) {
                        errorPrint("Error Updating（routes：/user/ticket_save）: %s ", err,res);
                    }
                });
                res.redirect('/user/facility_appt');
            }
        })
    })
}

// 設施預約
exports.facility_appt= function (req, res) {
    // 如果已經登入則直接跳轉
    if (!req.cookies.information || req.cookies.information == undefined) {
        res.redirect('/user/login');
    }else{
        var user_no=req.cookies.information.no;
        req.getConnection(function (err, connection) {
            connection.query("SELECT * FROM Ticket Ticket INNER JOIN ( SELECT * FROM Ticket_Check) Ticket_Check ON Ticket_Check.No=Ticket.No WHERE User_No=? AND Ticket_Check.Exist=? ORDER BY Date DESC",[user_no,1], function (err, rows) {
                connection.query('SELECT * FROM Facility Facility INNER JOIN ( SELECT * FROM Facility_Check) Facility_Check ON Facility.No=Facility_Check.No ' +
                'WHERE Facility_Check.Exist = ?', [1], function (err, rows2) {
                    // 門票日期處理
                    var arrary_date=[];
                    var arrary_num=JSON.parse(JSON.stringify(rows)).length;
                    for(var i=0;i<arrary_num;i++){
                        arrary_date.push(moment((JSON.parse(JSON.stringify(rows))[i].Date).slice(0, -14)).add(1, 'days').format('YYYY-MM-DD'));
                    }
                    res.render('facility_appt', {
                        page_title: "設施預約",
                        full_name:req.cookies.information.name,
                        identity:req.cookies.information.identity,
                        data:arrary_date,
                        data2:rows2
                    });
                })
            })
        })
    }
}

// 判斷預約是否重複或已達預約上限
exports.facility_appt_errorMsg = function (req, res) {
    var date=req.body.date;
    var time=req.body.time;
    var status=req.body.status;
    var user_no=req.cookies.information.no;
    req.getConnection(function (err, connection) {
        if(status=="add"){
            var facility_no=req.body.facility_no;
            connection.query("SELECT * FROM Facility_Appt WHERE Facility_No = ? AND User_No = ? AND Date = ? AND Time = ?", [facility_no,user_no,date,time], function (err, rows) {
                if (err) {
                    errorPrint("Error Selecting（routes：/user/facility_appt/error_msg）: %s ", err,res);
                } else{
                    if(rows!=''){
                        res.send({ msg: "您已重複預約。" });
                    }else{
                        connection.query("SELECT Available_PER FROM Facility WHERE No = ? ", [facility_no], function (err, rows) {
                            if (err) {
                                errorPrint("Error Selecting（routes：/user/facility_appt/error_msg）: %s ", err,res);
                            }else{
                                var available_PER=JSON.parse(JSON.stringify(rows))[0].Available_PER;
                                connection.query("SELECT count(Date) as Count FROM Facility_Appt WHERE Facility_No=? ORDER BY Date", [facility_no], function (err, rows) {
                                    if (err) {
                                        errorPrint("Error Selecting（routes：/admin/member_tickets）: %s ", err,res);
                                    }else{
                                        if(rows[0].Count==available_PER){
                                            res.send({ msg: "十分抱歉，預約人數已達上限，請更改預約時段/設施。" });
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }else{
            var facility_appt_no=req.body.facility_appt_no;
            // 利用預約編號查詢設施編號
            connection.query("SELECT Facility_No FROM Facility_Appt WHERE No = ? ", [facility_appt_no], function (err, rows) {
                if (err) {
                    errorPrint("Error Selecting（routes：/user/facility_appt/error_msg）: %s ", err,res);
                }else{
                    var facility_no=rows[0].Facility_No;
                    connection.query("SELECT Available_PER FROM Facility WHERE No = ? ", [facility_no], function (err, rows) {
                        if (err) {
                            errorPrint("Error Selecting（routes：/user/facility_appt/error_msg）: %s ", err,res);
                        }else{
                            var available_PER=rows[0].Available_PER;
                            connection.query("SELECT count(Date) as Count FROM Facility_Appt WHERE Facility_No=? ORDER BY Date", [facility_no], function (err, rows) {
                                if (err) {
                                    errorPrint("Error Selecting（routes：/admin/member_tickets）: %s ", err,res);
                                }else{
                                    if(rows[0].Count==available_PER){
                                        res.send({ msg: "十分抱歉，預約人數已達上限，請更改預約時段/設施。" });
                                    }
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

// 執行設施預約
exports.facility_appt_save = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var facility_no=input.facility_no;
    var date=input.facility_appt_date;
    var time=input.ticket_time;
    var user_no=req.cookies.information.no;
    req.getConnection(function (err, connection) {
        // 撈出最後一筆編號
        connection.query("SELECT No FROM `Facility_Appt` ORDER BY No DESC LIMIT 0 , 1", function (err, rows) {
            if (err) {
                errorPrint("Error Selecting（routes：/user/facility_appt_save）: %s ", err,res);
            }else{
                // 第一次新增會撈不到
                if (String(rows[0])=="undefined"){
                    no=1
                }else{
                    var no = Number(rows[0].No)+1;
                }
                var facility_appt_data = {
                    Facility_No: facility_no,
                    User_No:user_no,
                    Date:date,
                    Time:time
                }
                var facility_appt_check_data = {
                    No:no,
                    Exist: 1
                }
                connection.query("INSERT INTO Facility_Appt set ?", [facility_appt_data], function (err, row) {
                    if (err) {
                        errorPrint("Error Updating（routes：/user/facility_appt_save）: %s ", err,res);
                    }
                });
                connection.query("INSERT INTO Facility_Appt_Check set ?  ", [facility_appt_check_data], function (err, row) {
                    if (err) {
                        errorPrint("Error Updating（routes：/user/facility_appt_save）: %s ", err,res);
                    }
                });
                res.redirect('/user/order');
            }
        })
    })
}

// 會員目前訂單-門票
exports.order = function (req, res) {
    // 如果已經登入則直接跳轉
    if (!req.cookies.information || req.cookies.information == undefined) {
        res.redirect('/user/login');
    }else{
        var user_no=req.cookies.information.no;
        req.getConnection(function (err, connection) {
            connection.query("SELECT * FROM Ticket Ticket INNER JOIN ( SELECT * FROM Ticket_Check) Ticket_Check ON Ticket.No=Ticket_Check.No WHERE Ticket_Check.Exist = ? AND Ticket.User_No= ? ",[1,user_no], function (err, rows) {
                // 門票日期處理
                var arrary_date=[];
                var arrary_num=JSON.parse(JSON.stringify(rows)).length;
                for(var i=0;i<arrary_num;i++){
                    arrary_date.push(moment((JSON.parse(JSON.stringify(rows))[i].Date).slice(0, -14)).add(1, 'days').format('YYYY-MM-DD'));
                }
                res.render('user_order', {
                    page_title: "目前訂單-門票",
                    full_name:req.cookies.information.name,
                    identity:req.cookies.information.identity,
                    data:rows,
                    data2:arrary_date
                });
            })
        })
    }
}

// 會員目前訂單-設施
exports.order_facility = function (req, res) {
    // 如果已經登入則直接跳轉
    if (!req.cookies.information || req.cookies.information == undefined) {
        res.redirect('/user/login');
    }else{
        var user_no=req.cookies.information.no;
        var date=moment(req.params.date).format('YYYY-MM-DD');
        req.getConnection(function (err, connection) {
            connection.query('SELECT Facility_Appt.No,Facility_Appt.Facility_No,Facility_Appt.User_No,Facility_Appt.Date,Facility_Appt.Time,Facility.Name FROM Facility_Appt Facility_Appt INNER JOIN ( SELECT * FROM Facility_Appt_Check) Facility_Appt_Check ON Facility_Appt.No=Facility_Appt_Check.No ' +
                'INNER JOIN ( SELECT * FROM Facility) Facility ON Facility_Appt.Facility_No=Facility.No ' +
                'WHERE Facility_Appt_Check.Exist = ? AND Facility_Appt.User_No= ? AND Facility_Appt.Date=? ORDER BY Date,Time,Name DESC',[1,user_no,date], function (err, rows) {
                // 日期處理
                var arrary_date=[];
                var arrary_num=JSON.parse(JSON.stringify(rows)).length;
                for(var i=0;i<arrary_num;i++){
                    arrary_date.push(moment((JSON.parse(JSON.stringify(rows))[i].Date).slice(0, -14)).add(1, 'days').format('YYYY-MM-DD'));
                }
                res.render('user_order_facility', {
                    page_title: "目前訂單-設施",
                    full_name:req.cookies.information.name,
                    identity:req.cookies.information.identity,
                    data:rows,
                    data2:arrary_date
                });
            })
        })
    }
}

// 執行訂單刪除-門票
exports.ticket_appt_del= function (req, res) {
    var no=req.params.no;
    var ticket_check_data={
        Exist: 0
    };
    req.getConnection(function (err, connection) {
        connection.query("UPDATE Ticket_Check SET ? WHERE No = ? ", [ticket_check_data,no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/user/order/ticket_del/:no）: %s ", err,res);
            }else{
                res.redirect('/user/order');
            }
        });
    })
}

// 執行訂單刪除-設施
exports.facility_appt_del= function (req, res) {
    var no=req.params.no;
    var date=req.params.date;
    var facility_appt_check_data={
        Exist: 0
    };
    req.getConnection(function (err, connection) {
        connection.query("UPDATE Facility_Appt_Check SET ? WHERE No = ? ", [facility_appt_check_data,no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/user/order/facility/facility_del/:no）: %s ", err,res);
            }else{
                res.redirect('/user/order/facility/'+date);
            }
        });
    })
}

// 訂單編輯-設施
exports.order_facility_appt_edit= function (req, res) {
    var no=req.params.no;
    // 如果已經登入則直接跳轉
    if (!req.cookies.information || req.cookies.information == undefined) {
        res.redirect('/user/login');
    }else{
        req.getConnection(function (err, connection) {
            connection.query('SELECT Facility_Appt.No,Facility_Appt.Date,Facility_Appt.Time,Facility.Name FROM Facility_Appt Facility_Appt INNER JOIN ( SELECT * FROM Facility) Facility ON Facility_Appt.Facility_No=Facility.No WHERE Facility_Appt.No = ?',[no], function (err, rows) {
                res.render('order_facility_appt_edit', {
                    page_title: "目前訂單編輯-設施",
                    full_name:req.cookies.information.name,
                    identity:req.cookies.information.identity,
                    data:rows,
                    date:moment((JSON.parse(JSON.stringify(rows))[0].Date).slice(0, -14)).add(1, 'days').format('YYYY-MM-DD')
                });
            })
        })
    }
}

// 執行訂單編輯-設施
exports.order_facility_appt_edit_save = function (req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var no=input.facility_appt_no;
    var time=input.ticket_time[0];
    var date=input.facility_appt_date;
    req.getConnection(function (err, connection) {
        var facility_appt_data = {
            Time:time
        }
        connection.query("UPDATE Facility_Appt set ? WHERE No = ? ", [facility_appt_data , no], function (err, row) {
            if (err) {
                errorPrint("Error Updating（routes：/user/order/facility/facility_appt_edit_save）: %s ", err,res);
            }
        });
        res.redirect('/user/order/facility/'+date);
    })
}