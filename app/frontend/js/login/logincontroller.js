(function(model, view) {
  "use strict";
	document.addEventListener('onSignIn', function(e) {
		model.signIn(e.detail, function(resp, err) {
			if (err) return view.displayError(err);
      window.location = '/index.html';
		});
	});

	document.addEventListener('onSignUp', function(e) {
		model.signUp(e.detail, function(resp, err) {
			if (err) return view.displayError(err);
      view.signUpSuccess();
		});
	});
  
}(model, view));