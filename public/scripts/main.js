
var revel = revel || {};
revel.storage = revel.storage || {};

revel.FB_COLLECTION_LISTS = "lists";
revel.FB_KEY_TITLE = "Title";
revel.FB_KEY_COLOR = "color";
revel.FB_KEY_LAST_TOUCHED = "lastTouched";
revel.FB_COLLECTION_ITEMS = "Items";
revel.FB_KEY_ITEMS = "items";
revel.FB_KEY_DESCRIPTION = "Description";
revel.FB_KEY_PICTURE = "Picture";
revel.FB_KEY_ISCHECKED = "isChecked";
revel.FB_KEY_JOURNAL = "journalEntry";
revel.FB_KEY_USERS = "users";
revel.fbBucketListManager = null;
revel.inputBuffer = {};
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
		

		document.querySelector("#fab").addEventListener("click",(even)=>{
			sessionStorage.clear();
			revel.page = revel.pages.EXPANDED_LIST;
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
				const bl = revel.fbBucketListManager.getListAtIndex(i);
				const newCard = this._createCard(bl.title, bl.items);
				newCard.onclick = (event) => {
					if(revel.page == revel.pages.MAIN && !event.switchingToMain && 
						!Array.from(document.querySelectorAll(".card-body>div")).some(x=>x.contains(event.target))){
						event.switchingToExpanded = true;
						revel.storage.setbucketListId(bl.id);
						revel.page = revel.pages.EXPANDED_LIST;
						revel.showMainPageContents();

						document.querySelector("#expandedList .card-title").value = bl.title;

						this._createItems(Object.keys(bl.items)
							.filter(x=>!bl.items[x][revel.FB_KEY_ISCHECKED])
							.reduce((prev, next)=> {return{...prev, [next]: bl.items[next]}},{}), true)
						.forEach(x => document.querySelector("#itemsBox").appendChild(x));

						this._createItems(Object.keys(bl.items)
							.filter(x=>bl.items[x][revel.FB_KEY_ISCHECKED])
							.reduce((prev, next)=> {return{...prev, [next]: bl.items[next]}},{}), true)
						.forEach(x => document.querySelector("#checkedItemsBox").appendChild(x));
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
		let card = htmlToElement(`<div class="card">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <div id="cardItems" class="checkbox col">
		  </div>
		  <hr>
          <div id="checkedCardItems" class="checkbox col">
          </div>
		</div>`);
		
		this._createItems(Object.keys(items)
			.filter(x=>!items[x][revel.FB_KEY_ISCHECKED])
			.reduce((prev, next)=> {return{...prev, [next]: items[next]}},{}), false)
		.forEach(x => card.querySelector("#cardItems").appendChild(x));

		this._createItems(Object.keys(items)
			.filter(x=>items[x][revel.FB_KEY_ISCHECKED])
			.reduce((prev, next)=> {return{...prev, [next]: items[next]}},{}), false)
		.forEach(x => card.querySelector("#checkedCardItems").appendChild(x));

		return card;
	}
	_createItems(items, isInput){
		let itemElements = [];
		Object.keys(items).reduce((prev, next) => [...prev, {
			"id" : next,
			[revel.FB_KEY_DESCRIPTION] : items[next].Description,
			[revel.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now(),
			[revel.FB_KEY_PICTURE] : items[next][revel.FB_KEY_PICTURE],
			[revel.FB_KEY_JOURNAL] : items[next][revel.FB_KEY_JOURNAL],
			[revel.FB_KEY_ISCHECKED] : items[next][revel.FB_KEY_ISCHECKED]
		}],[]).forEach(item => {
			itemElements.push(isInput? this._createInputItem(item) : this._createItem(item));
		});
		return itemElements;
	}

	_createInputItem(item){
		const inputElem = htmlToElement(`<div class="row checkbox"> 
					<label> 
						<input type="checkbox" ${item[revel.FB_KEY_ISCHECKED]? "disabled='disabled'" : ""} class="item" ${item[revel.FB_KEY_ISCHECKED]? "checked" : ""} onchange="doalert(this)"> 
						<span class="checkbox-decorator">
							<span class="check"></span>
						</span> 
						<input id="${item.id}" class="input" value="${item[revel.FB_KEY_DESCRIPTION]}"> 
					</label> 
				</div>`);
		if(item[revel.FB_KEY_ISCHECKED]&&item[revel.FB_KEY_PICTURE]) {
			const pictureElem = htmlToElement(`<div class="col-12 col-sm-6 col-md-4" style="padding:0;"><div class="pin">
				<img src="" alt="${item[revel.FB_KEY_DESCRIPTION]}">
		 	</div></div>`);
			inputElem.appendChild(pictureElem);
			this.getImageUrl(item[revel.FB_KEY_PICTURE], url => pictureElem.querySelector("img").src = url);
		}
		if(item[revel.FB_KEY_ISCHECKED]&&item[revel.FB_KEY_JOURNAL]) {
			inputElem.appendChild(htmlToElement(`<p class="col">${item[revel.FB_KEY_JOURNAL]}</p>`));
		}
		return inputElem;
	}

	_createItem(item){
		return htmlToElement(`<div class="row checkbox"> 
			<label> 
				<input type="checkbox" disabled="disabled" class="item" ${item[revel.FB_KEY_ISCHECKED]? "checked" : ""} onchange="doalert(this)"> 
				<span class="checkbox-decorator">
					<span class="check">
					</span>
				</span> 
				${item.Description} 
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

	getImageUrl (imageName, callback) {
		console.log("fetching image ", imageName);
		var storageRef = firebase.storage().ref();
		var imageRef = storageRef.child(imageName);

		imageRef.getDownloadURL().then(function(url) {
			console.log(url);
			callback(url);
		});
		return imageName;
	}


}

revel.TimelineController = class {
	constructor() {

		revel.fbBucketListManager.beginListening(this.updateTimeline.bind(this));
	}

	updateTimeline() {
		const items = revel.fbBucketListManager.documentSnapshots
			.reduce((prev, next) => [...prev, ...Object.values(next.get(revel.FB_KEY_ITEMS))
				.reduce((p, n) => n[revel.FB_KEY_ISCHECKED]?[...p, {
					name: n[revel.FB_KEY_DESCRIPTION],
					date: n[revel.FB_KEY_LAST_TOUCHED].toDate().getMonth(),
					img: n[revel.FB_KEY_PICTURE]
				}]:p,[])],[]);

		//console.log(items);

		TimeKnots.draw("#timelineNonDate", items, {dateFormat: "%B %Y", color: "teal", width:500, showLabels:false, labelFormat: "%Y"});
	}

	getImageUrl (imageName, callback) {
		console.log("fetching image ", imageName);
		var storageRef = firebase.storage().ref();
		var imageRef = storageRef.child(imageName);

		imageRef.getDownloadURL().then(function(url) {
			console.log(url);
			callback(url);
		});
		return imageName;
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
		revel.fbListPageController = new revel.ListPageController();
	}

	if(document.querySelector("#timelinePage")){
		console.log("You are on timeline page");
		revel.fbBucketListManager = new revel.FbBucketListManager();
		revel.fbTimelineController = new revel.TimelineController();
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
			[revel.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now(),
			[revel.FB_KEY_ITEMS] : items.reduce((prev, next) => {
				return { 
					...prev, [next.id ? next.id : Math.random().toString(36).substr(2, 9)]: {
						[revel.FB_KEY_DESCRIPTION] : next.Description,
						[revel.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now(),
						[revel.FB_KEY_PICTURE] : revel.inputBuffer[next.id]? revel.inputBuffer[next.id][revel.FB_KEY_PICTURE].name : null,
						[revel.FB_KEY_JOURNAL] : revel.inputBuffer[next.id]? revel.inputBuffer[next.id][revel.FB_KEY_JOURNAL] : null,
						[revel.FB_KEY_ISCHECKED] : revel.inputBuffer[next.id]? revel.inputBuffer[next.id][revel.FB_KEY_ISCHECKED] : false
					}
				}
			},{})
		}
		this._ref.add(addItems)
		.then(function(docRef) {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
		});
		revel.inputBuffer= {};
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
	getListAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		console.log('myDoc title :>> ', docSnapshot.get(revel.FB_KEY_TITLE));
		const items = [];
		
		console.log('items :>> ', items);
		const bl = {id:docSnapshot.id ,title: docSnapshot.get(revel.FB_KEY_TITLE),
			items: docSnapshot.get(revel.FB_KEY_ITEMS)};
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

		this._ref.doc(id).update(items.reduce((prev, next) => {
			let path = revel.FB_KEY_ITEMS+"."+ (next.id ? next.id : Math.random().toString(36).substr(2, 9));
			if(revel.inputBuffer[next.id] && revel.inputBuffer[next.id][revel.FB_KEY_PICTURE])
				this.uploadImage(revel.inputBuffer[next.id][revel.FB_KEY_PICTURE]);
			return { 
				...prev,
				[path+"."+revel.FB_KEY_DESCRIPTION] : next.Description,
				[path+"."+revel.FB_KEY_LAST_TOUCHED] : firebase.firestore.Timestamp.now(),
				...revel.inputBuffer[next.id]? {[path+"."+revel.FB_KEY_PICTURE] : revel.inputBuffer[next.id][revel.FB_KEY_PICTURE].name} : null,
				...revel.inputBuffer[next.id]? {[path+"."+revel.FB_KEY_JOURNAL] : revel.inputBuffer[next.id][revel.FB_KEY_JOURNAL]} : null,
				...revel.inputBuffer[next.id]? {[path+"."+revel.FB_KEY_ISCHECKED] : revel.inputBuffer[next.id][revel.FB_KEY_ISCHECKED]} : false
			};
		},{}))
		.then(function() {
			console.log("Items successfully updated!");
		})
		.catch(function (error) {
			// The document probably doesn't exist.
			console.error("Error updating items: ", error);
		});
		revel.inputBuffer= {};
	}

	uploadImage(image) {
		console.log("uploading image "+ image.name + ": " + image.file);
		var storageRef = firebase.storage().ref();
		var imageRef = storageRef.child(image.name);

		var file = image.file;
		imageRef.put(file).then(function(snapshot) {
			console.log('Uploaded a file!');
		});
	}

	get documentSnapshots() {
		return this._documentSnapshots;
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
