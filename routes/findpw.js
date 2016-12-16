var crypto = require("crypto");
var db = require("./dbconfig");
var smtpTransport = require("./mailconfig").smtpTransport;

function Findpw( req, res ){
	var email = req.body['email'].trim();
	db.Users.findOne({ email : email }, function( err, user ){
		if( user ) {
			var shasum = crypto.createHash('sha1');
			shasum.update(email);
			var sha_email = shasum.digest('hex');
			var string = "http://wolk.co.kr/api/auth/findpw/" + email + "/" + sha_email;
			smtpTransport.sendMail({
				from: 'wolk <wolk.co.kr>',
				to: email,
				subject : '[Wolk] 비밀번호 재설정 안내',
				'html' : '<div style="width : 100%; text-align : center; font-size : 10pt; line-height : 24px;"><img src="http://wolk.co.kr/img/logo.png" style="margin : 30px 0 30px 0;"><div style="border-top : 1px solid #4c0e25; border-bottom : 1px solid #4c0e25; padding-top : 60px; padding-bottom : 60px; margin-bottom : 20px;">안녕하세요. ' + user.name + '님.<br><br>울크(Wolk)의 로그인 아이디의 비밀번호 재설정을 요청하셨기에 이메일로 안내해 드립니다.<br>아래 링크를 클릭하시면 비밀번호를 재설정 하실 수 있습니다.<br><a href="' + string + '" style="display : block; margin-top : 20px; text-decoration:none;color:#ce410a;font-weight:bold;">여기를 눌러 비밀번호 재설정</a><br>만약 비밀번호 재설정 요청을 하지 않으셨다면 위의 링크를 클릭하지 마시고<br>본 이메일을 무시하셔도 좋습니다.<br><br>감사합니다.<br>오늘도 좋은 하루되세요<br><br>울크 운영진 드림.<br></div>더 궁금한 사항이 있으시면 supprot@wolk.co.kr로 문의 바랍니다.</div>'
			}, function( error, response ){
				if( error ){
					throw error;
				} else {
					res.send("이메일로 비밀번호를 다시 설정하는 방법을 보내드렸습니다.");
				}
			});
		} else {
			res.send("입력하신 메일을 찾을 수 없습니다.");
		}
	});
};

module.exports = Findpw;
