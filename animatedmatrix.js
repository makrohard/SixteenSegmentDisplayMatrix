/*
Animated Matrix
version 0.2

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

* Usage:
*
* * Create Sixteen Segment Display Matrix.
*    var matrixObject = new segmentDisplayMatrix(number_of_rows, number_of_ columns);
*    Arguments: Dimension of matrix, number of displays in rows and columns. Required, integer. Defaults to 1.
*
* * Write SVG code to DOM.
*    document.getElementById('container').appendChild(matrixObject.matrix.svgcode);
*    Image dimensions are stored in matrixObject.matrix.mywidth and matrixObject.myheight.
*
* * Use commands:
*
* * * Segment commands:
*     Set the color of individual segments using the style.fill attribute of the segment svg elements.
*       This commands are independend from the color settings in groups and override those.
*
*   * Set one segment.
*       .setSegment(row, column, segmentname, color);
*
*   * Set all segments of one display.
*       .setDisplaySegments(row, column, color);
*
*   * Set all segments in all displays in matrix. 
*       .setMatrixSegments('color');
*
*   * Write one character on a display.
*       .setCharacter(row, column, character, color);
*
*   * Write a line of text to a row.
*       .setLine(row, line_of_text, color);
*
* * * Group commands:
*       The segment elements are grouped to displays and the displays are grouped to a matrix.
*       The color assigments to groups work independently from the segment colors.
*       The Browser will display the innermost set color.
* 
*   * Set color of one display group.
*      .setDisplayGroup(row, col, color);
*
*   * Set color of all display groups.
*        .setAllDisplayGroups(color);
*
*   * Set color of matrix group.
*       .setMatrixGroup(color);
*
*   * Clearing
*       Overwrite the matrix in order to clear it. Make use of the special color values. 
*
*    Examples:
*         .setMatrixSegments('clear'); - delete style.fill property from all segment elements
*         .setAllDisplayGroups('clear'); - delete style.fill property from all display groups
*         .setMatrixGroup('background'); - set matrix group style.fill property to background color
*  
*   * Draw ASCII Frame
*       .drawFrame(color);
*
*   * Arguments
*       row, column: Required, integer. Row and column representing display position.
*       segmentname: Required, string. Name of segment to alter. Valid names are stored in segmentnames array. 
*       color: Optional, string. Color to use. Defaults to foreground color if not specified. Defaults to black if invalid.
*         Accepted color formats are HEX '#FF0000', RGB rgb(255, 0, 0) or htmlname 'red'
*         'foreground' uses foreground color
*         'background' uses background color
*         'none' for transparent
*         'clear' removes style.fill attribute from svg elements
*       character, line_of_text: Required, String. Character or line of text to show on the display matrix.
*         The character set is stored in charset. This can be edited using the GUI um http://www.35007.de.
*         Unknown characters result in empty display, overflowing lines will be cut.
*
* * Invoke Demos:
*
*   * General pattern:
*       1: animatedMatrix = Animation(command, [args]); - make a new matrix instance with animation commands     
*       2: document.getElementById('container').appendChild(animatedMatrix.matrix.svgcode); - write matrix to DOM
*       3: window.setInterval('animatedMatrix.AnimationCommandName()', interval); - call animation command repeatedly 
*
*   * Clock
*       animatedMatrix = Animation('clock');
*       window.setInterval('animatedMatrix.setTime()', 100);
*
*   * Marquee
*       animatedMatrix = Animation('marquee', '     Hello World', 10 );
*       window.setInterval('animatedMatrix.setMarquee()', 500);
*
*   * Spinner
*       animatedMatrix = Animation('spinner');
*       window.setInterval('animatedMatrix.setSpinner()', 125)
*
*   * Bouncer
*       animatedMatrix = Animation('bouncer', 14, 30);
*       animatedMatrix.drawFrame('#000000');
*       window.setInterval('animatedMatrix.setBouncer()', 125);
*
*/
// **
// ** Segment Display Matrix
// **
var segmentDisplayMatrix = function(rows, cols) {
  "use strict";

  this.foregroundColor = '#FF0000'; // colors als instance properties
  this.backgroundColor = '#F0F0F0';
  var backgroundColor = this.backgroundColor;

  if (rows === undefined) var rows = 1; // validate attributes rows, cols 
  if (cols === undefined) var cols = 1;
  if (isNaN(rows) || rows < 1) rows = 1;
  if (isNaN(cols) || cols < 1) cols = 1;
  rows = parseInt(rows, 10);
  cols = parseInt(cols, 10);

  this.matrix = creatematrix(rows, cols); // creates matrix, stores properties

  // initializes private properties, calculates dimensions, returns matrix properties
  function creatematrix(rows, cols) {
    var myid = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4); // create short random id            
    var segmentwidth = 220; // display dimensions and spacing 
    var segmentspacingwidth = 20;
    var segmentheight = 360;
    var segmentspacingheight = 20;
    // segmentnames, used to store and access segment elements
    var segmentnames = ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'E', 'F', 'G1', 'G2', 'H', 'I', 'J', 'K', 'L', 'M', 'DP'];
    var segmentscount = segmentnames.length;
    var svgelements = { // store elements in array to access properties later
      matrix: '', // <g>
      displays: [], // <g> row / col 
      segments: [] // <use> row / col / segment
    };
    var myheight = getheight(rows); // calculate image dimensions
    var mywidth = getwidth(cols);

    // creates svg code, populates an array containing the svg elements, returns svgcode
    function createsvg() {
      var nssvg = 'http://www.w3.org/2000/svg'; // svg and xlink namespaces needed
      var nsxlink = 'http://www.w3.org/1999/xlink';
      var viewbox = '0 0 ' + ' ' + mywidth + ' ' + myheight; // set viewBox to image dimensions
      var gdisplay = '';
      var segment = '';
      var path = '';
      var i = 0;
      var row = 0;
      var col = 0;
      // svg paths that represent the segments
      var segmentpaths = ['m 30,0 -10,10 30,30 55,0 0,-30 -10,-10 z',
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
      var svgtag = document.createElementNS(nssvg, 'svg'); // <svg viewBox="0 0  980 1160" version="1.1" id="segmentdisplaymatrix_g4lw">
      svgtag.setAttribute('id', 'segmentdisplaymatrix_' + myid);
      svgtag.setAttribute('version', '1.1');
      svgtag.setAttribute('viewBox', viewbox);
      var mydefs = document.createElementNS(nssvg, 'defs'); // <defs>
      for (i = 0; i < segmentscount - 1; i++) {
        path = document.createElementNS(nssvg, 'path'); // <path d="m 30,0 -10,10 30,30 55,0 0,-30 -10,-10 z" id="A1_g4lw">
        path.setAttribute('id', segmentnames[i] + '_' + myid);
        path.setAttribute('d', segmentpaths[i]);
        mydefs.appendChild(path);
      }
      var mycircle = document.createElementNS(nssvg, 'circle'); // <circle r="7" cy="350" cx="215" id="DP">
      mycircle.setAttribute('id', 'DP_' + myid);
      mycircle.setAttribute('cx', '215');
      mycircle.setAttribute('cy', '350');
      mycircle.setAttribute('r', '7');
      mydefs.appendChild(mycircle);
      svgtag.appendChild(mydefs);
      var gmatrix = document.createElementNS(nssvg, 'g'); // matrix <g style="fill: rgb(240, 240, 240);">
      gmatrix.style.fill = backgroundColor;
      svgelements['matrix'] = gmatrix; // put matrix element in array
      for (row = 1; row < rows + 1; row++) {
        svgelements['segments'][row] = [];
        svgelements['displays'][row] = [];
        for (col = 1; col < cols + 1; col++) {
          gdisplay = document.createElementNS(nssvg, 'g'); // display <g transform="translate(20 20)">
          gdisplay.setAttribute('transform', 'translate(' + getwidth(col - 1) + ' ' + getheight(row - 1) + ')');
          svgelements['displays'][row][col] = gdisplay; // put display element in array
          svgelements['segments'][row][col] = {};

          for (i = 0; i < segmentscount; i++) {
            segment = document.createElementNS(nssvg, 'use'); // segment <use xlink:href="#A1_g4lw">
            segment.setAttributeNS(nsxlink, 'xlink:href', '#' + segmentnames[i] + '_' + myid);
            svgelements['segments'][row][col][segmentnames[i]] = segment; // put segment elements in array
            gdisplay.appendChild(segment);
          }
          gmatrix.appendChild(gdisplay);
        }
      }
      svgtag.appendChild(gmatrix);
      return svgtag;
    }
    // calculate width 
    function getwidth(mycols) {
      var segmentmatrixwidth = (mycols * segmentwidth) + (mycols * segmentspacingwidth) + segmentspacingwidth;
      return segmentmatrixwidth;
    }
    // calculate height
    function getheight(myrows) {
      var segmentmatrixheight = (myrows * segmentheight) + (myrows * segmentspacingheight) + segmentspacingheight;
      return segmentmatrixheight;
    }
    // return matrix properties
    return {
      rows: rows, // Number of rows and columns.
      cols: cols,
      mywidth: mywidth, // Height and width in pixel.
      myheight: myheight,
      segmentnames: segmentnames, // Array of valid segment names
      segmentscount: segmentscount,
      svgelements: svgelements, // Array of SVG elements that represent the segments of each display.
      svgcode: createsvg() // SVG object to insert in DOM.
    };
  }
};

// **
// ** Commands
// **
segmentDisplayMatrix.prototype = {
  constructor: segmentDisplayMatrix,
  // set color of single segment
  setSegment: function(row, col, seg, mycolor) {
    try {
      if (arguments.length < 3) throw 'One or more required arguments are missing.';
      var htmlcolor = this.tools.htmlcolor.call(this, mycolor); // get validated color
      row = parseInt(row, 10); // force type integer
      col = parseInt(col, 10);
      if (!this.tools.rowcolinbounds.call(this, row, col)) throw ('The display position to write to is not within matrix boundaries or row / column are not integer. Matrix: ' + this.matrix.rows + ', ' + this.matrix.cols + ' Requested: ' + row + ', ' + col);
      if (this.matrix.svgelements['segments'][row][col][seg] === undefined) throw ('Segment does not exist in array. Row: ' + row + ' Column: ' + col + ' Segment: ' + seg);

      this.matrix.svgelements['segments'][row][col][seg].style.fill = htmlcolor; // write style.fill to segment
    } catch (err) {
      return err;
    }
    return false;
  },
  // set color of all segments of one display
  setDisplaySegments: function(row, col, mycolor) {
    try {
      if (arguments.length < 2) throw 'One or more required arguments are missing.';
      row = parseInt(row, 10);
      col = parseInt(col, 10);
      if (!this.tools.rowcolinbounds.call(this, row, col)) throw ('The display position to write to is not within matrix boundaries or row / column are not integer. Matrix: ' + this.matrix.rows + ', ' + this.matrix.cols + ' Requested: ' + row + ', ' + col);
      var htmlcolor = this.tools.htmlcolor.call(this, mycolor);
      var segmentscount = this.matrix.segmentnames.length;
      var i = 0;

      for (i = 0; i < segmentscount; i++) {
        this.matrix.svgelements['segments'][row][col][this.matrix.segmentnames[i]].style.fill = htmlcolor;
      }
    } catch (err) {
      return err;
    }
    return false;
  },
  // set color off all segments of all displays in matrix
  setMatrixSegments: function(mycolor) {
    try {
      var htmlcolor = this.tools.htmlcolor.call(this, mycolor);
      var segmentscount = this.matrix.segmentnames.length;
      for (var col = 1; col <= this.matrix.cols; col++) {
        for (var row = 1; row <= this.matrix.rows; row++) {
          for (var i = 0; i < segmentscount; i++) {
            this.matrix.svgelements['segments'][row][col][this.matrix.segmentnames[i]].style.fill = htmlcolor;
          }
        }
      }
    } catch (err) {
      return err;
    }
    return false;
  },
  // write one character to display
  setCharacter: function(row, col, character, mycolor) {
    try {
      if (arguments.length < 3) throw 'One or more required arguments are missing.';
      row = parseInt(row, 10);
      col = parseInt(col, 10);
      if (!this.tools.rowcolinbounds.call(this, row, col)) throw ('The display position to write to is not within matrix boundaries or row / column are not integer. Matrix: ' + this.matrix.rows + ', ' + this.matrix.cols + ' Requested: ' + row + ', ' + col);
      var i = 0;
      var htmlcolor = this.tools.htmlcolor.call(this, mycolor);
      var segmentarray = this.tools.getcharsegments.call(this, 'U' + this.tools.dectohex(character.toString().codePointAt(0))); // This array contains the segment names for a character
      var segmentarraylength = segmentarray.length;
      var segmentnameslength = this.matrix.segmentnames.length;

      for (i = 0; i < segmentnameslength; i++) { // clear display
        this.matrix.svgelements['segments'][row][col][this.matrix.segmentnames[i]].style.fill = '';
      }
      for (i = 0; i < segmentarraylength; i++) { // write character to display
        this.matrix.svgelements['segments'][row][col][segmentarray[i]].style.fill = htmlcolor;
      }
    } catch (err) {
      return err;
    }
    return false;
  },
  // write one line of text to a row
  setLine: function(row, textline, mycolor) {
    try {
      if (arguments.length < 2 || row > this.matrix.rows) throw 'Missing argument(s) or row out of matrix boundaries.';
      row = parseInt(row, 10);
      var mytext = textline.toString();
      if (mytext.length == 0) throw 'Text string is empty.';
      var htmlcolor = this.tools.htmlcolor.call(this, mycolor);
      var cols = mytext.length <= this.matrix.cols ? mytext.length : this.matrix.cols;
      var segmentarray = '';
      var segmentarraylength = 0;
      var segmentnameslength = this.matrix.segmentnames.length;
      var col = 0;
      var i = 0;
      // write chars to line
      for (col = 1; col <= cols; col++) {
        // clear display
        for (i = 0; i < segmentnameslength; i++) {
          this.matrix.svgelements['segments'][row][col][this.matrix.segmentnames[i]].style.fill = '';
        }
        // write one character to display
        segmentarray = this.tools.getcharsegments.call(this, 'U' + this.tools.dectohex(textline.toString().codePointAt(col - 1)));
        segmentarraylength = segmentarray.length;
        for (i = 0; i < segmentarraylength; i++) {
          this.matrix.svgelements['segments'][row][col][segmentarray[i]].style.fill = htmlcolor;
        }
      }
    } catch (err) {
      return err;
    }
    return false;
  },
  // set color of one svg group that contains one display
  setDisplayGroup: function(row, col, mycolor) {
    try {
      if (arguments.length < 2) throw 'One or more required arguments are missing.';
      var htmlcolor = this.tools.htmlcolor.call(this, mycolor);
      row = parseInt(row, 10);
      col = parseInt(col, 10);
      if (!this.tools.rowcolinbounds.call(this, row, col)) throw ('The display position to write to is not within matrix boundaries or row / column are not integer. Matrix: ' + this.matrix.rows + ', ' + this.matrix.cols + ' Requested: ' + row + ', ' + col);

      this.matrix.svgelements['displays'][row][col].style.fill = htmlcolor;
    } catch (err) {
      return err;
    }
    return false;
  },
  // set color of all svg groups containg one display each
  setAllDisplayGroups: function(mycolor) {
    try {
      var htmlcolor = this.tools.htmlcolor.call(this, mycolor);
      for (var col = 1; col <= this.matrix.cols; col++) {
        for (var row = 1; row <= this.matrix.rows; row++) {
          this.matrix.svgelements['displays'][row][col].style.fill = htmlcolor;
        }
      }
    } catch (err) {
      return err;
    }
    return false;
  },
  // set color of svg group that contains the whole matrix
  setMatrixGroup: function(mycolor) {
    try {
      var htmlcolor = this.tools.htmlcolor.call(this, mycolor);
      this.matrix.svgelements['matrix'].style.fill = htmlcolor;
    } catch (err) {
      return err;
    }
    return false;
  },

  // ** functions and validations
  tools: {
    // check if rows and cols are within boundaries of matrix
    rowcolinbounds: function(row, col) {
      if (row > 0 && row <= this.matrix.rows && col > 0 && col <= this.matrix.cols) {
        return true;
      }
      return false;
    },
    // read char segments from charset array
    getcharsegments: function(utfcode) {
      if (this.charset[utfcode] !== undefined) {
        return this.charset[utfcode];
      } else {
        return [];
      }
    },
    // validate color format, if invalid return default value
    htmlcolor: function(htmlcolor) {
      // defaults and none
      switch (htmlcolor) {
        case undefined:
          htmlcolor = this.backgroundColor;
          break;
        case 'foreground':
          htmlcolor = this.foregroundColor;
          break;
        case 'background':
          htmlcolor = this.backgroundColor;
          break;
        case 'none':
          return 'none';
        case 'clear':
          return '';
      }
      htmlcolor = htmlcolor.toString();
      var isvalidcolor = false;
      // hex
      if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(htmlcolor.toUpperCase())) return htmlcolor;
      // RGB
      var stringlength = htmlcolor.length;
      if (htmlcolor.toLowerCase().substr(0, 4) == 'rgb(' && htmlcolor.substr(stringlength - 1, 1) == ')') {
        var rgbvalues = htmlcolor.substr(4, stringlength - 5).replace(/ /g, '').split(',');
        if (rgbvalues.length == 3) {
          var rgbbounds = true;
          for (var i = 0; i < 3; i++) {
            if (
              isNaN(rgbvalues[i]) ||
              !Number.isInteger(parseFloat(rgbvalues[i], 10)) ||
              rgbvalues[i] < 0 ||
              rgbvalues[i] > 255) {
              rgbbounds = false;
            }
          }
          if (rgbbounds) return htmlcolor.replace(/ /g, '').toLowerCase();
        }
      }
      // names
      var colorcodes = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond',
        'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
        'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgrey', 'darkgreen', 'darkkhaki', 'darkmagenta',
        'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
        'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick',
        'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow',
        'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon',
        'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgrey', 'lightgreen', 'lightpink',
        'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime',
        'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
        'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose',
        'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
        'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple',
        'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
        'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle',
        'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'
      ];
      if (colorcodes.includes(htmlcolor.toLowerCase())) return htmlcolor;
      // Default for invalid color
      return '#000000';
    },
    // dec to hex, min 4 digits
    dectohex: function(dec) {
      if (dec < 10) return '000' + dec;
      var final = '';
      var letters = {
        10: 'A',
        11: 'B',
        12: 'C',
        13: 'D',
        14: 'E',
        15: 'F'
      };
      var digit = dec;
      while (digit > 0) {
        var rest = 0;
        if (digit < 16)
          rest = digit;
        else
          rest = digit % 16;
        var letter = (rest > 9) ? letters[rest] : rest;
        final = letter + '' + final;
        digit = (digit - rest) / 16;
      }
      // format to min 4 digits
      if (final.length < 5) {
        final = Array(5 - final.length).join('0') + final;
      }
      return final;
    }
  }
};

// **
// ** Charset - use my GUI on http://35007.de to edit
// **
// add charset as prototype to matrix object
segmentDisplayMatrix.prototype.charset = {
  U00A7: ['A1', 'A2', 'C', 'D1', 'D2', 'F', 'G1', 'G2', 'H', 'M'], // § SectionSign
  U0020: [], //   Space
  U0021: ['B', 'C', 'DP'], // ! ExclamationPoint
  U0022: ['B', 'F'], // &quot; DoubleQuotes
  U0023: ['D1', 'D2', 'E', 'F', 'G1', 'G2', 'I', 'L'], // # NumberSign
  U0024: ['A1', 'A2', 'C', 'D1', 'D2', 'F', 'G1', 'G2', 'I', 'L'], // $ DollarSign
  U0025: ['A1', 'C', 'D2', 'F', 'G1', 'G2', 'I', 'J', 'K', 'L'], // % PercentSign
  U0026: ['A1', 'D1', 'D2', 'E', 'F', 'G1', 'H', 'J', 'M'], // &amp; Amperesand
  U0027: ['B'], // &apos; Apostrophe
  U0028: ['J', 'M'], // ( OpeningParenthesis
  U0029: ['H', 'K'], // ) ClosingParenthesis
  U002A: ['G1', 'G2', 'H', 'I', 'J', 'K', 'L', 'M'], // * Asterisk
  U002B: ['G1', 'G2', 'I', 'L'], // + Plus
  U002C: ['D1'], // , Comma
  U002D: ['G1', 'G2'], // - Hyphen
  U002E: ['DP'], // . DecimalPoint
  U002F: ['J', 'K'], // / Slash
  U0030: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'E', 'F', 'J', 'K'], // 0 0
  U0031: ['B', 'C'], // 1 1
  U0032: ['A1', 'A2', 'B', 'D1', 'D2', 'E', 'G1', 'G2'], // 2 2
  U0033: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'G1', 'G2'], // 3 3
  U0034: ['B', 'C', 'F', 'G1', 'G2'], // 4 4
  U0035: ['A1', 'A2', 'C', 'D1', 'D2', 'F', 'G1', 'G2'], // 5 5
  U0036: ['A1', 'A2', 'C', 'D1', 'D2', 'E', 'F', 'G1', 'G2'], // 6 6
  U0037: ['A1', 'A2', 'B', 'C'], // 7 7
  U0038: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'E', 'F', 'G1', 'G2'], // 8 8
  U0039: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'F', 'G1', 'G2'], // 9 9
  U003A: ['G1', 'D1'], // : Colon
  U003B: ['A1', 'K'], // ; Semicolon
  U003C: ['J', 'M'], // &lt; LessThan
  U003D: ['D1', 'D2', 'G1', 'G2'], // = Equal
  U003E: ['H', 'K'], // &gt; GreaterThan
  U003F: ['A2', 'B', 'G2', 'L', 'DP'], // ? QuestionMark
  U0040: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'E', 'G1', 'L'], // @ AtSign
  U0041: ['A1', 'A2', 'B', 'C', 'E', 'F', 'G1', 'G2'], // A A
  U0042: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'G2', 'I', 'L'], // B B
  U0043: ['A1', 'A2', 'D1', 'D2', 'E', 'F'], // C C
  U0044: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'I', 'L'], // D D
  U0045: ['A1', 'A2', 'D1', 'D2', 'E', 'F', 'G1'], // E E
  U0046: ['A1', 'A2', 'E', 'F', 'G1'], // F F
  U0047: ['A1', 'A2', 'C', 'D1', 'D2', 'E', 'F', 'G2'], // G G
  U0048: ['B', 'C', 'E', 'F', 'G1', 'G2'], // H H
  U0049: ['A1', 'A2', 'D1', 'D2', 'I', 'L'], // I I
  U004A: ['B', 'C', 'D1', 'D2', 'E'], // J J
  U004B: ['E', 'F', 'G1', 'J', 'M'], // K K
  U004C: ['D1', 'D2', 'E', 'F'], // L L
  U004D: ['B', 'C', 'E', 'F', 'H', 'J'], // M M
  U004E: ['B', 'C', 'E', 'F', 'H', 'M'], // N N
  U004F: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'E', 'F'], // O O
  U0050: ['A1', 'A2', 'B', 'E', 'F', 'G1', 'G2'], // P P
  U0051: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'E', 'F', 'M'], // Q Q
  U0052: ['A1', 'A2', 'B', 'E', 'F', 'G1', 'G2', 'M'], // R R
  U0053: ['A1', 'A2', 'C', 'D1', 'D2', 'F', 'G1', 'G2'], // S S
  U0054: ['A1', 'A2', 'I', 'L'], // T T
  U0055: ['B', 'C', 'D1', 'D2', 'E', 'F'], // U U
  U0056: ['E', 'F', 'J', 'K'], // V V
  U0057: ['B', 'C', 'E', 'F', 'K', 'M'], // W W
  U0058: ['H', 'J', 'K', 'M'], // X X
  U0059: ['H', 'J', 'L'], // Y Y
  U005A: ['A1', 'A2', 'D1', 'D2', 'J', 'K'], // Z Z
  U005B: ['A2', 'D2', 'I', 'L'], // [ OpeningBracket
  U005C: ['H', 'M'], // \ Backslash
  U005D: ['A1', 'D1', 'I', 'L'], // ] ClosingBracket
  U005E: ['K', 'M'], // ^ Caret
  U005F: ['D1', 'D2'], // _ Underscore
  U0060: ['H'], // ` GraveAccent
  U0061: ['D1', 'D2', 'E', 'G1', 'L'], // a a
  U0062: ['C', 'D1', 'D2', 'E', 'F', 'G1', 'G2'], // b b
  U0063: ['D1', 'D2', 'E', 'G1', 'G2'], // c c
  U0064: ['B', 'C', 'D1', 'D2', 'E', 'G1', 'G2'], // d d
  U0065: ['D1', 'D2', 'E', 'G1', 'K'], // e e
  U0066: ['A2', 'G1', 'G2', 'I', 'L'], // f f
  U0067: ['D2', 'E', 'G1', 'K', 'M'], // g g
  U0068: ['C', 'E', 'F', 'G1', 'G2'], // h h
  U0069: ['A1', 'D1', 'D2', 'G1', 'L'], // i i
  U006A: ['A2', 'C', 'D1', 'D2', 'G2'], // j j
  U006B: ['E', 'F', 'G1', 'G2', 'M'], // k k
  U006C: ['A1', 'D2', 'I', 'L'], // l l
  U006D: ['C', 'E', 'G1', 'G2', 'L'], // m m
  U006E: ['C', 'E', 'G1', 'G2'], // n n
  U006F: ['C', 'D1', 'D2', 'E', 'G1', 'G2'], // o o
  U0070: ['C', 'D1', 'G2', 'L', 'M'], // p p
  U0071: ['C', 'D1', 'D2', 'E', 'G1', 'G2', 'M'], // q q
  U0072: ['E', 'G1', 'G2'], // r r
  U0073: ['D1', 'D2', 'G2', 'M'], // s s
  U0074: ['D2', 'G1', 'G2', 'I', 'L'], // t t
  U0075: ['C', 'D1', 'D2', 'E'], // u u
  U0076: ['E', 'K'], // v v
  U0077: ['C', 'E', 'K', 'M'], // w w
  U0078: ['G1', 'G2', 'K', 'M'], // x x
  U0079: ['C', 'D1', 'D2', 'M'], // y y
  U007A: ['D1', 'G1', 'K'], // z z
  U007B: ['A2', 'D2', 'G1', 'I', 'L'], // { OpeningBrace
  U007C: ['I', 'L'], // | VerticalBar
  U007D: ['A1', 'D1', 'G2', 'I', 'L'], // } ClosingBrace
  U007E: ['F', 'H', 'J'], // ~ Tilde
  U20AC: ['A1', 'D1', 'E', 'F', 'G1', 'J', 'M'], // € EuroSign
  U00A2: ['A1', 'A2', 'D1', 'D2', 'E', 'F', 'I', 'L'], // ¢ CentSign
  U00A3: ['A2', 'D1', 'D2', 'G1', 'G2', 'I', 'L'], // £ PoundSign
  U2551: ['B', 'C', 'E', 'F'], // ║ BoxDrawingsDoubleVertical
  U2557: ['A1', 'A2', 'B', 'C', 'E'], // ╗ BoxDrawingsDoubleDownAndLeft
  U255D: ['B', 'G1', 'G2'], // ╝ BoxDrawingsDoubleUpAndLeft
  U255A: ['F', 'G1', 'G2'], // ╚ BoxDrawingsDoubleUpAndRight
  U2554: ['A1', 'A2', 'C', 'E', 'F'], // ╔ BoxDrawingsDoubleDownAndRight
  U2550: ['A1', 'A2', 'G1', 'G2'], // ═ BoxDrawingsDoubleHorizontal
  U00DF: ['A2', 'B', 'C', 'D2', 'G2', 'I', 'K'], // ß SharpS
  U03C0: ['G1', 'G2', 'K', 'M'], // π SmallPi
  U00B5: ['B', 'E', 'F', 'G1', 'G2'], // µ MicroSign
  U00F7: ['A2', 'D2', 'G1', 'G2'], // ÷ DivisionSign
  U00B0: ['A2', 'B', 'G2', 'I'], // ° DegreeSign
  U00B2: ['E', 'G2', 'K'], // ² SquareRoot
  U25A3: ['A1', 'A2', 'B', 'C', 'D1', 'D2', 'E', 'F', 'G1', 'G2', 'H', 'I', 'J', 'K', 'L', 'M', 'DP'] // ▣ AllChars
};

// **
// ** Animations
// **
// Demo Animations to use with segment matrix
var Animation = function(demo) {
  "use strict";
  var myinstance = false;
  var animate = loadanimations();

  try {
    switch (demo) {
      case undefined:
        throw ('No command specified.');
      case 'clock':
        myinstance = animate.startclock();
        break;
      case 'marquee':
        if (arguments.length < 3) throw 'One or more required arguments are missing.';
        var matrixlength = parseInt(arguments[2], 10); // force type integer
        if (matrixlength < 1) throw 'Matrix size for marquee has to be greater than zero.';
        var marqueetext = arguments[1].toString(10); // force type string
        if (marqueetext.length < 1) throw 'No textstring specified for marquee.';
          // if text is shorter then matrix, fill with leading spaces
        if (marqueetext.length < matrixlength) {
          marqueetext = Array(matrixlength - marqueetext.length + 1).join(' ') + marqueetext;
        }
        myinstance = animate.startmarquee(marqueetext, matrixlength);
        break;
      case 'spinner':
        myinstance = animate.startspinner();
        break;
      case 'bouncer':
        if (arguments.length < 3) throw 'One or more required arguments are missing.';
        var row = parseInt(arguments[1], 10); // force type integer
        var col = parseInt(arguments[2], 10);
        if (row < 5 || col < 5) throw 'Bouncer dimensions have to be at least 5 x 5.';
        myinstance = animate.startbouncer(row, col);
        myinstance.drawFrame('#000000');
        break;
      default:
        throw ('Unknown command: ' + demo);
    }
  } catch (err) {
    myinstance = err;
  } finally {
    return myinstance;
  }

  // constructors for animation objects 
  function loadanimations() {
    return {

      // Clock    
      startclock: function() {
        var Clock = function() {
          segmentDisplayMatrix.call(this, 1, 8);
        };
        inheritPrototype(Clock, segmentDisplayMatrix);
        Clock.prototype.setTime = this.protos.setTime;
        var ClockInstance = new Clock();
        return ClockInstance;
      },
      // Marquee
      startmarquee: function(textstring, matrixlength) {
        var Marquee = function() {
          this.textstring = textstring;
          this.matrixlength = matrixlength;
          this.marqueepos = 0;
          segmentDisplayMatrix.call(this, 1, matrixlength);
        };
        inheritPrototype(Marquee, segmentDisplayMatrix);
        Marquee.prototype.setMarquee = this.protos.setMarquee;
        var MarqueeInstance = new Marquee();
        return MarqueeInstance;
      },
      // Spinner    
      startspinner: function() {
        var Spinner = function(rows, cols) {
          this.rows = rows;
          this.cols = cols;
          this.spinnerindex = 0;
          segmentDisplayMatrix.call(this, 1, 1);
        };
        inheritPrototype(Spinner, segmentDisplayMatrix);
        Spinner.prototype.setSpinner = this.protos.setSpinner;
        Spinner.prototype.charset = this.protos.spinnerCharset;
        var SpinnerInstance = new Spinner();
        return SpinnerInstance;
      },
      // Bouncer   
      startbouncer: function(rows, cols) {
        var Bouncer = function() {
          this.ball = { // define ballobject
            xpos: 3,
            ypos: 3,
            xmov: 1,
            ymov: 1
          };
          segmentDisplayMatrix.call(this, rows, cols);
        };
        inheritPrototype(Bouncer, segmentDisplayMatrix);
        Bouncer.prototype.setBouncer = this.protos.setBouncer;
        Bouncer.prototype.moveball = this.protos.moveball;
        Bouncer.prototype.drawFrame = this.protos.drawFrame;
        var BouncerInstance = new Bouncer();
        return BouncerInstance;
      },

      // animation objects prototypes   
      protos: {
        // Clock 
        setTime: function() {
          var timenow = new Date();
          var hours = timenow.getHours();
          var mins = timenow.getMinutes();
          var secs = timenow.getSeconds();
          var timestring = (((hours < 10) ? ' ' : '') + hours + '.' + ((mins < 10) ? '0' : '') + mins + '.' + ((secs < 10) ? '0' : '') + secs);
          this.setLine(1, timestring, 'foreground');
        },
        // Marquee                
        setMarquee: function() {
          var stringlength = this.textstring.length;
          var processedstring = this.textstring.substr(this.marqueepos, stringlength) + this.textstring.substr(0, this.marqueepos);
          processedstring = processedstring.substr(0, this.matrixlength);
          this.setLine(1, processedstring, 'foreground');
          this.marqueepos++;
          if (this.marqueepos >= stringlength) {
            this.marqueepos = 0;
          }
        },
        // Spinner
        setSpinner: function() {
          this.spinnerindex++;
          if (this.spinnerindex > 7) this.spinnerindex = 0;
          this.setCharacter(1, 1, this.spinnerindex, 'foreground');
        },
        // Spinner charset      
        spinnerCharset: {
          U0030: ['A1', 'A2', 'I'],
          U0031: ['A2', 'B', 'J'],
          U0032: ['B', 'C', 'G2'],
          U0033: ['C', 'D2', 'M'],
          U0034: ['D1', 'D2', 'L'],
          U0035: ['D1', 'E', 'K'],
          U0036: ['E', 'F', 'G1'],
          U0037: ['A1', 'F', 'H']
        },
        //Bouncer    
        setBouncer: function() {
          this.setDisplaySegments(this.ball.ypos, this.ball.xpos, 'clear'); // clear old position
          this.moveball(); // get new position
          this.setCharacter(this.ball.ypos, this.ball.xpos, '▣', 'foreground'); //draw new postition
        },
        // Move bouncer ball
        moveball: function() {
          // check if border touched
          if (this.ball.ypos <= 2) {
            this.ball.ymov = this.ball.ymov * (-1);
          } // upper
          if (this.ball.ypos >= this.matrix.rows - 1) {
            this.ball.ymov = this.ball.ymov * (-1);
          } // lower
          if (this.ball.xpos <= 2) {
            this.ball.xmov = this.ball.xmov * (-1);
          } // left
          if (this.ball.xpos >= this.matrix.cols - 1) {
            this.ball.xmov = this.ball.xmov * (-1);
          } // right
          // move that ball
          this.ball.xpos += this.ball.xmov;
          this.ball.ypos += this.ball.ymov;
        },
        // draw ASCII frame
        drawFrame: function(mycolor) {
          if (this.matrix.rows < 3 || this.matrix.cols < 3) return 'Matrix needs to be at least 3 x 3 to draw a frame.';
          var row = 0;
          var col = 0;
          var htmlcolor = this.tools.htmlcolor.call(this, mycolor);
          var framestring = '';
          for (col = 2; col < this.matrix.cols; col++) {
            framestring += '═';
          }
          this.setLine(1, '╔' + framestring + '╗', htmlcolor);
          this.setLine(this.matrix.rows, '╚' + framestring + '╝', htmlcolor);
          for (row = 2; row < this.matrix.rows; row++) {
            this.setCharacter(row, 1, '║', htmlcolor);
            this.setCharacter(row, this.matrix.cols, '║', htmlcolor);
          }
          return false;
        },
      }
    };
  }

  // http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
  function inheritPrototype(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
  }
};

// **
// ** Polyfills
// **
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === "number" &&
    isFinite(value) &&
    Math.floor(value) === value;
};

/*! http://mths.be/codepointat v0.1.0 by @mathias */
if (!String.prototype.codePointAt) {
  (function() {
    "use strict"; // needed to support `apply`/`call` with `undefined`/`null`
    var codePointAt = function(position) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      var size = string.length;
      // `ToInteger`
      var index = position ? Number(position) : 0;
      if (index != index) { // better `isNaN`
        index = 0;
      }
      // Account for out-of-bounds indices:
      if (index < 0 || index >= size) {
        return undefined;
      }
      // Get the first code unit
      var first = string.charCodeAt(index);
      var second;
      if ( // check if it’s the start of a surrogate pair
        first >= 0xD800 && first <= 0xDBFF && // high surrogate
        size > index + 1 // there is a next code unit
      ) {
        second = string.charCodeAt(index + 1);
        if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
          // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      return first;
    };
    if (Object.defineProperty) {
      Object.defineProperty(String.prototype, 'codePointAt', {
        'value': codePointAt,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.codePointAt = codePointAt;
    }
  }());
}

// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    "use strict";
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}