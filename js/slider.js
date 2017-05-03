'use strict';
	
inits["slider"] = {
	listeners : [],
	sliderTimer : null,
	removeTimer : null,
	sliding_tmp : 0,
    addListener : function( element, event, handle ){
        element.addEventListener( event, handle, false );
        this.listeners.push({ element : element, event : event, handle : handle });
    },
	sliding : function( type ){
		let that = this;
		if( !type ){
			type = 1;
		}
		let imgs = $("#slide_imgs");
		let margin = document.body.clientWidth;
		let current_left = parseInt(imgs.style.left.split("px")[0]);
		if( !that.sliding_tmp ){
			that.sliding_tmp = 1;
			if( ( type == -1 && current_left == 0 ) ){
				let img = imgs.childNodes[imgs.childElementCount-1];
				imgs.removeChild(img);
				img = img.cloneNode(true);
				img.style.marginLeft =  margin * type + "px";
				img.onloadstart = function(){
					img.style.marginLeft = "0px";
				}
				imgs.insertBefore(img,imgs.childNodes[0]);
				setTimeout(function(){
					img.style.marginLeft = "0px";
				}, 10);
				that.removeTimer = setTimeout(function(){
					that.sliding_tmp = 0;
				},500);
				return;
			} else if ( ( type == 1 && current_left >= -margin * ( imgs.childElementCount - 1 ) ) ){
				let img = imgs.childNodes[0];
				imgs.appendChild(img.cloneNode(true))
				img.style.transition = "margin-left .5s";
				img.style.marginLeft = -margin + "px";
				that.removeTimer = setTimeout(function(){
					that.sliding_tmp = 0;
					imgs.removeChild(imgs.firstChild)
				},500);
				return;
			}
			imgs.style.left = current_left - margin * type + "px";
		}
	},
	init : function(){
		let that = this;
		let post_slider = $("div");
		post_slider.id = "post_slider";
		that.addListener(document,'touchmove',function(event){
			event.preventDefault();
		});
	
		let slide_imgs = $("div");
		slide_imgs.style.left = "0px";
		slide_imgs.id = "slide_imgs";
	
		let slide_count = 4;
		for( let i = 1; i <= slide_count; ++i ){
			let slide = $("div");
			slide.className = "slide";
			let colorcode = "";
			for( let j = 0; j < 3; ++j ){
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
		let slide1 = $("img");
		slide1.className = "slide";
		slide1.src = "/img/main/img_main.png";
		slider.appendChild(slide1);
				*/
	
		post_slider.onmouseover = function(){
			let arrows = $(".slide_arrow");
			for( let i = 0; i < arrows.length; ++i ){
				arrows[i].style.display = "block";
			}
		}
		post_slider.onmouseout = function(){
			let arrows = $(".slide_arrow");
			for( let i = 0; i < arrows.length; ++i ){
				arrows[i].style.display = "none";
			}
		}
		let slide_box = $("div");
		slide_box.id = "slide_box";
	
		let slide_logo = $("div");
		slide_logo.id = "slide_logo";
		slide_box.appendChild(slide_logo);
	
		let slide_line = $("div");
		slide_line.id = "slide_line";
		slide_box.appendChild(slide_line);
	
		let slide_text = $("text");
		//slide_text.innerHTML = "Lorem ipsum dolor sit amet, conectetur adipisicing elit<br>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
		slide_box.appendChild(slide_text);
	
		let slide_btn = $("div");
		slide_btn.id = "slide_btn";
		slide_btn.onclick = function(){
			location.href = "/register";
		}
		slide_btn.innerText = "지금 시작하기";
		slide_box.appendChild(slide_btn);
	
		post_slider.appendChild(slide_box);
		let slide_left = $("div");
		slide_left.className = "slide_arrow";
		slide_left.id = "slide_left";
		post_slider.appendChild(slide_left);
	
		slide_left.onclick = function(){
			that.sliding(-1);
			clearInterval(that.sliderTimer);
			that.sliderTimer = setInterval(that.sliding,3000);
		}
	
		let slide_right = $("div");
		slide_right.id = "slide_right";
		slide_right.className = "slide_arrow";
		post_slider.appendChild(slide_right);
	
		slide_right.onclick = function(){
			clearInterval(that.sliderTimer);
			that.sliderTimer = setInterval(that.sliding,3000);
			that.sliding(1);
		}
	
		if( $('#post_wrap') ){
			$('#wrap_mid').removeChild($('#post_wrap'));
		}
		document.body.appendChild(post_slider);
		that.sliderTimer = setInterval(that.sliding,3000);
	},
    exit : function(){
        for( let i = 0; i < this.listeners.length; ++i ){
            let h = this.listeners[i];
            h.element.removeEventListener( h.event, h.handle, false );
        }
		clearInterval(this.sliderTimer);
		clearInterval(this.removeTimer);
		document.body.removeChild($('#post_slider'));
    }
};
