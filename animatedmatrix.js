/*
Animated Matrix
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

*Usage:
*
* * Step 1: Create 16 Segment Display Matrix
*
* creatematrix(columns, rows)
* 
*  + Returns SVG-Element containing matrix in given size, ready to write to DOM:
*  document.getElementById('divmatrixcontainer').appendChild(creatematrix(8, 1)); 
*     
*  + Puts the svg <use> elements, representing each single segment in an array
*  to access their property later on without using getElementbyId:
*  segmentmatrix[col][row]['A1'].style.fill = 'none';
*
* * Step 2: Use Matrix
*
* Basic commands:
*
* Set single segment:
*  setsegment(column, row, segmentname, fillcolor)
*  Example: setsegment(0, 0 , 'A1', 'red');
*
* Set one display to character:
*  setchar(column, row, fillcolor, backgroundcolor, array_of_active_segment_names)
*  To populate the active segments array we do a lookup in the charset:
*  Example: setchar(0,0,'red', 'none', getcharsegments('U0030'));
*
* Set one line of text:
*  setline(line_number, fillcolor, text)
*  Example: setline(0, 'red', 'none', 'HELLO WORLD');
*
* Clear one display:
*  cleardisplay(column, row, backgroundcolor)
*  Example:cleardisplay(0, 0, 'none')
*
* Clear complete matrix: 
*  clearmatrix(columns, rows, myfill)
*  Example: clearmatrix(5, 5, 'red')
*
*
* * Invoke Demos:
*
* Clock
*  creatematrix(8, 1)
*  window.setInterval('writetime(\'red\', \'none\')', 100);
*
* Marquee
*  creatematrix(5, 1)
*  window.setInterval('marquee(\'     HELLO WORLD\',\'red\',\'none\', 5)', 1000);
*
* Spinner
*  creatematrix(1, 1)
*  window.setInterval('spinner(\'red\', \'none\')', 300);
*
* Bouncer
*  creatematrix (36,16);
*  drawframe(35, 15, 'black', 'none');
*  window.setInterval('bouncer(35, 15, \'red\', \'none\')', 200);
*/

"use strict";
// ** global vars
// array size limits
var maxwidth = 80;
var maxheight = 60;
// dimensions of display
var segmentwidth = 220
var segmentspacingwidth = 20
var segmentheight = 360
var segmentspacingheight = 20
// svg namspaces
var nssvg = 'http://www.w3.org/2000/svg';
var nsxlink = 'http://www.w3.org/1999/xlink';
// segmentnames array
var segmentnames = ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'E', 'F', 'G1', 'G2', 'H', 'I', 'J', 'K', 'L', 'M', 'DP'];
// segment matrix array. Contains segments as svg use elements as objects, to easily access properties.
var segmentmatrix = new Array();

// ** basic commands
// set line to textstring
function setline (numline, myfill, mybgcolor, strline) {
	var strlength = strline.length;
	for (var i = 0; i < strlength; i++) {
		cleardisplay(numline, i, mybgcolor);
		setchar(numline, i, myfill, getcharsegments('U' + dectohex(strline.codePointAt(i))));
		
	}
}

// set one display
function setchar (mycol, myrow, myfill, segmentarray) {
	var segmentscount= segmentarray.length;
	for (var i = 0; i < segmentscount; i++) {
		segmentmatrix[mycol][myrow][segmentarray[i]].style.fill = myfill;
	}
}
// set all segments of one display to a color
function cleardisplay(mycol, myrow, myfill) {
	for (var i = 0; i < 16; i++) {
		segmentmatrix[mycol][myrow][segmentnames[i]].style.fill = myfill;
	}
}

// set all segments off all displays to a color
function clearmatrix(myheight, mywidth, myfill) {
	for (var mycol = 0; mycol < mywidth; mycol++) {
		for (var myrow = 0; myrow < myheight; myrow++) {
			for (var i = 0; i < 16; i++) {
				segmentmatrix[mycol][myrow][segmentnames[i]].style.fill = myfill;
			}
		}
	}
}

// read char segments from charset array
function getcharsegments(utfcode) {
	return charset[utfcode]	
}
// Create svg code with segment matrix. Put <use> element in segmentmatrix array, to access its properties later.
function creatematrix(mywidth, myheight) {
		
	var myviewbox = '0 0 ' + ' ' + gettotalwidth(mywidth) + ' ' + gettotalheight(myheight);
	var gdisplay = '';
	var mysegment = '';
	var mypath = '';
	var i = 0;
	var segmentpaths = [	'm 30,0 -10,10 30,30 55,0 0,-30 -10,-10 z',
								'm 115,40 55,0 30,-30 -10,-10 -65,0 -10,10 z',
								'm 180,50 30,-30 10,10 0,120 -10,20 -30,-20 z',
								'm 180,210 30,-20 10,20 0,120 -10,10 -30,-30 z',
								'm 50,320 55,0 0,30 -10,10 -65,0 -10,-10 z',
								'm 115,320 55,0 30,30 -10,10 -65,0 -10,-10 z',
								'm 10,340 -10,-10 0,-120 10,-20 30,20 0,100 z',
								'm 10,170 -10,-20 0,-120 10,-10 30,30 0,100 -30,20 0,0 z',
								'm 10,180 40,-20 55,0 0,40 -55,0 -40,-20 z',
								'm 210,180 -40,20 -55,0 0,-40 55,0 z',
								'm 50,50 15,0 15,30 20,70 -15,0 -35,-50 z',
								'm 125,50 0,30 -15,70 -15,-70 0,-30 z',
								'm 140,80 15,-30 15,0 0,50 -35,50 -15,0 z',
								'm 85,210 15,0 -20,70 -15,30 -15,0 0,-50 z',
								'm 110,210 15,70 0,30 -30,0 0,-30 z',
								'm 120,210 15,0 35,50 0,50 -15,0 -15,-30 z',
	];
	
	var svgtag = document.createElementNS(nssvg,'svg');
	svgtag.setAttribute('version', '1.1');
	svgtag.setAttribute('id', 'Animated16SegmentMatrix');
	svgtag.setAttribute('viewBox', myviewbox);

	var mydefs = document.createElementNS(nssvg,'defs')
	for (i = 0; i < 16; i++) {
		mypath = document.createElementNS(nssvg,'path');
		mypath.setAttribute('id', segmentnames[i]);
		mypath.setAttribute('d', segmentpaths[i]);
		mydefs.appendChild(mypath);
	}		
	var mycircle = document.createElementNS(nssvg, 'circle');
		mycircle.setAttribute('id', 'DP');
		mycircle.setAttribute('cx', '215');
		mycircle.setAttribute('cy', '350');
		mycircle.setAttribute('r', '7');
		mydefs.appendChild(mycircle);	
	svgtag.appendChild(mydefs);
	
	var gmatrix = document.createElementNS(nssvg,'g')
		gmatrix.setAttribute('id', 'matrix');
		gmatrix.setAttribute('style', 'fill:none;');
				
	for (var myrow = 0; myrow < myheight; myrow++) {
		segmentmatrix[myrow] = new Array;
		for (var mycol = 0; mycol < mywidth; mycol++) {
			segmentmatrix[myrow][mycol] = new Object();
			gdisplay = document.createElementNS(nssvg, 'g')
				gdisplay.setAttribute('id', 'display' + '_' + mycol + '-' + myrow);
				gdisplay.setAttribute('transform', 'translate(' + gettotalwidth(mycol) + ' ' + gettotalheight(myrow) + ')');				
			for (i = 0; i < 17; i++) {				
				mysegment = document.createElementNS(nssvg, 'use');
				mysegment.setAttribute('id', 'Segment' + '_' + mycol + '-' + myrow + ':' + segmentnames[i]);
				mysegment.setAttributeNS(nsxlink, 'xlink:href', '#' + segmentnames[i]);
				segmentmatrix[myrow][mycol][segmentnames[i]] = mysegment;
				gdisplay.appendChild(mysegment);
			}							
			gmatrix.appendChild(gdisplay);		
		}
	}
	svgtag.appendChild(gmatrix);
	return svgtag 
}

// calculate width from line length
function gettotalwidth(numchars) {
   var segmentmatrixwidth = (numchars * segmentwidth) + (numchars * segmentspacingwidth) + segmentspacingwidth;
   return segmentmatrixwidth
}
// calculate height from lines count
function gettotalheight(numlines) {
  	var segmentmatrixheight = (numlines * segmentheight) + (numlines * segmentspacingheight) + segmentspacingheight;
   return segmentmatrixheight
}
function setsegment(mycol, myrow, myseg, myfill) {	
	segmentmatrix[mycol][myrow][myseg].style.fill = myfill;
}

// dec to hex, min 4 digits
function dectohex(dec) {
    if( dec < 10 ) return dec;
    var final = '';
    var letters = { 10 : 'A', 11 : 'B', 12 : 'C', 13 : 'D', 14 : 'E', 15 : 'F' };
    var digit = dec;
    while(digit > 0) {
        var rest = 0;
 
        if( digit < 16 )
            rest = digit;
        else
            rest = digit%16;
 
        var letter = ( rest>9 ) ? letters[rest] : rest;
        final = letter + '' + final;
        digit = (digit-rest)/16;
    }
    // format to min 4 digits
    switch (final.length) {
    	case 0:
    		final = '0000';
    		break;
    	case 1:
    		final = '000' + final;
    		break;
    	case 2:
    		final = '00' + final;
    		break;
    	case 3:
    		final = '0' + final;
    		break;
    	}    	
    return final;
}

// **
// ** demos code
// **

// Marquee 
var marqueepos = 0;
function marquee(mystring, myfill, mybgcolor, segmentlength) {	
 var mylength = mystring.length;
 var out =  mystring.substr(marqueepos, mylength) + mystring.substr(0, marqueepos);
 out = out.substr(0, segmentlength) 
 setline(0, myfill, mybgcolor, out);
 marqueepos++;
 if(marqueepos >= mylength) {marqueepos = 0;}
}

// Clock: Set timestamp: 23.59.59
function writetime(myfill, mybgcolor) {
var timenow    = new Date();
var myh   = timenow.getHours();
var mym = timenow.getMinutes();
var mys = timenow.getSeconds();
var myval   = ((myh < 10) ? ' ' : '') + myh + '.' + ((mym < 10) ? '0' : '') + mym + '.' + ((mys < 10) ? '0' : '') + mys;
setline(0, myfill, mybgcolor, myval);
}

// Spinner: Show spinning segment 
var spinnerindex = 0;
function spinner(myfill, mybgcolor) {
	var spinnercharset = {
	U0030: ['A1','A2','I'],
	U0031: ['A2','B','J'],
	U0032: ['B','C','G2'],
	U0033: ['C','D2','M'],
	U0034: ['D1','D2','L'],
	U0035: ['D1','E','K'],
	U0036: ['E','F','G1'],
	U0037: ['A1','F','H']
	};		
	spinnerindex++;
	if (spinnerindex > 7 ) {spinnerindex = 0}
	var utfcode = 	'U00' + (30 + spinnerindex);
	cleardisplay(0, 0, mybgcolor);
	setchar (0, 0, myfill, spinnercharset[utfcode]);	
}

// ** Bouncer code
// define global ballobject
var ball = {
	xpos: 2,
	ypos: 2,
	xmov: 1,
	ymov: 1
	};
// main	
function bouncer(mywidth, myheight, ballcolor, bgcolor) {
	cleardisplay(ball.ypos, ball.xpos, bgcolor); // clear old position
	moveball(mywidth, myheight) // get new position
	setchar(ball.ypos, ball.xpos, ballcolor, ['G1','G2','H','I','J','K','L','M']); //draw new postition	
}
// check, move
function moveball(mywidth, myheight) {	
	// check if border touched
	if (ball.ypos <= 1) {ball.ymov = ball.ymov * (-1)} // upper
	if (ball.ypos >= myheight -1) {ball.ymov = ball.ymov * (-1)} // lower
	if (ball.xpos <= 1) {ball.xmov = ball.xmov * (-1)} // left
	if (ball.xpos >= mywidth -1) {ball.xmov = ball.xmov * (-1)} // right
	// move that ball
	ball.xpos += ball.xmov;
	ball.ypos += ball.ymov;
}

// draw box frame with box drawing chars
function drawframe(mywidth, myheight, myfill) {
	setchar(0, 0, myfill, getcharsegments('U2554')); //corner ul
	setchar(0, mywidth, myfill, getcharsegments('U2557')); //corner ur
	setchar(myheight, 0, myfill, getcharsegments('U255A')); //corner ll
	setchar(myheight, mywidth, myfill, getcharsegments('U255D')); // corner ur
	var charharray  = getcharsegments('U2550');
	for (var i = 1; i < mywidth;i++) {
		setchar(0, i, myfill, charharray); //line top
		setchar(myheight, i, myfill, charharray); //line bottom
	}
	var charvarray = getcharsegments('U2551');
	for (var i = 1; i < myheight ;i++) {
		setchar(i, 0, myfill, charvarray); //line left
		setchar(i, mywidth, myfill, charvarray); //line right
	}	
}
