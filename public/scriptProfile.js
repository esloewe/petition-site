var menubarUl = $(".menubar-ul");
var profileClick = $(".profile");
var body = $("body,html");

profileClick.on("click", e => {
    menubarUl.toggle();
    e.preventDefault();
});

// $(document).on("click", e => {
//
// });

// menubarUl.on("click", e => {});
