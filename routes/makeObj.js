function makeObj( req, res, ejs, obj ){
    if( obj == undefined ){
        obj = new Object();
    }
    obj.session = JSON.stringify(req.user);
	console.log("요청페이지 : " + ejs);
    res.render( __dirname + "/../views/" + ejs + ".ejs", obj );
}


module.exports = makeObj;

