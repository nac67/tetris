/**
* Class: Controls a player of a tetris game
* Manages the game board and processes the user input every time step.
* @param garbage      Reference to the 2-item garbage list which stores how many
                      junk rows to send to the the ith player
* @param garbageIndex Which index of the garbage array am I
* @param spinBtn      Which ASCII key code to use to spin piece
* @param leftBtn      Which ASCII key code to use to move left
* @param rightBtn     Which ASCII key code to use to move right
* @param softBtn      Which ASCII key code to use to soft drop
* @param hardBtn      Which ASCII key code to use to hard drop
* @param holdBtn      Which ASCII key code to use to hold piece for later
*/
var GameController = function (garbage, garbageIndex, spinBtn, leftBtn, rightBtn, softBtn, hardBtn, holdBtn) {
    /** ASCII codes for buttons */
    this.spinBtn = spinBtn;
    this.leftBtn = leftBtn;
    this.rightBtn = rightBtn;
    this.softBtn = softBtn;
    this.hardBtn = hardBtn;
    this.holdBtn = holdBtn;

    this.tetris = new TetrisBoard(garbage, garbageIndex);
    this.tetris.restartLevel(garbage, garbageIndex);

    this.gametime = 0;           //overall game timer


    this.lastMouse = false;
    this.mouseTimer = 0;
    this.pressPos = [0,0];
    this.lastFrameX = 0;
    this.lastFrameY = 0;
    this.howMuchBlockHasMoved = 0;

    this.updateMouse = function () {
        if(!this.lastMouse && leftDown){
            //console.log("press");
            this.pressPos = [mx,my];
            this.lastFrameX = mx;
            this.lastFrameY = my;
            this.mouseTimer = this.gametime;
            this.howMuchBlockHasMoved = 0;
        }
    }

    this.getMouseDelta = function (){
        if(this.lastMouse && !leftDown){
            //console.log("release");
            var dx = mx - this.pressPos[0];
            var dy = my - this.pressPos[1];
            var t  = this.gametime - this.mouseTimer;
            return [dx,dy,t];
        }
        return null;
    }


    this.playerLost = false;

    /** restarts the level */
    this.restart = function () {
        this.tetris.restartLevel();
        this.playerLost = false;
    }
    
    /** Performs one timestep in the game and processes user input */
    this.update = function () {
        var allowDist, allowAngle, allowTime, dist, angle;

        var t = this.tetris;

        this.gametime++;

        this.updateMouse();
        var deltas = this.getMouseDelta();

        ////////////////////////////////////
        // STUFF THAT HAPPENS EVERY STEP
        ////////////////////////////////////
        //spin piece, move piece or force down will happen every time step
        var spinGesture = false;
        if(deltas != null){
            dist = Math.sqrt(deltas[1]*deltas[1] + deltas[0]*deltas[0]);
            allowDist = dist < 30;
            allowTime = deltas[2] < 10;
            spinGesture = allowDist && allowTime;
        }

        if(spinGesture){
            t.rotateActivePieceIfPossible();
        }


        var dx = mx - this.pressPos[0];
        var dy = my - this.pressPos[1];

        var desireToMove = Math.round(dx/20);





        if(leftDown && Math.abs(dy)<30){
            if(this.howMuchBlockHasMoved < desireToMove){
                t.tryToMove(1,0);
                this.howMuchBlockHasMoved ++;
            }

            if(this.howMuchBlockHasMoved > desireToMove){
                t.tryToMove(-1,0);
                this.howMuchBlockHasMoved --;
            }
        }

        var dropGesture = false;
        if(deltas != null){
            angle = Math.atan2(deltas[1],deltas[0])*180/Math.PI;
            dist = Math.sqrt(deltas[1]*deltas[1] + deltas[0]*deltas[0]);

            allowAngle = Math.abs(angle-90) < 30;
            allowDist = dist > 70;
            allowTime = deltas[2] < 50;

            dropGesture = allowAngle && allowDist && allowTime;
        }

        if(dropGesture){
            t.eyeCandy.setTopOfDrop(deepCopy(t.activePiece.cells));
            for(var i=0;i<ROWS;i++){
                t.lowerPiece();
            }
            t.eyeCandy.createBlur(t.activePiece.color,t.activePiece.cells);
            this.playerLost = this.playerLost || t.settlePiece();
        }


        var holdGesture = false;
        if(deltas != null){
            angle = Math.atan2(deltas[1],deltas[0])*180/Math.PI;
            dist = Math.sqrt(deltas[1]*deltas[1] + deltas[0]*deltas[0]);

            allowAngle = Math.abs(angle- (-90)) < 30;
            allowDist = dist > 70;
            allowTime = deltas[2] < 50;

            holdGesture = allowAngle && allowDist && allowTime;
        }

        if(holdGesture){
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



        //lock piece into place if touching below and timers up
        if (t.wouldBeColidingIfMoved(t.activePiece.cells,0,1)){
            t.settleTimer++;
            if(t.settleTimer == MAX_SETTLE || t.rotateCount >= MAX_ROTATES || t.shiftCount >= MAX_SHIFTS){
                this.playerLost = this.playerLost || t.settlePiece();
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


        this.lastMouse = leftDown;
        this.lastFrameX = mx;
        this.lastFrameY = my;
        t.eyeCandy.update();



        return this.playerLost;
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