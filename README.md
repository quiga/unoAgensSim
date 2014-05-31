unoAgensSim by QUIGA
====================

javasolt rendszer: linux

szükséges programok: nodejs

majd telepítés után a program mappájában kiadva: "sudo npm install"

indítás: node app.js

A keretrendszer egy része, tavaly készült el, akkor Moréh Tamással ketten csináltuk.
Az akkori kódbol nem sok maradt, a Mocsár játék nagy részét át kellett írnom, hogy az UNO jól működjön.
Az ai.js algoritmusai a saját munkám.

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


Megoldandó probléma:
	Az UNO szabáyokat betartó játékos létrehozása.
	Az MI képes kell legyen a random kártya rakásán felül, más szempontok alapján is döntést hozni.

	pl.: 	Az ágens választhatja a 2-es és a 3-as lapot is, de ha a a 3-asból több van akkor amellett fog dönteni.
			Az ágens ha lehetősége van rá cserélni szeretne.


Felépítés
	4 stratégia, mindegyik kimenetét figyeli, a súlyok alapján dönt végül.
	Megvalósítható lett volna döntési fával(ID3) is, de azzal készült az alap kártyajáték, 
	aminek a keretét felhasználtam, így nem szerettem volna én is azt írni.


Problémák
	A játékban van némi tanulás, bár inkább nevezhető az tapasztalatnak.
	Az egyes stratégiák kimenete csak a véletlentől függ, nem lehet következtetni belőle.


I/O
	Nem vár semmiféle bemenetet, saját magától működik. Kimenet az egyes MI-k által:
		* rakott lap
		* jelenlegi lapok
		* asztalon lévő felső lap
		* stratégia, ami alapján döntött

	Könnyen kiegészíthető lenne Grafikus felülettel, ami biztosítaná az emberek számára is a használatot.
	Ezen kívül más alkalmazási terület nem jut eszembe, ahol ezt fel lehetne használni. 








