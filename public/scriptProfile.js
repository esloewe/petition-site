var menubarUl = $(".menubar-ul");
var profileClick = $(".profile");

profileClick.on("click", e => {
    menubarUl.toggle();
    e.preventDefault();
});

$(document).on("click", e => {
    if (!$(e.target).closest(profileClick).length) {
        menubarUl.hide();
    }
});
