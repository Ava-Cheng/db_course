// 首頁
exports.index = function(req, res) {
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        admin_name="";
    }else{
        admin_name=req.cookies.admin.name;
    }
    res.render('index', {
        page_title: "",
        admin_name:admin_name
    });
};

// 樂園資訊頁面
exports.paradise_information = function(req, res) {
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        admin_name="";
    }else{
        admin_name=req.cookies.admin.name;
    }
    res.render('paradise_information', {
        page_title: "樂園資訊",
        admin_name:admin_name
    });
};

// 交通資訊頁面
exports.facilities_information = function(req, res) {
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        admin_name="";
    }else{
        admin_name=req.cookies.admin.name;
    }
    res.render('facilities_information', {
        page_title: "交通資訊",
        admin_name:admin_name
    });
};

// 錯誤頁面
exports.error = function(req, res) {
    if (!req.cookies.admin || req.cookies.admin == undefined) {
        admin_name="";
    }else{
        admin_name=req.cookies.admin.name;
    }
    res.render('error', {
        page_title: "",
        admin_name:admin_name
    });
};