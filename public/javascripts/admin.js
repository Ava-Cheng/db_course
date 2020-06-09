var ckEmail = /^(([.](?=[^.]|^))|[\w_%{|}#$~`+!?-])+@(?:[\w-]+\.)+[a-zA-Z.]{2,63}$/;//Email格式驗證
var ckNumber = /\d{1,2}$/;// 設施人數格式檢查

// 錯誤訊息接收 帳號管理
function admin_error_msg(frm,data){
    $.ajax({
        data: data,
        url: '/admin/error_msg',
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

// 錯誤訊息接收 設施管理
function facility_error_msg(frm,data){
    $.ajax({
        data: data,
        url: '/admin/facility_management/error_msg',
        dataType: 'json',
        type: 'POST',
        cache: false,
        timeout: 60,
        success: function (msg) {
            if(msg.msg=="此設施已存在。"){
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

// 登入Email格式檢查
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

// 新增設施
function go_add_facility(){
    window.location.href = '/admin/facility_management/add';
}

// 上傳圖片
// 點擊上傳圖片按鈕
function click_upload(){
    document.getElementById("facility_images").click();
}

// 上傳圖片
// 副檔名判斷、即時預覽圖片顯示
function upload(input) {
    var file = input.files[0];
    // 取得副檔名
    // TODO:用副檔名判斷會被偽造問題，下一階段在從根源跟改
    file_type=(file.name).split(".")[1];
    if(file_type!="BMP" && file_type!="bmp" && file_type!="JPG" && file_type!="jpg" && file_type!="JPEG" && file_type!="jpeg" && file_type!="PNG" && file_type!="png" && file_type!="GIF" && file_type!="gif"){
        alert("您所上傳的不是圖片，請重新選擇");
    }else{
        // 顯示圖片
        document.getElementById("preview_img").style.display="block";
        // 即時預覽圖
        if(input.files && input.files[0]){
            var imageTagID = input.getAttribute("targetID");
            var reader = new FileReader();
            reader.onload = function (e) {
               var img = document.getElementById(imageTagID);
               img.setAttribute("src", e.target.result)
            }
            reader.readAsDataURL(input.files[0]);
            // 取得設施圖片
            var frm = document.getElementById("facility_add_upload_images");
            data={"facility_name":"error"};
            facility_error_msg(frm,data);
            document.getElementById("facility_table").style.margin="0px 100px 0px 343px";
            
        }
    }
}
  
// 設施新增
function ckform_facility(status){
    var frm = document.getElementById("facility_add_form");
    var facility_name = frm.facility_name.value;
    var available_PER = frm.available_PER.value;
    var info = frm.info.value;
    if(status=="add"){
        var no="0";
    }else{
        var no=frm.no.value;
    }
    if (facility_name.length <= 40 && facility_name!="" && ckNumber.test(available_PER) && Number(available_PER) <= 25 && available_PER!="" && info.length <= 1000 && info!=""){
        // 錯誤訊息接收
        data={"facility_name":facility_name,"status":status,"no":no};
        facility_error_msg(frm,data);
    } else if (facility_name.length > 40) {
        alert("您所輸入的'設施名稱'長度過長，請再次檢查。");
    } else if (facility_name=="") {
        alert("請輸入有效'設施名稱'，請再次檢查。");
    } else if(!ckNumber.test(available_PER)){
        alert("您所輸入的'設施人數'格式錯誤，請再次檢查。");
    } else if(Number(available_PER) > 25){
        alert("您所輸入的'設施人數'長度過長，請再次檢查。");
    }else if (available_PER=="") {
        alert("請輸入有效'設施人數'，請再次檢查。");
    } else if (info.length > 1000) {
        alert("您所輸入的'設施介紹'長度過長，請再次檢查。");
    } else if (info=="") {
        alert("請輸入有效'設施介紹'，請再次檢查。");
    } else if (facility_name.length > 40 && facility_name=="" && !ckNumber.test(available_PER) && Number(available_PER) > 25 && available_PER=="" && info.length > 1000 && info=="") {
        alert("失敗！請檢查您的'設施名稱'、'設施人數'、'設施介紹'格式，稍後再試。");
    }
}

// 點擊facilityBtn
function click_facilityBtn(){
    document.getElementById("facilityBtn").click();
}

// 設施編輯
function go_edit_facility(no){
    window.location.href = '/admin/facility_management/edit/'+no;
}