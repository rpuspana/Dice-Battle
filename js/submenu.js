/*
 * Developer : Radu Nicolae Puspana
 * Dev date  : 2017
 * Version   : 1.0
 */

/*
 * Script details :
 * - used by rules.html, contact.html, credits.html
 * - contains the logic for adding the "back" and "close tab" buttons
 *   on the pages above or the page access denied banner if the page 
 *   was opend from the user's OSs file manager
 */

// log user agent, webpage and script name
logPlayerBrowserDetails();

// get the name of the current js script
var currentScriptName = getScriptNameById('submenu-script');

// get the current page's link
var pageURLlowercase = window.location.href.toLowerCase();

// get the name of the page without .html
// in case the page's name contains "-" repalce it with space
var pageName = pageURLlowercase.split("/").pop().split(".").shift().replace('-', ' ');

// warning message to display if user opened rules.html, help.html, about.htlml pages
// from the OSs file manager
var wPageAccesDenied = '<p class="gameWarning"><i class="ion-android-lock"></i>' +
    '<br>Looks like you spilled a cup of invisible ink on the content... .' +
    '<br>You can make it appear again by starting the game, ' + 
    'clicking the menu button and selecting "' + pageName + '".</p>';

//close button is displayed if this page was opened from the menu button planced on 
// start-game.html
var btnClose = '<button class="btn-close-menu" id="btn-close">' + 
               '<i class="ion-android-close"></i></button>';

//back to menu button is displayed if rules.html, help.html, about.html pages
// were opened from menu.html
var btnBackToMenu = '<button class="btn-close-menu" id="btn-back-menu">' + 
                    '<i class="ion-ios-arrow-back"></i></button>';

// reference to game-menu-content-placeholder div
var divGameRulesPlaceholder;

// reference to the page that opened the current page
var fatherPage = window.opener;

var player0panelDiv = document.getElementById('game-menu-page-content');


// if this page was not opened using the menu button from the game board
if ((typeof (fatherPage) === 'undefined') || (fatherPage === null)) {
    
     console.warn('%sWARN %s This page was not opened by the game.', 
                 getTimeAndDate(), 
                 currentScriptName);
    
    divGameRulesPlaceholder = document.getElementById('game-menu-content-placeholder');
    
    // insert <p> tag with "access denied" message
    createAndAddHTMLtag(divGameRulesPlaceholder, wPageAccesDenied)
    
    document.getElementById('content-placeholder-dummy').style.display = 'none';
    console.warn('%sWARN %s hide the main menu', 
                 getTimeAndDate(), 
                 currentScriptName);
    
    if (divGameRulesPlaceholder.style.overflowY.length > 0) {
        divGameRulesPlaceholder.style.overflowY = '';
        console.warn('%sWARN %s hide content vertical cursor (overflowY = "")', 
                 getTimeAndDate(), 
                 currentScriptName);
    }
   
}
else {
    // insert "close menu" and "back to menu" buttons on the current page
    // and add events for each of them
    insertSubMenuButtons();
}

// insert "back to menu" and "close menu" and buttons.
// Add events for each of them
function insertSubMenuButtons() {
    console.log('%sDEBUG %s insertSubMenuButtons()', 
                 getTimeAndDate(), 
                 currentScriptName);
    
    // insert a back-to-menu button on the rules.html page
    createAndAddHTMLtag(player0panelDiv, btnBackToMenu);

    // load menu.html page in the same tab
    // when the user clicks the left-facing arrow button
    document.getElementById('btn-back-menu').addEventListener('click', function () {
        document.location.assign('menu.html');
    });

    // insert a close window button for every page except stat-game.html
    createAndAddHTMLtag(player0panelDiv, btnClose);

    // close the tab if the user clicks on the close button
    document.getElementById('btn-close').addEventListener('click', function () {
        window.close();
    });
}

// create a HTML element and insert it as a first child of player0panelDiv
// htmlElem String string literal of a HTML element
function createAndAddHTMLtag(parentElement, htmlElem) {
     console.log('%sDEBUG %s createAndAddHTMLtag(%O, %s)', 
                 getTimeAndDate(), currentScriptName, parentElement, htmlElem);
    
    var htmlElement = createTagFromStrLiteral(htmlElem);
    
    parentElement.insertBefore(htmlElement, parentElement.firstChild);
    console.info('%sINFO  %s  Inserted %O in the DOM as a first child of main-menu div.', getTimeAndDate(), currentScriptName, htmlElement);
}

// create a HTML element and return it using DOM methods
// htmlElem String the HTML element that is to be created
// return frag DocumentFragment  HTML elements of htmlElem appened appended to the DocumentFragment
function createTagFromStrLiteral(htmlElem) {
     console.info('%sINFO %s  createTagFromStrLiteral(%s)', 
                 getTimeAndDate(), currentScriptName, htmlElem);
    
    var frag = document.createDocumentFragment();
    var temp = document.createElement('div');

    temp.innerHTML = htmlElem; 
    
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }

    console.log('%sDEBUG %s  createTagFromStrLiteral(param) returns %O', 
                getTimeAndDate(), currentScriptName, frag);
    return frag;
}