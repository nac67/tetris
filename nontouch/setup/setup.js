//LISTENERS
window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();

window.document.addEventListener("mousedown",mouseDown);
window.document.addEventListener("mouseup",mouseUp);

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

var test_txt = document.getElementById("test");

var leftDown = false;
var mx = 0;
var my = 0;

function mouseDown(event){
  leftDown = true;

  if (event.x != undefined && event.y != undefined) {
    mx = event.x;
    my = event.y;
  } else { // Firefox method to get the position
    mx = event.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft;
    my = event.clientY + document.body.scrollTop +
      document.documentElement.scrollTop;
  }

  mx -= canvas.offsetLeft;
  my -= canvas.offsetTop;
}

function mouseUp(e){
  leftDown = false;
}