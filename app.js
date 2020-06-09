#!/usr/bin/node
//module dependencies
var express = require('express');
var connection = require('express-myconnection');
var methodOverride = require('method-override');
var helmet = require('helmet');
var http = require('http');
var path = require('path');
var app = express();
//routes require
var routes = require('./routes/index');
var accountManagement = require('./routes/accountManagement');
var admin = require('./routes/admin');
var user = require('./routes/user');
//DB使用
var fs = require('fs');
var ini = require('ini');
var db = ini.parse(fs.readFileSync('./config/db.ini', 'utf8'));
var mysql = require('mysql');
//cookie
var cookie = require("cookie-parser");
//port設定
app.set('port', process.env.PORT || 3000);

// 使用 ejs template engine
app.set('views', path.join(__dirname, 'views')); //設計頁面模板位置，在views子目錄下
app.set('view engine', 'ejs'); //表明要使用的模板引擎(樣板引擎，Template Engine)是ejs

app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());
// 隱藏標頭
app.use(helmet());
//cookie
app.use(cookie());

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// DB連線
app.use(
    connection(mysql, {
        host: db.mySQL.host,
        user: db.mySQL.user,
        password: db.mySQL.password,
        port: db.mySQL.port,
        database: db.mySQL.database
    }, 'pool')
);

// routes
// 首頁
app.get('/', routes.index);
// 樂園資訊
app.get('/paradise_information', routes.paradise_information);
// 交通資訊
app.get('/facilities_information', routes.facilities_information);
// 設施資訊
app.get('/facility_information', routes.facility_information);


// 帳號管理
// 會員註冊
app.get('/reg/user', accountManagement.user_reg);
app.post('/reg/user_save', accountManagement.ser_reg_save);
// 管理員註冊
app.get('/reg/admin', accountManagement.admin_reg);
app.post('/reg/admin_save', accountManagement.admin_save_reg);
// 註冊錯誤訊息
app.post('/reg/error_msg', accountManagement.errorMsg);

// 管理員
// 管理員登入
app.get('/admin/login', admin.admin_login);
app.post('/admin/admin_do_login', admin.admin_do_login);
// 管理員登出
app.get('/admin/logout', admin.admin_logout);
// 登入錯誤訊息
app.post('/admin/error_msg', admin.errorMsg);
// 帳號管理
app.get('/admin/account_view', admin.admin_account_view);
// 執行修改帳號資訊
app.post('/admin/account_view_save', admin.admin_account_view_save);
// 門票管理
app.get('/admin/member_tickets', admin.member_tickets);
// 會員資料查看
app.get('/admin/member_data', admin.member_data);
// 設施管理
// 設施查看
app.get('/admin/facility_management', admin.facility_management);
// 設施新增
app.get('/admin/facility_management/add', admin.facility_add);
// 上傳圖片
app.post('/admin/facility_management/add/upload_images', admin.upload_images);
// 執行設施新增
app.post('/admin/facility_management/add_save', admin.facility_add_save);
// 設施修改
app.get('/admin/facility_management/edit/:no', admin.facility_management_edit);
// 執行設施修改
app.post('/admin/facility_management/edit_save', admin.facility_management_edit_save);
// 執行設施刪除
app.post('/admin/facility_management/del/:no', admin.facility_management_delete_save);
// 設施錯誤訊息
app.post('/admin/facility_management/error_msg', admin.facility_errorMsg);

// 會員
// 會員登入
app.get('/user/login', user.user_login);
app.post('/user/user_do_login', user.user_do_login);
// 會員登出
app.get('/user/logout', user.user_logout);
// 登入錯誤訊息
app.post('/user/error_msg', user.errorMsg);
// 帳號管理
app.get('/user/account_view', user.user_account_view);
// 執行修改帳號資訊
app.post('/user/account_view_save', user.user_account_view_save);
// 預定門票
app.get('/user/ticket', user.ticket);
// 門票人數確認
app.post('/user/ticket/num_check', user.ticket_num_check);
// 執行預定門票
app.post('/user/ticket_save', user.ticket_save);
// 目前訂單
app.get('/user/order', user.order);

// 失敗
app.get('/failure', routes.failure)
// ERROR
app.get('*', routes.error)

app.use(app.router);

http.createServer(app).listen(app.get('port'), function(req, res) {
    // 建立app instance
    // 服務器通過app.listen（3000）;啟動，監聽3000端口。
    console.log('Express server listening on port ' + app.get('port'));
});