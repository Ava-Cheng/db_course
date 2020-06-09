var ckNumber = /\d{1,2}$/;// 設施人數格式檢查

// 回上一頁
function go_back(){
    history.go(-1);
}

// 日期格式轉換
function dateChange(birth) {
    var en_mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var num_mon = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    var YYYY = birth.substring(11, 15);
    var MM = birth.substring(4, 7);
    var DD = birth.substring(8, 10);
    var dateFormatArray = [YYYY, MM, DD];
    //月份英文縮寫轉數字
    for (var j = 0; j < en_mon.length; j++) {
        if (en_mon[j] == dateFormatArray[1]) {
            dateFormatArray[1] = num_mon[j];
            break;
        }
    }
    birth = dateFormatArray[0] + '/' + dateFormatArray[1] + '/' + dateFormatArray[2];
    return birth
}

window.onload = function initSet() {
    // 查看會員資料 生日格式轉換
    $(["input[id=birth_cheng]"][0]).each(function () {
        birth=$(this).val();
        $(this).val(dateChange(birth));
    })

    // accountManagement
    $(document).ready(function () {
        // 即時驗證
        // 驗證姓名
        if ($("#name")) {
            $("#name").blur(function () {
                var name = $("#name").val();
                if (!ckName.test(name)) {
                    $("#errorMsg").html("您所輸入的'姓名'格式錯誤，請再次檢查。");
                } else if (name.length > 40) {
                    $("#errorMsg").html("您所輸入的'姓名'長度過長，請再次檢查。");
                } else{
                    $("#errorMsg").html("");
                }
            })
        }
        // 驗證生日
        if ($("#birth")) {
            $("#birth").blur(function () {
                var birth = $("#birth").val();
                if (birth=="") {
                    $("#errorMsg").html("請選擇生日。");
                } else{
                    $("#errorMsg").html("");
                }
            })
        }
        // 驗證行動電話
        if ($("#phone")) {
            $("#phone").blur(function () {
                var phone = $("#phone").val();
                if (!ckPhone.test(phone)) {
                    $("#errorMsg").html("您所輸入的'行動電話'格式錯誤，請再次檢查。");
                } else if (phone.length > 15) {
                    $("#errorMsg").html("您所輸入的'行動電話'長度過長，請再次檢查。");
                } else{
                    $("#errorMsg").html("");
                }
            })
        }
        // 驗證信箱
        if ($("#email")) {
            $("#email").blur(function () {
                var email = $("#email").val();
                if (!ckEmail.test(email)) {
                    $("#errorMsg").html("您所輸入的'Email'格式錯誤，請再次檢查。");
                } else if (email.length > 150) {
                    $("#errorMsg").html("您所輸入的'Email'長度過長，請再次檢查。");
                } else{
                    $("#errorMsg").html("");
                }
            })
        }
        // 驗證密碼
        if ($("#password") && $("#index_account_view").val()!="exist") {
            $("#password").blur(function () {
                var password = $("#password").val();
                if($("#index_account_view").val()!="exist"){
                    if (password == "") {
                        $("#errorMsg").html("請輸入有效密碼，請再次檢查。");
                    }else{
                        $("#errorMsg").html("");
                    }
                }
            })
        }
        // 驗證確認密碼
        if ($("#password_repeat")) {
            $("#password_repeat").blur(function () {
                var password_repeat = $("#password_repeat").val();
                var password = $("#password").val();
                if (password_repeat != password) {
                    $("#errorMsg").html("兩次輸入密碼不相符，請再次檢查。");
                }else{
                    $("#errorMsg").html("");
                }
            })
        }
        
        // 驗證設施名稱
        if ($("#facility_name")) {
            $("#facility_name").blur(function () {
                var facility_name = $("#facility_name").val();
                if (facility_name.length > 10) {
                    $("#errorMsg").html("您所輸入的'設施名稱'長度過長，請再次檢查。");
                } else{
                    $("#errorMsg").html("");
                }
            })
        }

        // 驗證設施人數
        if ($("#available_PER")) {
            $("#available_PER").blur(function () {
                var available_PER = $("#available_PER").val();
                if(!ckNumber.test(available_PER)){
                    $("#errorMsg").html("您所輸入的'設施人數'格式錯誤，請再次檢查。");
                }else if (Number(available_PER) > 25) {
                    $("#errorMsg").html("您所輸入的'設施人數'長度過長，請再次檢查。");
                }else{
                    $("#errorMsg").html("");
                }
            })
        }

        // 驗證設施名稱
        if ($("#info")) {
            $("#info").blur(function () {
                var info = $("#info").val();
                if (info.length > 1000) {
                    $("#errorMsg").html("您所輸入的'設施介紹'長度過長，請再次檢查。");
                } else{
                    $("#errorMsg").html("");
                }
            })
        }
    })
}