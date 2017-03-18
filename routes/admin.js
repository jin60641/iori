var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');

router.use(require('body-parser').urlencoded());
router.use(busboy())
var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;

var checkSession = require('./auth.js').checkAdmin;


function showAdminPage( req, res ){
    var page = req.params['page'];
    if( page == undefined || page.length == 0 ){
        page = "stat";
    }
    makeObj( req, res, "admin", { page : page });
}

router.get('/admin', checkSession, showAdminPage ); 
router.get('/admin/:page', checkSession, showAdminPage ); 


module.exports = router;
