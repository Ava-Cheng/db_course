// 返回首頁
function back_index() {
    window.location.href = '/';
}
// 前往樂園資訊頁面
function go_paradise_information() {
    window.location.href = '/paradise_information';
}
// 前往交通資訊頁面
function go_facilities_information(){
    window.location.href = '/facilities_information';
}

// 前往設施資訊頁面
function go_facility_information(){
    window.location.href = '/facility_information';
}

function data_list(name,info,images_name){
    // 動態更改設施資訊
    $("#info_view").val("        "+info);
    // 動態更改設施名稱
    $("#facility_name").val(name);
    // 動態更改設施圖片
    var facility_view = document.getElementById("facility_view");
    facility_view.src ="/images/facility/"+images_name;
    //顯示面試詳細資訊
    $("#right").show();
}