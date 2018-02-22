var petitionSignClick = $("#sign-petition");
var signatureCanvas = $("#canvas-sign");

var signing = false;
var canvasDataSave = $("#canvasDataSave");
var x; //current position mouse
var y;

//var submit = $("submit");

petitionSignClick.on("click", e => {
    console.log("petition sign working");
    canvasDataSave.val(signatureCanvas[0].toDataURL());
});

signatureCanvas.on("mousedown", e => {
    console.log("this works ");
    signing = true;
    x = e.offsetX; // previous position mouse
    y = e.offsetY;
});

signatureCanvas.on("mouseup", () => {
    signing = false;
});

signatureCanvas.on("mousemove", e => {
    if (signing == true) {
        var context = document.getElementById("canvas-sign").getContext("2d");
        context.strokeStyle = "#000000";
        context.lineWidth = 2;
        context.moveTo(x, y);
        context.lineTo(e.offsetX, e.offsetY);
        context.stroke();
        x = e.offsetX; // creates an ongoing recording of the movement
        y = e.offsetY;
        console.log("this works ");
    }
});
