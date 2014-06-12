/**
* Class: Holds state and update methods to add visual effects to the game
*/
var EyeCandy = function (){

    /**
    * Class: represents one block which flies after a row is destroyed
    */
    var Block = function (c, x, y) {
        this.c = c;
        this.x = x; //top left
        this.y = y;
        this.vx = Math.random()*10-5;
        this.vy = Math.random()*-10;
    }

    //flying blocks is a ring buffer
    var flyingBlocks = [];
    for (var i = 0; i < 40; i++) {
        flyingBlocks.push(null);
    };

    var tail = 0;
    function newPush(elem){
        flyingBlocks[tail] = elem;
        tail = (tail+1)%40;
    }

    var message = "";
    var messageTimer = 0;
    var TIME_FOR_MESSAGE = 50;
    var messageY = 0;
    var messageX = 0;

    var oldCells = [];
    var whoosh = [];
    var whooshColor = "";
    var whooshTime = 0;
    var TIME_FOR_WHOOSH = 10;

    /**
    * Adds a row of flying blocks that will start flying
    * @param row Row number that it should be located
    * @param blockColors list of colors to make the flying blocks
    */
    addRow = function(row, blockColors){
        for (var i = 0; i < blockColors.length; i++) {
            var b = new Block(blockColors[i],i*20,row*20);
            newPush(b);
        };
    }

    /**
    * Flashes a message across a players screen
    * @param msg the message to be shown
    */
    flashMessage = function (msg,msgY){
        messageTimer = TIME_FOR_MESSAGE;
        message = msg;
        messageY = msgY;
    }


    /**
    * Call this before you hard drop to set top of whoosh
    */
    setTopOfDrop = function (cells){
        oldCells = cells;
    }

    /**
    * Call this after you hard drop to set bottom of whoosh
    */
    createBlur = function(c, newCells){
        minX = 200;
        maxX = 0;
        minY = 400;
        maxY = 0;

        for (var i = 0; i < newCells.length; i++) {
            minX = Math.min(minX, newCells[i][0]*20);
            maxX = Math.max(maxX, newCells[i][0]*20+20);
            maxY = Math.max(maxY, newCells[i][1]*20);
        };
        for (var i = 0; i < oldCells.length; i++) {
            minY = Math.min(minY, oldCells[i][1]*20+20);
        }
        whoosh = [minX,maxX,minY,maxY];
        whooshColor = c;
        whooshTime = TIME_FOR_WHOOSH;
    }


    /**
    * Moves flying blocks and decrements timers
    */
    update = function(){
        for (var i = 0; i < flyingBlocks.length; i++) {
            var b = flyingBlocks[i];
            if(b!=null){
                b.x += b.vx;
                b.y += b.vy;
                b.vy += .8;
            }
        };

        if(messageTimer>0) messageTimer --;
        if(whooshTime>0) whooshTime --;

    }


    /**
    * Draws the visual effects
    */
    draw = function (shiftX, shiftY) {
        for (var i = 0; i < flyingBlocks.length; i++) {
            var b = flyingBlocks[i];
            if(b!=null){
                drawBlock(b.c,b.x+shiftX,b.y+shiftY);
            }
        };

        if(messageTimer>0){
            context.textAlign = "center";

            context.fillStyle = "#000000";
            context.font="24px sans-serif";
            context.fillText(message,shiftX+100,150+messageY);
        }

        if(whooshTime>0){
            var c1 = "rgba(255,255,255,0)";

            var alpha = Math.round((whooshTime/TIME_FOR_WHOOSH)*100)/100;
            alpha *= .6;
            var c = hexToRgb(whooshColor)
            var c2 = "rgba("+c.r+","+c.g+","+c.b+","+alpha+")";


            var grd = context.createLinearGradient(minX+shiftX,minY+shiftY,maxX+shiftX,maxY+shiftY);
            grd.addColorStop(0,c1);
            grd.addColorStop(1, c2);
            context.fillStyle = grd;
            context.fillRect(minX+shiftX,minY+shiftY,maxX-minX,maxY-minY);
        }
    }

    /**
    * Converts hex to rgb
    * http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    */
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // revealed module pattern
    return {
        addRow : addRow,
        setTopOfDrop : setTopOfDrop,
        createBlur : createBlur,
        update : update,
        draw : draw,
        flashMessage: flashMessage
    }
}