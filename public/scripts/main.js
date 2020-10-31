
var revel = revel || {};

revel.FB_COLLECTION_LISTS = "lists";
revel.FB_KEY_TITLE = "Title";
revel.FB_KEY_COLOR = "color";
revel.FB_KEY_LAST_TOUCHED = "lastTouched";
revel.FB_COLLECTION_ITEMS = "Items";
revel.FB_KEY_DESCRIPTION = "Description";
revel.FB_KEY_PICTURE = "Picture";
revel.FB_KEY_ISCHECKED = "isChecked";
revel.FB_KEY_JOURNAL = "journalEntry";
revel.fbBucketListManager = null;


//From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

revel.ListPageController = class {
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
          ${this._createItems(items)}
        </div>
      </div>`);
	}
	_createItems(items){
		let itemHtml = "";
		items.forEach(item => {
			itemHtml += `<div class="row checkbox"> <label> <input type="checkbox" class="item"> <h5>${item}</h5> </label> </div>`
		});
		return itemHtml;
	}         
}

revel.detailPageController = class {
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
          ${this._createItems(items)}
        </div>
      </div>`);
	}
	_createItems(items){
		let itemHtml = "";
		items.forEach(item => {
			itemHtml += `<div class="row checkbox"> <label> <input type="checkbox" class="item"> <h5>${item}</h5> </label> </div>`
		});
		return itemHtml;
	}         
}

revel.List = class {
	constructor(id, title,items) {
	  this.id = id;
	  this.title = title;
	  this.items = items;  
	}
}

revel.initializePage = function() {
	const queryString = location.search;
	const urlParams = new URLSearchParams(queryString);

	if(document.querySelector("#mainPage"))  {
		console.log("main page");
		const uid = urlParams.get("uid");
		console.log("main page for ", uid);
	}
};

revel.FbAuthManager = class {
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
	get photoURL() {
		return this._user.photoURL;
	}
};

revel.checkForRedirects = function() {
	if(revel.fbAuthManager.isSignedIn && revel.onIndex) {
		location.href = "/main.html";
	}
	if(!revel.fbAuthManager.isSignedIn && !revel.onIndex) {
		location.href = "/";
	}
};

revel.FbBucketListManager = class {
	constructor() {
	  this._documentSnapshots = [];
	  this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_LISTS);
	  this._unsubscribe = null;
	}
	add(quote, movie) {  
		console.log(`${quote}, ${movie}`);	
		// Add a new document with a generated id.
		this._ref.add({
			[rhit.FB_KEY_QUOTE] : quote,
			[rhit.FB_KEY_MOVIE] : movie,
			[rhit.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now(),
		})
		.then(function(docRef) {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
		});
	}
	beginListening(changeListener) {    
		this._unsubscribe = this._ref
		.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc")
		.limit(50)
		.onSnapshot((querySnapshot) => {
				console.log("MovieQuote update!");
				this._documentSnapshots = querySnapshot.docs;
				changeListener();
			});
		
	}
	stopListening() {    
		this._unsubscribe();
	}
	get length() {    
		return this._documentSnapshots.length;
	}
	getMovieQuoteAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.MovieQuote(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_QUOTE),
			docSnapshot.get(rhit.FB_KEY_MOVIE));
		return mq;
	}
   }

revel.main = function () {
	console.log("Ready");

	if(document.querySelector("#listPage")){
		console.log("You are on list page");
		revel.fbBucketListManager = new revel.FbBucketListManager();
		// new rhit.ListPageController();
	}
	
	revel.fbAuthManager = new revel.FbAuthManager();
	revel.fbAuthManager.beginListening(()=>{
		console.log("auth change callback fired.");
		console.log("sign in: ", revel.fbAuthManager.isSignedIn);

		revel.checkForRedirects();

		revel.initializePage();
	});
};

revel.main();
