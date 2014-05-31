/*
Pakli létrehozó, és formázó függvények

	@num: pakli darabszám
*/

module.exports = function () {

	require('./jsexpansion');
	
	var _formatCard = function(C) {
			var strC, strV;
			switch(C.color){
				case 0: strC = "Red"; break;
				case 1: strC = "Yellow"; break;
				case 2: strC = "Green"; break;
				case 3: strC = "Blue"; break;
			};

			switch(C.value){
				case 0: 
				case 1: 
				case 2: 
				case 3: 
				case 4: 
				case 5: 
				case 6: 
				case 7: 
				case 8: 
				case 9:  strV = C.value; break;
				case 10: strV = "Skip"; break;
				case 11: strV = "Reverse"; break;
				case 12: strV = "+2"; break;
				case 13: strV = "Color"; break;
				case 14: strV = "+4"; break;
			};

			if(C.value === 14 || C.value === 13)
				return strV;
			else return strC + "_" + strV;
		}

	return {
		create: function(num){
			num = num || 1;
			
			var cards = [];
			(num).times(function(){
				(4).times(function(color) {
					(15).times(function(value) {
						cards.push({color: color, value: value});
					});
				});
			});
			return cards;
		},
		formatCard: _formatCard,
		formatCards: function(cards) {
			if(!cards) return;
			var arrC = [];
			(cards.length).times(function(idx){
				arrC.push(_formatCard(cards[idx]));
			});
			return arrC;
		},
		sortCards: function(a, b){
			if(a.value <  b.value) return -1;
	  		if(a.value >  b.value) return  1;
	  		if(a.value == b.value){
		  		if(a.color <  b.color) return -1;
	  			if(a.color >  b.color) return  1;
	  			if(a.color == b.color) return  0;
			}	
	   		return 0;
		}
	};
};
