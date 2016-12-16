if( !window.addEventListener ){
	window.addEventListener = function(evt,cb){
		window.attachEvent('on'+evt,cb);
	}
}	
