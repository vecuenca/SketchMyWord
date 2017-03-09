/*jshint esversion: 6 */
var view = (function() {
  "use strict";

  var view = {};

	view.displayToast = function(msg) {
		Materialize.toast(msg, 5000);
	}

  return view;

}());