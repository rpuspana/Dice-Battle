/*
 * Developer : Radu Nicolae Puspana
 * Dev date  : 2017
 * Version   : 1.0
 */

/* Script details:
 * - used by dice-battle.js, menu.js, submenu.js
 * - containing functions for
 *   - log user agent and active webpage
 *   - getting the time and date to be used in logging statements
 * - log file in the format date time UTC ERR_LVL file-name-function-definition message
 *   Eg: 2017-7-5 13:23:45:431 UTC INFO library.js importing library library.js 
 */


console.info('%sINFO  %s importing library %s ', getTimeAndDate(), getScriptNameById('js-library'), getScriptNameById('js-library'));

// return the script name from it's full path
// return String scriptName.html
function getScriptNameById(scriptId) {
    var libraryScriptPath = document.getElementById(scriptId).src;
    var lastIdx = libraryScriptPath.lastIndexOf('/') + 1;
    return (libraryScriptPath.substring(lastIdx));
}

// log user agent and active webpage
function logPlayerBrowserDetails() {
    console.log('%sDEBUG %s  logPlayerBrowserDetails()', getTimeAndDate(),  getScriptNameById('js-library'));
    
    var libraryScriptName = getScriptNameById('js-library');
    var userAgent, lastIndex, currentWindow;
    
    // get the full link of the current page
    currentWindow = window.location.href;
    
    // the user can change this in the browser's settings, not ideal to use
    userAgent = navigator.userAgent;
    
    console.log('%sDEBUG %s   UA %s', getTimeAndDate(), libraryScriptName, userAgent);
    
    lastIndex = currentWindow.lastIndexOf('/');
    console.log('%sDEBUG %s   active webpage : ' + 
                 currentWindow.substring(lastIndex + 1), getTimeAndDate(), libraryScriptName);
}

// get tind and date to use for logging
// return dateAndTime String time and date formated as YYYY-MM-DD HH:MM:SS UTC
// return String YYYY-MM-DD HH:MM:SS UTC
function getTimeAndDate() {
    var date = new Date;

    var hour = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    var seconds = date.getUTCSeconds()
    var milliSeconds = date.getUTCMilliseconds();

    var year = date.getUTCFullYear();
    var month = date.getUTCMonth() + 1;
    var day = date.getUTCDate();
    
    var dateAndTime = ''  + year + '-' + month + '-' + day +
                      ' ' + hour + ':' + minutes + ':' + seconds + ':' + milliSeconds +
                      ' UTC ';
    
    return dateAndTime;
}