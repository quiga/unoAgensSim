module.exports = function () {
	require('./jsexpansion');
	var db = require('./db.json'),
		fs = require('fs'),
		deckFunctions = require("./cards")();

	var strategyFunc = function(id, players){

		var __validCard = function(card, deckCardColor, deckCardValue){
			return card.color === deckCardColor || card.value === deckCardValue || card.value === 14 || card.value === 13;
		};

		var __validCards = function(cards, deckCardColor, deckCardValue, eq){
			eq = eq || __validCard;
			var back = [];
			(cards.length).times(function(v){
				if(eq(cards[v], deckCardColor, deckCardValue)){
					back.push(cards[v]);
				}
			});
			return back;
		};

		var __minCard = function(id){
			var min, _id;
			players.forEach(function(act){
				if( !min || (min > act.cards.length && act.cards.length !== 0)){
					if(act.id !== id){
						min = act.cards.length;
						_id = act.id;
					}
				}
			});
			return _id;
		}

		var maxNumber = function(cards, deckCardColor, deckCardValue){
			var vcards = __validCards(cards, deckCardColor, deckCardValue);

			var numOfCardValues = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //[0,1,2,3,4,5,6,7,8,9,Skip,Reverse,+2,Color,+4]
			cards.forEach(function (card) { numOfCardValues[card.value] += 1; });
			var vale = numOfCardValues.indexOf(Math.max.apply(Math, numOfCardValues));

			var eq = function(a,b){ return a === b.value; };

			while( vcards.getIndexWithCustomEquals(vale, eq) === -1){
				if(Math.max.apply(Math, numOfCardValues) === 0) break;
				numOfCardValues[vale] = 0;
				vale = numOfCardValues.indexOf(Math.max.apply(Math, numOfCardValues));
			}

			vale = numOfCardValues.indexOf(Math.max.apply(Math, numOfCardValues));

			if(Math.max.apply(Math, numOfCardValues) === 0)
				return undefined;
			else{
				var back = __validCards(vcards, deckCardColor, vale, function(card, c, v){
					return card.value === v || card.value === 14;
				}).random();
				
				if(back.value === 7){
					back['data'] = { _id: __minCard(id) };
				}
				return back;
			}
		};
		
		var maxColor = function(cards, deckCardColor, deckCardValue){
			var vcards = __validCards(cards, deckCardColor, deckCardValue);

			var numOfCardValues = [0,0,0,0]; //[R,Y,G,B]
			cards.forEach(function (card) { numOfCardValues[card.color] += 1; });
			var vale = numOfCardValues.indexOf(Math.max.apply(Math, numOfCardValues));

			var eq = function(a,b){ return a === b.color; };

			while( vcards.getIndexWithCustomEquals(vale, eq) === -1){
				if(Math.max.apply(Math, numOfCardValues) === 0) break;
				numOfCardValues[vale] = 0;
				vale = numOfCardValues.indexOf(Math.max.apply(Math, numOfCardValues));
			}

			vale = numOfCardValues.indexOf(Math.max.apply(Math, numOfCardValues));

			if(Math.max.apply(Math, numOfCardValues) === 0)
				return undefined;
			else{
				var back = __validCards(vcards, numOfCardValues.indexOf(Math.max.apply(Math, numOfCardValues)), deckCardValue, function(card, c, v){
					return card.color === c;
				}).random();

				if(back.value === 7){
					back['data'] = { _id: __minCard(id) };
				}
				return back;
			}
		};

		var randomCard = function(cards, deckCardColor, deckCardValue){

			var back = __validCards(cards, deckCardColor, deckCardValue).random();

			if(back && back.value === 7){
				back['data'] = { _id: __minCard(id) };
			}
			return back;
		};

		var bastard = function(cards, deckCardColor, deckCardValue){
			var vcards = __validCards(cards, deckCardColor, deckCardValue);
			var eq = function(a,b){ return a[0] === b.color && a[1] == b.value; };
			
			var hetes = vcards.getIndexWithCustomEquals([deckCardColor, 7], eq);
			if(hetes !== -1){
				vcards[hetes]['data'] = { _id: __minCard(id) };
				return vcards[hetes];
			}

			var nullas = vcards.getIndexWithCustomEquals([deckCardColor, 0], eq);
			if(nullas !== -1){
				return vcards[nullas];
			}

			return undefined;
		};
		
		return {
			maxNumber: maxNumber,
			maxColor: maxColor,
			randomCard: randomCard,
			bastard: bastard,
			strategyList: ["maxNumber", "maxColor", "randomCard", "bastard"]
		}
	};

	function saveDB () {
		fs.writeFileSync('db.json', JSON.stringify(db));
	}

	return function () {

		var aiPlayers = [],
			callbacks;

		function getAi () {
			return aiPlayers;
		}

		function newAiPlayer (player, id, players) {
			aiPlayers.push(AI(player, id, players));
		}

		function setCallbacks (data) {
			callbacks = data;
		}

		function AI (player, id, players) {
			var myCurrentIndex,
				currentOrder,
				lastCardStrategy,
				putHistory = [];


			var strategy = strategyFunc(id, players);

			var _iPut = function () {
				callbacks.log("########################################################################\n#");
				callbacks.log(player.name +" MI KÖVETKEZIK (" + id + ")");

				var	val = callbacks.currentRound().cardsOnTable().last().value,
					col = callbacks.currentRound().cardsOnTable().last().color;
			
				callbacks.log("\t a felső lap: " + deckFunctions.formatCard(callbacks.currentRound().cardsOnTable().last()));
				callbacks.log("\t a jelenlegi lapok: " + deckFunctions.formatCards(player.cards));

				var results = {};
				strategy.strategyList.forEach(function(act){
					results[act] = strategy[act](player.cards, col, val);
				});
/*
				var dec = {};
				var cardNum = (player.cards.length / 10);
				var activePlayer = players.countBy(function(act){
					return act.cards.length > 0;
				}) / 6;
				dec['bastard'] = -1 * 4 * cardNum + 2 * activePlayer;
				dec['maxColor'] = -1 * 3 * cardNum + 4 * activePlayer;
				dec['maxNumber'] = -1 * 2 * cardNum + 3 * activePlayer;
				dec['randomCard'] = -1 * 1 * cardNum + 1 * activePlayer;
*/
				var pref = db["strategy"].maxAttr(function(a, b) {return b[1] - a[1]});
				
				var strategyId = undefined;
				for (var i = 0; i < pref.length; i++) {
					if(results[pref[i]]){
						strategyId = pref[i];
						break;
					}
				};
				if(strategyId){
					var card = results[strategyId];
					lastCardStrategy = strategyId;
				} else {
					lastCardStrategy = "nope";
					var card = undefined;
				}
				if(card){
					callbacks.log("\t a választott lap: " + deckFunctions.formatCard(card));
					callbacks.log("\t a választott stratégia: " + lastCardStrategy);
					if(player.cards.length === 2)
						callbacks.uno(id);
					if (putHistory.length === 0)
						card['prev'] = -1;
					else card['prev'] = putHistory.last().first();
					callbacks.log("");
					callbacks.put(id, card);

				} else {
					callbacks.log("\t lapkérés");
					callbacks.log("");
					callbacks.put(id, false);
				}
						
			};
			var _ready = function () {
				callbacks.ready(id);
			};
			var _updateModel = function () {};

			////////////////////////////////////////////////////

			var onNext = function (nextid) {
				if (nextid === id) {
					_iPut();
				};
			};

			var onNextCircle = function (callid) {};

			var onNewRound = function (data) {
				currentOrder = data.order;
				myCurrentIndex = currentOrder.indexOf(id);
			};

			var onPut = function (data) {
				if (data.cards.prev === id){
					var my = putHistory.last();
					if(strategy.strategyList.indexOf(lastCardStrategy) >= 0){
						if(data.cards.color === my.color && data.cards.value > 0 && data.cards.value < 10)
							db["strategy"][lastCardStrategy]++;
						else if(player.cards.countBy(function(d){ return d.color === data.cards.color; }) === 0)
							db["strategy"][lastCardStrategy]--;
						else if(data.cards.value === 0)
							db["strategy"][lastCardStrategy]--;

						else if(data.cards.value === 10)
							db["strategy"][lastCardStrategy]--;

						else if(data.cards.value === 11)
							db["strategy"][lastCardStrategy]++;

						else if(data.cards.value === 12)
							db["strategy"][lastCardStrategy]--;

						else if(data.cards.value === 13)
							db["strategy"][lastCardStrategy]++;

						else if(data.cards.value === 14)
							db["strategy"][lastCardStrategy]--;
					}  
				}
				putHistory.push([data.from, data.cards]);
				_ready();
			};

			var uno = function(_id){}

			var onNewPlayer = function (list) {};

			return {
				newplayer: onNewPlayer,
				newround: onNewRound,
				put: onPut,
				next: onNext,
				nextcircle: onNextCircle,
				uno: uno
			};
		}

		return {
			newAiPlayer: newAiPlayer,
			aiPlayers: getAi,
			callbacks: setCallbacks,
			saveDB: saveDB
		};
	};
}();