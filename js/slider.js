'use strict';
var sliderTimer;
var removeTimer;

window.addEventListener('load', function(){
	var post_slider = $("div");
	post_slider.id = "post_slider";
	document.body.style.overflowY = "hidden";
	document.ontouchmove = function(event){
		event.preventDefault();
	}

	var slide_imgs = $("div");
	slide_imgs.style.left = "0px";
	slide_imgs.id = "slide_imgs";

	var slide_count = 4;
	for( var i = 1; i <= slide_count; ++i ){
		var slide = $("div");
		slide.className = "slide";
		var colorcode = "";
		for( var j = 0; j < 3; ++j ){
			colorcode += Math.round(Math.random()*50 + 180).toString(16);
			if( colorcode.length % 2 ){
				colorcode += "0";
			}
		}
		slide.style.backgroundColor = '#' + colorcode;
//	  slide.style.background = "url('/img/slider_" + i + ".png')";
		slide_imgs.appendChild(slide);
	};

	post_slider.appendChild(slide_imgs);
			/*
	var slide1 = $("img");
	slide1.className = "slide";
	slide1.src = "/img/main/img_main.png";
	slider.appendChild(slide1);
			*/

	post_slider.onmouseover = function(){
		var arrows = $(".slide_arrow");
		for( var i = 0; i < arrows.length; ++i ){
			arrows[i].style.display = "block";
		}
	}
	post_slider.onmouseout = function(){
		var arrows = $(".slide_arrow");
		for( var i = 0; i < arrows.length; ++i ){
			arrows[i].style.display = "none";
		}
	}
	var slide_box = $("div");
	slide_box.id = "slide_box";

	var slide_logo = $("div");
	slide_logo.id = "slide_logo";
	slide_box.appendChild(slide_logo);

	var slide_line = $("div");
	slide_line.id = "slide_line";
	slide_box.appendChild(slide_line);

	var slide_text = $("text");
	//slide_text.innerHTML = "Lorem ipsum dolor sit amet, conectetur adipisicing elit<br>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
	slide_box.appendChild(slide_text);

	var slide_btn = $("div");
	slide_btn.id = "slide_btn";
	slide_btn.onclick = function(){
		location.href = "/register";
	}
	slide_btn.innerText = "지금 시작하기";
	slide_box.appendChild(slide_btn);

	post_slider.appendChild(slide_box);
	var slide_left = $("div");
	slide_left.className = "slide_arrow";
	slide_left.id = "slide_left";
	post_slider.appendChild(slide_left);

	slide_left.onclick = function(){
		sliding(-1);
		clearInterval(sliderTimer);
		sliderTimer = setInterval(sliding,3000);
	}

	var slide_right = $("div");
	slide_right.id = "slide_right";
	slide_right.className = "slide_arrow";
	post_slider.appendChild(slide_right);

	slide_right.onclick = function(){
		clearInterval(sliderTimer);
		sliderTimer = setInterval(sliding,3000);
		sliding(1);
	}

	if( $('#post_wrap') ){
		$('#wrap_mid').removeChild($('#post_wrap'));
	}
	$('#body').style.display = "none";
	document.body.style.minHeight = "0";
	document.body.appendChild(post_slider);
	sliderTimer = setInterval(sliding,3000);
});

var sliding_tmp = 0;
function sliding( type ){
	if( !type ){
		type = 1;
	}
	var imgs = $("#slide_imgs");
	var margin = document.body.clientWidth;
	var current_left = parseInt(imgs.style.left.split("px")[0]);
	if( !sliding_tmp ){
		sliding_tmp = 1;
		if( ( type == -1 && current_left == 0 ) ){
			var img = imgs.childNodes[imgs.childElementCount-1];
			imgs.removeChild(img);
			img = img.cloneNode(true);
			img.style.marginLeft =  margin * type + "px";
			imgs.insertBefore(img,imgs.childNodes[0]);
			setTimeout(function(){
				img.style.marginLeft = "0px";
			}, 10);
			removeTimer = setTimeout(function(){
				sliding_tmp = 0;
			},500);
			return;
		} else if ( ( type == 1 && current_left >= -margin * ( imgs.childElementCount - 1 ) ) ){
			var img = imgs.childNodes[0];
			imgs.appendChild(img.cloneNode(true))
			img.style.transition = "margin-left .5s";
			img.style.marginLeft = -margin + "px";
			removeTimer = setTimeout(function(){
				sliding_tmp = 0;
				imgs.removeChild(imgs.firstChild)
			},500);
			return;
		}
		imgs.style.left = current_left - margin * type + "px";
	}
}


