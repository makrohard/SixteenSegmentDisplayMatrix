/*
Animated Matrix Form - site functions
0.1 alpha

The MIT License (MIT)

(c) 2016 Johannes Loose, johannes@35007.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction,including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

var runningtimer;
var activesegmentscolor = '#FF0000';
var inactivesegmentscolor = '#F0F0F0';

function startclock() {
	setcolor();
	stopanimation();
 	showmatrix (8, 1, 0.2);
  	runningtimer = window.setInterval('writetime(activesegmentscolor, inactivesegmentscolor)', 100);
}
function startmarquee() {
	setcolor();
	stopanimation();
	showmatrix (5, 1, 0.2);
	runningtimer = window.setInterval('marquee(\'     HELLO WORLD\', activesegmentscolor, inactivesegmentscolor, 5)', 1000);
}
function startspinner() {
	setcolor();
	stopanimation();
	showmatrix (1, 1, 0.3);
	runningtimer = window.setInterval('spinner(activesegmentscolor, inactivesegmentscolor)', 125);
}
function startbouncer() {
	setcolor();
	stopanimation();
	showmatrix (36,16, 0.08);
	clearmatrix (36, 16, inactivesegmentscolor)
	drawframe(35, 15, 'black');
	runningtimer = window.setInterval('bouncer(35, 15, activesegmentscolor, inactivesegmentscolor)', 200);
}
function stopanimation() {
	clearInterval(runningtimer);
	segmentmatrix.length = 0;
}

function mytest() {
	document.getElementById('lbldontpress').innerHtml='XXXX';
	alert('OK');
}

// set color from inputs
function setcolor() {
	var inputcharcolor = document.getElementById('charcolor').value;
	var inputbgcolor = document.getElementById('bgcolor').value;

	if (hexcolorisvalid(inputcharcolor)) {
		activesegmentscolor = inputcharcolor;
	}
	
	if (hexcolorisvalid(inputbgcolor)) {
		inactivesegmentscolor = inputbgcolor;
	}
}

// call matrix generator and show result in scalable div 
function showmatrix(mywidth, myheight, myscale) {

	var container = document.getElementById('divsvgtarget');
	var divincontainer = document.getElementById('divoutersvg');
	container.removeChild(divincontainer);

	var innersvgdiv = document.createElement('div');
	innersvgdiv.setAttribute('id', 'divinnersvg');
	innersvgdiv.setAttribute('class', 'divinnersvg');


	var outersvgdiv = document.createElement('div');
	outersvgdiv.setAttribute('id', 'divoutersvg');
	outersvgdiv.setAttribute('class', 'divoutersvg');
	outersvgdiv.setAttribute('style', 'width:' + Math.ceil(gettotalwidth(mywidth) * myscale) +'px');
	
	innersvgdiv.appendChild(creatematrix(mywidth, myheight));	
	outersvgdiv.appendChild(innersvgdiv);	
	container.appendChild(outersvgdiv);
}

// returns true is string is valid hexcolor #09afAF
function hexcolorisvalid(hexcolor) {
var isok  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hexcolor);
return isok;
}

