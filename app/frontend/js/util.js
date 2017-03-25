/*jshint esversion: 6 */
var util = (function () {
  "use strict";

  var util = {};

  util.displayToast = function (msg, lifetime = 5000) {
    Materialize.toast(msg, lifetime);
  }

  util.deleteCookie = function (name) {
    var cookieString = name + '=';

    var expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() - 86400 * 1000);
    cookieString += ';max-age=0';
    cookieString += ';expires=' + expiryDate.toUTCString();
    document.cookie = cookieString;
  }

  // taken from http://stackoverflow.com/questions/5047346/converting-strings-like-document-cookie-to-objects
  util.str_obj = function (str) {
    str = str.split('; ');
    var result = {};
    for (var i = 0; i < str.length; i++) {
      var cur = str[i].split('=');
      result[cur[0]] = cur[1];
    }
    return result;
  }

  util.getUsername = function () {
    return util.str_obj(document.cookie).username;
  }

  util.getRoomId = function () {
    return util.str_obj(document.cookie).roomId;
  }

  return util;

}());