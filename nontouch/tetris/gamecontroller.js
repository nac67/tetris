/**
* Class: Controls a player of a tetris game
* Manages the game board and processes the user input every time step.
* @param sharedGarbage      Reference to the 2-item garbage list which stores how many
                            junk rows to send to the the ith player
* @param playerNumber Which index of the garbage array am I
* @param controls Object with mappings of moves to button ASCII codes
*/
var GameController = function (playerNumber, controls, sharedGarbage) {
    /** ASCII codes for buttons */
    this.spinBtn = controls.spin;
    this.leftBtn = controls.left;
    this.rightBtn = controls.right;
    this.softBtn = controls.soft;
    this.hardBtn = controls.hard;
    this.holdBtn = controls.hold;
    this.spinCWBtn = controls.spinCW;
    this.spinCCWBtn = controls.spinCCW;

    if (typeof(sharedGarbage) === 'undefined') {
        sharedGarbage = [0,0];
    }

    this.tetris = new TetrisBoard(sharedGarbage, playerNumber);
    this.tetris.restartLevel(sharedGarbage, playerNumber);

    this.gametime = 0;           //overall game timer
    this.prevLeft = false;       //keep track of previous state of various keys
    this.leftTimer = 0;            //in order to make non repeating key behavior
    this.prevRight = false;
    this.rightTimer = 0;
    this.prevSpin = false;
    this.prevHard = false;
    this.prevHold = false;
    this.prevSpinCW = false;
    this.prevSpinCCW = false;

    this.playerLost = false;

    /** restarts the level */
    this.restart = function () {
        this.tetris.restartLevel();
        this.playerLost = false;
    }
    
    /** Performs one timestep in the game and processes user input */
    this.update = function () {
        var t = this.tetris;
        var completedRows = 0;
        var updateResults = {losing:false, rowsCleared:0};

        this.gametime++;
        ////////////////////////////////////
        // STUFF THAT HAPPENS EVERY STEP
        ////////////////////////////////////
        //spin piece, move piece or force down will happen every time step
        if(!this.prevSpin && Key.isDown(this.spinBtn)){
            t.rotateActivePieceIfPossible(true);
        }

        if(!this.prevSpinCW && Key.isDown(this.spinCWBtn)){
            t.rotateActivePieceIfPossible(true);
        }

        if(!this.prevSpinCCW && Key.isDown(this.spinCCWBtn)){
            t.rotateActivePieceIfPossible(false);
        }
        

        if(!this.prevLeft && Key.isDown(this.leftBtn))
            this.leftTimer=0;
        if(Key.isDown(this.leftBtn)){
            this.leftTimer++;
            if(!this.prevLeft || this.leftTimer>DAS && this.gametime % MOVE_INTERVAL == 0){
                t.tryToMove(-1,0);
            }
        }

        if(!this.prevRight && Key.isDown(this.rightBtn))
            this.rightTimer=0;
        if(Key.isDown(this.rightBtn)){
            this.rightTimer++;
            if(!this.prevRight || this.rightTimer>DAS && this.gametime % MOVE_INTERVAL == 0){
                t.tryToMove(1,0);
            }
        }

        if(!this.prevHard && Key.isDown(this.hardBtn)){
            t.eyeCandy.setTopOfDrop(deepCopy(t.activePiece.cells));
            for(var i=0;i<ROWS;i++){
                t.lowerPiece();
            }
            t.eyeCandy.createBlur(t.activePiece.color,t.activePiece.cells);
            updateResults = t.settlePiece();
            completedRows += updateResults.rowsCleared;
            this.playerLost = this.playerLost || updateResults.losing;

        }

        if(!this.prevHold && Key.isDown(this.holdBtn)){
            if(t.allowedToHold){
                if(t.heldPieceID == -1){
                    t.heldPieceID = t.activePiece.c;
                    t.activePiece = new Piece(t,-1);
                }else{
                    var savedID = t.heldPieceID;
                    t.heldPieceID = t.activePiece.c;
                    t.activePiece = new Piece(t,savedID);
                }
                t.allowedToHold = false;
                t.settleTimer = 0;
            }
        }

        this.prevLeft = Key.isDown(this.leftBtn);
        this.prevRight = Key.isDown(this.rightBtn);
        this.prevHard = Key.isDown(this.hardBtn);
        this.prevSpin = Key.isDown(this.spinBtn);
        this.prevHold = Key.isDown(this.holdBtn);
        this.prevSpinCW = Key.isDown(this.spinCWBtn);
        this.prevSpinCCW = Key.isDown(this.spinCCWBtn);

        //lock piece into place if touching below and timers up
        if (t.wouldBeColidingIfMoved(t.activePiece.cells,0,1)){
            t.settleTimer++;
            if(t.settleTimer == MAX_SETTLE || t.rotateCount >= MAX_ROTATES || t.shiftCount >= MAX_SHIFTS){
                updateResults = t.settlePiece();
                completedRows += updateResults.rowsCleared;
                this.playerLost = this.playerLost || updateResults.losing;
                t.settleTimer =0;
            }
        }
        
        ////////////////////////////////////
        // STUFF THAT HAPPENS AT MOVE RATE
        ////////////////////////////////////
        //moving down happens at a fixed rate
        if(this.gametime % MOVE_INTERVAL == 0){
            if(Key.isDown(this.softBtn)){
                t.lowerPiece();
            }
        }

        ////////////////////////////////////
        // STUFF THAT HAPPENS AT FALL RATE
        ////////////////////////////////////
        if(this.gametime % Math.floor(t.fallInterval) == 0){
            t.lowerPiece();
        }

        t.eyeCandy.update();

        return updateResults;
    }

    /** 
    * Draws the current game board and relevant objects to screen at
    * a certain offest
    * @param {Number} shiftX How much to shift the drawing
    * @param {Number} shiftY How much to shift the drawing
    */
    this.draw = function (shiftX, shiftY) {
        extraShiftY = shiftY - 2*20; //hide top two rows

        var t = this.tetris;

        if(t.dangerLevel() > MERCY_RATIO && !NO_MERCY)
            context.fillStyle="#FFDDDD";
        else
            context.fillStyle="#DDDDDD";

        context.fillRect(0+shiftX,0+shiftY,200,400);

        // Draw existing cells
        for(var i=2;i<ROWS;i++){
            for(var j=0;j<COLS;j++){
                if(t.board[i][j] != ""){
                    drawBlock(t.board[i][j],j*20+shiftX,i*20+extraShiftY);
                }
            }
        }

        // Draw ghost piece
        if(SHOW_GHOST){
            var ghost = deepCopy(t.activePiece.cells);
            var ghostY = 0;
            for(ghostY=0;ghostY<ROWS;ghostY++){
                if(t.wouldBeColidingIfMoved(ghost,0,ghostY)){
                    break;
                }
            }
            for(var i=0;i<ghost.length;i++){
                ghost[i][1]+=ghostY-1;
            }
            for(var i=0;i<ghost.length;i++){
                var c = ghost[i];
                if(inBounds(c[1],c[0])){
                    context.strokeStyle=GREY;
                    context.lineWidth = 2;
                    context.strokeRect(c[0]*20+shiftX,c[1]*20+extraShiftY,20,20);
                }
            }
        }

        // Draw active piece
        for(var i=0;i<t.activePiece.cells.length;i++){
            var c = t.activePiece.cells[i];
            if(inBounds(c[1],c[0])){
                drawBlock(t.activePiece.color,c[0]*20+shiftX,c[1]*20+extraShiftY);
            }
        }

        

        //draw next piece demo
        var nextPieceIndex = t.currentBag[t.currentBag.length-1];
        var nextPiece = getPiece(nextPieceIndex);

        var nextPieceX = 180+shiftX;
        var nextPieceY = 30+shiftY;

        for (var i = 0; i < nextPiece.length; i++) {
            var c = nextPiece[i];
            context.fillStyle=getColor(nextPieceIndex);
            context.fillRect(c[0]*10+nextPieceX,c[1]*10+nextPieceY,10,10);
        };

        context.textAlign = "center";
        context.fillStyle="#000000";
        context.font="14px sans-serif";
        context.fillText("Next",nextPieceX+50,nextPieceY-10);


        //draw held piece
        var heldPieceX = 180+shiftX;
        var heldPieceY = 350+shiftY;

        if(t.heldPieceID != -1){
            var heldPiece = getPiece(t.heldPieceID);
            for (var i = 0; i < heldPiece.length; i++) {
                var c = heldPiece[i];
                context.fillStyle=getColor(t.heldPieceID);
                context.fillRect(c[0]*10+heldPieceX,c[1]*10+heldPieceY,10,10);
            };
        }

        context.fillStyle="#000000";
        context.font="14px sans-serif";
        context.fillText("Hold",heldPieceX+50,heldPieceY-10);

        t.eyeCandy.draw(shiftX,extraShiftY);
    }
}