// 首頁
exports.index = function(req, res) {
    if (!req.cookies.information || req.cookies.information == undefined) {
        full_name="";
        identity="";
    }else{
        full_name=req.cookies.information.name;
        identity=req.cookies.information.identity;
    }
    res.render('index', {
        page_title: "",
        full_name:full_name,
        identity:identity
    });
};

// 樂園資訊頁面
exports.paradise_information = function(req, res) {
    if (!req.cookies.information || req.cookies.information == undefined) {
        full_name="";
        identity="";
    }else{
        full_name=req.cookies.information.name;
        identity=req.cookies.information.identity;
    }
    res.render('paradise_information', {
        page_title: "樂園資訊",
        full_name:full_name,
        identity:identity
    });
};

// 交通資訊頁面
exports.facilities_information = function(req, res) {
    if (!req.cookies.information || req.cookies.information == undefined) {
        full_name="";
        identity="";
    }else{
        full_name=req.cookies.information.name;
        identity=req.cookies.information.identity;
    }
    res.render('facilities_information', {
        page_title: "交通資訊",
        full_name:full_name,
        identity:identity
    });
};

// 設施資訊頁面
exports.facility_information= function(req, res) {
    if (!req.cookies.information || req.cookies.information == undefined) {
        full_name="";
        identity="";
    }else{
        full_name=req.cookies.information.name;
        identity=req.cookies.information.identity;
    }
    req.getConnection(function (err, connection) {
        // 撈出設施相關資料
        connection.query('SELECT * FROM Facility Facility INNER JOIN ( SELECT * FROM Facility_Check) Facility_Check ON Facility.No=Facility_Check.No ' +
            'WHERE Facility_Check.Exist = ?', [1], function (err, rows) {
                if (err) {
                    errorPrint("Error Selecting（routes：/admin/facility_management): %s ", err);
                } else{
                    res.render('facility_information', {
                        page_title: "設施資訊",
                        full_name:full_name,
                        data:rows,
                        identity:identity
                    });
                }
        });
    });
}

// 錯誤頁面
exports.failure = function(req, res) {
    if (!req.cookies.information || req.cookies.information == undefined) {
        full_name="";
        identity="";
    }else{
        full_name=req.cookies.information.name;
        identity=req.cookies.information.identity;
    }
    res.render('failure', {
        page_title: "",
        full_name:full_name,
        identity:identity
    });
};

// 404頁面
exports.error = function(req, res) {
    if (!req.cookies.information || req.cookies.information == undefined) {
        full_name="";
        identity="";
    }else{
        full_name=req.cookies.information.name;
        identity=req.cookies.information.identity;
    }
    res.render('error', {
        page_title: "",
        full_name:full_name,
        identity:identity
    });
};