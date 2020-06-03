var moment = require('moment');

//ERROR顯示以及跳轉
function errorPrint(text, error) {
    console.log(text, error);
    res.redirect('/');
}

// 管理員帳號資料
exports.admin_account_view = function (req, res) {
    req.getConnection(function (err, connection) {
        // 依據No去找出相關管理員資料
        // TODO:No要依據登入去做改變
        no=1
        connection.query('SELECT * FROM Admin ' +
            'Inner join Admin_Member on Admin_Member.Admin_No ' +
            'Inner join Admin_Name on Admin_Name.Admin_No ' +
            'WHERE Admin.No = ? AND Admin_Member.Admin_No = ? AND Admin_Name.Admin_No = ?', [1,1,1], function (err, rows) {
                var rowsToJson = (JSON.parse((JSON.stringify(rows)).slice(1, -1)));
                var Birth = (rowsToJson.Birth).slice(0, -14);
                if (err) {
                    errorPrint("Error Selecting (routes：/admin/account_view）: %s ", err);
                } else {
                    res.render('admin_account_view', {
                        data: rows,
                        birth: Birth
                    });
                }
            }
        )
    })
};