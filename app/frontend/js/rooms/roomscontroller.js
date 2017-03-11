(function (model, view) {
    "use strict";
    document.addEventListener('onCreateRoom', function (e) {
        model.createRoom(e.detail, function (err, resp) {
            if (err) return view.displayToast(err);
            view.roomCreateSuccess(resp.roomId);
        })
    });

    document.addEventListener('onRoomJoin', function (e) {
        model.joinRoom(e.detail, function (err, resp) {
            if (err) return view.displayToast(err);
            view.roomJoinSuccess();
        })
    });

}(model, view));