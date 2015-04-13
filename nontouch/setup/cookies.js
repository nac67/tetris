function setCookie(cname,cvalue,exdays){
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
} 

function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++){
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
} 

var CookieHelpers = {
    expire:7,

    getDateString: function (offset) {
        if (typeof(offset) === 'undefined') {
            offset = 0;
        }

        var d = new Date();
        d.setDate(d.getDate() - offset);
        parts = d.toString().split(" "); //["Mon", "Apr", "13", "2015", "15:01:10", "GMT-0400", "(Eastern", "Daylight", "Time)"]
        return parts.slice(1,3).join(" ");
    },

    incrementToday: function() {
        var oldValue = CookieHelpers.getToday();
        setCookie(CookieHelpers.getDateString(), oldValue+1, CookieHelpers.expire);
    },

    getToday: function() {
        return Number(getCookie(CookieHelpers.getDateString()));
    },

    getYesterday: function() {
        return Number(getCookie(CookieHelpers.getDateString(1)));
    },

    getPreviousDay: function(n) {
        if (n < CookieHelpers.expire) {
            return Number(getCookie(CookieHelpers.getDateString(n)));
        } else {
            throw new Error("That day has expired");
        }
    },
}