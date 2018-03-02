var menubarUl = $(".menubar-ul");
var profileClick = $(".profile");

profileClick.on("click", e => {
    menubarUl.toggle();
    e.preventDefault();
});
