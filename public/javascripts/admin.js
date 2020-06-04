var ckEmail = /^(([.](?=[^.]|^))|[\w_%{|}#$~`+!?-])+@(?:[\w-]+\.)+[a-zA-Z.]{2,63}$/;//Email格式驗證

// 錯誤訊息接收
function admin_error_msg(frm,data){
    $.ajax({
        data: data,
        url: '/admin/error_msg',
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

//登入Email格式檢查
function ckform_login(){
    var frm = document.getElementById("loginForm");
    var email = frm.email.value;
    var password = frm.password.value;
    if (!ckEmail.test(email)) {
        $("#errorMsg").html("您所輸入的'Email'格式錯誤，請再次檢查。");
    } else{
        //錯誤訊息接收
        data={"email":email,"password":password};
        admin_error_msg(frm,data);
    }
}
