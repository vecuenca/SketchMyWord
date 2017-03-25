var preloaderView = (function(util) {
    "use strict";

    var preloaderView = {};

    preloaderView.display = () => {
        $('#preloader').show();
    };

    preloaderView.hide = () => {
        $('#preloader').hide();
    };

    return preloaderView;
}(util));