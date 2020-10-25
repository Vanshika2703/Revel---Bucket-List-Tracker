
var rhit = rhit || {};

//From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

rhit.ListPageController = class {
	constructor() {
		// document.querySelector("#submitAddQuote").onclick = (event) =>{}
		document.querySelector("#back").addEventListener("click",(event)=>{
			const list = newList(1,document.querySelector("#inputTitle").value,document.querySelector("#inputItem").value);
			const title = document.querySelector("#inputTitle").value;
			const item = document.querySelector("#inputItem").value;
			
		});

		$("#newListModal").on("show.bs.modal", (event) => {
			document.querySelector("#inputTitle").value = "";
			document.querySelector("#inputItem").value = "";
		});
	}
	updateList() {
		//make a new quote list container
		const newList = htmlToElement('<div id="listContainer"></div>');
		//fill them with quote cards
			const newCard = this._createCard(list.title, list.item);
			newList.appendChild(newCard);
		//remove the old one
		const oldList = document.querySelector("#listContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// put in the new one
		oldList.parentElement.appendChild(newList);
	}

	_createCard(title, item){
		return htmlToElement(`<div class="card">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${item}</h6>
        </div>
      </div>`);
	}
   }

rhit.List = class {
	constructor(id, title,items) {
	  this.id = id;
	  this.title = title;
	  this.items = items;  
	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(()=>{
		console.log("auth change callback fired.");
		console.log("sign in: ", rhit.fbAuthManager.isSignedIn);

		rhit.checkForRedirects();

		rhit.initializePage();
	});
};

rhit.initializePage = function() {
	const queryString = location.search;
	const urlParams = new URLSearchParams(queryString);

	if(document.querySelector("#mainPage"))  {
		console.log("main page");
		const uid = urlParams.get("uid");
		console.log("main page for ", uid);
	}

	if(document.querySelector("#loginPage"))  {
		console.log("login page");
		new rhit.LoginPageController();
	}
};

rhit.checkForRedirects = function() {
	if(document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		location.href = "/main.html";
	}
	if(!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		location.href = "/";
	}
};

rhit.LoginPageController = class {
	constructor() {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
			  // User is signed in.
			  var displayName = user.displayName;
			  var email = user.email;
			  var photoURL = user.photoURL;
			  var phoneNumber = user.phoneNumber;
			  var isAnonymous = user.isAnonymous;
			  var uid = user.uid;
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
	
		rhit.startFirebaseUI();
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user=null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user)=>{
			this._user = user;
			changeListener();
		})
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.startFirebaseUI = function() {
	// FirebaseUI config.
	var uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ]
      };

      // Initialize the FirebaseUI Widget using Firebase.
      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.main();
