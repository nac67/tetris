//DOM
var score_txt = document.getElementById("score");
var highscore_txt = document.getElementById("highscore");

//OVERRIDE CONSTANTS
NO_MERCY = true;
SPEED_UP = true;

var score = 0;
var highscore = getCookie("highscore");
highscore = (highscore == "" ? 0 : parseInt(highscore));


var gameOverTimer = 0;
var player1 = new GameController(0, DEFAULT_CONTROLS);

var prevP = false;
var prevR = false;



/**
* Restart the game
*/
function restart() {
    gameOverTimer = 0;
    player1.restart();
}

/**
* Perform one time step of whole game
*/
function animate() {
    
    var gameOver = player1.playerLost;

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
            }
        }else{
            if(gameOverTimer == 0){
                //do this once
                highscore = Math.max(highscore, player1.tetris.score);
                setCookie("highscore",String(highscore),365);
            }


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

    context.textAlign = "center";

    if(!focused){
        context.fillStyle="#000000";
        context.font="20px sans-serif";
        context.fillText("Click to resume",100,200); 
    }else if(paused){
        context.fillStyle="#000000";
        context.font="20px sans-serif";
        context.fillText("Paused",100,200);
    }else if(gameOver){

        context.fillStyle=TRANS_WHITE;
        context.fillRect(0,0,200,400);

        context.fillStyle="#000000";
        context.font="25px sans-serif";
        context.fillText("Game Over!",100,200);
        context.fillText("Score:"+(player1.tetris.score),100,250);
    }

    score_txt.innerHTML = "Score: "+player1.tetris.score;
    highscore_txt.innerHTML = "High Score: "+highscore;


    // request new frame
    requestAnimFrame(function() {
        animate();
    });
}
animate();
