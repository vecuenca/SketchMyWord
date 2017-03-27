(function(model, view, util) {
  "use strict";
	document.addEventListener('onSignIn', function(e) {
		model.signIn(e.detail)
		.then(resp =>{
			window.location = '/index.html';
		})
		.catch(util.displayToast);
	});

	document.addEventListener('onSignUp', function(e) {
		model.signUp(e.detail).then(resp => {
			view.signUpSuccess();
		}).catch(util.displayToast);

	});
  
}(model, view, util));