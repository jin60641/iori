let DragOut = function(evt){
	evt.stopPropagation();
	evt.preventDefault();
	let obj = evt.target.style;
	obj.margin = "";
	obj.borderTop="";
	obj.borderBottom="";
	obj.borderLeft="";
	obj.borderRight="";
}
let DragOver = function(evt){
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
	let obj = evt.target.style;
	obj.border="1px dashed #bbb";
}
var lastClickImg;
let fileArray = [];
let imageArray = [];
let imageTimeArray = [];
let colorArray = [];
var srcArray = [];

function openfile(event){
	if( event.dataTransfer ){
		event.dataTransfer.dropEffect = 'copy';
	}
	let input = event.target;
	let output = $('#img_preview');
	let files = [];
	if( input.files ){
		files = input.files;
	} else {
		if( event.clipboardData ){
			let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
			for( let i = 0; i < items.length; ++i ){
				if( items[i].type.indexOf("image") === 0 ){
					files.push( items[i].getAsFile() );
				}
			}
		} else {
			files = event.dataTransfer.files;
		}
	}
	if( files.length ){
		event.stopPropagation();
		event.preventDefault();
	}
	for( let i = 0; i < files.length; ++i ){
		if( fileArray.length > 20 ){
			alert("사진은 최대 20장까지만 업로드 가능합니다.");
			return 0;
		}
		fileArray.push(files[i]);
		colorArray.push({ r : Math.floor(Math.random()*255), g : Math.floor(Math.random()*255),b : Math.floor(Math.random()*255)});

		let reader = new FileReader();
		reader.addEventListener("load",function(e){
			let imgbox = $('div');
			imgbox.id = "imgbox_" + ( output.childElementCount + 1 );
			imgbox.className = "imgbox";
			imgbox.addEventListener("dragstart",function(evt){
				evt.stopPropagation();
				evt.preventDefault();
				return false;
			});
			imgbox.onclick = function (e) {
				e.stopPropagation();
				var imgIndex = Number(this.id.substring(7,this.id.length)) - 1;
				lastClickImg = imgIndex;
				this.style.backgroundColor = '#FFF4E9';
			}
			let dataURL = e.target.result;
			console.log("@@");
			output.appendChild(imgbox);
			imgbox.style.background="url('"+dataURL+"') center center no-repeat"
			srcArray.push(dataURL);
			imgbox.style.backgroundSize="cover";
			imgbox.style.backgroundClip="content-box";
			imgbox.addEventListener('drop', function(e){
				e.preventDefault();
				e.stopPropagation();
			}, false);
			imgbox.addEventListener('paste', function(e){
				e.preventDefault();
				e.stopPropagation();
			}, false);
			imgbox.addEventListener('dragover', function(e){
				e.preventDefault();
				e.stopPropagation();
			}, false);
			imgbox.addEventListener('dragleave', function(e){
				e.preventDefault();
				e.stopPropagation();
			}, false);
			let deletebtn = $("div");
			deletebtn.className='imgbox_delete';
			deletebtn.onclick = function(){
				alert("개발중");
				// delte img
			};
			imgbox.appendChild(deletebtn);
			if(input.type=="file"){
				input.value="";
			}
		});
		reader.readAsDataURL(files[i]);

	}
}
window.addEventListener('click', function(){
	lastClickImg = undefined;
});
