(function($){
  $(function(){
    $('.button-collapse').sideNav();
    $('.modal').modal({
      ready: function(modal, trigger) {
        $('ul.tabs').tabs();
      }
    });
  }); // end of document ready
})(jQuery); // end of jQuery name space