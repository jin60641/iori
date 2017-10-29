inits["test"] = {
	listeners : [],
	markers : [],
	infoWindows : [],
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
	getClickHandler : function(index){ // 마커 인덱스 반환용 클로저함수
		let that = this;
		return function(e) {
			var marker = that.markers[index],
				infoWindow = that.infoWindows[index];
	
			if (infoWindow.getMap()) {
				infoWindow.close();
			} else {
				infoWindow.open(that.map, marker);
			}
		}
	},
	getHospitals : function(lat,lng){
		let that = this;
		for( var i in that.markers ){
			that.markers[i].setMap(null);
		}
		that.markers = [];
		that.infoWindows = [];
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let items;
			try {
				items = JSON.parse(xhr.responseText);
				for( var i in items ){
					console.log(i);
					var item = items[i];
					console.log(item);
					var lat = item.latitude[0];
					var lng = item.longitude[0];
					var latlng = new naver.maps.LatLng(lat,lng);
					var markerOptions = {
						position : latlng.destinationPoint(0,0),
						map : that.map,
						shadow : null
					};
					var marker = new naver.maps.Marker(markerOptions);
					naver.maps.Event.addListener(marker,'click',that.getClickHandler(i));
					that.markers.push(marker);
					var infoWindow = new naver.maps.InfoWindow({
						content: '<div style="width:150px;text-align:center;padding:10px;">' + i + '</div>'
					});
					that.infoWindows.push(infoWindow);
//					marker.setAnimation(naver.maps.Animation.DROP);
				}
			} catch(e){
				console.log(e);
				alert(xhr.responseText);
			}
		}};
		xhr.open("GET", "/test/" + lat + '/' + lng, true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
	},
	map : null,
	start : function(){
		that = this;
		that.map = new naver.maps.Map('map_div', {
			zoom : 12,
			zoomControl : true,
			minZoom : 6
		});
		if( navigator.geolocation && navigator.geolocation.getCurrentPosition ){
			navigator.geolocation.getCurrentPosition( function( location ){
				var lat = location.coords.latitude;
				var lng = location.coords.longitude;
				that.getHospitals(lat,lng);
				var latlng = new naver.maps.LatLng(lat,lng);
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
		naver.maps.Event.addListener(that.map, 'rightclick', function(e) {
			that.getHospitals(e.coord.lat(), e.coord.lng());
		});

		that.addListener( window, "resize", that.windowResize );
	},
	windowResize : function(){
		var w = window.innerWidth;
		var h = window.innerHeight;
		that.map.setSize(new naver.maps.Size(w,h-42));
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
