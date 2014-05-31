var express = require('express');
var app = express();
var uno = require('./uno');

/////////////////////////////////////////////////
			
console.log("######################################################################################################################################");

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { 
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

var broadcastLog = function (ev, data) {
	if(data)
		console.log("# " + ev + " - " + data);
	else
		console.log("# " + ev);
};

uno.setLog(broadcastLog);

var broadcast = function (ev, data) {
	uno.callAIs(ev, data);
};

/*	Játékos(AI) rak lapot
*		cards: [{color: 0-3, value: 0-15 }]
*		lap kérés esetén []
*	Ezután érvényes lapok esetén mindenki magkapja a kártyák értékeit. Mindenki 'ready'-t válaszol!
*	Érvénytelen lépés esetén 'badcards' üzenetet küld vissza	
*/
var onPut = function (playerid, cards) {
	if (uno.currentRound().currentPlayerId() != playerid) return;
	uno.currentRound().putCards(cards, function () {
		broadcast('put', {from: playerid, cards: cards});
	}, function () {});
}

/*	
*	Ha mindenkitől beérkezett, akkor az utolsónál a megfelelő callback hívódik vissza
*		1. callback: Mindenkitől beérkezett, következő jön
*			nextid: A következő játékos azonosítója (eredeti sorrend alapján)
*		2. callback: Mindenkitől beérkezett, passz körbeért, utolsó lapot lerakó hív
*			callid: A nyitó játékos azonosítója (eredeti sorrend alapján)
*		3. callback: Mindenkitől beérkezett, új forduló, új sorrenddel
*			neworder: Játékosok sorrendje (egész tömb, pl.: [4,1,7,2,...])
*			cardnums: Játékosok kártyáinak számai (eredeti sorrendben, pl [14,14,...,16])
*/
var onReady = function (playerid) {
	uno.currentRound().readyFrom(playerid, function (nextid) {
		if (nextid === undefined) {
			console.log("id: " + nextid);
			throw new Error();
		};
		broadcast('next', nextid); // Erre mindenki tudni fogja, hogy ki jön. Aki jön, az ezzel kapja meg a „promptot”.
		}, function (callid) {
		if (callid === undefined) {
			throw new Error();
		};
	}, function (neworder) {

		broadcastLog(" ********* RESULT ********* ");
		broadcastLog("  ");
		var l = uno.currentRound().getHistory();
		for (var i = 0; i < l.length; i++) {
			broadcastLog("\t" + (i+1) + ". " + l[i]);
		};
		broadcastLog("  ");
		broadcastLog(" ********** END ********** ");

		uno.exit();
		process.exit();
	});
}

var onUno = function(playerid){
	uno.currentRound().unoFrom(playerid, function(){ broadcast("uno", playerid); }, function(){});
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
console.log("Uno 0.0.1 -- Server-side application\n(Use \"exit\" to leave.)");
process.stdin.on('data', function(chunk) {
	if (chunk == "exit\n") {
		console.log("Is exiting...");
		uno.exit();
		process.exit();
	}
});

uno.aiPlayersNum(6, 
	function() { broadcast('newplayer', uno.playerlist()); }, 
	{ put: onPut, ready: onReady, uno: onUno, log: broadcastLog }
);

uno.startGame(function (neworder, Card) {
	broadcastLog('startgame');
	broadcast('newround', {order: neworder}); // ready-t válaszolnak, ha kész.
	broadcastLog('first card', Card);
	broadcast('next', 0);	
});

