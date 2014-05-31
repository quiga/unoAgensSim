module.exports = function () {
	require('./jsexpansion');

	var aiModule,
		log = console.log,
		deckFunctions = require("./cards")(),
		pack = deckFunctions.create(1),
		players = [],
		gameStarted = false,
		currentRound,
		defCardNumber = 7,
		aiNames = ['Wapasha','Nayeli','Âviâja','Charulz','Dadenn','Darehl','Tifunee','Sharmaynn','Jayrehl','Izabylle','Lahteeffa','Klowee','Detoyaah','Óengus','Bradán','Svantepolk','Clodovicus','Vercingetorix','Gunnbjörg','Aðalsteinn','Ingvildr','Arthfael','Ingigerðr','Gyða','Wilhelm','Brunhilde','Sigfrøðr','Chlotichilda','Dagr','Haraldr','Suibhne','Boadicea','Gaufrid','Mildgyð','Eoforwine','Þeudhar','Arawn','Feidlimid','Warin','Ásdís','Gisilbert','Carloman','Ewald','Waldo','Eysteinn','Helmut','Gebhard','Lucasta','Elanor','Figaro','Oberon','D\'Artagnan','Vivien','Olivette','Scheherazade','Angelica','Philomel','Mignon','Dulcinea','Pollyanna','Aramis','Caspian','Faust','Aminta','Nydia','Hermia'],
		ais = []; // collection of ids. Length: num of ais, content: player index of ai


	/*	Játékoslista kliensoldali célokra
	*	A visszaadott tömb nem tartalmazza a nem publikus adatokat, pl. minden
	*/
	var playerlist = function () {
		var arr = [];
		players.forEach(function (act, index) {
			arr.push({name: act.name, ai: act.ai, id: index});
		});
		return arr;
	};

	var getCardnums = function () {
		var arr = [];
		players.forEach(function (act) {
			arr.push(act.cards.length);
		});
		return arr;
	};

	var setLog = function(f){
		log = f;
	}

	function Round (order_, democratic) {
		var currentPlayerOrder = 0,					// A soron következő játékos a sorban
			order = order_.uniq(),
			currentPlayerId = 0,					// A soron következő játékos ID-je
			readies = [],							// Beérkezett 'ready' flag-ek
			rdyCb = {cb: 1, param: order[0]},		// Utolsó 'ready'-ra adandó válasz
			circles = [],							// A forduló körei. Object-eket tartalmaz (egyfajta history)
			nobids = [],							// Az egymást követő passzok.
			cardsOnTable = [],						// Az asztalon lévő kártyák: {id: i, value: v, cards: c}
			cardsDeck = [],							// A pakliban lévő kártyák: {id: i, value: v, cards: c}
			neworder = [],							// A következő kör sorrendje (folyamatosan töltődik)
			history = [],
			nextUser_Left = true,					// A kör iránya
			shakedDeck = undefined,
			firstCard

		var unoFrom = function(id, cb){
			// TODO uno regisztrálása
			cb(id);
		}

		var __deal = function (p) {

			deckCount = Math.ceil((p.length * 7 * 2) / 60);				// pakli szám meghatározása
			pack = deckFunctions.create(deckCount);
			var shakedPck = [];
			shakedPck.push.apply(shakedPck, pack.shaked());
			shakedDeck = shakedPck.shaked().shaked();

			for (var z = 0; z < 7; z++) {
				for (var i = order.length - 1; i >= 0; i--) {
					if (shakedDeck.length > 0) p[order[i]].cards.push(shakedDeck.shift());
				};
			};

			table = shakedDeck.shift();			// amíg szám nem lesz az asztalon az első lap
			while(table > 9 || table == 0)
				shakedDeck.shift()

			firstCard = {id: 0, color: table.color, value: table.value, cards: table};
			cardsOnTable.push(firstCard);

			p.forEach(function (actP) {	actP.cards.sort(deckFunctions.sortCards); });// lapok rendezése

		}(players);
		
		var __getCardFromDeck = function(){
			if(shakedDeck.length === 0){
				var last = cardsOnTable.last();
				cardsOnTable.removeOne(last);
				shakedDeck = cardsOnTable.shaked().shaked();
				cardsOnTable.removeAll();
				cardsOnTable.push(last);

				if(shakedDeck.length === 0)
					shakedDeck = deckFunctions.create(1).shaked().shaked();
			}
			return shakedDeck.shift();
		}; 

		var __next = function (step) {

			step = step || 1;

			if(order.length === 0 || order.length === 1){
				if(order.length === 1) history.push(players[order[0]].name);
				log("Játék vége");
				rdyCb.cb = 2;
				return;
			}

			if (nextUser_Left) currentPlayerOrder+=step;
			else currentPlayerOrder-=step;

			currentPlayerOrder += order.length;
			currentPlayerOrder %= order.length;
			currentPlayerId = order[currentPlayerOrder];

			rdyCb.cb = 0;
			rdyCb.param = currentPlayerId;
		};

		var putCards = function (cards, callbackOK, callbackBad) {
			if (!cards) {
				// Laphúzás

				var lap = __getCardFromDeck();
				if(lap){
					log("az új lap: " + deckFunctions.formatCard(lap));
					players[currentPlayerId].cards.push(lap);
					players[currentPlayerId].cards.sort(deckFunctions.sortCards);
				}
				__next();

			} else {
				var prop = {}
				if(cards.value === 7){
					prop = cards.data;
					delete cards.data;
				}

				// Lépés
				cardsOnTable.push({id: currentPlayerId, value: cards.value, color: cards.color});
				
				players[currentPlayerId].cards.splice(players[currentPlayerId].cards.indexOfObject(cards),1);
				if(players[currentPlayerId].cards.length === 0)	{
					log(players[currentPlayerId].name + " kiment");
					history.push(players[currentPlayerId].name);
					order.removeOne(currentPlayerId);
				}

				if(cards.value === 7){
					var my = players[currentPlayerId].cards;
					players[currentPlayerId].cards = players[prop._id].cards;
					players[prop._id].cards = my;
				} 
				else if(cards.value === 0){ // körcsere
			
					var _myNext = function(current, step){
						step = step || 1;
						if (nextUser_Left) current+=step;
						else current-=step;

						current += order.length;
						current %= order.length;
						return current;
					} 

					var _cId = currentPlayerOrder;

					if(!order[_cId])
						_cId %= order.length;

					var ___id = _myNext(_cId);
					var ___idP = _cId;

					var my = players[order[_cId]].cards;

					while( _cId !== ___id){
						players[order[___idP]].cards = players[order[___id]].cards;
						___idP = ___id;
						___id = _myNext(___id);
					}
					players[___idP].cards = my;
				}

				if(cards.value === 10){
					__next(1);
				}
				else if(cards.value === 11){
					nextUser_Left = !nextUser_Left;
				}

				__next();

				if(cards.value === 12){ //+2
					players[currentPlayerId].cards.push(__getCardFromDeck());
					players[currentPlayerId].cards.push(__getCardFromDeck());
					players[currentPlayerId].cards.sort(deckFunctions.sortCards);
				}
				else if(cards.value === 13){
					//szin
				}
				else if(cards.value === 14){ // +4
					players[currentPlayerId].cards.push(__getCardFromDeck());
					players[currentPlayerId].cards.push(__getCardFromDeck());
					players[currentPlayerId].cards.push(__getCardFromDeck());
					players[currentPlayerId].cards.push(__getCardFromDeck());
					players[currentPlayerId].cards.sort(deckFunctions.sortCards);
				}
			};
			readies.splice(0);
			callbackOK();
		};

		var readyFrom = function (id, cbNext, cbNextCircle, cbNextRound) {
			if (readies.indexOf(id) === -1) {
				readies.push(id);
			} else {
				return;
			};
			if (readies.length === players.length) {
				if (rdyCb.cb === 0) {
					currentPlayerId = rdyCb.param;
					cbNext(rdyCb.param); 
					return;
				};
				if (rdyCb.cb === 1) {
					currentPlayerId = rdyCb.param;
					cbNextCircle(rdyCb.param); 
					return;}
					;
				if (rdyCb.cb === 2) {
					cbNextRound(rdyCb.param.order);
					neworder.splice(0);
					return;
				};
			};
		};

		var getCurrentPlayerId = function () {
			return currentPlayerId;
		}

		var getCardsOnTable = function () {
			return cardsOnTable;
		}

		var getHistory = function(){
			return history;
		};

		var getPlayerCards = function(pname){
			var C = undefined;
			players.forEach(function (act, index) {
				if(act.name === pname) {
					C = act.cards;
				}
			});
			return C;
		}

		return {
			currentPlayerId: getCurrentPlayerId, // ok
			putCards: putCards,	// ok
			readyFrom: readyFrom, // ok
			cardsOnTable: getCardsOnTable,
			firstCard: firstCard,
			myCards: getPlayerCards,
			getHistory: getHistory,
			unoFrom: unoFrom
		};
	};

	/*	MI játékosok hozzáadása
	*		param: MI játékosok száma
	*	(ettől függetlenül nem adódik hozzá több, mint amennyi a maximum)
	*		callback: ha kész, visszahívódik
	*/
	var aiPlayersNum = function (param, callback, funcs){
		if (param == 0) {callback(); return;};
		aiModule = (require('./ai'))();
		for (var i = 0; i < param && players.length < 10; i++) {
			var ainame = aiNames.splice(rndInt(aiNames.length-1),1)[0];
			while (players.indexOfKeyValue('name', ainame) !== -1) {
				ainame = aiNames.splice(rndInt(aiNames.length-1),1)[0];
			}
			players.push({
				name: ainame,
				ai: true,
				cards: [],
				id: players.length, 
				state: true
			});
			ais.push(players.length-1);
			aiModule.newAiPlayer(players.last(), players.length-1, players);
		};
		aiModule.callbacks(funcs.merge({players: getPlayers, currentRound: getCurrentRound}));
		callback();
	};


	/*	Új játék létrehozása, egyúttal currentRound beállítása
	*		callback: ha kész, visszahívódik a sorrenddel és a lapok számával
	*/
	var startGame = function (callback){
		if (players.length < 2) return;
		var order = [];
		players.forEach(function (act, index) {
			order.push(index);
		});
		currentRound = Round(order, true);
		gameStarted = true;
		obj = currentRound.firstCard;
		callback(order, deckFunctions.formatCard(obj['cards']));
	};

	var newRound = function (order) {
		currentRound = Round(order, false);
		//////L//O//G//////
		log("ROUND STARTED");
		//////L//O//G//////
	};

	var getCurrentRound = function(){
		return currentRound;
	}
	var getGameStarted = function(){
		return gameStarted;
	}
	var getPlayers = function(){
		return players;
	}

	var callAIs = function (ev, data) {
		if (!aiModule) {return;};
		ais.forEach(function (a, i) {
			(aiModule.aiPlayers()[i])[ev](data);
		});
	}

	var exit = function () {
		log("### exit ###");
		if (aiModule){
			aiModule.saveDB();
		}
	}

	return {
		players: getPlayers, // ok
		playerlist: playerlist, // ok
		aiPlayersNum: aiPlayersNum, 
		startGame: startGame, // ok
		newRound: newRound, // ok
		gameStarted: getGameStarted, // ok
		currentRound: getCurrentRound, // ok
		cardnums: getCardnums,
		callAIs: callAIs,
		exit: exit,
		setLog: setLog
	};
}();
