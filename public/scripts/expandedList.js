// document.querySelectorAll(".card").forEach(card => card);

document.querySelector("#listPage").onclick = (event) => {
    if(revel.page == revel.pages.EXPANDED_LIST && !event.switchingToExpanded && !document.querySelector("#expandedList").contains(event.target)){
        event.switchingToMain = true;
        revel.page = revel.pages.MAIN;
        revel.showMainPageContents();
    }
};

revel.showMainPageContents = function() {
    switch(revel.page) {
        case revel.pages.MAIN:
            document.querySelector("#listContainer").classList.remove("hidden");
            document.querySelector("#expandedList").classList.add("hidden");
            break;
        case revel.pages.EXPANDED_LIST:
            document.querySelector("#listContainer").classList.add("hidden");
            document.querySelector("#expandedList").classList.remove("hidden");
            break;
    }
};

function doalert(checkboxElem) {
    if (checkboxElem.checked) {
        alert ("hi");
    } else {
        alert ("bye");
    }
}

revel.showMainPageContents();