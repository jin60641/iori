'use strict';

var express = require('express');
var router = express.Router();
var async = require("async");
var request = require("request");
var apiKey = require('./settings.js').apiKey;
var parser = require('xml2js').parseString;

var makeObj = require('./makeObj.js');

router.get('/test/:lat/:lon', function(req,res){
	var lon = parseFloat(req.params['lon']);
	var lat = parseFloat(req.params['lat']);
	var url = "http://openapi2.e-gen.or.kr/openapi/service/rest/HsptlAsembySearchService/getHsptlMdcncLcinfoInqire?"
	url += "WGS84_LON=" + lon;
	url += "&WGS84_LAT=" + lat;
	url += "&pageNo=0&numOfRows=5";
	url += "&ServiceKey=" + apiKey;
	console.log(url);
	request( url, function( err, response, xml ){
		if( err ){
			throw err;
		}
		console.log(xml);
		parser( xml, function( err, result ){
			if( err ){
				throw err;
			}
			res.send(result.response.body[0].items[0].item);
		});
	});
});

router.get('/test', function(req,res){
	makeObj(req,res,"test");
});

router.get('/.well-known/acme-challenge/TgTcJfIcjTBxKdLpSplI-pS-tszWxxKCDVxebtbWl3w', function(req,res){
	res.send("TgTcJfIcjTBxKdLpSplI-pS-tszWxxKCDVxebtbWl3w.3-9-I62_50CExzz0HafMZVP8K3-h0XQUH4Cmjam7Gto");
});


module.exports = router;
