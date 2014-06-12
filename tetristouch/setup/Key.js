//KEY HANDLERS

var Key = function () {

  //LISTENERS
  window.document.addEventListener("keydown",keyDown);
  window.document.addEventListener("keyup",keyUp);  

  var keyCode = new Array(128);
  for(var i=0;i<keyCode.length;i++){
  	keyCode[i] = false;
  }

  function keyDown(e) {
  	keyCode[e.keyCode] = true;
    if(e.keyCode == 9){
      resetAll();
    }
  }

  function keyUp(e) {
  	keyCode[e.keyCode] = false;
  }

  function isDown(c) {
    return keyCode[c];
  }

  function resetAll() {
    for(var i=0;i<keyCode.length;i++){
      keyCode[i] = false;
    }
  }

  return {
    isDown: isDown,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    resetAll: resetAll
  }

} ();

