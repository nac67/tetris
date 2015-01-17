var RED    = "#FF0000";
var ORANGE = "#FF9000";
var YELLOW = "#C0C000";
var GREEN  = "#00E000";
var BLUE   = "#0000FF";
var PURPLE = "#7D26CD";
var CYAN   = "#00E0E0";
var GREY   = "#909090";

var TRANS_RED = "rgba(255,0,0,.5)";
var TRANS_GREEN = "rgba(0,255,0,.5)";
var TRANS_WHITE = "rgba(255,255,255,.8)";


// I is cyan
// J is blue
// L is orange
// O is yellow
// S is green
// T is purple
// Z is red

/**
* Given a number c, returns the cells occupied by piece c 
* @param {Number} c Which piece to get
*/
function getPiece (c) {
    //x, y not r,c
    if(c == 0){
        return [
            [3,1],
            [4,1],
            [5,1],
            [6,1]
        ];
    }
    else if(c == 1){
        return [
            [3,0],
            [3,1],
            [4,1],
            [5,1]
        ];
    }
    else if(c == 2){
        return [
            [5,0],
            [3,1],
            [4,1],
            [5,1]
        ];
    }
    else if(c == 3){
        return [
            [4,0],
            [4,1],
            [5,0],
            [5,1]
        ];
    }
    else if(c == 4){
        return [
            [3,1],
            [4,1],
            [4,0],
            [5,0]
        ];
    }
    else if(c == 5){
        return [
            [3,1],
            [4,1],
            [4,0],
            [5,1]
        ];
    }
    else if(c == 6){
        return [
            [3,0],
            [4,0],
            [4,1],
            [5,1]
        ];
    }
}


/**
* Given a number c, returns the starting origin of piece c 
* @param {Number} c Which piece to get
*/
function getOrigin(c) {
    if(c == 0){
        return [4.5,1.5];
    }else if(c==3){
        return [4.5,0.5]
    }else{
        return [4,1];
    }
}


/**
* Given a number c, returns the color of piece c 
* @param {Number} c Which piece to get
*/
function getColor (c) {
    // I is cyan
    // J is blue
    // L is orange
    // O is yellow
    // S is green
    // T is purple
    // Z is red
    if(c == 0){
        return CYAN;
    }else if(c==1){
        return BLUE;
    }else if(c==2){
        return ORANGE;
    }else if(c==3){
        return YELLOW;
    }else if(c==4){
        return GREEN;
    }else if(c==5){
        return PURPLE;
    }else if(c==6){
        return RED;
    }else{
        console.log(c);
    }
}


/**
* Shuffles the numbers 0..6 and returns in list.
*/
function generateBag(){
    var origBag = [0,1,2,3,4,5,6];
    var newBag = [];
    while(origBag.length>0){
        var i = Math.floor(Math.random()*origBag.length);
        newBag.push(origBag.splice(i,1));
    }
    return newBag;
}


/**
* Class: represents an active piece in the game, storing origin, cells
* and color. 
*/
var Piece = function (game, id) {
    var i;
    if(id == -1){
        i = game.currentBag.pop();
        if(game.currentBag.length == 0) game.currentBag = generateBag();
    }else{
        i = id;
    }
    this.origin = getOrigin(i);
    this.cells = getPiece(i);
    this.color = getColor(i);
    this.c = i;

    //account for 2 hidden rows above screen
    for(var j=0;j<this.cells.length;j++){
        this.cells[j][1] += 2;
    }
    this.origin[1] += 2;
}


/**
* Draws a block onto the screen at position (posX,posY)
*/
function drawBlock(col,posX,posY){
    context.fillStyle=col;
    context.fillRect(posX,posY,20,20);
    context.fillStyle="rgba(255,255,255,.4)";
    context.fillRect(posX+3,posY+3,14,14);
}


/**
* Returns a row of all grey, except one spot which is empty
*/
function generateJunk(){
    var row = [GREY,GREY,GREY,GREY,GREY,GREY,GREY,GREY,GREY,GREY];
    var MAX_JUNK = 1;
    for(var i=0;i<MAX_JUNK;i++){
        row[Math.floor(Math.random()*10)] = "";
    }
    return row;
}


/**
* Returns an empty row
*/
function generateEmpty(){
    return ["","","","","","","","","",""];
}