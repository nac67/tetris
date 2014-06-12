/**
* Deep copies an array
*/
function deepCopy(arry){
    var newArry = [];
    for (var i = 0; i < arry.length; i++){
        newArry[i] = arry[i].slice();
    }
    return newArry;
}

/**
* Checks if row,col is within board limits
*/
function inBounds(r,c){
    if(r < 0 || r>=ROWS || c < 0 || c>=COLS){
        return false;
    }else{
        return true;
    }
}
