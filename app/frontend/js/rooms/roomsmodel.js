var model = (function(){
    "use strict";

    var headers = new Headers({
		'Content-Type': 'application/json'
	});

    var model = {};

    model.createRoom = function(data, callback) {
        fetch('/game/', {
            method: 'put',
            credentials: 'include',
            headers: headers
        }).then(function(resp){
            if (resp.status == 403){
                callback(resp, null);
            }else{
                callback(null, resp);
            }
        }).catch(function(err){
            callback(err, null);
        });
    };

    model.joinRoom = function(data, callback) {
        fetch('/game/' + data.roomId + '/', {
            method: 'post',
            credentials: 'include',
            headers: headers
        }).then(function(resp){
            if(resp.status == 403 || resp.status == 400){
                callback(resp, null);
            }else{
                callback(null, resp);
            }
        }).catch(function(err){
            callback(err, null);
        });
    };

    return model;
}());