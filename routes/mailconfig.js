'use strict';

var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",{service: 'Gmail',auth:{user: "nagase.iori.kr@gmail.com",pass: require('./settings.js').mailPassword}});
function mailTemplate(html){
	return '<div id="wrap" style="background-color: #f2f2f2; text-align:center; font-size:12pt;padding-top:150px;padding-bottom:150px;"><div id="card" style="margin:auto;width:800px;border: 1px solid;border-color: #e5e6e9 #dfe0e4 #d0d1d5;border-radius: 3px;background-color:white;"><div id="header" style="height: 70px;background-color: rgba(255,92,62,1); box-shadow: 0px 1px 1px rgba(0,0,0,0.1);"><div id="header_logo" style="background-image: url(https://iori.kr/svg/logo_white.svg);background-size: 100% 100%;width: 76px;height: 48px;display: block;margin: auto;padding-top: 20px;"></div></div><div id="text" style="padding:25px;box-sizing:border-box;width:100%;">' + html + '<br><br>더 궁금한 사항이 있으시면 support@iori.kr로 문의 바랍니다.</div></div></div>';
}

module.exports = {
	smtpTransport : smtpTransport,
	mailTemplate : mailTemplate
}
