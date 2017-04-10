var crypto = require("crypto");
var async = require("async");
var db = require("./dbconfig");
var smtpTransport = require("./mailconfig").smtpTransport;

function Register( req, res ){
	var password, email, name, uid;
	try {
		password = req.body['password'].trim();
		email = req.body['email'].trim();
		name = req.body['name'].trim();
	} catch(e){
		res.end();
	} finally {
		if( req.body['uid'] && req.body['uid'].length > 0 ){
			uid = req.body['uid'].trim();
		} else {
			uid = "";
		}
	}
	async.parallel([
		function(callback){
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
			if( score >= 2 && password.length >= 8 && password.length <= 20 ){
				var shasum = crypto.createHash('sha1');
				shasum.update(password);
				password = shasum.digest('hex');
				callback(null,'gd');
			} else {
				callback(null,'유효하지 않은 비밀번호입니다');
			}
		},
		function(callback){
			db.Users.findOne({ email : email }, function( err, result ){
				if( !result ){
					var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
					if ( regex.test(email) == false ){
						callback(null,"유효하지않은 이메일입니다.");
					} else {
						callback(null,'gd');
					}
				} else {
					callback(null,"이미 사용중인 메일입니다.");
				}
			});
		},
		function(callback){
			if( uid.length > 0 ){
				if( uid.length >= 8 && uid.length <= 20 ){
					db.Users.findOne({ uid : uid }, function( err, result ){
						if( !result ){
							var regex = /([a-zA-Z0-9_])*/;
							if( uid.length != uid.match(regex)[0].length ){
								callback(null,"아이디에는 영문 대/소문자와 밑줄(_)만 사용하실 수 있습니다.");
							} else {
								callback(null,'gd');
							}
						} else {
							callback(null,"이미 사용중인 아이디입니다.");
						}
					});
				} else {
					callback(null,'유효하지 않은 아이디입니다.');
				}
			} else {
				uid = "";
				callback(null,'gd');
			}
		}
	], function( error, result ){
		if( error ){
			throw error;
		} else if( result[0] == "gd" && result[1] == "gd" && result [2] == "gd" ){
			var id_num;
			db.Users.findOne().sort({id:-1}).exec( function( err, result ){
				if( err ){
					throw err;
				} else if( result ){
					id_num = result.id + 1;
				} else {
					id_num = 1;
				}
				var current = new db.Users({
					id : id_num,
					password : password,
					email : email,
					uid : uid,
					last : new Date(),
					name : name
				});
				var shasum2 = crypto.createHash('sha1');
				shasum2.update(email);
				password = shasum2.digest('hex');
				if( current.uid == "" ){
					current.uid = password.substr(0,20);
				}
				current.save( function( err2 ){
					if( err2 ){
						throw err2;
					} else {
						var string = "http://iori.kr/api/auth/mail/" + email + "/" + password;
						smtpTransport.sendMail({
							from: 'iori <iori.kr>',
							to: email,
							subject : 'iori.kr 인증 메일',
							html : '<div style="width : 100%; text-align : center; font-size : 10pt; line-height : 24px;"><img src="http://iori.kr/img/logo_color.png" style="width : 200px; margin : 30px 0 30px 0;"><div style="border-top : 1px solid #4c0e25; border-bottom : 1px solid #4c0e25; padding-top : 60px; padding-bottom : 60px; margin-bottom : 20px;">안녕하세요. iori.kr입니다.<br>회원가입을 위한 이메일 인증을 위해 아래의 링크를 클릭해주세요.<br><a href="' + string + '" style="display : block; margin-top : 20px; text-decoration:none;color:#ce410a;font-weight:bold;">여기를 눌러 이메일 인증</a><br>인증이 완료되면 정상적으로 서비스 이용이 가능합니다.<br>감사합니다.<br>오늘도 좋은 하루되세요.<br>iori.kr 운영진 드림.<br></div>더 궁금한 사항이 있으시면 support@iori.kr로 문의 바랍니다.</div>'
						}, function(err3,response){
							if( err3 ){
								throw err3;
							} else {
								res.send(email + "으로 인증메일이 발송되었습니다.\n메일을 확인해주세요.");
							}
						});
					}
				});
			});
		} else {
			if( result[0] != "gd" ){
				res.send(result[0]);
			} else if( result[1] != "gd" ){
				res.send(result[1]);
			} else {
				res.send(result[2]);
			}
		}
	});
};

module.exports = Register;
