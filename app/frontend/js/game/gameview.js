/*jshint esversion: 6 */
var view = (function() {
  "use strict";

  var view = {};

	window.onload = function() {
		var cookieUser = str_obj(document.cookie).username;
		document.getElementById('header-username').innerHTML += cookieUser;
	}

	view.displayToast = function(msg) {
		Materialize.toast(msg, 5000);
	}

	// taken from http://stackoverflow.com/questions/5047346/converting-strings-like-document-cookie-to-objects
  function str_obj(str) {
    str = str.split(', ');
    var result = {};
    for (var i = 0; i < str.length; i++) {
      var cur = str[i].split('=');
      result[cur[0]] = cur[1];
    }
    return result;
  }

  return view;

}());