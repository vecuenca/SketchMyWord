/*jshint esversion: 6 */
var gameView = (function() {
  "use strict";

  var gameView = {};

  gameView.onload = function() {
    // Nothing yet...
    return;
  }

  gameView.display = function() {
    $('#game-area').show();
  }

  gameView.hide = function() {
    $('#game-area').hide();
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

  return gameView;

}());