var revel = revel || {};

revel.initLogin = function() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in.
          const displayName = user.displayName;
          const email = user.email;
          const photoURL = user.photoURL;
          const phoneNumber = user.phoneNumber;
          const isAnonymous = user.isAnonymous;
          const uid = user.uid;
          // ...
          console.log("The user is signed in ", uid);
          console.log("displayName :>> ", displayName);
          console.log("email :>> ", email);
          console.log("photoURL :>> ", photoURL);
          console.log("phoneNumber :>> ", phoneNumber);
          console.log("isAnonymous :>> ", isAnonymous);
          console.log("uid :>> ", uid);
        } else {
          // User is signed out.
          // ...
          console.log("There is no user signed in");
        }
    });
    
    const inputEmailEl = document.querySelector("#inputEmail");
    const inputPasswordEl = document.querySelector("#inputPassword");
    
    document.querySelector("#createAccountButton").onclick = (event) => {
        console.log(`Create account for email: ${inputEmailEl.value} password: ${inputPasswordEl.value}`);
    
        firebase.auth().createUserWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Create account error ", errorCode, errorMessage);
            // ...
        });
    };
    document.querySelector("#logInButton").onclick = (event) => {
        console.log(`Log in for email: ${inputEmailEl.value} password: ${inputPasswordEl.value}`);
    
        firebase.auth().signInWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            console.log("Existing account log in error ", errorCode, errorMessage);
        });
    };
    
    revel.startFirebaseUI();
}

revel.startFirebaseUI = function() {
	// FirebaseUI config.
	const uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ]
      };

      // Initialize the FirebaseUI Widget using Firebase.
      const ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
}

revel.initLogin();
