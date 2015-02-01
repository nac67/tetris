//DOM
var score_txt = document.getElementById("score");
var highscore_txt = document.getElementById("highscore");
var timer_txt = document.getElementById("timer");

//OVERRIDE CONSTANTS
NO_MERCY = true;
SPEED_UP = false;

var NEEDED_LINES = 40;
var COUNTDOWN_TIME = 180;

var score = 0;
var highscore = getCookie("sprint_highscore");
highscore = (highscore == "" ? 0 : parseInt(highscore));


var countDown = COUNTDOWN_TIME;
var player1 = new GameController(0, DEFAULT_CONTROLS);

var prevP = false;
var prevR = false;

var lineCount = NEEDED_LINES;

var startTime;
var endTime;
var finishTime;
var elapsedFrames;



/**
* Restart the game
*/
function restart(doReplay) {

    if (!doReplay) {
        Replay.createNewReplay();
    }
    elapsedFrames = 0;
    lineCount = NEEDED_LINES;
    countDown = COUNTDOWN_TIME;

    

    player1.restart();

    if (doReplay) {
        player1.tetris.currentBag = Replay.getPieceBag();
        var newActivePieceID = player1.tetris.currentBag.pop();
        player1.tetris.activePiece = new Piece(player1.tetris, newActivePieceID);
        Replay.running = true;
    } else {
        Replay.running = false;
    }
}

restart(false);

function formatTime (t) {
    var seconds = t;
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

function getTime() {
    try {
        endTime = new Date();
        var timeStart = Math.round(startTime.getTime()/1000);
        var timeEnd = Math.round(endTime.getTime()/1000);
        return timeEnd - timeStart;
    } catch (e) {
        return 0;
    }
}

/**
* Perform one time step of whole game
*/
function animate() {
    
    var gameOver = player1.playerLost;
    if(lineCount <=0){
        lineCount = 0;
        gameOver = true;

    }
    var updateResults;

    // if(!prevP && Key.isDown(80)){
    //     paused = !paused;
    // }
    // prevP = Key.isDown(80);

    if(!prevR && Key.isDown(82)){
        restart(false)
    }
    prevR = Key.isDown(82);


    focused = true;//document.hasFocus();
    if(focused && !paused && !gameOver){
        if (countDown > 0) {
            countDown --;
        } else if (countDown == 0) {
            startTime = new Date();
            countDown = -1;
        } else {
            if (!Replay.running) {
                Replay.saveFrame(player1.controls, elapsedFrames);
            }
            updateResults = Replay.updateGame(player1, elapsedFrames);
            elapsedFrames++;

            lineCount -= updateResults.rowsCleared;
            if(lineCount <=0){
                
                finishTime = getTime();

                if(highscore == 0 || finishTime < highscore) {
                    highscore = finishTime;
                }
                setCookie("sprint_highscore",String(highscore),365);

            }
        }

        
    }

    if (gameOver){
        if (Key.isDown(13)) {
            restart(false);
        }
        if (Key.isDown(65)) {
            restart(true);
        }

    }


    //DRAWING
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    player1.draw(50,0);

    context.textAlign = "center";

    // draw line count
    context.fillStyle="#000000";
    context.font="32px sans-serif";
    context.fillText(lineCount,25,370);

    if(countDown > 0) {
        var time = Math.ceil(countDown/60);
        context.fillStyle="#000000";
        context.font="20px sans-serif";
        context.fillText(time,150,200); 
    }else if(!focused){
        context.fillStyle="#000000";
        context.font="20px sans-serif";
        context.fillText("Click to resume",150,200); 
    }else if(paused){
        context.fillStyle="#000000";
        context.font="20px sans-serif";
        context.fillText("Paused",150,200);
    }else if(gameOver){

        context.fillStyle=TRANS_WHITE;
        context.fillRect(50,0,200,400);

        context.fillStyle="#000000";
        context.font="25px sans-serif";

        if (lineCount > 0) {
            context.fillText("Game Over!",150,200);
        } else {

            
            context.fillText("You Win!",150,200);
            context.fillText(""+formatTime(finishTime),150,230)

            context.fillText("Press Enter.",150,280)
        }
    }

    score_txt.innerHTML = "Score: "+player1.tetris.score;
    highscore_txt.innerHTML = "High Score: "+formatTime(highscore);
    timer_txt.innerHTML = "Time: "+formatTime(getTime());


    // request new frame
    requestAnimFrame(function() {
        animate();
    });
}
animate();
