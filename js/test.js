inits["test"] = {
	listeners : [],
	init : function(){
		var script = $('script');
		script.src = "https://openapi.map.naver.com/openapi/v3/maps.js?clientId=0YLM45AZvfnM6zmkJZY1&submodules=geocoder";
		document.getElementsByTagName('head')[0].appendChild(script);
		var map_div = $('div');
		map_div.id = "map_div";
		$('#wrap_mid').appendChild(map_div);
		var that = this;
		script.onload = function(){
			var t = setInterval( function(){
				if( naver.maps.Service ){
					clearInterval(t);
					that.start();
				}
			},100);
		}
	},
	map : null,
	start : function(){
		that = this;
		that.map = new naver.maps.Map('map_div', {
			zoom : 10,
			zoomControl : true,
			minZoom : 6
		});
		if( navigator.geolocation && navigator.geolocation.getCurrentPosition ){
			navigator.geolocation.getCurrentPosition( function( location ){
				var latlng = new naver.maps.LatLng(location.coords.latitude,location.coords.longitude);
				that.map.setCenter(latlng);
				var markerOptions = {
				    position : latlng.destinationPoint(0,0),
				    map : that.map,
				    icon: {
				        url : '/img/my_location.png',
				        size : new naver.maps.Size(40, 40),
				        origin : new naver.maps.Point(0, 0),
				        anchor : new naver.maps.Point(20, 20)
				    }
				};
				var marker = new naver.maps.Marker(markerOptions);
				that.windowResize();
			});
		} else {
			that.windowResize();
		}
		that.addListener( window, "resize", that.windowResize );
	},
	windowResize : function(){
		var w = window.innerWidth;
		var h = window.innerHeight;
		that.map.setSize(new naver.mas.Size(w,h-42));
	},
	addListener : function( element, event, handle ){
		element.addEventListener( event, handle, false );
		this.listeners.push({ element : element, event : event, handle : handle });
	},
	exit : function(){
		for( let i = 0; i < this.listeners.length; ++i ){
			let h = this.listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
		$('#wrap_mid').removeChild($('#map_div'));
		delete naver;
	}
}
