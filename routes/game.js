'use strict';

var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var async = require("async");

var makeObj = require('./makeObj.js');
var checkSession = require('./auth.js').checkSession;


module.exports = router;
