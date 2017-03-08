(function(model, view) {
  "use strict";
	document.addEventListener('onSignIn', function(e) {
		model.signIn(e.detail, function(resp, err) {
			if (err) return view.showError(err);
      window.location = '/index.html';
		});
	});
  
}(model, view));