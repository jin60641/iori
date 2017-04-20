
'use strict';

(function () {
	var css_href = '/css/webfont_woff.css';
	var css_href_normal = '/css/webfont_normal.css';
	if ( (window.localStorage && localStorage.font_css_cache) || document.cookie.indexOf('font_css_cache') > -1  ) {
		injectFontsStylesheet();
	} else {
		window.addEventListener("load", injectFontsStylesheet);
	}

	function isFileCached(href){
		return (
			window.localStorage
			&& localStorage.font_css_cache
			&& (localStorage.font_css_cache_file === href)
		);
	}

	function isOldBrowser(){
		return ( !window.localStorage || !window.XMLHttpRequest );
	}

	function injectFontsStylesheet() {
		if (isOldBrowser()) {
			var stylesheet = document.createElement('link');
			stylesheet.href = css_href_normal;
			stylesheet.rel = 'stylesheet';
			stylesheet.type = 'text/css';
			document.getElementsByTagName('head')[0].appendChild(stylesheet);
			document.cookie = "font_css_cache";
		} else {
			if (isFileCached(css_href)) {
				injectRawStyle(localStorage.font_css_cache);
			} else {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", css_href, true);
				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4) {
						injectRawStyle(xhr.responseText);
						localStorage.font_css_cache = xhr.responseText;
						localStorage.font_css_cache_file = css_href;
					}
				};
				xhr.send();
			}
		}
	}
	function injectRawStyle(text) {
		var style = document.createElement('style');
		style.setAttribute("type", "text/css");
		if (style.styleSheet) {
			style.styleSheet.cssText = text;
		} else {
			style.innerHTML = text;
		}
		document.getElementsByTagName('head')[0].appendChild(style);
	}

}());
