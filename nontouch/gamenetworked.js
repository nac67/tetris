var statusTxt = document.getElementById("statusTxt");
var friendID = document.getElementById("friendID");
var connectBtn = document.getElementById("connectBtn");
var yourID = document.getElementById("yourID");

var peer = new Peer({key: 'rn47yq3tbcpu8fr'});

peer.on('open', function(id) {
  yourID.innerHTML = "Your ID: "+id;
  statusTxt.innerHTML = "Enter friends id and hit connect";
});

connectBtn.onclick = function () { 
  statusTxt.innerHTML = "Attempting to connect to friend" 
  var _conn = peer.connect(friendID.value);
  handleConnection(_conn);
}

peer.on('connection', function(_conn) {
  handleConnection(_conn);
});

function handleConnection(conn) {
  conn.on('open', function() {
    statusTxt.innerHTML = "Connected to friend";
    connectBtn.disabled = true;


    
    var gameOverTimer = 0;
    var garbageQueue = [0,0]; //how many junk lines to send player i
    var player = new GameController(garbageQueue,0, DEFAULT_CONTROLS);
    var SEND_INTERVAL = 10;
    var sendTime = 0;
    var enemyLost = false;

    var enemyBoard = [];
    var enemyActivePieceCells = [];
    var enemyActivePieceColor = "";

    context.fillStyle = "#FFFFFF";
    context.fillRect(300, 0, 300, canvas.height);

    /**
    * Restart the game
    */
    function restart() {
        gameOverTimer = 0;
        gameOver = false;
        enemyLost = false;
        player.restart();
    }

    // Receive messages
    conn.on('data', function(data) {
      //receive data
      if(data == "restart"){
        restart();
      }else if(data == "I lost"){
        enemyLost = true;
      }else{
        if(data.cmd == "draw"){
          enemyBoard = data.board;
          enemyActivePieceCells = data.activePieceCells;
          enemyActivePieceColor = data.activePieceColor;
        }
        if(data.cmd == "garbage"){
          garbageQueue[0] += data.amount;
        }


      }
    });

    function sendData(data){
      conn.send(data);
    }



    /**
    * Perform one time step of whole game
    */
    function animate() {
      var gameOver = gameOver || player.playerLost || enemyLost;


      /*if(!prevP && Key.isDown(80)){
          paused = !paused;
      }
      prevP = Key.isDown(80);

      if(!prevR && Key.isDown(82)){
          restart()
      }
      prevR = Key.isDown(82);*/

      if(!gameOver){
        player.update();
      }else{
          if(gameOverTimer == 0){
            if(player.playerLost){
              sendData("I lost");
            }
          }
          if(gameOverTimer<GAME_OVER_TIME){
              gameOverTimer++;
          }else{
              restart();
              sendData("restart");
          }
      }

      if(garbageQueue[1] != 0){
        sendData({cmd:"garbage", amount:garbageQueue[1]});
        garbageQueue[1] = 0;
      }
      

      //DRAWING
      context.fillStyle = "#eeeeee";
      context.fillRect(0, 0, 300, canvas.height);
      player.draw(0,0);
      context.textAlign = "center";


      //draw enemy
      var shiftX = 300;
      var extraShiftY = - 2*20; //hide top two rows
      var b = enemyBoard;
      if(b.length>0){
        context.fillStyle = "#eeeeee";
        context.fillRect(300, 0, 300, canvas.height);
        context.fillStyle="#DDDDDD";
        context.fillRect(300, 0, 200, canvas.height);
        
        // Draw existing cells
        for(var i=2;i<ROWS;i++){
            for(var j=0;j<COLS;j++){
                if(b[i][j] != ""){
                  drawBlock(b[i][j],j*20+shiftX,i*20+extraShiftY);
                }
            }
        }
      }
    
      var cells = enemyActivePieceCells;
      var color = enemyActivePieceColor;

      if(cells!=null){
        for(var i=0;i<cells.length;i++){
          var c = cells[i];
          if(inBounds(c[1],c[0])){
            drawBlock(color,c[0]*20+shiftX,c[1]*20+extraShiftY);
          }
        }
      }





      if(gameOver){
          var winPos = (player.playerLost ? 300 : 0);
          var losePos = (player.playerLost ? 0 : 300);

          context.fillStyle=TRANS_GREEN;
          context.fillRect(winPos,0,200,400);
          context.fillStyle=TRANS_RED;
          context.fillRect(losePos,0,200,400);

          context.fillStyle="#000000";
          context.font="20px sans-serif";
          context.fillText("You Win!",100+winPos,200);
          context.fillText("You Lose!",100+losePos,200);
      }

      sendTime ++;
      if(sendTime % SEND_INTERVAL == 0){
        console.log("sending: "+player.tetris.activePiece)

        if(player.tetris.activePiece != null){
          sendData({cmd:"draw", 
            board:player.tetris.board, 
            activePieceCells: player.tetris.activePiece.cells,
            activePieceColor: player.tetris.activePiece.color
          });
        }else{
          sendData({cmd:"draw", 
            board:player.tetris.board, 
            activePieceCells: null,
            activePieceColor: ""
          });
        }
      }




      


      // request new frame
      requestAnimFrame(function() {
          animate();
      });
    }
    animate();



  });
}