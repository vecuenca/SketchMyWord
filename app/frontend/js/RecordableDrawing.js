var canvas = (function(){
   "use strict";

   var clickX = new Array();
   var clickY = new Array();
   var clickDrag = new Array();
   var paint = false;

   var canvas = {};

   var context = document.getElementById('canvas').getContext("2d");

   var cvs = document.getElementById('canvas');

   cvs.addEventListener("mousedown", (function(e){
       paint = true;
       addClick(e.clientX - cvs.offsetLeft, e.clientY - cvs.offsetTop, false);
       redraw();
   }));

   cvs.addEventListener( "mousemove", (function(e){
       if(paint){
            addClick(e.clientX - cvs.offsetLeft, e.clientY - cvs.offsetTop, true);
            redraw();
        }
   }));

   cvs.addEventListener("mouseup", (function(e){
       paint = false;
   }));

   cvs.addEventListener("mouseout", function(e){
       paint = false;
   });

    function addClick(x, y, dragging){
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    function redraw(){
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); 

        context.strokeStyle = "#df4b26";
        context.lineJoin = "round";
        context.lineWidth = 5;
                    
        for(var i=0; i < clickX.length; i++) {		
            if (!clickDrag[i] && i == 0) {
                context.beginPath();
                context.moveTo(clickX[i], clickY[i]);
                context.stroke();
            } else if (!clickDrag[i] && i > 0) {
                context.closePath();

                context.beginPath();
                context.moveTo(clickX[i], clickY[i]);
                context.stroke();
            } else {
                context.lineTo(clickX[i], clickY[i]);
                context.stroke();
            }
        }
    }

   return canvas;

}());
