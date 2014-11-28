/**
* Class: A mode that represents a game board and also holds the methods
* that alter it.
* @param garbage      Reference to the 2-item garbage list which stores how many
                      junk rows to send to the the ith player
* @param garbageIndex Which index of the garbage array am I
*/
var TetrisBoard = function (garbage, garbageIndex) {
    //know your enemy
    this.garbage = garbage;
    this.myIndex = garbageIndex; //0 or 1
    this.enemyIndex = (garbageIndex+1) % garbage.length; //reverse of myIndex

    this.score = 0;              //if single player

    //init variables
    this.board = [];             //20 rows 10 cols
    this.currentBag = generateBag();

    this.activePiece = null;     //invariant: no cells in activePiece can be occupied by board

    this.settleTimer = 0;        //when this reaches max_settle, piece will lock
    this.shiftCount = 0;         //if a piece has shifted or rotated too much it will
    this.rotateCount = 0;

    this.heldPieceID = -1;       //id of piece that is held, -1 means no piece held
    this.allowedToHold = true;   //can't repeatedly swap in and out held piece

    this.fallInterval = START_FALL_INTERVAL;

    this.eyeCandy = new EyeCandy();

    /**
    * Restart the Level. This will clear the board and
    * make a new active piece.
    */
    this.restartLevel = function () {
        this.board = [];
        for (var i=0;i<ROWS;i++){
            this.board.push([]);
            for(var j=0;j<COLS;j++){
                this.board[i].push("");
            }
        }
        this.activePiece = new Piece(this,-1);
        this.heldPieceID = -1;
        this.allowedToHold = true;
        this.score = 0;
        this.fallInterval = START_FALL_INTERVAL;
        this.eyeCandy.resetEverything();
    }

    /**
    * This will offset the board by n rows. If n is positive,
    * it will shift the rows down. Rows will be shifted off the board
    * and the other side will be n blank rows.
    * @param {Number} n Rows to shift
    */
    this.shiftBoard = function (n) {
        if(n<0){
            n = -n;
            for(var i=n;i<ROWS;i++){
                this.board[i-n] = this.board[i];
            }
            for(var i=ROWS-n;i<ROWS;i++){
                this.board[i] = generateEmpty();
            }
        }else{
            for(var i=ROWS-1;i>=n;i--){
                this.board[i] = this.board[i-n];
            }
            for(var i=0;i<n;i++){
                this.board[i] = generateEmpty();
            }
        }
    }


    /**
    * This will cause the bottom of the board to be
    * filled up with junk rows as a challenge. The
    * rest of the board will be shifted up.
    * @param {Number} n Rows to junk
    */
    this.junkTheBottom = function(n){
        this.shiftBoard(-n);
        var junk = generateJunk();
        for(var i=ROWS-n;i<ROWS;i++){
            this.board[i] = junk.slice();
        }
    }


    /**
     * Decides if a row has any grey tiles in it
     */
    this.isGreyRow = function (row){
        var isGrey = false;
        for(var i=0;i<COLS;i++){
            if(row[i] == GREY) isGrey = true;
        }
        return isGrey;
    }


    /**
    * This will move the active piece by a certain amount
    * User must protect against boundary issues with board
    * @param {Number} x cols to shift
    * @param {Number} y rows to shift
    */
    this.moveActivePiece = function(x,y){
        for(var i=0;i<this.activePiece.cells.length;i++){
            var c = this.activePiece.cells[i];
            c[0] += x;
            c[1] += y;
        }
        this.activePiece.origin[0] += x;
        this.activePiece.origin[1] += y;
    }


    /**
    * Decides if shifting the cells by x cols and y rows
    * will cause one or more cells to be off board or overlapping
    * existing blocks. 
    * @param {Number} x cols to shift
    * @param {Number} y rows to shift
    */
    this.wouldBeColidingIfMoved = function(cells,x,y){
        var futureCells = deepCopy(this.activePiece.cells);

        for(var i=0;i<futureCells.length;i++){
            var c = futureCells[i];
            c[0] += x;
            c[1] += y;
        }

        for(var i=0;i<futureCells.length;i++){
            var x = futureCells[i][0];
            var y = futureCells[i][1];
            if(!inBounds(y,x)){
                return true;
            }
            if(this.board[y][x] != ""){
                return true;
            }
        }
        return false;
    }


    /**
    * Moves the active piece down by one cell if possible. Resets
    * rotate, shift count.
    */
    this.lowerPiece = function(){
        if(!this.wouldBeColidingIfMoved(this.activePiece.cells,0,1)){
            this.moveActivePiece(0,1);
            this.rotateCount = 0;
            this.shiftCount = 0;
        }
    }


    /**
    * Locks a piece into place. Applies tiles to the board and creates
    * a new active piece. Manages removing rows that are full and handles
    * sending junk to enemy player. Checks for game over condition and returns.
    * @returns whether this player board is in a losing state.
    */
    this.settlePiece = function(){
        var danger = this.dangerLevel();
        
        // make changes to actual board
        for(var i=0;i<this.activePiece.cells.length;i++){
            var c = this.activePiece.cells[i];
            this.board[c[1]][c[0]] = this.activePiece.color;
        }

        // check for full rows
        var rowScore = 0;
        

        var originalRow = ROWS-1; //for keeping track of what row it was on before a ripple
        for (var i=ROWS-1;i>0;i--){
            var rowIsFull = true;
            for(var j=0;j<COLS;j++){
                if(this.board[i][j] == ""){
                    rowIsFull = false;
                }
            }
            
            // clear row, then ripple changes up
            if(rowIsFull){
                this.eyeCandy.addRow(originalRow,this.board[i]);
                if(!this.isGreyRow(this.board[i]) || ALLOW_GREY_FOR_COMBO) rowScore++;
                this.board[i] = ["","","","","","","","","",""];
                for(var j=i;j>1;j--){
                    this.board[j] = this.board[j-1].slice();
                }
                i++; //run current row again
            }
            originalRow --;
        }

        // Add garbage to enemy
        if(rowScore>0){
            this.garbage[this.enemyIndex] += rowScore-1;
            if(rowScore == 4) this.eyeCandy.flashMessage("Tetris!",0);
            if(danger>MERCY_RATIO && !NO_MERCY){
                this.eyeCandy.addRow(ROWS-1,this.board[ROWS-1]);
                this.shiftBoard(1);
                this.eyeCandy.flashMessage("Mercy Drop!",15);
            }


            //for single player
            if (SPEED_UP) this.fallInterval += (MIN_FALL_INTERVAL-this.fallInterval)/DECAY;
            for(var i=0;i<rowScore;i++){
                this.score += (i+1)*10;
            }

        }

        // Add garbage to self
        var myGarbage = this.garbage[this.myIndex];
        if(myGarbage>0){
            this.junkTheBottom(myGarbage);
            this.garbage[this.myIndex] = 0;
        }

        this.activePiece = new Piece(this,-1);
        this.rotateCount = 0;
        this.shiftCount = 0;
        this.settleTimer = 0;

        this.allowedToHold = true;

        // check for game over condition
        if(this.wouldBeColidingIfMoved(this.activePiece.cells,0,0)){
            return [true, rowScore];
        }

        return [false, rowScore];
    }

    /**
    * Tries to move a piece by an amount without causing overlap.
    * If it succeeds, it will reset the settle timer, but increment
    * the shift count.
    * @param {Number} x cols to shift
    * @param {Number} y rows to shift
    */
    this.tryToMove = function (x,y){
        if(!this.wouldBeColidingIfMoved(this.activePiece.cells,x,y)){
            this.moveActivePiece(x,y);
            this.settleTimer = 0;
            this.shiftCount ++;
        }
    }

    /**
    * Tries to rotate the active piece 90 degrees CW about its origin.
    * If it must, it may shift the piece vertically up or down by a certain
    * amount, though it will always choose the lowest position possible. This
    * accounts for  "floor kicks" (defined in detail below. 
    * This also implements "wall kicks" in which
    * it will shift the piece away from the wall to allow rotation.
    *
    * floor kick:
    * how it works is it scans through a range of y offsets that start a little (determined by piece)
    * above where the piece currently is and one unit below where the pice currently
    * is and finds the lowest amount that that piece can be placed without overlap.
    * If the lowest place is within the range of acceptable y offsets, it shifts the
    * piece by that much. Otherwise there doesn't exist an acceptable location for
    * this piece to exist if it is rotated, so it leaves the piece alone
    */
    this.rotateActivePieceIfPossible = function(){
        //don't rotate square
        if(this.activePiece.c == 3) return;

        //deep copy for clone
        var futureCells = deepCopy(this.activePiece.cells);

        //rotate clone
        for(var i=0;i<futureCells.length;i++){
            var c = futureCells[i];
            var oldX = c[0];
            var oldY = c[1];

            //perform translate, rotate, translate back
            var newX = oldX - this.activePiece.origin[0];
            var newY = oldY - this.activePiece.origin[1];
            var newnewX = -newY;
            var newnewY = newX;
            newnewX += this.activePiece.origin[0];
            newnewY += this.activePiece.origin[1];

            //assign back to cells
            c[0] = newnewX;
            c[1] = newnewY;
        }

        //wall kick
        var furthestRight = 0;
        var furthestLeft = COLS;
        for(var i=0;i<futureCells.length;i++){
            furthestLeft = Math.min(furthestLeft,futureCells[i][0]);
            furthestRight = Math.max(furthestRight,futureCells[i][0]);
        }
        var newXShift =0;
        if(furthestLeft<0){
            newXShift = -furthestLeft;
        }else if(furthestRight>=COLS){
            newXShift = (COLS-1)-furthestRight;
        }
        for(var i=0;i<futureCells.length;i++){
            futureCells[i][0]+=newXShift;
        }

        //floor kick
        var lowestAllowed = null;
        var highestKick = (this.activePiece.c == 0? -2: -1);
        for(var kickY = highestKick;kickY<=1;kickY++){

            var allowed = true;
            for(var i=0;i<futureCells.length;i++){
                var x = futureCells[i][0];
                var y = futureCells[i][1];
                if(inBounds(y+kickY,x)){
                    if(this.board[y+kickY][x] != ""){
                        allowed = false;
                    }
                }else{
                    allowed = false;
                }
            }
            if(allowed){
                lowestAllowed = kickY;
            }
        }

        for(var i=0;i<futureCells.length;i++){
            var c = futureCells[i];
            c[1] += lowestAllowed;
        }

        //make changes according to clone
        if(lowestAllowed != null){
            this.activePiece.cells = futureCells;
            this.activePiece.origin[0] += newXShift;
            this.activePiece.origin[1] += lowestAllowed;
            this.settleTimer = 0;
            this.rotateCount ++;
        }
    }


    /**
    * Calculates the danger. 0 Least danger, 1 most danger. Danger is loosely
    * defined as the closeness of the blocks to the top of the screen. More 
    * specifically, it calculates this by drawing a ray from the top of each column
    * and finding where it first encounters a block. It considers the shortest (COLS-IGNORED) rays,
    * and takes the ratio of those rays to the maximum length the ray could be. The
    * shorter the rays, the more danger. The reason for using (COLS-IGNORED) rays, and not the
    * full number of columns is sometimes you have a nearly empty column, (waiting for a long piece)
    * but you are still in danger. So it ignores the IGNORED most empty rows.
    */
    this.dangerLevel = function () {
        var IGNORED = 3;
        var colSpace = [];
        var count;
        for (var j=0; j<COLS; j++) {
            count = 0;
            for(var i=0; i<ROWS; i++){
                if(this.board[i][j] != ""){
                    break;
                }
                count ++;
            };
            colSpace.push(count-2); //account for 2 hidden rows above top
        };


        colSpace.sort(function(a,b){return a-b});
        var sum = 0;
        for (var i = 0; i < COLS-IGNORED; i++) {
            sum += colSpace[i];
        };
        var totalPossible = (COLS-IGNORED)*(ROWS-2); //rows-2 due to hidden rows

        //if(garbageIndex == 1)test_txt.innerHTML = colSpace.toString()//"sum: "+sum+"\n"+(1-(sum/totalPossible));
        return 1-(sum/totalPossible);
    }
} 