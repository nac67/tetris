var gameOverTimer = 0;
var garbageQueue = [0,0]; //how many junk lines to send player i

var player1 = new GameController(garbageQueue,0, UPPER_KEYBOARD_CONTROLS); //W A D S 1 ~
var player2 = new GameController(garbageQueue,1, DEFAULT_CONTROLS);

var prevP = false;
var prevR = false;

var focused = document.hasFocus();

/**
* Restart the game
*/
function restart() {
    gameOverTimer = 0;
    player1.restart();
    player2.restart();
}

/**
* Perform one time step of whole game
*/
function animate() {
    var gameOver = player1.playerLost || player2.playerLost;

    focused = document.hasFocus();
    if(focused){

        if(!prevP && Key.isDown(80)){
            paused = !paused;
        }
        prevP = Key.isDown(80);

        if(!prevR && Key.isDown(82)){
            restart()
        }
        prevR = Key.isDown(82);

        if(!gameOver){
            if(!paused){
                player1.update();
                player2.update();
            }
        }else{
            if(gameOverTimer<GAME_OVER_TIME){
                gameOverTimer++;
            }else{
                restart();
            }
        }
    }

    //DRAWING
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    player1.draw(0,0);
    player2.draw(300,0);

    context.textAlign = "center";

    if(!focused){
        context.fillStyle="#000000";
        context.font="20px sans-serif";
        context.fillText("Click on game to continue",250,200);
    }
    else if(paused){
        context.fillStyle="#000000";
        context.font="20px sans-serif";
        context.fillText("Paused",250,200);
    }else if(gameOver){
        var winPos = (player1.playerLost ? 300 : 0);
        var losePos = (player1.playerLost ? 0 : 300);

        context.fillStyle=TRANS_GREEN;
        context.fillRect(winPos,0,200,400);

        context.fillStyle=TRANS_RED;
        context.fillRect(losePos,0,200,400);

        context.fillStyle="#000000";
        context.font="20px sans-serif";
        context.fillText("You Win!",100+winPos,200);
        context.fillText("You Lose!",100+losePos,200);
    }

    // request new frame
    requestAnimFrame(function() {
        animate();
    });
}
animate();
