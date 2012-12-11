/*
Copyright (C) 2012 Anna-Liisa Mattila

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//some kind of gui thing

WIDGET3D = {

  ElementType : {"MAIN_WINDOW":0, "WINDOW":1, "BASIC":2, "TEXT":3, "UNDEFINED":666 },
  
  //Container is a object that contains constructor method of container (eg. in three.js Object3D)
  // Container is used in windows to manage it's childs. Container has to provide
  // add and remove methods for meshes and other containers it allso needs to provide
  // mutable position.x, position.y position.z and rotation.x, rotation.y, rotation.z values.
  // position value changes has to be inherited to containers children.
  // This interface is mandatory!!!
  Container : undefined,
  
  initialized : false,
  
  isInitialized : function(){
    return this.initialized;
  },
  
  //------------------------------------------------------------
  // USEFUL HELPPER FUNCTIONS FOR MOUSE COORDINATE CALCULATIONS
  //------------------------------------------------------------

  //returns the real width of the canvas element
  getRealWidth : function(){
    return parseInt(window.getComputedStyle(this.getEvents().domElement_,null).getPropertyValue("width"));
  },

  getRealHeight : function(){
    return parseInt(window.getComputedStyle(this.getEvents().domElement_,null).getPropertyValue("height"));
  },

  getCanvasWidth : function(){
    return this.getEvents().domElement_.width;
  },

  getCanvasHeight : function(){
    return this.getEvents().domElement_.height;
  },

  //calculates mouseScreenCoordinates from domEvent
  mouseScreenCoordinates : function(domEvent){
    
    var coords = { x: 0, y: 0};
    if (!domEvent) {
      domEvent = window.event;
      coords.x = domEvent.x;
      coords.y = domEvent.y;
    }
    else {
      var element = domEvent.target ;
      var totalOffsetLeft = 0;
      var totalOffsetTop = 0 ;

      while (element.offsetParent)
      {
          totalOffsetLeft += element.offsetLeft;
          totalOffsetTop += element.offsetTop;
          element = element.offsetParent;
      }
      coords.x = domEvent.pageX - totalOffsetLeft;
      coords.y = domEvent.pageY - totalOffsetTop;
    }
    
    return coords;
  },

  mouseCoordinates : function(domEvent){

    var coords = this.mouseScreenCoordinates(domEvent);
    
    //If canvas element size has been manipulated with CSS the domElement.width and domElement.height aren't the
    // values of the height and width used showing the canvas. In here we need the real screen coordinatelimits
    //to calculate mouse position correctly.
    
    var CSSwidth = this.getRealWidth();
    var CSSheight = this.getRealHeight();
    
    var limits = {
      minX: 0,
      maxX: CSSwidth,
      minY: 0,
      maxY: CSSheight
    };
    
    var mouse = this.scaleCoordinates(coords, limits);
    return mouse;
  },

  //scales coordinates to range of -1..1
  scaleCoordinates : function(point, limits){
    var x = +((point.x - limits.minX) / limits.maxX) * 2 - 1;
    var y = -((point.y - limits.minY) / limits.maxY) * 2 + 1;
    
    return {x: x, y: y};
  },

  //calculates childs coordinate limits in parent coordinate system
  calculateLimits : function(position, width, height){

    var maxX = position.x + (width/2);
    var minX = position.x - (width/2);
    
    var maxY = position.y + (height/2);
    var minY = position.y - (height/2);
    
    return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
  },
  
  //Initializes the widget system core
  //
  //PARAMETERS:
  //  scene: Scene where gui objects are drawn. Meshes and containers are added here. Should provide add and remove
  //    methods.
  //
  //  collisionCallback: JSON object containing attributes callback and args (arguments for callback, optional).
  //    collisionCallback is used detecting mouse events on guiObjects. collisionCallback should return
  //    the mesh which was hit by cursor or false if hit weren't occured.
  //
  //  domElement: DOM element where the mouse events are arised. Passing canvas where the
  //    app is rendered is recomended. This parameter is optional, but if it's not specified
  //    mouse event detection will use document as it's domElement!
  //
  //  container: object containing constructor method of container (descriped above).
  //
  //RETURNS:
  //  root window which is Window typed gui object.
  //
  init : function(parameters){
    
    //Some private variables inside a closure
    
    var focused_ = [];
    var allObjects_ = {};
    var mainWindow_;
    var events_;
    
    var makeId = function(){
      var i = 0;
      return function(){
        return ++i;
      }
    }
    WIDGET3D.id = makeId();
      
    WIDGET3D.getEvents = function(){
      return events_;
    };
    
    WIDGET3D.getMainWindow = function(){
      return mainWindow_;
    };
    
    WIDGET3D.addObject = function(widget){
      allObjects_[(widget.id_)] = widget;
    };
    
    WIDGET3D.removeObject = function(id){
      delete allObjects_[id];
    };
    
    WIDGET3D.getObjectById = function(id){
      return allObjects_[id];
    };
    
    WIDGET3D.getFocused = function(){
      return focused_;
    };
    
    WIDGET3D.addFocus = function(object){
      focused_.push(object);
    };
    
    WIDGET3D.removeFocus = function(object){
      for(var i = 0; i < focused_.length; ++i){
        if(focused_[i] === object){
          focused_.splice(i, 1);
          return true;
        }
      }
      return false;
    };
    
    WIDGET3D.unfocusFocused = function(){
    
      for(var i = 0; i < focused_.length; ++i){
        focused_[i].unfocus();
      }
      
      focused_ = [];
    };
    
    var parameters = parameters || {};
    
    //INITIALIZING CODE
    if(parameters.container != undefined){
      WIDGET3D.Container = parameters.container;
    }
    else{
      console.log("Container must be specified!");
      console.log("Container has to be constructor method of container of used 3D-engine (eg. in three.js THREE.Object3D");
    }
    
    mainWindow_ = new WIDGET3D.MainWindow();
    
    if(parameters.collisionCallback != undefined && 
      parameters.collisionCallback.callback != undefined){
      
      events_ = new WIDGET3D.DomEvents(parameters.collisionCallback, parameters.domElement);
    }
    else{
      console.log("CollisionCallback has to be JSON object containing attributes callback (and args, optional)");
      console.log("Initializing WIDGET3D failed!");
      return false;
    }
    
    
    WIDGET3D.initialized = true;

    return mainWindow_;
  }
};







