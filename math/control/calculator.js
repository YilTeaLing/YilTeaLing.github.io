function showCalculator() {
    var calculator = document.createElement("div");
    calculator.innerHTML = "123";
    document.getElementById("pad").appendChild(calculator);
}

var x = 0;
var x = 0;
var y = 0;
var l = 0;
var t = 0;
var isDown = false;

function controlMouseDown(e, element) {
    x = e.clientX;
    y = e.clientY;
    l = element.offsetLeft;
    t = element.offsetTop;
    isDown = true;
}

function controlMouseMove(e, element) {
    if(isDown == false) {
        return;
    }
    var dx = e.clientX;
    var dy = e.clientY;
    var dl = dx - (x - l);
    var dt = dy - (y - t);
    element.style.left = dl + "px";
    element.style.top = dt + "px";
}

function controlMouseUp() {
    isDown = false;
}