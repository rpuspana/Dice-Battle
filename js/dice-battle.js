/*
 * Developer : Radu Nicolae Puspana
 * Dev date  : 2017
 * Version   : 1.0
 */

/* Script details :
 * - used by start-game.html
 * - contains all the logic of the dice game
 * - log statements format : date time UTC ERR_LVL file-name-function-definition message
 *   Eg: 2017-7-5 13:23:45:431 UTC INFO library.js importing library
 */


var currentRunningScript;

// how much points a player needs to win the game
var DEFAULT_WINNER_SCORE;

// number of miliseconds to wait until the roll dice and hold button
// can be clicked by the user again
// 1000 ms = 1 second
var WAIT_TIME_BETWEEN_BUTTON_CLICKS;

// if this number is shown on just one dice, causes the player to pass game controls
var DICE_FACE_PASS_CONTROLS;

// if this number is shown on both dice, set player's score and round score to 0,
// player's round score is 0, pass the dice to the next player
var DICE_FACE_SCORE_RESET

// if this number is shown on both dice, increase player's score by a number of points.
// if the score is < DEFAULT_WINNER_SCORE, pass the dice to the next player
// if the score is >= DEFAULT_WINNER_SCORE, player wins
var DICE_FACE_INCREASE_SCORE;

// bonus when player rolls 6 6
var BONUS_SCORE_66_ROLL;

// the player wiht a score of at least this many points, wins
var DEFAULT_WINNER_SCORE;

// total score of each player
// scores[0] holds the score of Player 1
// scores[1] holds the score of Player 2
var scores;

// roud score of the current player
var roundScore;

// current player. 
var activePlayer;

// state variable to see if the game is still on or not
var gameOn;

// state variable indicating if it's the next player's turn
var nextPlayerTurn;

// flag variable to stop users from not clicking the roll dice and hold buttons
// too fast
var waitTimeOver;

// variable for handling the menu page
var menuPageRef;

currentRunningScript = getScriptNameById('dice-battle-script');

// log user agent, webpage and script name
logPlayerBrowserDetails();

// Set up global game variables, player UI, in order to start a new game
initilizeGame();

// The menu.html page will be closed if the following events will happen 
// on start-game.html : page close, page refresh, clicking the browser's back button
window.onbeforeunload = function() {
    if (menuPageRef !== null) {
        menuPageRef.close();
        
        // Don't show the browser's 
        // "this page is asking you to confirm that you want to leave - data you have entered
        // may no be saved" confirmation popup and close the menu page directly
        return null;
    }
}

// Event handler for clicking on the menu button
document.querySelector('.btn-menu').addEventListener('click', function(){
    
    // if the menu.html page was never opened or closed
    if (menuPageRef === null || menuPageRef.closed) {
        // open the manu page in a new tab of the same browser
        menuPageRef = window.open('menu.html', 'menu-page');
        console.info(getTimeAndDate() + 'INFO Player opened the menu page');
    } else {
     // if the browser supports the focus() function and the
     // page is opened opened, bring it front.
        if (window.focus) { 
            menuPageRef.focus();
        }
    }
});

// Event handler for clicking the "New game" button
document.querySelector('.btn-new').addEventListener('click', function() {
    if (gameOn) {
        console.info(getTimeAndDate() + 'INFO Player clicked the new game button ending the current game');
    }
    else {
        console.info(getTimeAndDate() + 'INFO Player clicked the new game button');
    }
    
    // Set up global game variables and update the UI accordingly
    initilizeGame();                   
});

// Event handler for clicking the "roll dice" button
document.querySelector('.btn-roll').addEventListener('click', function () {
    
    console.info(getTimeAndDate() + 'INFO  * Player ' + (activePlayer + 1) + 
                 ' clicked the ROLL DICE BUTTON');
    
    var diceFace1, diceFace2;
    
    // add delay between clicks on the "roll dice" button
    setTimeout(function() {
        waitTimeOver = true;
        
        //when the time expires, hide the "fast clicking documentation"
        document.getElementById('fast-click-notification').style.display = 'none';
    }, WAIT_TIME_BETWEEN_BUTTON_CLICKS);

    console.log('%sDEBUG  gameOn = %s', getTimeAndDate(), gameOn);
    console.log('%sDEBUG  waitTimeOver = %s', getTimeAndDate(), waitTimeOver);
    
    if (gameOn) {
        if (waitTimeOver) {
            // enforce the wait time to prevent fast and multiple clicks on the "roll dice" button
            waitTimeOver = false;
            console.log('%sDEBUG  waitTimeOver = ', getTimeAndDate(), waitTimeOver);
            
            // when player rolls, hide the spcial dice roll notification
            document.getElementById('dice-roll-notification').style.display = 'none';
            console.log('%sDEBUG  remove DOM element with id dice-roll-notification', getTimeAndDate());

            // generating the number x representing the dice face, 1 <= x <= 6
            diceFace1 = Math.floor(Math.random() * 6) + 1;
            diceFace2 = Math.floor(Math.random() * 6) + 1;
            
            console.log(getTimeAndDate() + 'DEBUG  generated dice: d1 = ' + 
                        diceFace1 + ', d2 = ' + diceFace2);

            // display dice wid ID on the UI
            displayDice('1', diceFace1);
            displayDice('2', diceFace2);

            // evaluate dice roll, set his scores, update his UI panel
            setPlayerScoreAndRoundScore(diceFace1, diceFace2);

            // check to see if the dice controls will be passed to the next player
            if (nextPlayerTurn) {
                // pass controls to the next player
                nextPlayer();
            }
            else {
                // if the current player has a score equal or greater than the winner score
                if (scores[activePlayer] >= DEFAULT_WINNER_SCORE) {
                    console.info(getTimeAndDate() + 'INFO   Player ' + (activePlayer + 1) + ' wins');

                    // set variables to end the game and display the game over notification
                    endGame();
                }
            }
        }
        // if the game is on and the wait time between clicks is not over
        else {
            // show the fast click notification, hide all other notifications
            setNotificationsVizibility('none', 'block', 'none');
        }
    }
    // if the game is over
    else {
        // display the "game over, roll dice button disabled" notification
        displayOrLogDiceBtnDisabledNotif('Game over. "Roll dice" button disabled');
    }
});

// Event handler for clicking the "end turn" button
document.querySelector('.btn-hold').addEventListener('click', function () {
    
    console.info(getTimeAndDate() + 'INFO  # Player ' + (activePlayer + 1) + ' clicked the END TURN BUTTON');
    
    // add delay between clicks on the "end turn" button
    setTimeout(function() {
        waitTimeOver = true;
        
        //when the time expires, hide the "fast clicking" notification
        document.getElementById('fast-click-notification').style.display = 'none';
    }, WAIT_TIME_BETWEEN_BUTTON_CLICKS);
    
    console.log('%sDEBUG  gameOn = %s', getTimeAndDate(), gameOn);
    console.log('%sDEBUG  waitTimeOver = %s', getTimeAndDate(), waitTimeOver);
    
    if (gameOn) {
        if (waitTimeOver) {

             // enforce the wait time to prevent fast and multiple clicks on the roll dice button
            waitTimeOver = false;
            console.log('%sDEBUG  waitTimeOver = ', getTimeAndDate(), waitTimeOver);

            // when player end this turn, hide the spcial dice roll notification
            document.getElementById('dice-roll-notification').style.display = 'none';
            console.log('%sDEBUG  remove DOM element with id dice-roll-notification', getTimeAndDate());

            // add player's current score to his global score
            scores[activePlayer] += roundScore;
            console.log(getTimeAndDate() + 'DEBUG  Player ' + (activePlayer + 1) + 
                        ' score = ' + scores[activePlayer]);

            // update the UI with the newly calculated global score.
            document.querySelector('#score-' + activePlayer).textContent = scores[activePlayer];

            // check if the current player won the game
            if (scores[activePlayer] >= DEFAULT_WINNER_SCORE) {
                console.info(getTimeAndDate() + 'INFO   Player ' + (activePlayer + 1) + ' wins');

                // emphasize current player as winner and end the game
                endGame()
            } 
            else {
                // pass controlls to the next player
                nextPlayer();
            }
        }
        // if the game is in progress and the wait time between clicks is not over
        else {
            // show the fast click notification, hide all other notifications
            setNotificationsVizibility('none', 'block', 'none');
        }
    }
     // if the game is over
    else {
        // display the 'Game over. "End turn" button disabled' notification
        displayOrLogDiceBtnDisabledNotif('Game over. "End turn" button disabled');
    }
});

// end the game, delay/not delay displaying the current player as winner, show the "game over" notification
function endGame() {
    console.log('%sDEBUG  endGame()', getTimeAndDate());
    
    var showWinnerDelay;
    var specialDiceRollNotifDisplayProp = document.getElementById('dice-roll-notification').style.display;
    
    // if a special dice roll notification is on, delay showing the winner and "game over" notification
    // by an amount of milliseconds
    specialDiceRollNotifDisplayProp === 'block' ? showWinnerDelay = 2000 : showWinnerDelay = 0;
    
    // make the players unable to roll the dice or hold the dice
    gameOn = false;
    console.info(getTimeAndDate() + 'INFO    gameOn = ' + gameOn);
   
    if (specialDiceRollNotifDisplayProp === 'block') {
        console.info('%sINFO   delay by %d milliseconds showing the winner on the UI and displaying the "game over" notification', getTimeAndDate(), showWinnerDelay);
    }
    
    // timeout ncessary to give user time to read another notification 
    setTimeout(function() {
        if (specialDiceRollNotifDisplayProp === 'block') {
            console.info('%sINFO   resume showing the winner on the UI and displaying the "game over" notification', getTimeAndDate());
        }

        // emphasize winning player on the UI
        emphasizeWinningPlayerOnUI();

        // hide the special dice roll and the fast clicking documentation
        setNotificationsVizibility('none', 'none', 'block');

        displayNotification('game-over-notification', 
                            'game-over-notif-style', 
                            "Game over. Player " + (activePlayer + 1) + ' wins');

        console.info(getTimeAndDate() + 'INFO    *** GAME OVER ***');
    }, showWinnerDelay);
}

// display a notification indicating that a dice controling button is disabled on the UI, 
// or just log the notifications message if the notification is already on the UI
// notifMsg String notification message to display or log
function displayOrLogDiceBtnDisabledNotif(notifMsg) {
    console.log('%sDEBUG  displayOrLogBtnDisabledNofifMsg(%s)',
               getTimeAndDate(), notifMsg);
    
    var gameOverNotifMsg = document.getElementById('game-over-notification').textContent;
    
    // if notification currently on has a text different from notifMsg
    if (gameOverNotifMsg !== notifMsg) {
        // hide the special roll, the fast click notifications and
        // show game over notification
        setNotificationsVizibility('none', 'none', 'block');

        // display the "dice control button disabled" notification
        displayNotification('game-over-notification', 'dice-btn-disabled-notif-style', notifMsg);
    }
    else {
        console.log('%sDEBUG   %s', getTimeAndDate(), notifMsg);
    }
}

// emphasize the winning player on UI
function emphasizeWinningPlayerOnUI() {
    console.log(getTimeAndDate() + 'DEBUG   emphasizeWinningPlayerOnUI()');

    // isert the "winner" CSS class to <div class="player-activePlayer-panel active">
    document.querySelector('.player-' + activePlayer + '-panel').classList.add('winner');

    // remove the "active" CSS class from <div class="player-activePlayer-panel winner active">
    document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
}


// Set up global game variables and update the UI accordingly, in order to start a new game
function initilizeGame() {
    console.info(getTimeAndDate() + 'INFO  inside %s', currentRunningScript);
    console.info(getTimeAndDate() + 'INFO  *** START GAME ***');
    console.log(getTimeAndDate() + 'DEBUG initilizeGame()');
    
    // if this number is shown on just one dice, causes the player to pass game controls
    DICE_FACE_PASS_CONTROLS = 1;
    console.log(getTimeAndDate() + 'DEBUG   DICE_FACE_PASS_CONTROLS = ' + DICE_FACE_PASS_CONTROLS);
    
    // if this number is shown on both dice, set player's score and round score to 0,
    // player's round score is 0, pass game controls
    DICE_FACE_SCORE_RESET = 1;
    console.log(getTimeAndDate() + 'DEBUG   DICE_FACE_SCORE_RESET = ' + DICE_FACE_SCORE_RESET);
    
    // if this number is shown on both dice, increase player's score by a number of points.
    // if the score is < DEFAULT_WINNER_SCORE, pass the dice to the next player
    // if the score is >= DEFAULT_WINNER_SCORE, player wins
    DICE_FACE_INCREASE_SCORE = 6;
    console.log(getTimeAndDate() + 'DEBUG   DICE_FACE_INCREASE_SCORE = ' + DICE_FACE_INCREASE_SCORE);
    
    BONUS_SCORE_66_ROLL = 20;
    console.log(getTimeAndDate() + 'DEBUG   BONUS_SCORE_66_ROLL = ' + BONUS_SCORE_66_ROLL);

    // the player wiht a score of at least this many points, wins
    DEFAULT_WINNER_SCORE = 100;
    console.log(getTimeAndDate() + 'DEBUG  DEFAULT_WINNER_SCORE = ' + DEFAULT_WINNER_SCORE);
    
    // number of miliseconds (ms) a player has to wait between clicks
    /// 1000 ms = 1 second
    WAIT_TIME_BETWEEN_BUTTON_CLICKS = 3000;
    console.log(getTimeAndDate() + 'DEBUG  WAIT_TIME_BETWEEN_BUTTON_CLICKS = ' + WAIT_TIME_BETWEEN_BUTTON_CLICKS);
    
    // player to roll dice
    // acticePlayer = 0 => player 1 rolls dice
    // acticePlayer = 1 => player 2 rolls dice
    activePlayer = 0;
    console.log(getTimeAndDate() + 'DEBUG  Player ' + activePlayer + ' rolls dice');
    
    // scores[0] = player 1 score, scores[1] = player 2 score
    scores = [0, 0];
    console.log(getTimeAndDate() + 'DEBUG  Player 1 score ' + scores[0]);
    console.log(getTimeAndDate() + 'DEBUG  Player 2 score ' + scores[1]);
    
    // current player round score
    roundScore = 0;
    console.log(getTimeAndDate() + 'DEBUG  Player ' + (activePlayer + 1) + ' round score ' + roundScore);
    
    // state variable indicating if it's the next player's turn
    nextPlayerTurn = false;
    
    // gameOn = true  => game is in progress
    // gameOn = false => game is over
    gameOn = true;
    console.log(getTimeAndDate() + 'DEBUG  gameOn = ' + gameOn);
    
    // "roll dice" or "end turn" buttons are enabled again after a short wait time
    waitTimeOver = true;
    
    // reference for the menu page
    menuPageRef = null;
    
    // initialize UI for player 1, id = 0
    initialisePlayerUI(0);
    
     // initialize UI for player 2, id = 1
    initialisePlayerUI(1);
    
    // initialise game board
    initialiseGameBoard();
}

// initialize player panel on the UI
function initialisePlayerUI(playerID) {
    console.log(getTimeAndDate() + 'DEBUG  initialisePlayerUI(' + playerID + ')');
    
    // set player total score to 0
    document.getElementById('score-' + playerID).textContent = '0';
    
    // set each player's round score to 0
    document.getElementById('current-' + playerID).textContent = '0';
    
    // restore player name
    document.getElementById('name-' + playerID).textContent = 'Player ' + (playerID + 1);

    // remove the "winner" CSS class from <div class="player-playerID-panel">
    // that may have been inserted into this <div> from the last game
    document.querySelector('.player-' + playerID + '-panel').classList.remove('winner');

    // remove the "active" CSS class from <div class="player-playerID-panel">
    // that may have been inserted into this <div> from the last game
    document.querySelector('.player-' + playerID + '-panel').classList.remove('active');
}

// initialise game board to start a new game
function initialiseGameBoard() {
    console.log(getTimeAndDate() + 'DEBUG  initialiseGameBoard()');

    // emphasize activ player on UI
    document.querySelector('.player-' + activePlayer + '-panel').classList.add('active');
    console.log(getTimeAndDate() + 'DEBUG   Player ' + (activePlayer + 1) + 
                ' rolls the dice first');
    
    console.log('%sDEBUG   hide both dice on UI', getTimeAndDate());
    
    // hide all notifications on start-game.html at the begining of a new game
    setNotificationsVizibility('none', 'none', 'none');
}

// set the display property on all notifications for start-game.html
// specialRollNotifSwitch String display property of the special dice roll notification
// fastClickNotifSwitch   String display property of the fast click notification
// gameOverNotifSwitch    String display property of the game over notification
function setNotificationsVizibility(specialRollNotifSwitch, 
                                    fastClickNotifSwitch, 
                                    gameOverNotifSwitch) {
     console.log('%sDEBUG   setNotificationsVizibility(%s, %s, %s)',
                getTimeAndDate(), specialRollNotifSwitch, fastClickNotifSwitch, gameOverNotifSwitch);

    // set the display property for the special dice roll notification 
    document.getElementById('dice-roll-notification').style.display = specialRollNotifSwitch;

    // set the display property for the fast-clicking notification
    document.getElementById('fast-click-notification').style.display = fastClickNotifSwitch;

    // set the display property for the game over notification
    document.getElementById('game-over-notification').style.display = gameOverNotifSwitch;
}

// set score and round score of a player and update the corresponding UI elemetns
// based on his dice roll
// param dice1Num  number  number shown on dice 1
// param dice2Num  number  number shown on dice 2
function setPlayerScoreAndRoundScore(dice1Num, dice2Num) {
    
    console.log(getTimeAndDate() + 'DEBUG  setPlayerScoreAndRoundScore(' + 
                dice1Num + ',' + dice2Num + ')');
    
    // message to show when one of the dice shows 1 after a roll
    var passDiceNotifMsg = 'Score is kept, round score 0, next player\'s turn';
    
    // message to display when the user rolls 1 1
    var resetScoresNotifMsg = 'Score 0, round score 0, next player\'s turn';
    
    // message to display when the user rolls 6 6
    var IncreaseScoreNotifMsg = 'Score + ' + BONUS_SCORE_66_ROLL + ', round score 0';
    
    // hold dice or pass dice
    var retainDiceInfo = '';
    
    // neither dice is DICE_FACE_SCORE_RESET and one of them is not DICE_FACE_INCREASE_SCORE
    if (((dice1Num !== DICE_FACE_SCORE_RESET) && (dice2Num !== DICE_FACE_SCORE_RESET)) &&
       ((dice1Num !== DICE_FACE_INCREASE_SCORE) || (dice2Num !== DICE_FACE_INCREASE_SCORE))) {
        
        // add numbers from both dice to the round score
        roundScore += (dice1Num + dice2Num);
        
        // update round score of player
        document.getElementById('current-' + activePlayer).textContent = String(roundScore);
        
        // current player has dice control
        nextPlayerTurn = false;
    }
    
    // both dice show the value DICE_FACE_SCORE_RESET
    if ((dice1Num === DICE_FACE_SCORE_RESET) && (dice2Num === DICE_FACE_SCORE_RESET)) {
        
        roundScore = 0
        scores[activePlayer] = 0;
        
        // enter the new scores on the player's panel
        updatePlayerIDscoresUI(activePlayer, roundScore, scores[activePlayer]);
        
        // notify the user and explain to him the consequences of this special dice roll
        displayNotification('dice-roll-notification', 'reset-score-notif-style', 
                            resetScoresNotifMsg);
        
        // give the dice to the next player
        nextPlayerTurn = true;
        
    }
    // In version 1 of the game DICE_FACE_SCORE_RESET = DICE_FACE_PASS_CONTROLS = 1
    // For a 1 1 dice roll, the code block above and below were executed
    // and only the above if should execute
    else if ((dice1Num === DICE_FACE_PASS_CONTROLS) || (dice2Num === DICE_FACE_PASS_CONTROLS)) {
        
        roundScore = 0;
        
        document.getElementById('current-' + activePlayer).textContent = String(roundScore);
        
        // notify the user and explain to him the consequences of this special dice roll
        displayNotification('dice-roll-notification', 'pass-controls-notif-style',                                                      passDiceNotifMsg);
        
        // give dice control to the next player
        nextPlayerTurn = true;
    }
    
    // both dice show the value DICE_FACE_INCREASE_SCORE
    if ((dice1Num === DICE_FACE_INCREASE_SCORE) && (dice2Num === DICE_FACE_INCREASE_SCORE)) {
        
        roundScore = 0;
        scores[activePlayer] += BONUS_SCORE_66_ROLL;
        
        // if the current player did not win
        if ((scores[activePlayer]) < DEFAULT_WINNER_SCORE) {
            retainDiceInfo = ', next player\'s turn';
            nextPlayerTurn = true
        }
        else {
            retainDiceInfo = '. Calculating winner...';
            nextPlayerTurn = false;
        }
        
        // for the current player, update the UI with the new round score and score
        updatePlayerIDscoresUI(activePlayer, roundScore, scores[activePlayer]);
        
        // display a notification informing the user of his new round score, score,
        // and if it's the next player's turn
        displayNotification('dice-roll-notification', 'increase-score-notif-style', 
                            (IncreaseScoreNotifMsg + retainDiceInfo));
    }
    
    console.log(getTimeAndDate() + 'DEBUG   Player ' + (activePlayer + 1) + 
                ' score = ' + scores[activePlayer]);
    console.log(getTimeAndDate() + 'DEBUG   Player ' + (activePlayer + 1) +
                ' round score = ' + roundScore);
    console.log(getTimeAndDate() + 'DEBUG   nextPlayerTurn = ' + nextPlayerTurn);
}

// display and set a color theme for a targeted element
// elemId    String  id of targeted element
// cssClass  String  CSS class to apply on the selected element
// msg       String  the content of the element
function displayNotification(elemId, cssClass, msg) {
    console.info('%INFO   displayNotification(%s, %s, "%s")',
                getTimeAndDate(), elemId, cssClass, msg);
   
    var notifElem = document.getElementById(elemId);
    var cssClassOfNotifElem = notifElem.className;
    
    if (cssClassOfNotifElem !== '') {
        notifElem.classList.remove(cssClassOfNotifElem);    
    }
    
    notifElem.classList.add(cssClass);
    notifElem.textContent = msg;
    notifElem.style.display = 'block';
}

// update a player's round score and score on the UI
// param playerID    number  id of the player who's UI will be updated
// param roundScore  number  number to update the player's round score from the UI
// param score       number  number to update the player's score from the UI
function updatePlayerIDscoresUI(playerID, roundScore, score) {
     console.log('%sDEBUG   updatePlayerIDscoresUI(%d, %d, %d)',
                getTimeAndDate(), playerID, roundScore, score);
    document.getElementById('current-' + playerID).textContent = String(roundScore);
    document.getElementById('score-' + playerID).textContent = String(score);
}

// display the dice face on the UI
// param diceID    String   the ID of the dice to display
// param diceFace  integer  a number between 1 and 6
function displayDice(diceID, diceFace) {
    console.log(getTimeAndDate() + 'DEBUG  displayDice(diceID=' + 
                diceID + ', face=' + diceFace + ')');
    
    // reference to the first or second dice image in the DOM
    var diceDOM;
    
    diceDOM = document.getElementById('dice-' + diceID);
    diceDOM.style.display = 'block';
    diceDOM.src = '../img/dice/dice-' + diceFace + '.png';
}

// pass control to the next player and highlight the current player on the UI
function nextPlayer() {
    console.log(getTimeAndDate() + 'DEBUG  nextPlayer()');
                 
    // next player's turn
    activePlayer === 0 ? activePlayer = 1 : activePlayer = 0;
    console.log(getTimeAndDate() + 'DEBUG   controlls passed to Player ' + (activePlayer + 1));
    
    // current player round score
    roundScore = 0;
    console.log(getTimeAndDate() + 'DEBUG   Player ' + (activePlayer + 1) + ' round score = ' + roundScore);
    
    // show both player's round score as 0 on the UI
    document.getElementById('current-0').textContent = '0';
    document.getElementById('current-1').textContent = '0';

    // mark current player on the UI by using the "actice" CSS class
    // if it finds the "active" class it will remove it
    // if it doesn't it will add it
    document.querySelector('.player-0-panel').classList.toggle('active');
    document.querySelector('.player-1-panel').classList.toggle('active');
}
