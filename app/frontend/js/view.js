(function (roomView, gameView) {
    "use strict";
    // Load each view component
    window.onload = function() {
			roomView.onload();
			gameView.onload();
    };
} (roomView, gameView));