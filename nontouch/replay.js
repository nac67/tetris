var Replay = (function () {
    // make sure that when replaying a replay, it is not recording a new one over the one currently playing 
    //thus screwing things up., This will only become a problem inside the update function on gameplay controller, but watch out!
    var currentReplay;
    var listOPieces;

    var createNewReplay = function () {
        currentReplay = [];
        listOPieces = [];
    }

    var saveFrame = function (controls, time) {
        if (currentReplay.length > 10800) return;

        currentReplay[time] = {spin: Key.isDown(controls.spin),
                            left: Key.isDown(controls.left),
                            right: Key.isDown(controls.right),
                            soft: Key.isDown(controls.soft),
                            hard: Key.isDown(controls.hard),
                            hold: Key.isDown(controls.hold),
                            spinCW: Key.isDown(controls.spinCW),
                            spinCCW: Key.isDown(controls.spinCCW)};
    }

    var keyDownAtTime = function (keyStr, time) {
        // keyStr is like 'spinCW'
        if (time >= currentReplay.length) return false;
        return currentReplay[time][keyStr];
    }

    var getReplay = function () {
        return currentReplay;
    }

    var savePiece = function (i) {
        listOPieces.unshift(i);
    }

    var getPieceBag = function () {
        var result = listOPieces.slice();
        return result;
    }

    var updateGame = function (player, time) {
        var spinBtn = keyDownAtTime('spin', time),
            spinCWBtn = keyDownAtTime('spinCW', time),
            spinCCWBtn = keyDownAtTime('spinCCW', time),
            leftBtn = keyDownAtTime('left', time),
            rightBtn = keyDownAtTime('right', time),
            softBtn = keyDownAtTime('soft', time),
            hardBtn = keyDownAtTime('hard', time),
            holdBtn = keyDownAtTime('hold', time);

        return player.update(spinBtn, spinCWBtn, spinCCWBtn, leftBtn, rightBtn, softBtn, hardBtn, holdBtn);
    }

    return {createNewReplay: createNewReplay, saveFrame: saveFrame, keyDownAtTime: keyDownAtTime, getReplay:getReplay, updateGame: updateGame,
           savePiece: savePiece, getPieceBag: getPieceBag};
})();

Replay.running = false;