var socket;

socket = io.connect('/');
socket.on( 'connect_failed', function(){
});
socket.onbeforeunload = function(){
}
socket.on( 'disconnect', function(){
});


