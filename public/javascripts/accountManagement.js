var ckEmail = /^(([.](?=[^.]|^))|[\w_%{|}#$~`+!?-])+@(?:[\w-]+\.)+[a-zA-Z.]{2,63}$/;// Email格式驗證
var ckName = /^[A-Za-z\u4e00-\u9fa5]+$/;// 姓名格式驗證
var ckPhone = /\d{10,15}$/;// 電話格式檢查

// 錯誤訊息接收
function reg_error_msg(frm,data){
    $.ajax({
        data: data,
        url: '/reg/error_msg',
        dataType: 'json',
        type: 'POST',
        cache: false,
        timeout: 60,
        success: function (msg) {
            $("#errorMsg").html(msg.msg);
        },
        error: function (error) {
            $("#errorMsg").html("");
            frm.submit();
        }
    })
}

// 註冊Emial、密碼、姓名、電話格式及長度檢查
function ckform_reg() {
    var frm = document.getElementById("regForm");
    var email = frm.email.value;
    var password = frm.password.value;
    var password_repeat = frm.password_repeat.value;
    var name = frm.name.value;
    var phone = frm.phone.value;
    var birth = frm.birth.value;
    if (((frm.index_account_view.value =="exist")||(frm.index_account_view.value !="exist" && password != "")) && ckName.test(name) && name.length <= 40 && birth!="" && ckPhone.test(phone) && phone.length <= 15 && ckEmail.test(email) && email.length <= 150  && password == password_repeat){
        // 錯誤訊息接收
        data={"email":email,"password":password,"password_repeat":password_repeat,"name":name,"phone":phone,"birth":birth};
        reg_error_msg(frm,data);
    }else if (!ckName.test(name)) {
        alert("您所輸入的'姓名'格式錯誤，請再次檢查。");
    } else if (name.length > 40) {
        alert("您所輸入的'姓名'長度過長，請再次檢查。");
    } else if (birth=="") {
        alert("請選擇生日。");
    } else if (!ckPhone.test(phone) || phone.length > 15) {
        alert("您所輸入的'行動電話'格式錯誤，請再次檢查。");
    } else if (!ckEmail.test(email) || email.length > 150) {
        alert("您所輸入的'Email'格式錯誤，請再次檢查。");
    } else if (password == "" && frm.index_account_view.value!="exist") {
        alert("請輸入有效密碼，請再次檢查。");
    } else if (password_repeat != password) {
        alert("兩次輸入密碼不相符，請再次檢查。");
    } else if (!ckName.test(name) && name.length > 40 && birth=="" && !ckPhone.test(phone) && phone.length> 15 && !ckEmail.test(email) && email.length > 150 && password == "") {
        alert("失敗！請檢查您的'生日'、'Email'、'姓名'、'密碼'、'行動電話'格式，稍後再試。");
    }
}