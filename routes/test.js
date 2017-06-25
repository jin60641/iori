'use strict';

var express = require('express');
var router = express.Router();
var async = require("async");
var request = require("request");
var apiKey = require('./settings.js').apiKey;

var makeObj = require('./makeObj.js');

router.get('/test/:lon/:lat', function(req,res){
	var lon = parseInt(req.params['lon']);
	var lat = parseInt(req.params['lat']);
	var url = "http://openapi2.e-gen.or.kr/openapi/service/rest/HsptlAsembySearchService/getHsptlMdcncLcinfoInqire?pageNo=1&numOfRows=300";
	url += "&WGS84_LON=" + lon;
	url += "&WGS84_LAT=" + lat;
	url += "&ServiceKey=" + apiKey;
	request( url, function( err, response, body ){
		if( err ){
			throw err;
		}
		res.send(body);
	});
});

router.get('/test', function(req,res){
	makeObj(req,res,"test");
});

module.exports = router;
