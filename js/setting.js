var settings = [{
	id : "uid",
	name : "아이디",
	text : "iori.kr/@" + session.uid,
	value : session.uid
},{
	id : "email",
	name : "이메일",
	text : "이메일은 공개적으로 표시되지 않습니다.",
	value : session.email
}]

window.addEventListener('load', function(){
	var wrap = $('div');
	wrap.id = "setting_wrap";

	var account_box = $('div');
	account_box.className = "setting_box";
	var account_title = $('div');
	account_title.className = "setting_title";
	account_title.innerText = "계정";
	account_box.appendChild(account_title);
	var objs = settings;
	for( var i = 0; i < objs.length; ++i ){
		account_box.appendChild(makeField(objs[i]));
	}
	
	wrap.appendChild(account_box);

	document.body.appendChild(wrap);
});


function makeField(obj){
	var dom = $('div');

	var label = $('label');
	label.id = "setting_label_" + obj.id;
	label.className = "setting_label";
	label.innerText = obj.name;
	dom.appendChild(label);

	var div = $('div');
	div.id = "setting_div_" + obj.id;
	div.className = "setting_div";
	dom.appendChild(div);

	var input = $('input');
	input.id = "setting_input_" + obj.id;
	input.className = "setting_input";
	if( obj.value ){
		input.value = obj.value;
	}
	div.appendChild(input);

	if( obj.text ){
		var text = $('div');
		text.id = "setting_text_" + obj.id;
		text.className = "setting_text";
		text.innerText = obj.text;
		div.appendChild(text);
	}

	return dom;
}
