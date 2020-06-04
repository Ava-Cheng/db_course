// 首頁
exports.index = function(req, res) {
    res.render('index', {
        page_title: ""
    });
};

// 樂園資訊頁面
exports.paradise_information = function(req, res) {
    res.render('paradise_information', {
        page_title: "樂園資訊"
    });
};

// 交通資訊頁面
exports.facilities_information = function(req, res) {
    res.render('facilities_information', {
        page_title: "交通資訊"
    });
};

// 錯誤頁面
exports.error = function(req, res) {
    res.render('error', {
        page_title: ""
    });
};