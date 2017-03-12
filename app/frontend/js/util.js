/*jshint esversion: 6 */
var util = (function() {
  "use strict";

  var util = {};

	util.displayToast = function(msg, lifetime = 5000) {
		Materialize.toast(msg, lifetime);
	}

	// taken from http://stackoverflow.com/questions/5047346/converting-strings-like-document-cookie-to-objects
  util.str_obj = function(str) {
    str = str.split(', ');
    var result = {};
    for (var i = 0; i < str.length; i++) {
      var cur = str[i].split('=');
      result[cur[0]] = cur[1];
    }
    return result;
  }

  return util;

}());