var preloaderView = (function(util) {
    "use strict";

    var preloaderView = {};

    preloaderView.display = function() {
        $('#preloader').show();
    };

    preloaderView.hide = function() {
        $('#preloader').hide();
    };

    return preloaderView;
}(util));