
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
revel.pages = {
	"FRIENDS" : "friends",
	"EXPANDED_LIST" : "expandedList",
	"INDEX" : "index",
	"PROFILE" : "profile",
	"TIMELINE" : "timeline",
	"MAIN" : "main"
}


//From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}



revel.ListPageController = class {
	constructor() {
		document.querySelector("#back").addEventListener("click",(event)=>{
			const title = document.querySelector("#inputTitle").value;
			const items = [];
			document.querySelectorAll("#itemsBox div.row.checkbox input.inputItem").forEach(item => {
				items.push(item.value);				
			});
			console.log(`title: ${title}, item: ${items}`)
			revel.fbBucketListManager.addList(title,items);
		});

		$("#newListModal").on("show.bs.modal", (event) => {
			document.querySelector("#inputTitle").value = "";
			document.querySelector(".inputItem").value = "";
		});

		document.querySelector("#addItem").addEventListener("click",(event)=>{
			console.log("clicked add item");
			document.querySelector("#itemsBox").appendChild(this._createInputItem());
		  console.log("new list item entry place added");
		});
		//start listening
		revel.fbBucketListManager.beginListening(this.updateList.bind(this));
	}
	async updateList() {
		console.log(`${revel.fbBucketListManager.length}`);
		//make a new quote list container
		const newList = htmlToElement('<div id="listContainer"></div>');
		//fill them with quote cards
		if(revel.fbBucketListManager.length == 0){
			newList.appendChild(this._createEmpty());
		}else{
			for(let i = 0; i<revel.fbBucketListManager.length;i++){
				const bl = await revel.fbBucketListManager.getListAtIndex(i);
				const newCard = this._createCard(bl.title, bl.items);
				// newCard.onclick = (event) =>{
				// 	rhit.storage.setMovieQuoteId(bl.id);
				// 	window.location.href = "/moviequote.html";
				// };
				newList.appendChild(newCard);
			}
		}
		//remove the old one
		const oldList = document.querySelector("#listContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// put in the new one
		oldList.parentElement.appendChild(newList);
	}

	_createCard(title, items){
		console.log("title: ", title);
		console.log("items: ", items);
		return htmlToElement(`<div class="card">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <div class="checkbox col">
		  	${this._createItems(items)}
          </div>
      </div>`);
	}
	_createItems(items){
		let itemHtml = "";
		items.forEach(item => {
			itemHtml += `<div class="row checkbox"> <label> <input type="checkbox" class="item"> <h5>${item[revel.FB_KEY_DESCRIPTION]}</h5> </label> </div>`
		});
		return itemHtml;
	}
	
	_createInputItem(){
		return htmlToElement(`<div class="row checkbox"> 
				<label> <input type="checkbox" class="item" style="width:20px;height:20px;"> 
					<input type="text" class="form-control inputItem"> 
				</label> 
			</div>`);
	}

	_createEmpty(){
		return htmlToElement(`<div class="emptyPage justify-content-center">
        <br><br>
        You have no lists
        <br>
        Click the '+' icon to add a new list
        <br><br>
      </div>`);
	}
}

revel.expandedListController = class {
	constructor() {
		// document.querySelector("#submitAddQuote").onclick = (event) =>{}
		document.querySelector("#back").addEventListener("click",(event)=>{
			//const list = newList(1,document.querySelector("#inputTitle").value,document.querySelector("#inputItem").value);
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
	if(revel.fbAuthManager.isSignedIn && revel.page == revel.pages.INDEX) {
		location.href = "/main.html";
	}
	if(!revel.fbAuthManager.isSignedIn && revel.page != revel.pages.INDEX) {
		location.href = "/";
	}
};

revel.FbBucketListManager = class {
	constructor() {
	  this._documentSnapshots = [];
	  this._ref = firebase.firestore().collection(revel.FB_COLLECTION_LISTS);
	  this._unsubscribe = null;
	}
	addList(title,items) {  
		console.log(`${title}, ${items}`);	
		// Add a new document with a generated id.\

		let addItems = {
			[revel.FB_KEY_TITLE] : title,
			[revel.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now()
		}
		this._ref.add(addItems)
		.then(function(docRef) {
			let _itemsRef = docRef.collection(revel.FB_COLLECTION_ITEMS);
			items.forEach(item => {
				_itemsRef.add({
				[revel.FB_KEY_DESCRIPTION] : item,
				[revel.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now(),
				[revel.FB_KEY_PICTURE] : null,
				[revel.FB_KEY_JOURNAL] : null,
				[revel.FB_KEY_ISCHECKED] : false}
				)
			});
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
		});
	}
	beginListening(changeListener) {    
		this._unsubscribe = this._ref
		.orderBy(revel.FB_KEY_LAST_TOUCHED, "desc")
		.limit(50)
		.onSnapshot((querySnapshot) => {
				console.log("BucketLists updated!");
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
	async getListAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		console.log('myDoc title :>> ', docSnapshot.get(revel.FB_KEY_TITLE));
		const items = [];
		await firebase.firestore().collection(revel.FB_COLLECTION_LISTS).doc(docSnapshot.id)
			.collection(revel.FB_COLLECTION_ITEMS).get()
			.then(response =>{
				response.forEach(x=> items.push({
					id: x.id,
					...x.data()
				}));
			});
		
		console.log('items :>> ', items);
		const bl = {title: docSnapshot.get(revel.FB_KEY_TITLE),
			items: items};
		return bl;
	}
   }

revel.main = function () {
	console.log("Ready");

	if(document.querySelector("#listPage")){
		console.log("You are on list page");
		revel.fbBucketListManager = new revel.FbBucketListManager();
		new revel.ListPageController();
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
