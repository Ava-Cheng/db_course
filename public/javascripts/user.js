var ckEmail = /^(([.](?=[^.]|^))|[\w_%{|}#$~`+!?-])+@(?:[\w-]+\.)+[a-zA-Z.]{2,63}$/;//Email格式驗證

// 登入Email格式檢查
function ckform_user_login(){
    var frm = document.getElementById("loginForm");
    var email = frm.email.value;
    var password = frm.password.value;
    if (!ckEmail.test(email)) {
        $("#errorMsg").html("您所輸入的'Email'格式錯誤，請再次檢查。");
    } else{
        //錯誤訊息接收
        data={"email":email,"password":password};
        user_error_msg(frm,data);
    }
}

// 錯誤訊息接收 帳號管理
function user_error_msg(frm,data){
    $.ajax({
        data: data,
        url: '/user/error_msg',
        dataType: 'json',
        type: 'POST',
        cache: false,
        timeout: 60,
        success: function (msg) {
            if(msg.msg=="此帳號已存在，請直接登入。" || msg.msg=="此帳號不存在，請前往註冊。" || msg.msg=="密碼輸入錯誤，請再次確認。"){
                alert(msg.msg);
            }else{
                $("#errorMsg").html(msg.msg);
            } 
        },
        error: function (error) {
            $("#errorMsg").html("");
            frm.submit();
        }
    })
}

// 確認預定門票是否有超過限制
function check_ticket_num(user_no){
    var frm = document.getElementById("ticketForm");
    var book_date = frm.book_date.value;
    data={"user_no":user_no,"book_date":book_date};
    $.ajax({
        data: data,
        url: '/user/ticket/num_check',
        dataType: 'json',
        type: 'POST',
        cache: false,
        timeout: 60,
        success: function (msg) {
            if(msg.msg=="當天預定人數已經額滿，請擇日選擇。" || msg.msg=="您已經預訂過囉。"){
                alert(msg.msg);
            }else{
                $("#errorMsg").html(msg.msg);
            } 
        },
        error: function (error) {
            $("#errorMsg").html("");
            frm.submit();
        }
    })
}