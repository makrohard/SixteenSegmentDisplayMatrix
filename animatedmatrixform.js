/*
Animated Matrix Form
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
*/

window.animatedMatrices = { matrixid: 0 }; // Object to store running matrices

// GUI to start and stop animations
(function () {
  'use strict';

  addlistener();

  function addlistener () {
    document.getElementById('btnrun').addEventListener('click', function () {
      startstopanimation.startanimation(document.getElementById('selectdemo').value);
    });
  }
  // settings for the animation caller
  var startstopanimation = {
    startanimation: function (animation) {
      switch (animation) {
        case 'clock':
          this.callsetinterval({
            animationcaller: Animation('clock'),
            animationfunction: 'setTime()',
            animationinterval: 100,
            animationscale: 0.2
          });
          break;
        case 'marquee':
          this.callsetinterval({
            animationcaller: Animation('marquee', 'Hello World', 12),
            animationfunction: 'setMarquee()',
            animationinterval: 500,
            animationscale: 0.2
          });
          break;
        case 'spinner':
          this.callsetinterval({
            animationcaller: Animation('spinner'),
            animationfunction: 'setSpinner()',
            animationinterval: 125,
            animationscale: 0.35
          });
          break;
        case 'bouncer':
          this.callsetinterval({
            animationcaller: Animation('bouncer', 16, 36),
            animationfunction: 'setBouncer()',
            animationinterval: 300,
            animationscale: 0.08
          });
          break;
        default:
          return;
      }
    },

    stopanimation: function (animationid) {
      clearInterval(animatedMatrices['matrix' + animationid].timer); // clear timer
      showremovematrix.removematrix(animationid); // remove from DOM
      delete window.animatedMatrices['matrix' + animationid]; // delete property from global matrix object
    },
    callsetinterval: function (param) {
      window.animatedMatrices.matrixid++; // increment id to reference matrices
      var matrix = (function () {
        return param.animationcaller;
      }()); // make an instance of an animated matrix
      window.animatedMatrices['matrix' + window.animatedMatrices.matrixid] = { // put new matrix and timer reference in global matrix array 
        animation: matrix,
        timer: (function () {
          return window.setInterval(('animatedMatrices[\'matrix' + window.animatedMatrices.matrixid + '\'].animation.' + param.animationfunction), param.animationinterval);
        }())
      };
      showremovematrix.showmatrix(window.animatedMatrices.matrixid, matrix.matrix.svgcode, matrix.matrix.mywidth * param.animationscale); // write to DOM
    }
  };

  var showremovematrix = {
    // show matrix in scalable div, add buttons and listeners 
    showmatrix: function (id, svgtag, mywidth) {
      var container = document.getElementById('divsvgcontainer');

      var matrixcontainer = document.createElement('div');
      matrixcontainer.setAttribute('id', 'divmatrixcontainer_' + id);
      matrixcontainer.setAttribute('class', 'divmatrixcontainer');

      var charcolorinput = document.createElement('input');
      charcolorinput.setAttribute('id', 'charcolor_' + id);
      charcolorinput.setAttribute('class', 'fgcolorinput');
      charcolorinput.setAttribute('type', 'color');
      charcolorinput.setAttribute('value', '#f00000');
      charcolorinput.setAttribute('title', 'Segments color');
      charcolorinput.addEventListener('change', function () {
        var mycolor = window.animatedMatrices['matrix' + id].animation.tools.htmlcolor(this.value);
        window.animatedMatrices['matrix' + id].animation.foregroundColor = mycolor;
      });

      var bgcolorinput = document.createElement('input');
      bgcolorinput.setAttribute('id', 'bgcolor_' + id);
      bgcolorinput.setAttribute('value', '#f0f0f0');
      bgcolorinput.setAttribute('class', 'bgcolorinput');
      bgcolorinput.setAttribute('type', 'color');
      bgcolorinput.setAttribute('title', 'Background color');
      bgcolorinput.addEventListener('change', function () {
        var mycolor = window.animatedMatrices['matrix' + id].animation.tools.htmlcolor(this.value);
        window.animatedMatrices['matrix' + id].animation.backgroundColor = mycolor;
        window.animatedMatrices['matrix' + id].animation.setMatrixGroup(mycolor);
      });

      var stopbutton = document.createElement('button');
      stopbutton.setAttribute('id', 'btnstop');
      stopbutton.setAttribute('class', 'stopbutton');
      stopbutton.setAttribute('type', 'button');
      stopbutton.setAttribute('title', 'Stop animation and delete matrix.');
      stopbutton.addEventListener('click', function () {
        startstopanimation.stopanimation(id);
      });
      stopbutton.innerHTML = 'X';

      var innersvgdiv = document.createElement('div');
      innersvgdiv.setAttribute('id', 'divinnersvg_' + id);
      innersvgdiv.setAttribute('class', 'divinnersvg');

      var outersvgdiv = document.createElement('div');
      outersvgdiv.setAttribute('id', 'divoutersvg_' + id);
      outersvgdiv.setAttribute('class', 'divoutersvg');
      outersvgdiv.setAttribute('style', 'width:' + mywidth + 'px');

      innersvgdiv.appendChild(svgtag);
      outersvgdiv.appendChild(innersvgdiv);
      matrixcontainer.appendChild(stopbutton);
      matrixcontainer.appendChild(outersvgdiv);
      matrixcontainer.appendChild(charcolorinput);
      matrixcontainer.appendChild(bgcolorinput);
      container.appendChild(matrixcontainer);
    },
    // remove matrix from DOM
    removematrix: function (id) {
      var container = document.getElementById('divsvgcontainer');
      var divincontainer = document.getElementById('divmatrixcontainer_' + id);
      if (divincontainer) container.removeChild(divincontainer);
    }
  };

}());