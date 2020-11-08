
var revel = revel || {};
revel.storage = revel.storage || {};

revel.FB_COLLECTION_LISTS = "lists";
revel.FB_KEY_TITLE = "Title";
revel.FB_KEY_COLOR = "color";
revel.FB_KEY_LAST_TOUCHED = "lastTouched";
revel.FB_COLLECTION_ITEMS = "Items";
revel.FB_KEY_DESCRIPTION = "Description";
revel.FB_KEY_PICTURE = "Picture";
revel.FB_KEY_ISCHECKED = "isChecked";
revel.FB_KEY_JOURNAL = "journalEntry";
revel.FB_KEY_USERS = "users";
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
			const blId = revel.storage.getbucketListId();
			const title = document.querySelector("#inputTitle").value;
			const items = [];
			document.querySelectorAll("#itemsBox div.row.checkbox .input").forEach(item => {
				items.push({Description: item.value, id: item.id});				
			});
			console.log('items :>> ', items);
			if(blId==0){
				console.log('blId :>> ', blId);
				if(title!=""){
			console.log(`title: ${title}, item: ${items}`)
			revel.fbBucketListManager.addList(title,items);
			revel.page = revel.pages.MAIN;
			revel.showMainPageContents();
			}
			else if(items.length!=0 && title=="" && items[0]!=""){
				console.log('items.length :>> ', items.length);
				console.log('items :>> ', items);
				alert("please fill in the title before you save")
			}else{
				revel.page = revel.pages.MAIN;
				revel.showMainPageContents();
			}
		}
			else{
				console.log("existing");
				revel.fbBucketListManager.update(blId,title,items);
				revel.page = revel.pages.MAIN;
				revel.showMainPageContents();
			}
		});

		document.querySelector("#fab").addEventListener("click",(even)=>{
			sessionStorage.clear();
		//	document.querySelector("#expandedList").replaceChild("#expandedList .card-body", this._createEmptyExpandedList());
			revel.page = revel.pages.EXPANDED_LIST;
			revel.showMainPageContents();
		});

		document.querySelector("#addItem").addEventListener("click",(event)=>{
			console.log("clicked add item");
			document.querySelector("#itemsBox").appendChild(this._createInputItem());
		  console.log("new list item entry place added");
		});

		document.querySelector("#deleteButton").addEventListener("click",(event)=>{
			console.log("delete button clicked");
			const blId = revel.storage.getbucketListId();
			if(blId == 0){
				alert("this list can't be deleted")
			}else{
				revel.fbBucketListManager.delete(blId);
			}
			revel.page = revel.pages.MAIN;
			revel.showMainPageContents();
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
				newCard.onclick = (event) => {
					if(revel.page == revel.pages.MAIN && !event.switchingToMain && 
						!Array.from(document.querySelectorAll(".card-body>div")).some(x=>x.contains(event.target))){
						event.switchingToExpanded = true;
						revel.storage.setbucketListId(bl.id);
						revel.page = revel.pages.EXPANDED_LIST;
						document.querySelector("#expandedList .card-title").value = bl.title;

						let itemsBoxHtml = this._createItems(bl.items);
						document.querySelector("#itemsBox").innerHTML = itemsBoxHtml;

						revel.showMainPageContents();
					}
				}
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
			itemHtml += this._createItem(item);
		});
		return itemHtml;
	}

	_createItem(item){
		return `<div class="row checkbox"> <label> <input type="checkbox" class="item" onchange="doalert(this)"> <span class="checkbox-decorator"><span class="check"></span></span> <input id="${item.id}" class="input" value="${item.Description}"> </label> </div>`
	}
	
	_createInputItem(){
		return htmlToElement(`<div class="row checkbox"> 
			<label> 
				<input type="checkbox" class="item">
				<span class="checkbox-decorator"><span class="check"></span></span> 
				<input class="input" placeholder="ENTER BUCKET LIST ITEM"> 
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

	_createEmptyExpandedList(){
		return htmlToElement(`<div class="card-body">
        <button id="back" type="button" class="btn btn-dark">
          <i class="material-icons justify-content-left">arrow_back</i>
        </button>
        <button type="button" class="close" aria-label="Close" data-toggle="modal" data-target="#confirmDeleteModal">
          <i class="material-icons justify-content-right">delete</i>
        </button>
        <input class="input card-title" id="inputTitle" placeholder="ENTER TITLE">
        <div id="itemsBox" class="checkbox col list-items">
          <div class="row checkbox"> <label> <input type="checkbox" class="item"> <input class="input" placeholder="ENTER BUCKET LIST ITEM"> </label> </div>
        </div>

        <button id="addItem" type="button" class="btn">
          <i class="material-icons">add</i>
        </button>
      </div>
    `)
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

	if(document.querySelector("#listPage")){
		console.log("You are on list page");
		revel.fbBucketListManager = new revel.FbBucketListManager();
		new revel.ListPageController();
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
	  this._ref = firebase.firestore().collection(revel.FB_KEY_USERS).doc(revel.fbAuthManager.uid).collection(revel.FB_COLLECTION_LISTS);
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
		await this._ref.doc(docSnapshot.id)
			.collection(revel.FB_COLLECTION_ITEMS).get()
			.then(response =>{
				response.forEach(x=> items.push({
					id: x.id,
					...x.data()
				}));
			});
		
		console.log('items :>> ', items);
		const bl = {id:docSnapshot.id ,title: docSnapshot.get(revel.FB_KEY_TITLE),
			items: items};
		return bl;
	}

	delete(id) {
		return this._ref.doc(id).delete();
	}

	update(id,title,items) {
		console.log(`hihihihi ${title}, ${items}`);	
		this._ref.doc(id).update({
			[revel.FB_KEY_TITLE]: title,
			[revel.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now()
		})
		.then(function() {
			console.log("Document successfully updated!");
		})
		.catch(function (error) {
			// The document probably doesn't exist.
			console.error("Error updating document: ", error);
		});

		items.forEach(item => {
			if(item.id)
				this._ref.doc(id).collection(revel.FB_COLLECTION_ITEMS).doc(item.id)
				.update({
					[revel.FB_KEY_DESCRIPTION] : item.Description,
					[revel.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now(),
					[revel.FB_KEY_PICTURE] : null,
					[revel.FB_KEY_JOURNAL] : null,
					[revel.FB_KEY_ISCHECKED] : false})
				.then(function() {
					console.log("Item successfully updated!");
				})
				.catch(function (error) {
					// The document probably doesn't exist.
					console.error("Error updating item: ", error);
				});
			else
				this._ref.doc(id).collection(revel.FB_COLLECTION_ITEMS)
				.add({
					[revel.FB_KEY_DESCRIPTION] : item.Description,
					[revel.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now(),
					[revel.FB_KEY_PICTURE] : null,
					[revel.FB_KEY_JOURNAL] : null,
					[revel.FB_KEY_ISCHECKED] : false})
				.then(function() {
					console.log("Item successfully updated!");
				})
				.catch(function (error) {
					// The document probably doesn't exist.
					console.error("Error updating item: ", error);
				});
		});

	}
   }

revel.storage.BL_ID_KEY = "BL_ID_KEY";
revel.storage.getbucketListId = function() {
	const blId = sessionStorage.getItem(revel.storage.BL_ID_KEY);
	if(!blId){
		console.log("No list quote id in storage");
		return 0;
	}
	return blId;
}

revel.storage.setbucketListId = function(blId) {
	sessionStorage.setItem(revel.storage.BL_ID_KEY, blId);
}
   
revel.main = function() {
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
