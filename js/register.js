
window.addEventListener('load', function(){
	var form_title = document.createElement("div");	
	form_title.innerText = "회원가입";
	form_title.id = "form_title";
	document.body.appendChild(form_title)
	var form = document.createElement("form");
	form.id = "form";
	
	var form_name_label = document.createElement("label");
	form_name_label.innerText = "이름";
	form_name_label.htmlFor = "form_name";
	form.appendChild(form_name_label);
	var form_name = document.createElement("input");
	form_name.id = "form_name";
	form_name.type = "text";
	form.appendChild(form_name);

	var form_uid_label = document.createElement("label");
	form_uid_label.innerText = "아이디";
	form_uid_label.htmlFor = "form_uid";
	form.appendChild(form_uid_label);

	var form_uid = document.createElement("input");
	form_uid.id = "form_uid";
	form_uid.type = "text";
	form_uid.placeholder = "최대 20자 영문 대/소문자, 숫자, 밑줄(_) 사용가능"
	form.appendChild(form_uid);

	var form_email_label = document.createElement("label");
	form_email_label.innerText = "이메일";
	form_email_label.htmlFor = "form_email";
	form.appendChild(form_email_label);
	var form_email = document.createElement("input");
	form_email.id = "form_email";
	form_email.type = "email";
	form.appendChild(form_email);

	var form_password_label = document.createElement("label");
	form_password_label.innerText = "비밀번호";
	form_password_label.htmlFor = "form_email";
	form.appendChild(form_password_label);
	var form_password = document.createElement("input");
	form_password.type = "password";
	form_password.id = "form_password";
	form_password.placeholder = "8~20자 영문 대/소문자, 숫자, 특수문자 혼용";
	form.appendChild(form_password);

	var form_agree = document.createElement("div");
	form_agree.innerHTML = "<a target='_blank' href='/terms' >이용약관</a> 및 <a target='_blank' href='/privacy'>개인정보취급</a> 방침에 동의합니다.";
	form_agree.style.backgroundImage = 'url("/img/login/btn_checkbox_pressed.png")';
	form_agree.onclick = function(evt){
		if( evt.target.id == "form_agree" ){
			if( this.style.backgroundImage != 'url("/img/login/btn_checkbox_normal.png")' ){	
				this.style.backgroundImage = 'url("/img/login/btn_checkbox_normal.png")';
			} else {
				this.style.backgroundImage = 'url("/img/login/btn_checkbox_pressed.png")';
			}
		}
	}
	form_agree.id = "form_agree";
	form.appendChild(form_agree);

	var form_submit_btn = document.createElement("div");
	form_submit_btn.id = "form_submit_btn";
	form_submit_btn.className = "form_btn";
	form_submit_btn.onclick = send_register;
	form_submit_btn.innerText = "회원가입";
	form.appendChild(form_submit_btn);

    var form_alert = document.createElement("div");
    form_alert.id = "form_alert";
    form_alert.innerText = "'";
    form.appendChild(form_alert);

	if( session ){
		if( session.name ){
			form_name.value = session.name;
//			form_name.readOnly = true;
		}
		if( session.email ){
			form_email.value = session.email;
//			form_email.readOnly = true;
		}
	} else {
		var form_facebook_btn = document.createElement("div");
		form_facebook_btn.id = "form_facebook_btn";
		form_facebook_btn.className = "form_btn";
		form_facebook_btn.onclick = function(){
			location.href = "/api/login/facebook";
		};
		form_facebook_btn.innerHTML = "<img src='/img/login/ic_sns.png' />페이스북으로 회원가입";
		form.appendChild(form_facebook_btn);
	}

	var form_login = document.createElement("text");
	form_login.innerHTML = "이미 회원이신가요?<a href='/login'>로그인하기</a>"
	form.appendChild(form_login);
	document.body.appendChild(form);
});

function show_alert(msg){
	var form_alert = document.getElementById("form_alert");
	form_alert.innerText = msg;
	form_alert.style.opacity = 1;
}

function send_register(){
	var name = document.getElementById("form_name").value;
	var uid = document.getElementById("form_uid").value;
	var email = document.getElementById("form_email").value;
	var password = document.getElementById("form_password").value;
	if( document.getElementById("form_agree").style.backgroundImage != 'url("/img/login/btn_checkbox_pressed.png")' ){
		show_alert("약관동의를 체크해 주세요.");
		return;
	} else if( name.length == 0 ){
		document.getElementById("form_name").focus();
		show_alert("이름을 입력해 주세요.");
		return;
	} else if( uid.length == 0 ){
		document.getElementById("form_uid").focus();
		show_alert("아이디를 입력해 주세요.");
		return;
	} else if( uid.length < 8 || uid.length > 20 ){
		document.getElementById("form_uid").focus();
		show_alert("아이디는 8~20 자리 사이여야 합니다.");
		return;
	} else if( email.length == 0 ){
		document.getElementById("form_email").focus();
		show_alert("이메일을 입력해 주세요.");
		return;
	} else if( email.match(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/g ) == undefined ){
		document.getElementById("form_email").focus();
		show_alert("유효하지 않은 이메일 입니다.");
		return;
	} else if( password.length < 8 || password.length > 20 ){
		document.getElementById("form_password").focus();
		show_alert("비밀번호는 8~20 자리 사이여야 합니다.");
		return;
	} else {
		var score = 0;
		if( password.match(/[a-z]/) ){
			++score;
		}
		if( password.match(/[A-Z]/) ){
			++score;
		}
		if( password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/) ){
			++score;
		}
		if( password.match(/[0-9]/) ){
			++score;
		}
		if( score < 2 ){
			show_alert("비밀번호는 영어 대소문자, 숫자, 특수문자 중 두가지 이상을 조합해야 합니다.");
			document.getElementById("form_password").focus();
			return;
		} else if( score >= 2 ){
			show_alert("서버의 응답을 기다리고 있습니다.");

			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(event){ 
				if( xhr.readyState == 4 && xhr.status == 200 ){
					 show_alert(xhr.responseText.toString());
				}
			}
			xhr.open("POST", "/register", false); 
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
			xhr.send('name='+name+'&uid='+uid+'&email='+email+'&password='+password);
		}
	}
};


function autoDash(str){
	str = str.replace(/[^0-9]/g, '');
	var tmp = '';
	if( str.length >= 2 ){
		if( str.slice(0,2).match(/01|02|03|04|05|06/g) ){
			if( str.length < 4){
				return str;
			}else if(str.length < 7){
				tmp += str.substr(0, 3);
				tmp += '-';
				tmp += str.substr(3);
				return tmp;
			}else if(str.length < 11){
				tmp += str.substr(0, 3);
				tmp += '-';
				tmp += str.substr(3, 3);
				tmp += '-';
				tmp += str.substr(6);
				return tmp;
			} else {
				tmp += str.substr(0, 3);
				tmp += '-';
				tmp += str.substr(3, 4);
				tmp += '-';
				tmp += str.substr(7, 4);
				return tmp;
			}
		} else {
			return "";
		}
	} else {
		return str;
	}
}

