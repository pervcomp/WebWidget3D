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

var WIDGET3D = WIDGET3D || {};

  
WIDGET3D.ElementType = {"MAIN_WINDOW":0, "WINDOW":1, "BASIC":2, "TEXT":3, "UNDEFINED":666 };

//Container is a object that contains constructor method of container (eg. in three.js Object3D)

// Container is used in windows to manage it's childs. Container has to provide
// add and remove methods for meshes and other containers it allso needs to provide
// mutable position.x, position.y position.z and rotation.x, rotation.y, rotation.z values.
// position value changes has to be inherited to containers children.
// This interface is mandatory!!!

WIDGET3D.Container;
WIDGET3D.focused = [];
WIDGET3D.initialized = false;
WIDGET3D.mainWindow;
WIDGET3D.events;


//WIDGET3D.Plug;

//Initializes gui
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
WIDGET3D.init = function(parameters){
  var that = this;
  
  var parameters = parameters || {};
  

  if(parameters.container != undefined){
    WIDGET3D.Container = parameters.container;
  }
  else{
    console.log("Container must be specified!");
    console.log("Container has to be constructor method of container of used 3D-engine (eg. in three.js THREE.Object3D");
  }
  
  WIDGET3D.mainWindow = new WIDGET3D.MainWindow();
  
  if(parameters.collisionCallback != undefined && 
    parameters.collisionCallback.callback != undefined){
    
    WIDGET3D.events = new WIDGET3D.DomEvents(parameters.collisionCallback, parameters.domElement);
  }
  else{
    console.log("CollisionCallback has to be JSON object containing attributes callback (and args, optional)");
    console.log("Initializing WIDGET3D failed!");
    return false;
  }
  WIDGET3D.initialized = true;
  return WIDGET3D.mainWindow;
};


WIDGET3D.isInitialized = function(){
  return WIDGET3D.initialized;
};

WIDGET3D.getEvents = function(){
  return WIDGET3D.events;
};

WIDGET3D.getMainWindow = function(){
  return WIDGET3D.mainWindow;
};

WIDGET3D.unfocusFocused = function(){

  for(var i = 0; i < WIDGET3D.focused.length; ++i){
    WIDGET3D.focused[i].unfocus();
  }
  
  WIDGET3D.focused = [];
};

//------------------------------------------------------------
// USEFUL HELPPER FUNCTIONS FOR MOUSE COORDINATE CALCULATIONS
//------------------------------------------------------------

//returns the real width of the canvas element
WIDGET3D.getRealWidth = function(){
  return parseInt(window.getComputedStyle(WIDGET3D.events.domElement_,null).getPropertyValue("width"));
};

WIDGET3D.getRealHeight = function(){
  return parseInt(window.getComputedStyle(WIDGET3D.events.domElement_,null).getPropertyValue("height"));
};

WIDGET3D.getCanvasWidth = function(){
  return WIDGET3D.events.domElement_.width;
};

WIDGET3D.getCanvasHeight = function(){
  return WIDGET3D.events.domElement_.height;
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
  //var CSSheight = parseInt(window.getComputedStyle(WIDGET3D.events.domElement_,null).getPropertyValue("height"));
  //var CSSwidth = parseInt(window.getComputedStyle(WIDGET3D.events.domElement_,null).getPropertyValue("width"));
  
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
}
  
//---------------------------------------------
// GUI OBJECT : generic abstract object
//---------------------------------------------

//There are ElementType amount of different kind of bjects
//with different properties that are inherited from thisObject.
//So thisObject describes all properties and methods that are
//for all types of objects
WIDGET3D.GuiObject = function(){
  this.isVisible_ = true;
  this.inFocus_ = false;
  
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
    
    //TODO: FIX
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
    
    //TODO: FIX
    removeAll : function(name){
    
      if(this.hasOwnProperty(name.toString()) &&
      Object.prototype.toString.apply(this[name.toString()]) === '[object Array]')
      {
        var index = this[name.toString()][0].index;
        this[name.toString()] = false;
        return index;
      }
      
      return false;
    }
  };
  
};

//set focus on object
WIDGET3D.GuiObject.prototype.focus = function(){
  if(!this.inFocus_){
  
    WIDGET3D.unfocusFocused();
    this.inFocus_ = true;
    WIDGET3D.focused.push(this);
    
  }
};

//unfocus object
WIDGET3D.GuiObject.prototype.unfocus = function(){
  if(this.inFocus_){
    this.inFocus_ = false; 
  }
};

// Adds one of supported event listnerss to object
// Parameters: event = WIDGET3D.EventType object that defines event type
// callback: callback function that is called when the event is triggered to object
// (args: arguments for callback)
//
// NOTE: domEvent IS ALLWAYS PASSED TO CALLBACKFUNCTION AS ITS FIRST ARGUMENT
// so don't include it to args!
//
WIDGET3D.GuiObject.prototype.addEventListener = function(name, callback, args){
  if(!WIDGET3D.events.enabled_[name.toString()]){
    WIDGET3D.events.enableEvent(name);
  }
  if(!this.events_.checkEvent(name)){    
    var index = WIDGET3D.mainWindow.childEvents_.addObject(name, this);
  }
  else{
    var index = this.events_[name.toString()][0].index;
  }
  this.events_.addCallback(name, callback, args, index);
};

//TODO: FIX
// Removes eventlistener from object
// Parameters: event = WIDGET3D.EventType object
//             callback = binded callbackfunction
//             args = binded arguments for callback
WIDGET3D.GuiObject.prototype.removeEventListener = function(name, callback, args){  
  var index = this.events_.removeCallback(name, callback, args);
  
  if(index === false){
    return false;
  }
  if(this.events_[name.toString()] === false){
    WIDGET3D.mainWindow.childEvents_[name.toString()].splice(index, 1);
    
    //if there were no events left lets disable event
    if(WIDGET3D.mainWindow.childEvents_[name.toString()].length == 0){
      WIDGET3D.mainWindow.childEvents_.removeEvent(name);
    }
    
    for(var i = 0; i < WIDGET3D.mainWindow.childEvents_[name.toString()].length; ++i){
      WIDGET3D.mainWindow.childEvents_[name.toString()][i].setNewEventIndex(name, i);
    }
    return true;
  }
};


//TODO: FIX
// Removes eventlisteners from object
// Parameters: event = WIDGET3D.EventType object
WIDGET3D.GuiObject.prototype.removeEventListeners = function(name){  
  var index = this.events_.removeAll(name);
  if(index === false){
    return false;
  }
  else{
    WIDGET3D.mainWindow.childEvents_[name.toString()].splice(index, 1);
    
    //if there were no events left lets disable event
    if(WIDGET3D.mainWindow.childEvents_[name.toString()].length == 0){   
      WIDGET3D.mainWindow.childEvents_.removeEvent(name);
    }
    for(var i = 0; i < WIDGET3D.mainWindow.childEvents_[name.toString()].length; ++i){
      WIDGET3D.mainWindow.childEvents_[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

//TODO: FIX
WIDGET3D.GuiObject.prototype.setNewEventIndex = function(name, index){
  
  for(var i = 0; i < this.events_[name.toString()].length; ++i){
    this.events_[name.toString()][i].index = index;
  }
  WIDGET3D.mainWindow.childEvents_[name.toString()][index] = this;
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

//meshes is array of meshes that are part of object
WIDGET3D.Basic.prototype.setMesh = function(mesh){

  if(this.mesh_ && this.parent_){
    //removes the old mesh from the scene
    if(this.isVisible_){
      this.parent_.container_.remove(this.mesh_);
    }
    
    WIDGET3D.mainWindow.removeMesh(this.mesh_);
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
  
  WIDGET3D.mainWindow.meshes_.push(this.mesh_);
};

// shows object
// sets object's isVisible -flag to true
// adds the object to the scene so that it is
// rendered next time
WIDGET3D.Basic.prototype.show = function(){
  if(!this.isVisible_){
    this.isVisible_ = true;
    this.mesh_.visible = true;
    
    this.parent_.container_.add(this.mesh_);
  }
};

// hides an object
// sets object's isVisible -flag to false
// removes the object from the scene so that it won't
// be rendered next time
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

//getters and setters for location and rotation

WIDGET3D.Basic.prototype.getLocation = function(){
  return {x: this.mesh_.position.x,
    y: this.mesh_.position.y,
    z: this.mesh_.position.z};
};

WIDGET3D.Basic.prototype.setLocation = function(x, y, z){
  this.mesh_.position.x = x;
  this.mesh_.position.y = y;
  this.mesh_.position.z = z;
};

WIDGET3D.Basic.prototype.setX = function(x){
  this.mesh_.position.x = x;
};

WIDGET3D.Basic.prototype.setY = function(y){
  this.mesh_.position.y = y;
};

WIDGET3D.Basic.prototype.setZ = function(z){
  this.mesh_.position.z = z;
};

WIDGET3D.Basic.prototype.getRot = function(){
  return {x: this.mesh_.rotation.x,
    y: this.mesh_.rotation.y,
    z: this.mesh_.rotation.z};
};

WIDGET3D.Basic.prototype.setRot = function(rotX, rotY, rotZ){
  this.mesh_.rotation.x = rotX;
  this.mesh_.rotation.y = rotY;
  this.mesh_.rotation.z = rotZ;
};

WIDGET3D.Basic.prototype.setRotX = function(rotX){
  this.mesh_.rotation.x = rotX;
};

WIDGET3D.Basic.prototype.setRotY = function(rotY){
  this.mesh_.rotation.y = rotY;
};

WIDGET3D.Basic.prototype.setRotZ = function(rotZ){
  this.mesh_.rotation.z = rotZ;
};

//deletes object and removes it from it's parents object list
WIDGET3D.Basic.prototype.remove = function(){
  this.hide();
  
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListeners(i);
    }
  }
  
  //removing mesh
  var mesh = WIDGET3D.mainWindow.removeMesh(this.mesh_);
  
  //TESTING THAT THE REMOVED MESH WAS RIGHT
  if(mesh != this.mesh_){
    console.log("removed mesh was wrong! ");
    console.log(mesh);
    console.log(this.mesh_);
  }
  
  //removing object
  var obj = this.parent_.removeFromObjects(this);
  
  //TESTING THAT THE REMOVED OBJECT WAS RIGHT
  if(obj != this){
    console.log("removed object was wrong! ");
    console.log(obj);
    console.log(this);
  }
};

//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR BASIC OBJECT
//--------------------------------------------------
WIDGET3D.Basic.prototype.inheritance = function(){
  function guiBasicPrototype(){}
  guiBasicPrototype.prototype = this;
  var created = new guiBasicPrototype();
  return created;
};


//---------------------------------------------
// INTERFACE OBJECT FOR WINDOW AND MAIN WINDOW
//---------------------------------------------
//
// Object that has the functionality that should be
// inherited to all kind of windows but not to any other objects.
//

WIDGET3D.WindowInterface = function(){
  this.children_ = [];
  this.container_ = new WIDGET3D.Container();
  
};

// adds new child to window
WIDGET3D.WindowInterface.prototype.addChild = function(object){
  
  object.setParent(this);
  
  return object;
};

// hides unfocused objects in window
WIDGET3D.WindowInterface.prototype.hideNotFocused = function(){
  for(var i = 0; i < this.children_.length; ++i){
    if(!this.children_[i].inFocus_){
      this.children_[i].hide();
    }
  }
};

//removes object in place 'index' from object list
WIDGET3D.WindowInterface.prototype.removeFromObjects = function(object){
  
  for(var k = 0; k < this.children_.length; ++k){
    if(this.children_[k] === object){
      var removedObj = this.children_.splice(k, 1);
    }
  }
  
  return removedObj[0];
};


//------------------------------------------------
// MAIN WINDOW: Singleton root window
//
// The Main Window is inited by widget3d by default.
//
// Extends WIDGET3D.GuiObject object.
//---------------------------------------------------

WIDGET3D.MainWindow = function(){
  
  WIDGET3D.GuiObject.call( this );
  WIDGET3D.WindowInterface.call( this );
  
  
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
        WIDGET3D.events.disableEvent(name);
        return true;
      }
      return false;
    }
  };
  
  this.needsUpdate_ = true;
  
};

//-----------------------------------------------------------------------------------------
// inheriting MainWindow from GuiObject
WIDGET3D.MainWindow.prototype = WIDGET3D.GuiObject.prototype.inheritance();


//inheriting some methods from WindowInterface
// adds new child to window
WIDGET3D.MainWindow.prototype.addChild= WIDGET3D.WindowInterface.prototype.addChild;
// hides unfocused objects in window
WIDGET3D.MainWindow.prototype.hideNotFocused = WIDGET3D.WindowInterface.prototype.hideNotFocused;
// removes object from window
WIDGET3D.MainWindow.prototype.removeFromObjects = WIDGET3D.WindowInterface.prototype.removeFromObjects;

//-----------------------------------------------------------------------------------------
WIDGET3D.MainWindow.prototype.type_ = WIDGET3D.ElementType.MAIN_WINDOW;
//-----------------------------------------------------------------------------------------

//removes mesh from mesh list
WIDGET3D.MainWindow.prototype.removeMesh = function(mesh){

  for(var k = 0; k < this.meshes_.length; ++k){
    if(this.meshes_[k] === mesh){
      var removedMesh = this.meshes_.splice(k, 1);
    }
  }
  return removedMesh[0];
};

//---------------------------------------------
// GUI OBJECT: WINDOW
//---------------------------------------------
// Basic window that can has children.
// Extends WIDGET3D.Basic object.
//---------------------------------------------

WIDGET3D.Window = function(){
  WIDGET3D.Basic.call( this );
  WIDGET3D.WindowInterface.call( this );
};


//-----------------------------------------------------------------------------------------
// inheriting window from Basic object
WIDGET3D.Window.prototype = WIDGET3D.Basic.prototype.inheritance();

//inheriting some methods from WindowInterface

// adds new child to window
WIDGET3D.Window.prototype.addChild= WIDGET3D.WindowInterface.prototype.addChild;
// hides unfocused objects in window
WIDGET3D.Window.prototype.hideNotFocused = WIDGET3D.WindowInterface.prototype.hideNotFocused;
// removes object from window
WIDGET3D.Window.prototype.removeFromObjects = WIDGET3D.WindowInterface.prototype.removeFromObjects;

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

  if(this.mesh_){
    //removes the old mesh from the scene
    if(this.isVisible_){
      this.container_.remove(this.mesh_);
    }
    
    WIDGET3D.mainWindow.removeMesh(this.mesh_);
    this.mesh_ = mesh;
    
    if(this.isVisible_){
      this.container_.add(this.mesh_);
    }
    
    WIDGET3D.mainWindow.meshes_.push(this.mesh_);
  }
  else {
    this.mesh_ = mesh;
    WIDGET3D.mainWindow.meshes_.push(this.mesh_);
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

//setters and getters for location and rotation

WIDGET3D.Window.prototype.getLocation = function(){
  return {x: this.container_.position.x,
    y: this.container_.position.y,
    z: this.container_.position.z};
};

WIDGET3D.Window.prototype.setLocation = function(x, y, z){
  this.container_.position.x = x;
  this.container_.position.y = y;
  this.container_.position.z = z;
};

WIDGET3D.Window.prototype.setX = function(x){
  this.container_.position.x = x;
};

WIDGET3D.Window.prototype.setY = function(y){
  this.container_.position.y = y;
};

WIDGET3D.Window.prototype.setZ = function(z){
  this.container_.position.z = z;
};

WIDGET3D.Window.prototype.getRot = function(){
  return {x: this.container_.rotation.x,
    y: this.container_.rotation.y,
    z: this.container_.rotation.z};
};

WIDGET3D.Window.prototype.setRot = function(rotX, rotY, rotZ){
  this.container_.rotation.x = rotX;
  this.container_.rotation.y = rotY;
  this.container_.rotation.z = rotZ;
};

WIDGET3D.Window.prototype.setRotX = function(rotX){
  this.container_.rotation.x = rotX;
};

WIDGET3D.Window.prototype.setRotY = function(rotY){
  this.container_.rotation.y = rotY;
};

WIDGET3D.Window.prototype.setRotZ = function(rotZ){
  this.container_.rotation.z = rotZ;
};

WIDGET3D.Window.prototype.remove = function(){
  
  //children needs to be removed
  for(var k = 0; k < this.children_.length; ++k){
    this.children_[k].remove();
  }
  
  //hiding the window from scene
  this.hide();
  
  //removing eventlisteners
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListeners(i);
    }
  }
  
  //If wondow has a mesh, it has to be removed allso
  if(this.mesh_){
    var mesh = WIDGET3D.mainWindow.removeMesh(this.mesh_);
    if(mesh != this.mesh_){
      console.log("removed mesh was wrong! " + mesh);
    }
  }
  
  //container has to be removed from parent's container
  this.parent_.container_.remove(this.container_);
  
  //removing this from parents objects
  var obj = this.parent_.removeFromObjects(this);
  if(obj != this){
    console.log(obj);
    console.log(this);
    console.log("removed object was wrong! " + obj);
  }
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
WIDGET3D.Text = function(){
  
  WIDGET3D.Basic.call( this );
  
  this.mutable_ = true;
  
  this.cursor_ = "|";
  this.string_ = "";
  
  this.text_ = this.string_ + this.cursor_;
  
  this.maxLength_ = undefined;
  
};

// inheriting TextBox from GuiObject
WIDGET3D.Text.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.Text.prototype.type_ = WIDGET3D.ElementType.TEXT;

WIDGET3D.Text.prototype.setText = function(text){
  this.string_ = text;
  if(this.inFocus_ && this.mutable_){
    this.text_ = this.string_ + this.cursor_;
  }
  else{
    this.text_ = this.string_;
  }
  
  this.update();
};

WIDGET3D.Text.prototype.addLetter = function(letter){
  if(this.mutable_){
    if(this.maxLength_ != undefined &&
      this.string_.length < this.maxLength_){

      this.string_ += letter;
    }
    else{
      this.string_ += letter;
    }
    
    if(this.inFocus_){
      this.text_ = this.string_ + this.cursor_;
    }
    else{
      this.text_ = this.string_;
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.erase = function(amount){
  if(this.mutable_){
    if(amount >= this.string_.length){
      this.string_ = "";
    }
    else{
      this.string_ = this.string_.substring(0, (this.string_.length-amount));
    }
    
    if(this.inFocus_){
      this.text_ = this.string_ + this.cursor_;
    }
    else{
      this.text_ = this.string_;
    }
    
    this.update();
  }
};

//set focus on textobject
WIDGET3D.Text.prototype.focus = function(){
  if(!this.inFocus_){
  
    WIDGET3D.unfocusFocused();
    this.inFocus_ = true;
    WIDGET3D.focused.push(this);
    
    if(this.mutable_){
      this.setText(this.string_);
    }
  }
};

//unfocus textobject
WIDGET3D.Text.prototype.unfocus = function(){
  if(this.inFocus_){
    this.inFocus_ = false;
    if(this.mutable_){
      this.setText(this.string_);
    }
  }
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



