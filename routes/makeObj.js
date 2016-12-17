var fs = require('fs-extra');

function makeObj( req, res, ejs, obj ){
    if( obj == undefined ){
        obj = new Object();
    }
    obj.session = JSON.stringify(req.user);
	var url = __dirname + "/../views/" + ejs + ".ejs";
	fs.exists( url, function( exists ){
		if( exists ){
	    	res.render( url, obj );
		} else {
			res.send("404 Not Found 페이지 디자인이 없어요홍홍~");
		}
	});

}


module.exports = makeObj;

