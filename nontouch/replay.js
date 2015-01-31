var Replay = (function () {
    // make sure that when replaying a replay, it is not recording a new one over the one currently playing 
    //thus screwing things up., This will only become a problem inside the update function on gameplay controller, but watch out!
    var currentReplay;

    var createNewReplay = function () {
        currentReplay = [];
    }

    var saveFrame = function (controls) {
        if (currentReplay.length > 7200) return;

        currentReplay.push({spin: Key.isDown(controls.spin),
                            left: Key.isDown(controls.left),
                            right: Key.isDown(controls.right),
                            soft: Key.isDown(controls.soft),
                            hard: Key.isDown(controls.hard),
                            hold: Key.isDown(controls.hold),
                            spinCW: Key.isDown(controls.spinCW),
                            spinCCW: Key.isDown(controls.spinCCW)});
    }

    var keyDownAtTime = function (keyStr, time) {
        // keyStr is like 'spinCW'
        if (time >= currentReplay.length) return false;
        return currentReplay[time][keyStr];
    }

    var getReplay = function () {
        return currentReplay;
    }

    return {createNewReplay: createNewReplay, saveFrame: saveFrame, keyDownAtTime: keyDownAtTime, getReplay:getReplay};
})();