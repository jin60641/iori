//브라우저가 무엇인지 판단
function getBrowser(){
    if( /webkit/i.test( navigator.userAgent ) ){
        return "webkit";
    } else if( /Trident||msie||\.net/i.test( navigator.userAgent ) ){
        return "ms";
    } else if( /moz/i.test( navigator.userAgent ) ){
        return "moz";
    } else {
        return "webkit";
    }
}

var search_result_view=0;
function search_result_none(){
    if(search_result_view){
        return 0;
    } else {
        document.getElementById("search_result").style.display="none";
    }
}

function sessionLogOut(){
	var date = "Thu, 01 Jan 1970 00:00:01 GMT"
	/*
	document.cookie = "facebook=;expires=" + date + ";domain=iori.kr;path=/";
	document.cookie = "userid=;expires=" + date + ";domain=iori.kr;path=/";
	document.cookie = "email=;expires=" + date + ";domain=iori.kr;path=/";
	document.cookie = "password=;expires=" + date + ";domain=iori.kr;path=/";
	*/
	document.cookie = "facebook=,userid=,email=,password=;expires=" + date + ";domain=iori.kr;path=/";

	location.href = "/api/auth/logout";
}

function followUser( user_id, callback ){
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
		if( xhr.responseText == "follow" ){
			callback(1);
		} else if( xhr.responseText == "unfollow" ){
			callback(0);
		}
    }}
    xhr.open("POST","/api/user/follow", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('user_id='+user_id);
}

postOption = {};
