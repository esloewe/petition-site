var menubarUl = $(".menubar-ul");
var profileClick = $(".profile");

profileClick.on("click", e => {
    menubarUl.toggle();
    e.preventDefault();
});

//listen click on document and another so that when i clicked
