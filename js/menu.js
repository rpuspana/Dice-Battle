/*
 * Developer : Radu Nicolae Puspana
 * Dev date  : 2017
 * Version   : 1.0
 */

/* Script details :
 * - used by menu.html
 * - contains the logic for the menu page ?????
 */

// log user agent, webpage and script name
logPlayerBrowserDetails();

// warning message to display if user opened this page by double clicking on
// menu.html from the OSs file manager
var wGameMenuAccessViolation = 
    '<p class="gameWarning"><i class="ion-android-lock"></i>' +
    '<br>Looks like you spilled a cup of invisible ink on the menu\'s links...' +
    '<br>You can make them appear again by using the game\'s menu.</p>';

// close button is displayed if menu.html was opened from start-game.html menu button
var btnClose = '<button class="btn-close-menu" id="btn-close">' + 
               '<i class="ion-android-close"></i></button>';

// reference to div with id game-menu-content-placeholder
var contPlHolder;

// reference to the page that opened the menu.html page
var fatherPage = window.opener;

// reference to div with id game-menu-page-content
var player0panelDiv = document.getElementById('game-menu-page-content');

// get the name of the current js script
var currentScriptName = getScriptNameById('menu-script');


// if menu.html was not opened by start-game.html
if ((typeof (fatherPage) === 'undefined') || (fatherPage === null)) {

    console.warn('%sWARN  %s This page was not opened by the game.', 
                 getTimeAndDate(), 
                 currentScriptName);
    
    contPlHolder = document.getElementById('game-menu-content-placeholder');

    // create and add the page access violation banner in where the menu links are
    createAndAddHTMLtag(contPlHolder, wGameMenuAccessViolation);
    
    // hide the menu's links
    document.getElementById('main-menu').style.display = 'none';
    console.warn('%sWARN  %s hiding the main manu (and it\'s links)', 
                 getTimeAndDate(), 
                 currentScriptName);
}
else {
    // insert a close tab button
    createAndAddHTMLtag(player0panelDiv, btnClose);

    // add click event listener on the close button created above.
    // when the user clicks this button, it closes the browser tab of menu.html
    document.getElementById('btn-close').addEventListener('click', function () {
        window.close();
    });
}

// create a HTML element and insert it as a first child of player0panelDiv
// param parentElem String  DOM element under which to place the htmlElem
// param htmlElem   String  DOM element to be created
function createAndAddHTMLtag(parentElement, htmlElem) {
    console.log('%sDEBUG  %s createAndAddHTMLtag(%O, %s)', 
                 getTimeAndDate(), currentScriptName, parentElement, htmlElem);
    
    var htmlElement = createTagFromStrLiteral(htmlElem);
    
    parentElement.insertBefore(htmlElement, parentElement.firstChild);
    console.info('%sINFO  %s Inserted %O in the DOM as a first child of main-menu div.', getTimeAndDate(), currentScriptName, htmlElement);
}

// create a HTML element and return it using DOM methods
// param htmlElem string  the HTML element that is to be created
// return frag DocumentFragment  HTML elements of htmlElem appened appended to the DocumentFragment
function createTagFromStrLiteral(htmlElem) {
    console.info('%sINFO  %s createTagFromStrLiteral(%s)', 
                 getTimeAndDate(), currentScriptName, htmlElem);
    
    var frag = document.createDocumentFragment();
    var temp = document.createElement('div');

    temp.innerHTML = htmlElem; 
    
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }

    console.log('%sDEBUG  %s createTagFromStrLiteral(param) returns %O', 
                 getTimeAndDate(), currentScriptName, frag);
    return frag;
}