'use strict';

var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",{service: 'Gmail',auth:{user: "nagase.iori.kr@gmail.com",pass: require('./settings.js').mailPassword}});
module.exports = {
	smtpTransport : smtpTransport
}
