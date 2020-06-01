//首頁
exports.index = function(req, res) {
    res.render('index', {});
};

//錯誤頁面
exports.error = function(req, res) {
    res.render('error', {});
};