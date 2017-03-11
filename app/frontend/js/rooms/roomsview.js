var roomsView = (function () {
    "use strict";

    var roomsView = {};
    var socket;

    document.getElementById('btn-create-game').onclick = function(e){
        var event = new CustomEvent('onCreateRoom', {
            detail: {}
        });
        document.dispatchEvent(event);
    };

    document.getElementById('form-join-game').onsubmit = function(e){
        var event = new CustomEvent('onRoomJoin', {
            detail: {
                roomId: document.getElementById('room-id-input').value;
            }
        });
        document.dispatchEvent(event);
    };

    socket.on('full_users', function(data){
        window.location = '/index.html';
    });

    roomsView.roomCreateSuccess = function(roomId){
        socket = io.connect();
        document.getElementById('room-id').value = roomId;
    };

    roomsView.roomJoinSuccess = function(){
        //eventually change this to waiting screen
        socket = io.connect();
        socket.emit('join_room');
        // window.location = '/index.html';
    };

    roomsView.displayToast = function (msg) {
        Materialize.toast(msg, 5000);
    }

    return roomsView;

}());