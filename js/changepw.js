
window.addEventListener('load', function(){
	var form_title = document.createElement("div");
	form_title.innerText = "비밀번호 변경";
	form_title.id = "form_title";
	document.body.appendChild(form_title)
	var form = document.createElement("form");
	form.id = "form";

	var form_password_label = document.createElement("label");
	form_password_label.innerText = "새 비밀번호";
	form_password_label.htmlFor = "form_password";
	form.appendChild(form_password_label);
	var form_password = document.createElement("input");
	form_password.id = "form_password";
	form_password.type = "password";
	form.appendChild(form_password);

	var form_check_label = document.createElement("label");
	form_check_label.innerText = "새 비밀번호 확인";
	form_check_label.htmlFor = "form_check";
	form.appendChild(form_check_label);
	var form_check = document.createElement("input");
	form_check.id = "form_check";
	form_check.type = "password";
	form.appendChild(form_check);
	var form_submit_btn = document.createElement("div");
	form_submit_btn.id = "form_submit_btn";
	form_submit_btn.onclick = send_submit;
	form_submit_btn.className = "form_btn";
	form_submit_btn.innerText = "비밀번호변경";
	form.appendChild(form_submit_btn);

	var form_alert = document.createElement("div");
	form_alert.id = "form_alert";
	form_alert.innerText = "'";
	form.appendChild(form_alert);

	document.body.appendChild(form);
});

function send_submit(){
	var password = document.getElementById("form_password").value;
	var check = document.getElementById("form_check").value;
	if( password.length == 0 ){
		show_alert("비밀번호를 입력해 주세요.");
		document.getElementById("form_password").focus();
	} else if( password != check ){
		show_alert("비밀번호가 일치하지 않습니다");
	}
	if( password.length < 8 || password.length > 20 ){
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
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(event){
				if( xhr.readyState == 4 && xhr.status == 200 ){
					if( xhr.responseText == "success" ){
						alert("비밀번호가 변경되었습니다.\n다시 로그인해주세요.");
						location.href = "/login/index";
					} else {
						show_alert(xhr.responseText);
					}
				}
			};
			xhr.open("POST", "/changepw", false);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			var email = document.URL.split('/')[4];
			var link = document.URL.split('/')[5];
			if( email != "" && link != "" ){
				xhr.send('password=' + password + '&email=' + email + '&link=' + link );
			} else {
				xhr.send('password=' + password);
			}
		}
	}
};

function show_alert(msg){
	var form_alert = document.getElementById("form_alert");
	form_alert.innerText = msg;
	form_alert.style.opacity = 1;
}

