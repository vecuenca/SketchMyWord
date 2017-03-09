(function(model, view) {
  "use strict";
	document.addEventListener('onSignIn', function(e) {
		model.signIn(e.detail, function(resp, err) {
			if (err) return view.displayToast(err);
      window.location = '/index.html';
		});
	});

	document.addEventListener('onSignUp', function(e) {
		model.signUp(e.detail, function(resp, err) {
			if (err) return view.displayToast(err);
      view.signUpSuccess();
		});
	});
  
}(model, view));