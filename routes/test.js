'use strict';

var express = require('express');
var router = express.Router();
var async = require("async");
var request = require("request");
var apiKey = require('./settings.js').apiKey;

router.get('/test/:lon/:lat', function(req,res){
	var lon = parseInt(req.params['lon']);
	var lat = parseInt(req.params['lat']);
	var url = "http://openapi.e-gen.or.kr/openapi/service/rest/HsptlAsembySearchService/getHsptlMdcncLcinfoInqire?pageNo=1&numOfRows=300";
	url += "&WGS84_LON=" + lon;
	url += "&WGS84_LAT=" + lat;
	url += "&ServiceKey=" + apiKey;
	request( url, function( err, response, body ){
		if( err ){
			throw err;
		}
		console.log(response);
		console.log(body);
	});
});

module.exports = router;
