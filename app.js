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
var routes = require('./routes');
//DB使用
var fs = require('fs');
var ini = require('ini');
var db = ini.parse(fs.readFileSync('./config/db.ini', 'utf8'));
var mysql = require('mysql');
//port設定
app.set('port', process.env.PORT || 3000);

//使用 ejs template engine
app.set('views', path.join(__dirname, 'views')); //設計頁面模板位置，在views子目錄下
app.set('view engine', 'ejs'); //表明要使用的模板引擎(樣板引擎，Template Engine)是ejs

app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());
//隱藏標頭
app.use(helmet());

//development only
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

//routes
app.get('/', routes.index);
//ERROR
app.get('*', routes.error)

app.use(app.router);

http.createServer(app).listen(app.get('port'), function(req, res) {
    //建立app instance
    //服務器通過app.listen（3000）;啟動，監聽3000端口。
    console.log('Express server listening on port ' + app.get('port'));
});