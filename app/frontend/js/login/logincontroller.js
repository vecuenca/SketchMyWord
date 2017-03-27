(function(model, view, util) {
  "use strict";
	document.addEventListener('onSignIn', function(e) {
		model.signIn(e.detail, function(err, resp) {
			if (err) return util.displayToast(err);
      window.location = '/index.html';
		});
	});

	document.addEventListener('onSignUp', function(e) {
		model.signUp(e.detail).then(resp => {
			view.signUpSuccess();
		}).catch(util.displayToast);
	});
  
}(model, view, util));