var revel = revel || {};

firebase.auth().onAuthStateChanged((user) => {
    document.querySelector("#profilePictureContainer").innerHTML = `<img src=${user.photoURL} alt="profile picture" class="profile-picture">`;
    document.querySelector("#displayName").innerHTML = user.displayName;
});