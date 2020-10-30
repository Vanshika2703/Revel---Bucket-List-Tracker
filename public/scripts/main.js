
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
		//	const list = new List(1,document.querySelector("#inputTitle").value,document.querySelector("#inputItem").value);
			const title = document.querySelector("#inputTitle").value;
			const items = document.querySelector("#inputItem").value;
			
		});

		$("#newListModal").on("show.bs.modal", (event) => {
			document.querySelector("#inputTitle").value = "";
			document.querySelector("#inputItem").value = "";
		});
	}
	updateList() {
		//make a new bucket list container
		const newList = htmlToElement('<div id="listContainer"></div>');
		//fill them with list cards
			const newCard = this._createCard(list.title, list.item);
			newList.appendChild(newCard);
		//remove the old one
		const oldList = document.querySelector("#listContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// put in the new one
		oldList.parentElement.appendChild(newList);
	}

	_createCard(title, items){
		return htmlToElement(`<div class="card">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${items}</h6>
        </div>
      </div>`);
	}
	_createItems(items){
		let itemHtml = "";
		items.forEach(item => {
			itemHtml += `<label> <input type="checkbox"> <h5>${item}</h5> </label>`
		});
		return itemHtml;
	}
   }

revel.List = class {
	constructor(id, desc, pic, isChecked, journalEntry) {
	  this.id = id;
	  this.desc = desc;
	  this.pic = pic;
	  this.isChecked = isChecked;
	  this.journalEntry = journalEntry;
	}
}

revel.Item = class {
	constructor(id, title, items) {
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
};

revel.checkForRedirects = function() {
	if(revel.fbAuthManager.isSignedIn && revel.onIndex) {
		location.href = "/main.html";
	}
	if(!revel.fbAuthManager.isSignedIn && !revel.onIndex) {
		location.href = "/";
	}
};

revel.main = function () {
	console.log("Ready");
	
	revel.fbAuthManager = new revel.FbAuthManager();
	revel.fbAuthManager.beginListening(()=>{
		console.log("auth change callback fired.");
		console.log("sign in: ", revel.fbAuthManager.isSignedIn);

		revel.checkForRedirects();

		revel.initializePage();
	});
};

revel.main();
