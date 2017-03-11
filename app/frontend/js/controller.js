(function(model, roomView, roomModel, gameView, gameModel){
    "use strict";

    document.addEventListener('onCreateRoom', function (e) {
        roomModel.createRoom(e.detail, function (err, resp) {
            if (err) return roomView.displayToast(err);
            roomView.roomCreateSuccess(resp.roomId);
        })
    });

    document.addEventListener('onRoomJoin', function (e) {
        roomModel.joinRoom(e.detail, function (err, resp) {
            if (err) return roomView.displayToast(err);
            roomView.roomJoinSuccess();
        })
    });

}(model, roomView, roomModel, gameModel, gameView));