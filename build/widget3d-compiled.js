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
    
    WIDGET3D.getAllObjects = function(){
      return allObjects_;
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








//------------------------------------------------------------
// USEFUL HELPPER FUNCTIONS
//------------------------------------------------------------

//returns the real width of the canvas element
WIDGET3D.getRealWidth = function(){
  return parseInt(window.getComputedStyle(WIDGET3D.getEvents().domElement_,null).getPropertyValue("width"));
};

WIDGET3D.getRealHeight = function(){
  return parseInt(window.getComputedStyle(WIDGET3D.getEvents().domElement_,null).getPropertyValue("height"));
};

WIDGET3D.getCanvasWidth = function(){
  return WIDGET3D.getEvents().domElement_.width;
};

WIDGET3D.getCanvasHeight = function(){
  return WIDGET3D.getEvents().domElement_.height;
};

//calculates mouseScreenCoordinates from domEvent
WIDGET3D.mouseScreenCoordinates = function(domEvent){
  
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
};

WIDGET3D.mouseCoordinates = function(domEvent){

  var coords = WIDGET3D.mouseScreenCoordinates(domEvent);
  
  //If canvas element size has been manipulated with CSS the domElement.width and domElement.height aren't the
  // values of the height and width used showing the canvas. In here we need the real screen coordinatelimits
  //to calculate mouse position correctly.
  
  var CSSwidth = WIDGET3D.getRealWidth();
  var CSSheight = WIDGET3D.getRealHeight();
  
  var limits = {
    minX: 0,
    maxX: CSSwidth,
    minY: 0,
    maxY: CSSheight
  };
  
  var mouse = WIDGET3D.scaleCoordinates(coords, limits);
  return mouse;
};

//scales coordinates to range of -1..1
WIDGET3D.scaleCoordinates = function(point, limits){
  var x = +((point.x - limits.minX) / limits.maxX) * 2 - 1;
  var y = -((point.y - limits.minY) / limits.maxY) * 2 + 1;
  
  return {x: x, y: y};
};

//calculates childs coordinate limits in parent coordinate system
WIDGET3D.calculateLimits = function(position, width, height){

  var maxX = position.x + (width/2);
  var minX = position.x - (width/2);
  
  var maxY = position.y + (height/2);
  var minY = position.y - (height/2);
  
  return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
};


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

//WIDGET 3D EVENTS
//---------------------------------------------
// DOM EVENTS
//--------------------------------------------


//Eventhandler abstraction for WIDGET3D's objects
// needs the gui's main window (root window)
//For mouse events uses mainwindows renderer as domElement!
WIDGET3D.DomEvents = function(collisionCallback, domElement){

  var _that_ = this;
  
  if(domElement){
    _that_.domElement_ = domElement;
  }
  else{
    _that_.domElement_ = document;
  }
  
  _that_.collisions_ = {
    callback: collisionCallback.callback,
    args: collisionCallback.args
  };
  
  _that_.enabled_ = {};
  
  _that_.mouseEvent = function(domEvent){
    
    var hit = _that_.collisions_.callback(domEvent, _that_.collisions_.args);
    var name = domEvent.type;
    var mainWindow = WIDGET3D.getMainWindow();
    
    //hit can't be mainWindow because mainWindow doesn't have mesh
    if(hit && hit.events_.hasOwnProperty(name.toString())){
      for(var k = 0; k < hit.events_[name.toString()].length; ++k){
        hit.events_[name.toString()][k].callback(domEvent,
          hit.events_[name.toString()][k].arguments);
      }
    }
    //if mainwindow has eventlistener it is executed also
    if(mainWindow.events_.hasOwnProperty(name.toString())){
      for(var j = 0; j < mainWindow.events_[name.toString()].length; ++j){
        mainWindow.events_[name.toString()][j].callback(domEvent,
          mainWindow.events_[name.toString()][j].arguments);
      }
    }
    
  };
  
  _that_.keyboardEvent = function(domEvent){
    
    var name = domEvent.type;
    var mainWindow = WIDGET3D.getMainWindow();
    
    for(var k = 0; k < mainWindow.childEvents_[name.toString()].length; ++k){
      if(mainWindow.childEvents_[name.toString()][k] != mainWindow &&
        mainWindow.childEvents_[name.toString()][k].inFocus_)
      {
        var object = mainWindow.childEvents_[name.toString()][k];
        
        for(var m = 0; m < object.events_[name.toString()].length; ++m){
          object.events_[name.toString()][m].callback(domEvent,
            object.events_[name.toString()][m].arguments);
          
        }
      }
    }
    
    //then we call main windows onkeydown callback if there is one
    if(mainWindow.events_.hasOwnProperty(name.toString())){      
      for(var l = 0; l < mainWindow.events_[name.toString()].length; ++l){
        mainWindow.events_[name.toString()][l].callback(domEvent,
          mainWindow.events_[name.toString()][l].arguments);
      }
    }
  };
  
  // This method can be used to trigger an event
  // if id is specified the event is passed to specific object
  // if the id isn't specified the event is passed to all objects
  // that has the listener for the event.
  //
  _that_.triggerEvent = function(event, id){
    var name = event.type;
    
    if(!id){
      
      var mainWindow = WIDGET3D.getMainWindow();
      
      for(var k = 0; k < mainWindow.childEvents_[name.toString()].length; ++k){
        
        var object = mainWindow.childEvents_[name.toString()][k];
        
        for(var m = 0; m < object.events_[name.toString()].length; ++m){
          object.events_[name.toString()][m].callback(event,
            object.events_[name.toString()][m].arguments);
        }
      }
    }
    else{
      
      var to = WIDGET3D.getObjectById(id);
      for(var i = 0; i < to.events_[name.toString()].length; ++i){
        to.events_[name.toString()][i].callback(event,
          to.events_[name.toString()][i].arguments);
      }
    }
  };

  
};

//Adds event listener to dom element
WIDGET3D.DomEvents.prototype.enableEvent = function(name){
  //if there is no property or if the property is false
  if(!this.enabled_.hasOwnProperty(name.toString()) || 
    (this.enabled_.hasOwnProperty(name.toString()) && this.enabled_[name.toString()] === false))
  {
    if(name == "keyup" || name == "keydown" || name == "keypress"){
      document.addEventListener(name, this.keyboardEvent, false);
    }
    else{
      this.domElement_.addEventListener(name, this.mouseEvent, false);
    }
    this.enabled_[name.toString()] = true;
  }
};

//Removes event listener from dom element
WIDGET3D.DomEvents.prototype.disableEvent = function(name){

  if(this.enabled_.hasOwnProperty(name.toString()) && this.enabled_[name.toString()] === true){
    if(name == "keyup" || name == "keydown" || name == "keypress"){
      //console.log("removed keyboard listener from event "+name);
      document.removeEventListener(name, this.keyboardEvent, false);
    }
    else{
      //console.log("removed mouse listener from event "+name);
      this.domElement_.removeEventListener(name, this.mouseEvent, false);
    }
    this.enabled_[name.toString()] = false;
    return true;
  }
  return false;
};

//---------------------------------------------
// GUI OBJECT : generic abstract object
//---------------------------------------------

//There are ElementType amount of different kind of bjects
//with different properties that are inherited from thisObject.
//So this Object describes all properties and methods that are
//for all types of objects

//GUI OBJECT CONSTRUCTORS
WIDGET3D.GuiObject = function(){

  this.isVisible_ = true;
  this.inFocus_ = false;
  this.id_ = WIDGET3D.id();
  
  this.events_ = {
  
    checkEvent : function(name){
      if(this.hasOwnProperty(name.toString()) && this[name.toString()] != false){
        return true;
      }
      else{
        return false;
      }
    },
    
    addCallback : function(name, callback, arguments, index){
      if(!this.hasOwnProperty(name.toString()) ||
      (this.hasOwnProperty(name.toString()) && this[name.toString()] === false))
      {
        this[name.toString()] = [];  
      }
      this[name.toString()].push({callback : callback, arguments : arguments, index : index});
    },
    
    removeCallback : function(name, callback, arguments){
      if(this.hasOwnProperty(name.toString()) &&
      Object.prototype.toString.apply(this[name.toString()]) === '[object Array]')
      {
        for(var i = 0; i < this[name.toString()].length; ++i){
          if(this[name.toString()][i].callback === callback && this[name.toString()][i].arguments === arguments){
            
            var index = this[name.toString()][i].index;
            this[name.toString()].splice(i, 1);

            if(this[name.toString()].length == 0){
              this[name.toString()] = false;
            }
            return index;
          }
        }
      }
      return false;
    },
    
    removeAll : function(name){
    
      if(this.hasOwnProperty(name.toString()) &&
      Object.prototype.toString.apply(this[name.toString()]) === '[object Array]')
      {
        var index = this[name.toString()][0].index;
        this[name.toString()] = false;
        return index;
      }
      
      return false;
    },
    
    remove : function(){
      var listeners = [];
      for(listener in this){
        if(this.hasOwnProperty(listener) &&
        Object.prototype.toString.apply(this[listener]) === '[object Array]')
        {
          var tmp = {name : listener, index: this[listener][0].index};
          listeners.push(tmp);
          listener = false;
        }
      }
      return listeners;
    }
  };
  
  WIDGET3D.addObject(this);//TESTAA!!!
  
};

//TODO: FIX SO THAT MULTIPLE TARGETS CAN BE FOCUSED
//set focus on object
WIDGET3D.GuiObject.prototype.focus = function(){
  if(!this.inFocus_){
  
    WIDGET3D.unfocusFocused();
    this.inFocus_ = true;
    WIDGET3D.addFocus(this);
    
  }
};

//unfocus object
//TODO FIX
WIDGET3D.GuiObject.prototype.unfocus = function(){
  if(this.inFocus_){
    this.inFocus_ = false; 
  }
};

// Adds event listner to object
// callback: callback function that is called when the event is triggered to object
// (args: arguments for callback)
//
// NOTE: event object IS ALLWAYS PASSED TO CALLBACKFUNCTION AS ITS FIRST ARGUMENT
//
WIDGET3D.GuiObject.prototype.addEventListener = function(name, callback, args){

  if(!WIDGET3D.getEvents().enabled_[name.toString()]){
    WIDGET3D.getEvents().enableEvent(name);
  }
  if(!this.events_.checkEvent(name)){
    var index = WIDGET3D.getMainWindow().childEvents_.addObject(name, this);
  }
  else{
    var index = this.events_[name.toString()][0].index;
  }
  this.events_.addCallback(name, callback, args, index);
};

// Removes eventlistener from object
// Parameters: event = event name
//             callback = binded callbackfunction
//             args = binded arguments for callback
//             custom = boolean flag that tells if the event is dom event or custom event (message)
WIDGET3D.GuiObject.prototype.removeEventListener = function(name, callback, args){

  var index = this.events_.removeCallback(name, callback, args);
  
  if(index === false){
    return false;
  }
  if(this.events_[name.toString()] === false){
    var mainWindow = WIDGET3D.getMainWindow();
    
    mainWindow.childEvents_[name.toString()].splice(index, 1);
    
    //if there were no events left lets disable event
    if(mainWindow.childEvents_[name.toString()].length == 0){
      mainWindow.childEvents_.removeEvent(name);
    }
        
    for(var i = 0; i < mainWindow.childEvents_[name.toString()].length; ++i){
      mainWindow.childEvents_[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

// Removes eventlisteners from object
WIDGET3D.GuiObject.prototype.removeEventListeners = function(name){
  var index = this.events_.removeAll(name);
  if(index === false){
    return false;
  }
  else{
    var mainWindow = WIDGET3D.getMainWindow();
    
    mainWindow.childEvents_[name.toString()].splice(index, 1);
    
    if(mainWindow.childEvents_[name.toString()].length == 0){   
      mainWindow.childEvents_.removeEvent(name);
    }
    
    for(var i = 0; i < mainWindow.childEvents_[name.toString()].length; ++i){
      mainWindow.childEvents_[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

WIDGET3D.GuiObject.prototype.removeAllListeners = function(){
  var listeners = this.events_.remove();
  
  var mainWindow = WIDGET3D.getMainWindow();
  for(var i = 0; i < listeners.length; ++i){
    var name = listeners[i].name;
    var index = listeners[i].index;
    
    mainWindow.childEvents_[name].splice(index, 1);
    
    if(mainWindow.childEvents_[name].length == 0){
      mainWindow.childEvents_.removeEvent(name);
    }
    
    for(var k = 0; k < mainWindow.childEvents_[name].length; ++k){
      mainWindow.childEvents_[name][k].setNewEventIndex(name, k);
    }
  }
}

WIDGET3D.GuiObject.prototype.setNewEventIndex = function(name, index){
  
  for(var i = 0; i < this.events_[name.toString()].length; ++i){
    this.events_[name.toString()][i].index = index;
  }
  WIDGET3D.getMainWindow().childEvents_[name.toString()][index] = this;
}

WIDGET3D.GuiObject.prototype.addUpdateCallback = function(callback, args){ 
  this.updateCallback_ = {callback: callback, arguments: args};
};

WIDGET3D.GuiObject.prototype.update = function(){
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
};


//---------------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR ABSTRACT GUI OBJECT
//---------------------------------------------------------
WIDGET3D.GuiObject.prototype.inheritance = function(){
  function guiObjectPrototype(){}
  guiObjectPrototype.prototype = this;
  var created = new guiObjectPrototype();
  return created;
};

//---------------------------------------------
// GUI OBJECT: BASIC
//---------------------------------------------
//
// The basic guiObject that can be moved or hidden and so on.
// Any other object than main window is this type of object
//
WIDGET3D.Basic = function(){

  WIDGET3D.GuiObject.call( this );
  
  this.mesh_;
  this.parent_;
};


// inheriting basic from GuiObject
WIDGET3D.Basic.prototype = WIDGET3D.GuiObject.prototype.inheritance();

WIDGET3D.Basic.prototype.type_ = WIDGET3D.ElementType.BASIC;

//sets parent window for object
WIDGET3D.Basic.prototype.setParent = function(widget){
  // if parent is allready set we have to do some things
  // to keep datastructures up to date.
  if(this.parent_ != undefined){
  
    if(this.isVisible_ && this.mesh_){
      this.parent_.container_.remove(this.mesh_);
    }
    
    this.parent_.removeFromObjects(this);
  }
  
  this.parent_ = widget;
  this.parent_.children_.push(this);
  
  if(this.isVisible_ && this.mesh_){
    this.parent_.container_.add(this.mesh_);
  }
  if(!this.parent_.isVisible_){
    this.hide();
  }
}

//meshes is array of meshes WIDGET3D are part of object
WIDGET3D.Basic.prototype.setMesh = function(mesh){

  var mainWindow = WIDGET3D.getMainWindow();
  
  if(this.mesh_ && this.parent_){
    //removes the old mesh from the scene
    if(this.isVisible_){
      this.parent_.container_.remove(this.mesh_);
    }
    
    mainWindow.removeMesh(this.mesh_);
    this.mesh_ = mesh;
    
    if(this.isVisible_){
      this.parent_.container_.add(this.mesh_);
    }
  }
  else if(this.parent_){
  
    this.mesh_ = mesh;
    
    if(this.isVisible_){
     this.parent_.container_.add(this.mesh_);
    }
  }
  else{
    this.mesh_ = mesh;
  }
  mainWindow.meshes_.push(this.mesh_);
};

// shows object
WIDGET3D.Basic.prototype.show = function(){
  if(!this.isVisible_){
    this.isVisible_ = true;
    this.mesh_.visible = true;
    
    this.parent_.container_.add(this.mesh_);
  }
};

// hides object
WIDGET3D.Basic.prototype.hide = function(){
  if(this.isVisible_){
    this.isVisible_ = false;
    this.mesh_.visible = false;
    if(this.inFocus_){
      this.unfocus();
    }
    
    this.parent_.container_.remove(this.mesh_);
  }
};

//removes object
WIDGET3D.Basic.prototype.remove = function(){
  this.hide();
  //removing event listeners
  this.removeAllListeners();
  //removing mesh
  WIDGET3D.getMainWindow().removeMesh(this.mesh_);
  //removing object
  this.parent_.removeFromObjects(this);
  
  WIDGET3D.removeObject(this.id_);
};

//getters and setters for location and rotation
//TODO: MOVE TO ADAPTER SIDE
WIDGET3D.Basic.prototype.getPosition = function(){
  return this.mesh_.position;
};

WIDGET3D.Basic.prototype.setPosition = function(x, y, z){
  
  this.mesh_.position.set(x,y,z);
};

WIDGET3D.Basic.prototype.setX = function(x){
  this.mesh_.position.setX(x);
};

WIDGET3D.Basic.prototype.setY = function(y){
  this.mesh_.position.setY(y);
};

WIDGET3D.Basic.prototype.setZ = function(z){
  this.mesh_.position.setZ(z);
};

WIDGET3D.Basic.prototype.getRotation = function(){
  return this.mesh_.rotation;
};

WIDGET3D.Basic.prototype.setRotation = function(rotX, rotY, rotZ){
  
  this.mesh_.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Basic.prototype.setRotationX = function(rotX){
  this.mesh_.rotation.setX(rotX);
};

WIDGET3D.Basic.prototype.setRotationY = function(rotY){
  this.mesh_.rotation.setY(rotY);
};

WIDGET3D.Basic.prototype.setRotationZ = function(rotZ){
  this.mesh_.rotation.setZ(rotZ);
};

//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR BASIC OBJECT
//--------------------------------------------------
WIDGET3D.Basic.prototype.inheritance = function(){
  function guiBasicPrototype(){}
  guiBasicPrototype.prototype = this;
  var created = new guiBasicPrototype();
  return created;
};//---------------------------------------------
// GENERAL FUNCTIONALITY FOR WINDOWS
//---------------------------------------------
//
// Object that has the functionality that should be
// inherited to all kind of windows but not to any other objects.
//

WIDGET3D.WindowBase = function(){
  this.children_ = [];
  this.container_ = new WIDGET3D.Container();
};

// adds new child to window
WIDGET3D.WindowBase.prototype.addChild = function(widget){
  
  widget.setParent(this);
  return widget;
};

// hides unfocused objects in window
WIDGET3D.WindowBase.prototype.hideNotFocused = function(){
  for(var i = 0; i < this.children_.length; ++i){
    if(!this.children_[i].inFocus_){
      this.children_[i].hide();
    }
  }
};

//removes object in place 'index' from object list
WIDGET3D.WindowBase.prototype.removeFromObjects = function(widget){
  
  for(var k = 0; k < this.children_.length; ++k){
    if(this.children_[k] === widget){
      var removedObj = this.children_.splice(k, 1);
      return removedObj[0];
    }
  }
  return false;
};//------------------------------------------------
// MAIN WINDOW: Singleton root window
//
// The Main Window is inited by widget3d by default.
//
// Extends WIDGET3D.GuiObject object.
//---------------------------------------------------

WIDGET3D.MainWindow = function(){
  
  WIDGET3D.GuiObject.call( this );
  WIDGET3D.WindowBase.call( this );
  
  this.meshes_ = [];
  
  this.childEvents_ = {
    
    addObject : function(name, child){
      if(!this.hasOwnProperty(name.toString()) ||
        (this.hasOwnProperty(name.toString()) && this[name.toString()] == false))
      {
        this[name.toString()] = [];
      }
      this[name.toString()].push(child);
      var index = this[name.toString()].length-1;
      return index;
    },

    removeEvent : function(name){
      if(this.hasOwnProperty(name.toString()) && this[name.toString()].length == 0){
        this[name.toString()] = false;  
        WIDGET3D.getEvents().disableEvent(name);
        return true;
      }
      return false;
    }
  };
};


//-----------------------------------------------------------------------------------------
// inheriting MainWindow from GuiObject
WIDGET3D.MainWindow.prototype = WIDGET3D.GuiObject.prototype.inheritance();


//inheriting some methods from WindowInterface
// adds new child to window
WIDGET3D.MainWindow.prototype.addChild= WIDGET3D.WindowBase.prototype.addChild;
// hides unfocused objects in window
WIDGET3D.MainWindow.prototype.hideNotFocused = WIDGET3D.WindowBase.prototype.hideNotFocused;
// removes object from window
WIDGET3D.MainWindow.prototype.removeFromObjects = WIDGET3D.WindowBase.prototype.removeFromObjects;

//-----------------------------------------------------------------------------------------
WIDGET3D.MainWindow.prototype.type_ = WIDGET3D.ElementType.MAIN_WINDOW;
//-----------------------------------------------------------------------------------------

//removes mesh from mesh list
WIDGET3D.MainWindow.prototype.removeMesh = function(mesh){

  for(var k = 0; k < this.meshes_.length; ++k){
    if(this.meshes_[k] === mesh){
      var removedMesh = this.meshes_.splice(k, 1);
      return removedMesh[0];
    }
  }
  return false;
};


//---------------------------------------------
// GUI OBJECT: WINDOW
//---------------------------------------------
// Basic window that can has children.
// Extends WIDGET3D.Basic object.
//---------------------------------------------
WIDGET3D.Window = function(){
  WIDGET3D.Basic.call( this );
  WIDGET3D.WindowBase.call( this );
};


//-----------------------------------------------------------------------------------------
// inheriting window from Basic object
WIDGET3D.Window.prototype = WIDGET3D.Basic.prototype.inheritance();

//inheriting some methods from WindowInterface

// adds new child to window
WIDGET3D.Window.prototype.addChild= WIDGET3D.WindowBase.prototype.addChild;
// hides unfocused objects in window
WIDGET3D.Window.prototype.hideNotFocused = WIDGET3D.WindowBase.prototype.hideNotFocused;
// removes object from window
WIDGET3D.Window.prototype.removeFromObjects = WIDGET3D.WindowBase.prototype.removeFromObjects;

//-----------------------------------------------------------------------------------------
WIDGET3D.Window.prototype.type_ = WIDGET3D.ElementType.WINDOW;
//-----------------------------------------------------------------------------------------

//sets parent window for object
WIDGET3D.Window.prototype.setParent = function(widget){
  
  // if parent is allready set we have to do some things
  // to keep datastructures up to date.
  if(this.parent_ != undefined){
  
    this.parent_.container_.remove(this.container_);
    this.parent_.removeFromObjects(this);
    
    this.parent_ = widget;
    this.parent_.children_.push(this);
    this.parent_.container_.add(this.container_);
  }
  else{
    this.parent_ = widget;
    this.parent_.children_.push(this);
    this.parent_.container_.add(this.container_);
  }
};

//sets mesh for window
WIDGET3D.Window.prototype.setMesh = function(mesh){
  var mainWindow =  WIDGET3D.getMainWindow();
  
  if(this.mesh_){
    //removes the old mesh from the scene
    if(this.isVisible_){
      this.container_.remove(this.mesh_);
    }
    
    mainWindow.removeMesh(this.mesh_);
    this.mesh_ = mesh;
    
    if(this.isVisible_){
      this.container_.add(this.mesh_);
    }
    mainWindow.meshes_.push(this.mesh_);
  }
  else {
    this.mesh_ = mesh;
    mainWindow.meshes_.push(this.mesh_);
    this.container_.add(this.mesh_);
  }
};

// shows window
WIDGET3D.Window.prototype.show = function(){

  if(!this.isVisible_){
    for(var i = 0; i < this.children_.length; ++i){
      this.children_[i].show();
    }
    this.isVisible_ = true;
    this.parent_.container_.add(this.container_);
    if(this.mesh_){
      this.mesh_.visible = true;
      this.container_.add(this.mesh_);
    }
  }
};

// hides window
WIDGET3D.Window.prototype.hide = function(){

  if(this.isVisible_){
    for(var i = 0; i < this.children_.length; ++i){
      this.children_[i].hide();
    }
    
    this.isVisible_ = false;
    if(this.inFocus_){
      this.unfocus();
    }
    this.parent_.container_.remove(this.container_);
    if(this.mesh_){
      this.mesh_.visible = false;
      this.container_.remove(this.mesh_);
    }
  }
};

//removes window and it's children
WIDGET3D.Window.prototype.remove = function(){
  //children needs to be removed  
  while(this.children_.length > 0){
    this.children_[0].remove();
  }
  //hiding the window from scene
  this.hide();
  //removing event listeners
  this.removeAllListeners();
  
  //If window has a mesh, it has to be removed allso
  if(this.mesh_){
    WIDGET3D.getMainWindow().removeMesh(this.mesh_);
  }
  //container has to be removed from parent's container
  this.parent_.container_.remove(this.container_);
  //removing this from parents objects
  this.parent_.removeFromObjects(this);
  
  WIDGET3D.removeObject(this.id_);
};

//setters and getters for location and rotation

//TODO: MOVE TO THE ADAPTER SIDE
WIDGET3D.Window.prototype.getPosition = function(){
  return this.container_.position;
};

WIDGET3D.Window.prototype.setPosition = function(x, y, z){
  
  this.container_.position.set(x,y,z);
};

WIDGET3D.Window.prototype.setX = function(x){
  this.container_.position.setX(x);
};

WIDGET3D.Window.prototype.setY = function(y){
  this.container_.position.setY(y);
};

WIDGET3D.Window.prototype.setZ = function(z){
  this.container_.position.setZ(z);
};

WIDGET3D.Window.prototype.getRotation = function(){
  return this.container_.rotation;
};

WIDGET3D.Window.prototype.setRotation = function(rotX, rotY, rotZ){
  
  this.container_.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Window.prototype.setRotationX = function(rotX){
  this.container_.rotation.setX(rotX);
};

WIDGET3D.Window.prototype.setRotationY = function(rotY){
  this.container_.rotation.setY(rotY);
};

WIDGET3D.Window.prototype.setRotationZ = function(rotZ){
  this.container_.rotation.setZ(rotZ);
};

 
//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR WINDOW OBJECT
//--------------------------------------------------
WIDGET3D.Window.prototype.inheritance = function(){
  function guiWindowPrototype(){}
  guiWindowPrototype.prototype = this;
  var created = new guiWindowPrototype();
  return created;
};


//---------------------------------------------
// GUI OBJECT: TEXT
//---------------------------------------------
//
// This object is designed for text abstraction.
// Abstraction doesn't provide fonts and it's mesh
// can be anything from 3D-text to plane geometry
// textured with 2D-canvas
//

//TODO: REFACTOR SO THAT THE COMPONENT WOULD BE MORE USEFULL OR
// REMOVE AT THE ADAPTER SIDE

WIDGET3D.Text = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  this.mutable_ = parameters.mutable !== undefined ? parameters.mutable : true;
  
  this.cursor_ = parameters.cursor !== undefined ? parameters.cursor : "|";
  
  this.maxLength_ = parameters.maxLength !== undefined ? parameters.maxLength : false;
  this.maxLineLength_ = parameters.maxLineLength !==  undefined ? parameters.maxLineLength : this.maxLength_;
  
  this.endl_ = '\n';
  
  //row buffer that is not yet added to the rows_ table
  this.currentRow_ = "";
  
  //the whole text that is processed in add and erase functions
  this.text_ = "";
  
  //table of rows
  this.rows_ = [];
  
  //the whole text + cursor
  this.textHandle_ = this.text_;
  
  if(parameters.text){
    this.setText(parameters.text);
  }
};


// inheriting Text from Basic
WIDGET3D.Text.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.Text.prototype.type_ = WIDGET3D.ElementType.TEXT;

WIDGET3D.Text.prototype.setText = function(text){
  if(this.mutable_){
    for(var i = 0; i < text.length; ++i){
      this.addLetter(text[i]);
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.addLetter = function(letter){
  if(this.mutable_){
    
    //Checking it the current row and the whole text length are below limits
    if(!this.maxLength_ || this.text_.length < this.maxLength_)
    {
    
      if(!this.maxLineLength_ || this.currentRow_.length < this.maxLineLength_){
        this.currentRow_ += letter;
        this.text_ += letter;
        
        if(this.currentRow_.length == this.maxLineLength_ || this.text_.length == this.maxLength_)
        {
          this.rows_.push(this.currentRow_+this.endl_);
          this.currentRow_ = "";
        }
      }
      else if(this.currentRow_.length == this.maxLineLength_ || this.text_.length == this.maxLength_)
      {
        this.rows_.push(this.currentRow_+this.endl_);
        this.currentRow_ = letter;
        this.text_ += letter;
      }
      
    }
    
    this.textHandle_ = this.text_;
    if(this.inFocus_){
      this.textHandle_ += this.cursor_;
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.erase = function(amount){
  if(this.mutable_){
    
    for(i = 0; i < amount; ++i){
      if(this.currentRow_.length != 0){
        this.currentRow_ = this.currentRow_.substring(0, (this.currentRow_.length-1));
        
        if(this.currentRow_.length == 0 && this.rows_.length != 0){
          this.currentRow_ = this.rows_[this.rows_.length-1];
          this.rows_.splice(-1, 1);
          //taking the endl character out.
          this.currentRow_ = this.currentRow_.substring(0, (this.currentRow_.length-1));
          
        }
      }
      else if(this.rows_.length != 0){
        this.currentRow_ = this.rows_[this.rows_.length-1];
        this.rows_.splice(-1, 1);
        
        //taking the endl character and the character to be erased out.
        this.currentRow_ = this.currentRow_.substring(0, (this.currentRow_.length-2));
      }
    }
    this.text_ = this.text_.substring(0, (this.text_.length-amount));
    
    this.textHandle_ = this.text_;
    if(this.inFocus_){
      this.textHandle_ += this.cursor_;
    }
    
    this.update();
  }
};

//set focus on textobject
WIDGET3D.Text.prototype.focus = function(){
  if(this.mutable_ && !this.inFocus_){
    this.textHandle_ = this.text_ + this.cursor_;
  }
  WIDGET3D.Basic.prototype.focus.call(this);
  this.update();
};

//unfocus textobject
WIDGET3D.Text.prototype.unfocus = function(){
  if(this.inFocus_ && this.mutable_){
    this.textHandle_ = this.text_;
  }
  WIDGET3D.Basic.prototype.unfocus.call(this);
  this.update();
};


//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR TEXT OBJECT
//--------------------------------------------------
WIDGET3D.Text.prototype.inheritance = function(){
  function guiTextPrototype(){}
  guiTextPrototype.prototype = this;
  var created = new guiTextPrototype();
  return created;
};

// ROLL CONTROLS
//
//Parameters: component: WIDGET3D.Basic typed object to which the controlls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the controll is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.RollControls = function(parameters){
  
  var that = this;
  
  this.component_ = parameters.component;
  this.mouseButton_ = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  this.shiftKey_ = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  this.clickLocation_;
  this.rotationOnMouseDownY_;
  this.rotationOnMousedownX_;
  this.modelRotationY_ = 0;
  this.modelRotationX_ = 0;
  this.rotate_ = false;

  this.mouseupHandler = function(event){
    if(that.rotate_){
      that.rotate_ = false;
      
      var mainWindow = WIDGET3D.getMainWindow();
      mainWindow.removeEventListener("mousemove", that.mousemoveHandler);
      mainWindow.removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  this.mousedownHandler = function(event){
    
    if(event.button === that.mouseButton_ && event.shiftKey === that.shiftKey_){
      that.component_.focus();
      if(!that.rotate_){
        that.rotate_ = true;
        
        that.clickLocation_ = WIDGET3D.mouseCoordinates(event);
        that.rotationOnMouseDownY_ = that.modelRotationY_;
        that.rotationOnMouseDownX_ = that.modelRotationX_;
        
        var mainWindow = WIDGET3D.getMainWindow();
        mainWindow.addEventListener("mousemove", that.mousemoveHandler);
        mainWindow.addEventListener("mouseup", that.mouseupHandler);
      }
    }
  };

  this.mousemoveHandler = function(event){

    if (that.rotate_){
    
      var mouse = WIDGET3D.mouseCoordinates(event);
      
      that.modelRotationY_ = that.rotationOnMouseDownY_ + ( mouse.x - that.clickLocation_.x );
      that.modelRotationX_ = that.rotationOnMouseDownX_ + ( mouse.y - that.clickLocation_.y );
      
      //that.update();
      
    }

  };
  
  this.component_.addEventListener("mousedown", this.mousedownHandler);
};

//Update must be called before the component is rendered to apply
//the change in components rotation
WIDGET3D.RollControls.prototype.update = function(){

  var rot = this.component_.getRotation();
  
  var newRotY = rot.y + ((this.modelRotationY_ - rot.y)*0.04);
  var newRotX = rot.x + ((this.modelRotationX_ - rot.x)*0.04);
  
  this.component_.setRotationY(newRotY);
  this.component_.setRotationX(newRotX);
};


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

// three.js plugin for widget3D -library
//

var THREEJS_WIDGET3D = {

  initialized : false,
  
  init : function(parameters){

    if(WIDGET3D != undefined && !THREEJS_WIDGET3D.initialized){
      var parameters = parameters || {};
      
      //seting the three.js renderer
      if(parameters.renderer){
        WIDGET3D.renderer = parameters.renderer;
      }
      else{
        //if there were no renderer given as a parameter, we create one
        var width = parameters.width !== undefined ? parameters.width : window.innerWidth;
        var height = parameters.height !== undefined ? parameters.height : window.innerHeight;
        
        var antialias = parameters.antialias !== undefined ? parameters.antialias : true;
        var domParent = parameters.domParent !== undefined ? parameters.domParent : document.body;
        
        WIDGET3D.renderer = new THREE.WebGLRenderer({antialias: antialias});
        WIDGET3D.renderer.setSize( width, height );
        
        var clearColor = parameters.clearColor !== undefined ? parameters.clearColor : 0x333333;
        var opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
        
        WIDGET3D.renderer.setClearColorHex( clearColor, opacity );
        
        domParent.appendChild(WIDGET3D.renderer.domElement);
      }
      
      //setting three.js camera
      var camera = parameters.camera !== undefined ? parameters.camera  : 
        new THREE.PerspectiveCamera(75, 
          WIDGET3D.renderer.domElement.width / WIDGET3D.renderer.domElement.height,
          1, 10000);
      
      WIDGET3D.scene = parameters.scene !== undefined ? parameters.scene : new THREE.Scene();
      
      var mainWindow = false;
      
      //initializing WIDGET3D
      if(!WIDGET3D.isInitialized()){
      
        mainWindow = WIDGET3D.init({collisionCallback: {callback: THREEJS_WIDGET3D.checkIfHits},
          container: THREE.Object3D,
          domElement: WIDGET3D.renderer.domElement});
        
        if(!mainWindow){
          console.log("Widget3D init failed!");
          return false;
        }
      }
      else{
        mainWindow = WIDGET3D.getMainWindow();
      }
      
      WIDGET3D.scene.add(mainWindow.container_);
      
      WIDGET3D.projector = new THREE.Projector();
      WIDGET3D.camera = new WIDGET3D.CameraGroup({camera : camera});
      
      mainWindow.addChild(WIDGET3D.camera);
      
      //---------------------------------------------
      //CREATING RENDERING METHOD
      WIDGET3D.render = function(){
        //updating all objects
        var objects = WIDGET3D.getAllObjects();
        
        for(var i in objects){
          if(objects.hasOwnProperty(i)){
            objects[i].update();
          }
        }
        
        WIDGET3D.renderer.render(WIDGET3D.scene, WIDGET3D.camera.camera_);
      };
      //---------------------------------------------
      
      THREEJS_WIDGET3D.initialized = true;
      
      return mainWindow;
    }
    else{
      console.log("nothing to init");
      return WIDGET3D.getMainWindow();
    }
  },
  
  checkIfHits : function(event){
  
    var mouse = WIDGET3D.mouseCoordinates(event);
    
    var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
    var ray = WIDGET3D.projector.pickingRay(vector, WIDGET3D.camera.camera_);
    
    //intersects checks now all the meshes in scene. It might be good to construct
    // a datastructure that contains meshes of mainWindow.childEvents_.event array content
    var intersects = ray.intersectObjects(WIDGET3D.getMainWindow().meshes_);
    
    var closest = false;
    
    if(intersects.length > 0){
      //finding closest
      //closest object is the first visible object in intersects
      for(var m = 0; m < intersects.length; ++m){
        
        if(intersects[m].object.visible){
          closest = intersects[m].object;
          var inv = new THREE.Matrix4();
          inv.getInverse(intersects[m].object.matrixWorld);
          
          //position where the click happened in object coordinates
          var objPos = intersects[m].point.clone().applyProjection(inv);
          var found = THREEJS_WIDGET3D.findObject(closest, event.type);
          
          if(found){
            //Info about object and world coordinates are atached to
            //the event object so that the data may be used in eventhandlers like
            //controls.
            event.objectCoordinates = objPos;
            event.worldCoordinates = intersects[m].point;
          }
          return found;
        }
      }
    }
    return false;
  },
  
  findObject : function(mesh, name){
  
    var mainWindow = WIDGET3D.getMainWindow();
    
    for(var i = 0; i < mainWindow.childEvents_[name.toString()].length; ++i){
      
      // if the object is not visible it can be the object hit
      // because it's not in the scene.
      if(mainWindow.childEvents_[name.toString()][i].isVisible_){
        
        // If the object is the one we hit, we return the object
        if(mesh === mainWindow.childEvents_[name.toString()][i].mesh_){
          
          return mainWindow.childEvents_[name.toString()][i];
          
        }//if right object
        
      }//if visible
    }//for child events loop
    return false;
  }
};

WIDGET3D.createMainWindow_THREE = THREEJS_WIDGET3D.init;

//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// GRID LAYOUTED WINDOW
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              color = hexadecimal
//
WIDGET3D.GridWindow = function(parameters){
  
  var that = this;
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.density_ = parameters.density !== undefined ? parameters.density : 6;
  
  this.maxChildren_ = this.density_ * this.density_;
  
  this.color_ = parameters.color !== undefined ? parameters.color : 0x6B6B6B;
  this.lineWidth_ = parameters.lineWidth !== undefined ? parameters.lineWidth : 2;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.5;
  
  this.material_ = new THREE.MeshBasicMaterial({
    color: this.color_,
    opacity: this.opacity_,
    wireframe: true,
    side : THREE.DoubleSide,
    wireframeLinewidth : this.lineWidth_
  });
  
  var geometry = new THREE.PlaneGeometry( this.width_, this.height_, this.density_, this.density_ );
  
  var mesh =  new THREE.Mesh(geometry, this.material_);
  
  this.setMesh(mesh);
  
  //default mouse controls in use
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls_){
    
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    
    this.controls_ = new WIDGET3D.RollControls({component : this, mouseButton : button, shiftKey : shift});
  }
  
};

WIDGET3D.GridWindow.prototype = WIDGET3D.Window.prototype.inheritance();

WIDGET3D.GridWindow.prototype.update = function(){
  if(this.defaultControls_){
    this.controls_.update();
  }
  WIDGET3D.GuiObject.prototype.update(this);
}


WIDGET3D.GridWindow.prototype.addSlots = function(newDensity){
  this.density_ = newDensity;
  this.maxChildren_ = newDensity * newDensity;
  
  var grid = new THREE.PlaneGeometry( this.width_, this.height_, this.density_, this.density_ );
  
  var gridMesh =  new THREE.Mesh(grid, this.material_);
  
  this.setMesh(gridMesh);
  
  var tmpChilds = this.children_;
  this.children_ = [];
  
  for(var i = 0; i < tmpChilds.length; ++i){
  
    var icon = tmpChilds[i];
    this.children_.push(icon);
    
    icon.width_ = this.width_/(this.density_ + 3.3);
    icon.height_ = this.height_/(this.density_ + 3.3);
    
    var geometry = new THREE.CubeGeometry(icon.width_, icon.height_, icon.depth_);
    
    var mesh = new THREE.Mesh( geometry, icon.material_);
    icon.setMesh(mesh);
    icon.setToPlace();
  }
  
}


//---------------------------------------------------
// ICONS FOR GRIDWINDOW
//---------------------------------------------------
WIDGET3D.GridIcon = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  var parent = parameters.parent;
  if(parent == undefined){
    console.log("GridIcon needs to have grid window as parent!");
    console.log("Parent has to be given in parameters.");
    return false;
  }
  
  if(parent.children_.length >= parent.maxChildren_){
    console.log("Grid is full! Creating bigger one");
    parent.addSlots(Math.ceil(parent.density_ * 1.5));
  }
  
  this.color_ = parameters.color !== undefined ? parameters.color : 0xFFFFFF;
  this.url_ = parameters.url !== undefined ? parameters.url : false;
  this.img_ = parameters.img !== undefined ? parameters.img : false;
  
  //object can store metadata in a format that user like
  this.metadata_ = parameters.metadata !== undefined ? parameters.metadata : false;
  
  this.width_ = parent.width_/(parent.density_ + 3.3);
  this.height_ = parent.height_/(parent.density_ + 3.3);
  
  this.depth_ = parameters.depth !== undefined ? parameters.depth : (this.height_/4);
  
  var geometry = new THREE.CubeGeometry(this.width_, this.height_, this.depth_);
  
  this.texture_ = false;
  
  if(this.img_){
    this.texture_ = new THREE.Texture(this.img_);
    this.texture_.needsUpdate = true;
  }
  else if(this.url_){
    this.texture_ = THREE.ImageUtils.loadTexture(this.url_);
  }

  this.material_ = new THREE.MeshBasicMaterial({map : this.texture_, color: this.color_});
  
  var mesh = new THREE.Mesh( geometry, this.material_);
  
  this.setMesh(mesh);
  parent.addChild(this);
  
  this.setToPlace();
  
};

WIDGET3D.GridIcon.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.GridIcon.prototype.setToPlace = function(){

  var parentLoc = this.parent_.getPosition();
  
  var parentLeft = -this.parent_.width_/2.0 + parentLoc.x/this.parent_.width_;
  var parentTop =  this.parent_.height_/2.0 + parentLoc.y/this.parent_.height_;
  
  var stepX = this.parent_.width_/this.parent_.density_;
  var stepY = this.parent_.height_/this.parent_.density_;
  
  var slotCenterX = stepX/2;
  var slotCenterY = stepY/2;
  
  if(this.parent_.children_.length-1 > 0){
  
    var lastIcon = this.parent_.children_[this.parent_.children_.length-2];
    var lastIconLoc = lastIcon.getPosition();
    
    if(((this.parent_.children_.length-1) % this.parent_.density_) == 0)
    {  
      var x = parentLeft + slotCenterX;
      var y = lastIconLoc.y - stepY;
    }
    else{
      var x = lastIconLoc.x + stepX;
      var y = lastIconLoc.y;
    
    }
  }
  else{
    
    var x = parentLeft + slotCenterX;
    var y = parentTop - slotCenterY;
    
  }
  this.setPosition(x, y, parentLoc.z/this.parent_.height_);
};

//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// TITLED WINDOW
//---------------------------------------------------
//
// PARAMETERS:  title :           title string
//              width :           widht in world coordinate space
//              height:           height in world coordinate space
//              defaultControls : boolean that tells if the default mouse controls are used
//              *color:           hexadecimal color for window
//              *texture :        three.js texture object
//              *material :       three.js material object
//              * if material is given texture and color doens't apply
//
//              All parameters are optional
//
WIDGET3D.TitledWindow = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var that = this;
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 2000;
  this.height_ = parameters.height !== undefined ? parameters.height : 2000;
  
  var title = parameters.title !== undefined ? parameters.title : "title";
  
  var color = parameters.color !== undefined ? parameters.color : 0x808080;
  var texture = parameters.texture;
  var material = parameters.material !== undefined ? parameters.material :  new THREE.MeshBasicMaterial({color : color, map : texture, side : THREE.DoubleSide});
  
  
  //---------------------------------------------------
  //TITLEBAR, ACTS AS THE BODY FOR THE WINDOW
  //---------------------------------------------------
  this.title_ = {};
  var mainMesh = this.createTitle(title, material.side);
  this.setMesh(mainMesh);
  
  //---------------------------------------------------
  //CONTENT
  //---------------------------------------------------
  this.content_ =  new WIDGET3D.Basic();
  var mesh =  new THREE.Mesh( new THREE.PlaneGeometry( this.width_, this.height_ ), material);
  this.content_.setMesh(mesh);
  this.addChild(this.content_);
  
  
  //---------------------------------------------------
  //CLOSE BUTTON
  //---------------------------------------------------
  this.closeButton_ = new WIDGET3D.Basic();
  
  var buttonMesh = new THREE.Mesh( new THREE.PlaneGeometry( this.width_/10.0, this.height_/10.0 ),
    new THREE.MeshBasicMaterial( { color: 0xAA0000, side : this.mesh_.material.side} ) );
  
  this.closeButton_.setMesh(buttonMesh);
  this.closeButton_.setPosition(((this.width_/2.0)-(this.width_/20.0)), ((this.height_/2.0)+(this.height_/20.0)), 0);
  
  this.addChild(this.closeButton_);
  
  //---------------------------------------------------
  //CONTROLS
  //---------------------------------------------------
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls_){
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    var attached = parameters.attached !== undefined ? parameters.attached : false;
    var debug = parameters.debug !== undefined ? parameters.debug : false;
    
    this.controls_ = new WIDGET3D.DragControls({
      debug: debug,
      component : this,
      mouseButton : button,
      shiftKey : shift,
      width : (this.width_*2),
      height : ((this.height_+this.title_.height_)*2)
    });
    
    this.start_ = false;
  }
};

WIDGET3D.TitledWindow.prototype = WIDGET3D.Window.prototype.inheritance();

//sets titlebar text
WIDGET3D.TitledWindow.prototype.createTitle = function(title, side){

  this.textureCanvas_ = document.createElement('canvas');
  this.textureCanvas_.width = 512;
  this.textureCanvas_.height = 128;
  this.textureCanvas_.style.display = "none";
  
  document.body.appendChild(this.textureCanvas_);
  
  this.setTitle(title);
  
  var texture = new THREE.Texture(this.textureCanvas_);
  texture.needsUpdate = true;
  
  var material = new THREE.MeshBasicMaterial({ map: texture, side : side });
  
  this.title_.width_ = this.width_ - this.width_/10.0;
  this.title_.height_ = this.height_/10.0;
  
  var titleMesh = new THREE.Mesh( new THREE.PlaneGeometry(this.title_.width_, this.title_.height_), material);
  titleMesh.position.y = ((this.height_/2.0)+(this.height_/20.0));
  titleMesh.position.x =(((this.width_ - this.width_/10.0)/2.0) - (this.width_/2.0));
  
  return titleMesh;
};

WIDGET3D.TitledWindow.prototype.setTitle = function(title){

  var titleContext = this.textureCanvas_.getContext('2d');

  titleContext.fillStyle = "#B3B3B3";
  titleContext.fillRect(0, 0, this.textureCanvas_.width, this.textureCanvas_.height);
  
  titleContext.fillStyle = "#000000";
  titleContext.font = "bold 60px Courier New";
  titleContext.align = "center";
  titleContext.textBaseline = "middle";
  titleContext.fillText(title, 10, this.textureCanvas_.height/2);
};

WIDGET3D.TitledWindow.prototype.updateTitle = function(title){

  this.setTitle(title);
  this.mesh_.material.map.needsUpdate = true;
}


WIDGET3D.TitledWindow.prototype.remove = function(){
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from DOM
  var canvas = this.textureCanvas_;
  document.body.removeChild(canvas);
  
  if(this.defaultControls_){
    this.controls_.remove();
  }
  
  WIDGET3D.Window.prototype.remove.call( this );
};

WIDGET3D.TitledWindow.prototype.getContent = function(){
  return this.content_;
};
//---------------------------------------------------
//
// 3D DIALOG
//
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              color = hexadecimal string
//              text = string
//              buttonText = string
//              maxTextLength = integer
//
WIDGET3D.Dialog = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.text_ = parameters.text !== undefined ? parameters.text : "This is a dialog";
  this.buttonText_ = parameters.buttonText !== undefined ? parameters.buttonText : "submit";
  this.maxTextLength_ = parameters.maxTextLength !== undefined ? parameters.maxTextLength : undefined;
  
  this.canvas_ = document.createElement('canvas');
  this.canvas_.width = 512;
  this.canvas_.height = 512;
  this.canvas_.style.display = "none";
  document.body.appendChild(this.canvas_);
  this.context_ = this.canvas_.getContext('2d');
  
  this.material_ = this.createDialogText(this.text_);
  
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width_, this.height_), this.material_);
  
  this.setMesh(mesh);
  
  //CREATING DIALOG BUTTON
  this.button_ = new WIDGET3D.Basic();
  
  this.buttonCanvas_ = document.createElement('canvas');
  this.buttonCanvas_.width = 512;
  this.buttonCanvas_.height = 128;
  this.buttonCanvas_.style.display = "none";
  document.body.appendChild(this.buttonCanvas_);
  this.buttonContext_ = this.buttonCanvas_.getContext('2d');
  
  this.createButtonText(this.buttonText_);
  
  this.addChild(this.button_);
  
  //CREATING TEXTBOX
  
  this.textBox_ = new WIDGET3D.Text({maxLength : this.maxTextLength_});
  
  this.textCanvas_ = document.createElement('canvas');
  this.textCanvas_.width = 512;
  this.textCanvas_.height = 128;
  this.textCanvas_.style.display = "none";
  document.body.appendChild(this.textCanvas_);
  this.textContext_ = this.textCanvas_.getContext('2d');
  
  
  this.createTextBox();
  this.textBox_.addUpdateCallback(this.updateTextBox, this);
  
  this.addChild(this.textBox_);
  this.textBox_.setText("");
  
  this.textBox_.addEventListener("click", this.textBoxOnclick, this);
  this.textBox_.addEventListener("keypress", this.textBoxOnkeypress, this);
  this.textBox_.addEventListener("keydown", this.textBoxOnkeypress, this);
};

WIDGET3D.Dialog.prototype = WIDGET3D.Window.prototype.inheritance();

WIDGET3D.Dialog.prototype.update = function(){
  this.textBox_.update();
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
}

WIDGET3D.Dialog.prototype.createDialogText = function(string){

  this.context_.fillStyle = "#FFFFFF";
  this.context_.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
  
  this.context_.fillStyle = "#000055";
  this.context_.font = "bold 30px Courier New";
  this.context_.align = "center";
  this.context_.textBaseline = "middle";
  
  var textWidth = this.context_.measureText(string).width;
  this.context_.fillText(string, this.canvas_.width/2-(textWidth/2), 40);
  var texture = new THREE.Texture(this.canvas_);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, color: this.color_, opacity: this.opacity_});
  
  texture.needsUpdate = true;
  
  return material;
  
}

WIDGET3D.Dialog.prototype.createButtonText = function(string){

  this.buttonContext_.fillStyle = "#B3B3B3";
  this.buttonContext_.fillRect(0, 0, this.buttonCanvas_.width, this.buttonCanvas_.height);
  
  this.buttonContext_.fillStyle = "#000000";
  this.buttonContext_.font = "bold 60px Courier New";
  this.buttonContext_.align = "center";
  this.buttonContext_.textBaseline = "middle";
  
  var textWidth = this.buttonContext_.measureText(string).width;
  this.buttonContext_.fillText(string, this.buttonCanvas_.width/2-(textWidth/2), this.buttonCanvas_.height/2);
  var texture = new THREE.Texture(this.buttonCanvas_);
  
  var material = new THREE.MeshBasicMaterial({ map: texture });
  
  var mesh = new THREE.Mesh( new THREE.CubeGeometry(this.width_/2.0, this.height_/10.0, 20), material);
  
  this.button_.setMesh(mesh);
  
  var parentLoc = this.getPosition();
  
  var y = parentLoc.y - (this.height_/5.0);
  
  this.button_.setPosition(parentLoc.x, y ,parentLoc.z);
  
  texture.needsUpdate = true;
};

WIDGET3D.Dialog.prototype.createTextBox = function(){
  
  var texture = new THREE.Texture(this.textCanvas_);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh( new THREE.PlaneGeometry(this.width_/1.5, this.height_/10.0), material);
  
  this.textBox_.setMesh(mesh);
  
  var parentLoc = this.getPosition();
  
  var y = parentLoc.y + this.height_/10;
  
  this.textBox_.setPosition(parentLoc.x, y ,parentLoc.z+10);
  
  this.updateTextBox(this);
}

WIDGET3D.Dialog.prototype.updateTextBox = function(window){

  window.textContext_.fillStyle = "#FFFFFF";
  window.textContext_.fillRect(0, 0, window.textCanvas_.width, window.textCanvas_.height);
  
  window.textContext_.fillStyle = "#000000";
  window.textContext_.font = "bold 50px Courier New";
  window.textContext_.align = "center";
  window.textContext_.textBaseline = "middle";
  
  window.textContext_.fillText(window.textBox_.textHandle_, 5, window.textCanvas_.height/2);
  
  window.textBox_.mesh_.material.map.needsUpdate = true;
  
};

WIDGET3D.Dialog.prototype.textBoxOnclick = function(event, window){
  window.textBox_.focus();
};

WIDGET3D.Dialog.prototype.textBoxOnkeypress = function(event, window){
  
  if(event.charCode != 0){
    //if event is a character key press
    var letter = String.fromCharCode(event.charCode);
    window.textBox_.addLetter(letter);
  }
  else if(event.type == "keydown" && (event.keyCode == 8 || event.keyCode == 46)){
    //if event is a backspace or delete key press
    window.textBox_.erase(1);
  }

};

WIDGET3D.Dialog.prototype.remove = function(){
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from dom
  var canvas1 = this.textCanvas_;
  var canvas2 = this.buttonCanvas_;
  document.body.removeChild(canvas1);
  document.body.removeChild(canvas2);
  
  WIDGET3D.Window.prototype.remove.call( this );
}

//---------------------------------------------------
//
// 3D SELECT DIALOG
//
//---------------------------------------------------
//
// PARAMETERS:  width : width in world coordinates
//              height : height in world coordinates
//              color : hexadecimal string
//              text : string, title text
//              choices = array of choises 
//                {string: choice name displayed, 
//                 onclick : {handler : function, parameters : object}}
//
WIDGET3D.SelectDialog = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.depth_ = parameters.depth !== undefined ? parameters.depth : 10;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.choices_ = parameters.choices !== undefined ? parameters.choices : [];
  this.hasCancel_ = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  this.text_ = parameters.text !== undefined ? parameters.text : false;
  
  if(this.hasCancel_){
    this.cancelText_ = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";
    this.choices_.push({string: this.cancelText_, onclick : {handler : function(event, that){that.remove()}, parameters : this}});
  }
  
  if(this.text_){
    this.createText();
  }
  else{
    this.choiceHeight_ = this.height_/((this.choices_.length)*1.2);
  }
  
  //CREATING CHOICEBUTTONS
  this.choiceCanvases_ = [];
  this.createChoises();

};

WIDGET3D.SelectDialog.prototype = WIDGET3D.Window.prototype.inheritance();

WIDGET3D.SelectDialog.prototype.createText = function(){
  this.textCanvas_ = document.createElement('canvas');
  this.textCanvas_.width = 512;
  this.textCanvas_.height = 128;
  this.textCanvas_.style.display = "none";
  document.body.appendChild(this.textCanvas_);
  var context = this.textCanvas_.getContext('2d');
  
  var material = this.createTitleMaterial(this.text_, context, this.textCanvas_);
  
  this.choiceHeight_ = this.height_/((this.choices_.length+1)*1.2);
  
  var mesh = new THREE.Mesh(new THREE.CubeGeometry(this.width_, this.choiceHeight_, this.depth_), material);

  mesh.position.y = this.height_*0.5 - this.choiceHeight_*0.5;
  
  this.setMesh(mesh);
}

WIDGET3D.SelectDialog.prototype.createChoises = function(){

  var lastY = 0;
  
  for(var i = 0; i < this.choices_.length; ++i){
    var choice = new WIDGET3D.Basic();
    var choiceCanvas = document.createElement('canvas');
    this.choiceCanvases_.push(choiceCanvas);
    choiceCanvas.width = 512;
    choiceCanvas.height = 128;
    choiceCanvas.style.display = "none";
    document.body.appendChild(choiceCanvas);
    var choiceContext = choiceCanvas.getContext('2d');
    
    var material = this.createButtonMaterial(this.choices_[i].string, choiceContext, choiceCanvas);
    var width = this.width_/1.2;
    var height = this.choiceHeight_;
    var mesh = new THREE.Mesh( new THREE.CubeGeometry(width, height, this.depth_), material);
    
    choice.setMesh(mesh);
    
    var parentLoc = this.getPosition();
    var y = 0;
    if(i == 0){
      if(this.text_){
        y = this.height_*0.5 - height*1.7;
      }
      else{
        y = this.height_*0.5 - height*0.5;
      }
    }
    else{
      y = lastY - 1.2*height;
    }
    lastY = y;
    
    choice.setPosition(parentLoc.x, y ,parentLoc.z);
    
    choice.addEventListener("click", this.choices_[i].onclick.handler, this.choices_[i].onclick.parameters);
    choice.menuID_ = i;
    this.addChild(choice);
  }
};

WIDGET3D.SelectDialog.prototype.createButtonMaterial = function(string, context, canvas){

  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 40px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  var textWidth = context.measureText(string).width;
  context.fillText(string, canvas.width/2-(textWidth/2), canvas.height/2);
  
  var texture = new THREE.Texture(canvas);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, color: this.color_, opacity : this.opacity_});
  texture.needsUpdate = true;
  
  return material;
}

WIDGET3D.SelectDialog.prototype.createTitleMaterial = function(string, context, canvas){

  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 45px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  var textWidth = context.measureText(string).width;
  context.fillText(string, canvas.width/2-(textWidth/2), canvas.height/2);
  
  var texture = new THREE.Texture(canvas);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, color: this.color_, opacity : this.opacity_});
  texture.needsUpdate = true;
  
  return material;
}

WIDGET3D.SelectDialog.prototype.changeChoiceText = function(text, index){
  var object = false;
  for(var i = 0; i < this.children_.length; ++i){
    if(this.children_[i].menuID_ == index){
      object = this.children_[i];
      break;
    }
  }
  if(object){
    var canvas = object.mesh_.material.map.image;
    var context = object.mesh_.material.map.image.getContext('2d');
    var material = this.createButtonMaterial(text, context, canvas);
    object.mesh_.material = material;
    object.mesh_.needsUpdate = true;
    return true;
  }
  return false;
}


WIDGET3D.SelectDialog.prototype.remove = function(){

  //hiding the window from scene
  this.hide();
  
  //removing child canvases from DOM
  for(var i = 0; i < this.choiceCanvases_.length; ++i){
    canvas = this.choiceCanvases_[i];
    document.body.removeChild(canvas);
  }
  this.choiceCanvases_ = null;
  
  //deleting the background canvas
  var canvas = this.textCanvas_;
  document.body.removeChild(canvas);
  
  WIDGET3D.Window.prototype.remove.call( this );

}

//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// CAMERA GROUP
//
// components that needs to follow camera are added to
// this group and the coordinates given to added component
// are offset from the camera
//---------------------------------------------------
//
// PARAMETERS:  camera : three.js camera object
//
WIDGET3D.CameraGroup = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.camera_ = parameters.camera;
  
  this.camera_.position.set(0,0,0);
  this.container_.add(this.camera_);
};

WIDGET3D.CameraGroup.prototype = WIDGET3D.Window.prototype.inheritance();// DRAG CONTROLS for WIDGET3D three.js version
//
//Parameters: component: WIDGET3D.Basic typed object to which the controlls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the controll is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.DragControls = function(parameters){
  
  var that = this;
  
  //To get the right orientation we need to have orientation of a cameras parent and camera and add these together
  that.setPlaneRotation = function(){
    
    var camRot = that.camera_.rotation.clone();
    var parent = that.camera_.parent;
    
    
    while(parent != undefined && parent != that.component_.parent){
    
      camRot.add(parent.rotation.clone());
      parent = parent.parent;
    }
    
    that.plane_.rotation.copy(camRot);
    
  }; 
  
  that.component_ = parameters.component;
  that.mouseButton_ = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  that.shiftKey_ = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  that.camera_ = WIDGET3D.camera.camera_;
  
  var width = parameters.width !== undefined ? parameters.width : 2000;
  var height = parameters.height !== undefined ? parameters.height : 2000;
  
  var debug = parameters.debug !== undefined ? parameters.debug : false;
  
  that.drag_ = false;
  that.offset_ = new THREE.Vector3();
  
  //invisible plane that is used as a "draging area".
  //the planes orientation is the same as the cameras orientation.
  that.plane_ = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 8, 8 ), 
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true, side : THREE.DoubleSide } ) );
  
  that.plane_.visible = debug;
  
  that.setPlaneRotation();
  
  WIDGET3D.scene.add( that.plane_ );
  
  that.mouseupHandler = function(event){
    if(that.drag_){
      that.drag_ = false;
      
      //var pos = that.component_.getPosition();
      that.plane_.position.copy(that.component_.parent_.container_.localToWorld(that.component_.getPosition().clone()));

      WIDGET3D.getMainWindow().removeEventListener("mousemove", that.mousemoveHandler);
      WIDGET3D.getMainWindow().removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  that.mousedownHandler = function(event){
    if(event.button === that.mouseButton_ && event.shiftKey === that.shiftKey_){
      that.start_ = true;
      if(!that.drag_){
        
        that.setPlaneRotation();
        //var pos = that.component_.getPosition();
        that.plane_.position.copy(that.component_.parent_.container_.localToWorld(that.component_.getPosition().clone()));
        //FORCE TO UPDATE MATRIXES OTHERWISE WE MAY GET INCORRECT VALUES FROM INTERSECTION
        that.plane_.updateMatrixWorld(true);
        
        var mouse = WIDGET3D.mouseCoordinates(event);
        var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
        var ray = WIDGET3D.projector.pickingRay(vector, that.camera_);
        
        var intersects = ray.intersectObject( that.plane_ );
        if(intersects.length > 0){
          that.offset_.copy( intersects[ 0 ].point ).sub( that.plane_.position );
        }
        
        
        WIDGET3D.getMainWindow().addEventListener("mousemove", that.mousemoveHandler);
        WIDGET3D.getMainWindow().addEventListener("mouseup", that.mouseupHandler);
        
        that.component_.focus();
        that.drag_ = true;
      }
    }
  };

  that.mousemoveHandler = function(event){
    if(that.drag_){

      var mouse = WIDGET3D.mouseCoordinates(event);
      var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
      var ray = WIDGET3D.projector.pickingRay(vector, that.camera_);
      
      var intersects = ray.intersectObject( that.plane_ );
      if(intersects.length > 0){
      
        var pos = intersects[ 0 ].point.sub( that.offset_);
        that.plane_.position.copy(pos);
        var vec = that.component_.parent_.container_.worldToLocal(pos);
        that.component_.setPosition(vec.x, vec.y, vec.z);
        
      }
    }
  };
  
  that.component_.addEventListener("mousedown", that.mousedownHandler);
  
  
  that.remove = function(){
  
    WIDGET3D.scene.remove( that.plane_ );
    
    that.plane_.geometry.dispose();
    that.plane_.material.dispose();
    that.plane_ = undefined;
  };
  
};






