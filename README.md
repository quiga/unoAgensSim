unoAgensSim
===========


szükséges programok: nodejs

majd "npm install" parancs kiadása

indítás: node app.js

AZ alapprogram az app.js, felhasználó nem tud vele játszani, csak MI van benne.

Az indítás után a program léterhozz 6 darab MI-t, és elindítja a játékot.

Minden esetben, ha nem tud rakni lapot kér.

Az ágens nágy stratégiát ismer:

	* megszámolja a számok alapján, melyik lapból hány darab van, és a legtöbből próbál meg rakni, ha tud. Ha ez nem lehetséges akkor a második, harmadik... legtöbből. 

	* megszámolja a színek alapján, melyik lapból hány darab van, és a legtöbből próbál meg rakni, ha tud. Ha ez nem lehetséges akkor a második, harmadik... legtöbből. 

	* random rak a megfelelő lapok közül 

	* cserélni próbál

Menet közben folyamatosan megjegyzi, hogy mely stratégia alkalmazása milyen sikert hozott.

	eredmény	esemény (mindig a következő játékos lapja)

		+		azonos színt rak a következő

		+ 		Color lap a következő

		+ 		Reverse lap a következő


		-		a rakott szín nekem nincs

		-		csere

		- 		Skip lap a következő

		- 		+2 lap a következő

		- 		+4 lap a következő


Amelyik stratégiához tartozó szám  a legnagyobb, azt fogja választani, feltéve hogy az nem lapot kér. Ha mindegyik stratégia kimenete a lapkérés csak akkor fog ténylegesen új lapot kérni.









