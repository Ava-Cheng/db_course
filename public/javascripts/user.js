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

// 點擊門票，顯示預約時段
function click_ticket(facility_date){
    $("#facility_appt_date").val(facility_date);
    // 顯示下一個步驟
    $("#step2").show();
}

// 點擊預約時段，顯示預約設施
function click_time(ticket_time){
    $("#ticket_time").val(ticket_time);
    // 顯示下一個步驟
    $("#step3").show();
}

// 點擊預約設施
function click_facility_appt(facility_name,facility_no){
    $("#facility_appt_facility_name").val(facility_name);
    $("#facility_appt_no").val(facility_no);
    // 顯示下一個步驟
    $("#step4").show();
}

// 錯誤訊息接收 設施預約
function facility_appt_error_msg(){
    var frm = document.getElementById("facility_appt_form");
    var facility_no=$("#facility_appt_no").val();
    var date=$("#facility_appt_date").val();
    var time=$("#ticket_time").val();
    data={"facility_no":facility_no,"date":date,"time":time};
    $.ajax({
        data: data,
        url: '/user/facility_appt/error_msg',
        dataType: 'json',
        type: 'POST',
        cache: false,
        timeout: 60,
        success: function (msg) {
            if(msg.msg=="您已重複預約。" || msg.msg=="十分抱歉，預約人數已達上限，請更改預約時段/設施。"){
                alert(msg.msg);
            }
        },
        error: function (error) {
            frm.submit();
        }
    })
}

// 新增訂單-門票
function go_add_ticket(){
    window.location.href = '/user/ticket';
}

// 新增訂單-設施
function go_add_facility(){
    window.location.href = '/user/facility_appt';
}

// 目前訂單查看
function go_edit_ticket(date){
    window.location.href = '/user/order/facility/'+date;
}

// 目前訂單刪除
function go_del_ticket(no){
    var ticket_view_form = document.getElementById("ticket_view_form");
    var isClick = true;
    if (isClick) {
        isClick = false;
        //刪除確認
        var result = confirm('您確定要刪除嗎？');
        if (result == true) {
            ticket_view_form.action = '/user/order/ticket_del/'+no;
            alert('已刪除');
        } else {
            return false;
        }
        setTimeout(function () {
            isClick = true;
        }, 1500); //不能重複點擊
    }
    ticket_view_form.submit();
}