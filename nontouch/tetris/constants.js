var ROWS = 20;
var COLS = 10;

ROWS+=2                     //account for hidden rows above top of screen

var DAS = 11;               //delayed auto shift (how long to hold L/R before auto shift)
var MOVE_INTERVAL = 2;      //how fast object moves when you hold down
var START_FALL_INTERVAL = 20;     //how fast fall interval starts

var SPEED_UP = false;       //should fall interval speed up
var DECAY = 20;             //how fast it approaches max speed
var MIN_FALL_INTERVAL = 2;  //fastest fallInterval can be


var MAX_SETTLE = 40;        //amount of time till locking
var MAX_SHIFTS = 20;        //override the settletimer and lock anyway
var MAX_ROTATES = 8;
var paused = false;   
var GAME_OVER_TIME = 100;   //timer before game restarts
var SHOW_GHOST = true;      //piece at the bottom
var ALLOW_GREY_FOR_COMBO = true; //when you get grey rows in a combo, these should also be 
                                 //considered when figuring out how many rows to send to the opponent

var MERCY_RATIO = .75;      //if danger is above this level, then completing any row 
                            //will also eliminate a row from the bottom

var NO_MERCY = false;       //disable mercy mode

var DEFAULT_CONTROLS = {
    spin: Key.UP,
    left: Key.LEFT,
    right: Key.RIGHT,
    soft: Key.DOWN,
    hard: 32,
    hold: 16,
}

var UPPER_KEYBOARD_CONTROLS = {
    spin: 87,
    left: 65,
    right: 68,
    soft: 83,
    hard: 49,
    hold: 192,
}