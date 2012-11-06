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

//WIDGET3D.Plug;

WIDGET3D.initialized = false;

WIDGET3D.events;
WIDGET3D.mainWindow;

WIDGET3D.focused = [];

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
}

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

//calculates mouseCoordinates from domEvent
WIDGET3D.mouseCoordinates = function(domEvent){
  
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

WIDGET3D.normalizedMouseCoordinates = function(domEvent){

  var coords = WIDGET3D.mouseCoordinates(domEvent);
  
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
  
  var mouse = WIDGET3D.normalizeCoords(coords, limits);
  return mouse;
};

//normalizes coordinates to range of -1..1
WIDGET3D.normalizeCoords = function(point, limits){
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

//transforms parent coordinate to child coordinate
WIDGET3D.parentCoordToChildCoord = function(point, childLimits, parentLimits){
  
  var childX = ((point.x - parentLimits.minX)/parentLimits.maxX)*childLimits.maxX + childLimits.minX;
  var childY = ((point.y - parentLimits.minY)/parentLimits.maxY)*childLimits.maxY + childLimits.minY;
  
  return {x: childX, y: childY};
};


  
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
  
  this.events_ = [];
  this.setUpEvents();
};

// this function is used to set up event structure
// must be called at the constructor
WIDGET3D.GuiObject.prototype.setUpEvents = function(){
  for(var i = 0; i < WIDGET3D.NUMBER_OF_EVENTS; ++i){
    this.events_.push(
      {callback: false, arguments: undefined, index: undefined});
  }
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
WIDGET3D.GuiObject.prototype.addEventListener = function(event, callback, args){
  this.events_[event].callback = callback;
  this.events_[event].arguments = args;

  WIDGET3D.mainWindow.childEvents_[event].push(this);
  this.events_[event].index = WIDGET3D.mainWindow.childEvents_[event].length - 1;
  
  if(!WIDGET3D.events.enabled_[event]){
    WIDGET3D.events.enableEvent(event);
  }
  
};

// Switches events handler callback to function that is given as parameter.
// This can be used only if there is a listner for the event allready.
WIDGET3D.GuiObject.prototype.switchEventCallback = function(event, callback, args){
  this.events_[event].callback = callback;
  this.events_[event].arguments = args;
};

// Removes eventlistener from object
// Parameters: event = WIDGET3D.EventType object
WIDGET3D.GuiObject.prototype.removeEventListener = function(event){

  this.events_[event].callback = false;
  this.events_[event].arguments = undefined;
  
  WIDGET3D.mainWindow.childEvents_[event].splice(this.events_[event].index, 1);
  
  for(var i = 0; i < WIDGET3D.mainWindow.childEvents_[event].length; ++i){
    WIDGET3D.mainWindow.childEvents_[event][i].setNewEventIndex(event,i);
  }
  this.events_[event].index = undefined;
};

WIDGET3D.GuiObject.prototype.setNewEventIndex = function(event, index){
  this.events_[event].index = index;
  WIDGET3D.mainWindow.childEvents_[event][index] = this;
}

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
  
  this.updateCallback_;
};

// inheriting basic from GuiObject
WIDGET3D.Basic.prototype = WIDGET3D.GuiObject.prototype.inheritance();

WIDGET3D.Basic.prototype.type_ = WIDGET3D.ElementType.BASIC;

WIDGET3D.Basic.prototype.addUpdateCallback = function(callback, args){
  //this.updateCallback_.callback = callback;
  //this.updateCallback_.arguments = args;
  
  this.updateCallback_ = {callback: callback, arguments: args};
};

WIDGET3D.Basic.prototype.update = function(){
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
    WIDGET3D.mainWindow.needsUpdate();
  }
};


//sets parent window for object
WIDGET3D.Basic.prototype.setParent = function(window){
  // if parent is allready set we have to do some things
  // to keep datastructures up to date.
  if(this.parent_ != undefined){
  
    if(this.isVisible_ && this.mesh_){
      this.parent_.container_.remove(this.mesh_);
    }
    
    this.parent_.removeFromObjects(this);
  }
  
  this.parent_ = window;
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
      WIDGET3D.mainWindow.needsUpdate();
    }
  }
  else if(this.parent_){
  
    this.mesh_ = mesh;
    
    if(this.isVisible_){
     this.parent_.container_.add(this.mesh_);
     WIDGET3D.mainWindow.needsUpdate();
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
    WIDGET3D.mainWindow.needsUpdate();
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
    WIDGET3D.mainWindow.needsUpdate();
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
  
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Basic.prototype.setX = function(x){
  this.mesh_.position.x = x;
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Basic.prototype.setY = function(y){
  this.mesh_.position.y = y;
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Basic.prototype.setZ = function(z){
  this.mesh_.position.z = z;
  WIDGET3D.mainWindow.needsUpdate();
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
  
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Basic.prototype.setRotX = function(rotX){
  this.mesh_.rotation.x = rotX;
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Basic.prototype.setRotY = function(rotY){
  this.mesh_.rotation.y = rotY;
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Basic.prototype.setRotZ = function(rotZ){
  this.mesh_.rotation.z = rotZ;
  WIDGET3D.mainWindow.needsUpdate();
};

//deletes object and removes it from it's parents object list
WIDGET3D.Basic.prototype.remove = function(){
  this.hide();
  
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListener(i);
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
  
  this.childEvents_ = new Array(WIDGET3D.NUMBER_OF_EVENTS);
  for(var k = 0; k < this.childEvents_.length; ++k){
    this.childEvents_[k] = [];
  }
  
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

//Window content needs update
WIDGET3D.MainWindow.prototype.needsUpdate = function(){
  this.needsUpdate_ = true;
};

WIDGET3D.MainWindow.prototype.update = function(){
  this.needsUpdate_ = false;
};

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
WIDGET3D.Window.prototype.setParent = function(window){
  
  // if parent is allready set we have to do some things
  // to keep datastructures up to date.
  if(this.parent_ != undefined){
  
    this.parent_.container_.remove(this.container_);
    this.parent_.removeFromObjects(this);
    
    this.parent_ = window;
    this.parent_.children_.push(this);
    this.parent_.container_.add(this.container_);
  }
  else{
    this.parent_ = window;
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
  WIDGET3D.mainWindow.needsUpdate();
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
    WIDGET3D.mainWindow.needsUpdate();
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
    WIDGET3D.mainWindow.needsUpdate();
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
  
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Window.prototype.setX = function(x){
  this.container_.position.x = x;
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Window.prototype.setY = function(y){
  this.container_.position.y = y;
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Window.prototype.setZ = function(z){
  this.container_.position.z = z;
  WIDGET3D.mainWindow.needsUpdate();
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
  
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Window.prototype.setRotX = function(rotX){
  this.container_.rotation.x = rotX;
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Window.prototype.setRotY = function(rotY){
  this.container_.rotation.y = rotY;
  WIDGET3D.mainWindow.needsUpdate();
};

WIDGET3D.Window.prototype.setRotZ = function(rotZ){
  this.container_.rotation.z = rotZ;
  WIDGET3D.mainWindow.needsUpdate();
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
      this.removeEventListener(i);
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

WIDGET3D.EventType = {"onclick":0, "ondblclick":1, "onmousemove":2,
  "onmousedown":3, "onmouseup":4, "onmouseover":5, "onmouseout":6,
  "onkeydown":7, "onkeyup":8, "onkeypress":9};
  
WIDGET3D.NUMBER_OF_EVENTS = 10;

WIDGET3D.EventTable = {

  addEvent : function(name){
    if(!this.name){
      this.name = [];
      return true;
    }
    return false;
  },
  
  addCallback : function(event, callback, arguments, object){
    if(this.event){
      this.event.push({callback : callback, arguments : arguments, object : object});
      return (this.event.length-1);
    }
    return false;
  }
};

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
  
  _that_.enabled_ = [];
  
  for(var i = 0; i < WIDGET3D.NUMBER_OF_EVENTS; ++i){
    _that_.enabled_.push(false);
  }
  
  _that_.mouseEvent = function(domEvent, eventType){
    
    var hit = _that_.collisions_.callback(domEvent, eventType, _that_.collisions_.args);
    
    //mainwindow click detected
    if(!hit && WIDGET3D.mainWindow.events_[eventType].callback){

      WIDGET3D.mainWindow.events_[eventType].callback(domEvent,
        WIDGET3D.mainWindow.events_[eventType].arguments);
    }
    else if(hit && hit.events_[eventType].callback){
      
      hit.events_[eventType].callback(domEvent,
        hit.events_[eventType].arguments);
    }
  };
  
  _that_.keyboardEvent = function(domEvent, eventType){
    
    //first we call main windows onkeydown callback if there is one
    if(WIDGET3D.mainWindow.events_[eventType].callback){
      console.log("mainwindow event!");
      
      if(WIDGET3D.mainWindow.inFocus_){
        
        WIDGET3D.mainWindow.events_[eventType].callback(domEvent,
          WIDGET3D.mainWindow.events_[eventType].arguments);
      }
    }
    
    //then we check other objects
    for(var i = 0; i < WIDGET3D.mainWindow.childEvents_[eventType].length; ++i){
      if(WIDGET3D.mainWindow.childEvents_[eventType][i].inFocus_){

        WIDGET3D.mainWindow.childEvents_[eventType][i].events_[eventType].callback(domEvent,
          WIDGET3D.mainWindow.childEvents_[eventType][i].events_[eventType].arguments);
       }
      
    }
  };
  
  _that_.onEvent = function(event){
    if(event.button){
      _that_.mouseEvent(event);
    }
    else{
      _that_.keyboardEvent(event);
    }
  }
  
  // Event listeners chatches events from DOM element.
  _that_.onclick = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onclick);
  };
  
  _that_.ondblclick = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.ondblclick);
  };
  
  _that_.onmousemove = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmousemove);
  };
  
  _that_.onmousedown = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmousedown);
  };
  
  _that_.onmouseup = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmouseup);
  };
  
  _that_.onmouseover = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmouseover);
  };
  
  _that_.onmouseout = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmouseout);
  };
  
  _that_.onkeydown = function(domEvent){
    _that_.keyboardEvent(domEvent, WIDGET3D.EventType.onkeydown);
  };
  
  _that_.onkeyup = function(domEvent){
    _that_.keyboardEvent(domEvent, WIDGET3D.EventType.onkeyup);
  };
  
  _that_.onkeypress = function(domEvent){
    _that_.keyboardEvent(domEvent, WIDGET3D.EventType.onkeypress);
  };
};

// Enables event
WIDGET3D.DomEvents.prototype.enableEvent = function(event){

  switch(event){
  
    case WIDGET3D.EventType.onclick:
      this.domElement_.addEventListener('click',this.onclick,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.ondblclick:
      this.domElement_.addEventListener('dblclick',this.ondblclick,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmousemove:
      this.domElement_.addEventListener('mousemove',this.onmousemove,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmousedown:
      this.domElement_.addEventListener('mousedown',this.onmousedown,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseup:
      this.domElement_.addEventListener('mouseup',this.onmouseup,true);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseover:
      this.domElement_.addEventListener('mouseover',this.onmouseover,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseout:
      this.domElement_.addEventListener('mouseout',this.onmouseout,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onkeydown:
      //keypress is allways detected in document
      document.addEventListener('keydown',this.onkeydown,false);
      this.enabled_[event] = true;
      break;
    
    case WIDGET3D.EventType.onkeyup:
      //keypress is allways detected in document
      document.addEventListener('keyup',this.onkeyup,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onkeypress:
      //keypress is allways detected in document
      document.addEventListener('keypress',this.onkeypress,false);
      this.enabled_[event] = true;
      break;
      
    default:
      console.log("event types supported: ");
      console.log(WIDGET3D.EventType);
      return;
  }
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

var THREEJS_WIDGET3D = {};
  
THREEJS_WIDGET3D.initialized = false;

THREEJS_WIDGET3D.Container = THREE.Object3D;

THREEJS_WIDGET3D.init = function(parameters){

  if(WIDGET3D != undefined && !THREEJS_WIDGET3D.initialized){
    
    var parameters = parameters || {};
    
    if(parameters.renderer){
      THREEJS_WIDGET3D.renderer = parameters.renderer;
    }
    else{
      //if there were no renderer given as a parameter, we create one
      var width = parameters.width !== undefined ? parameters.width : window.innerWidth;
      var height = parameters.height !== undefined ? parameters.height : window.innerHeight;
      
      var antialias = parameters.antialias !== undefined ? parameters.antialias : true;
      var domParent = parameters.domParent !== undefined ? parameters.domParent : document.body;
      
      THREEJS_WIDGET3D.renderer = new THREE.WebGLRenderer({antialias: antialias});
      THREEJS_WIDGET3D.renderer.setSize( width, height );
      
      var clearColor = parameters.clearColor !== undefined ? parameters.clearColor : 0x333333;
      var opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
      
      THREEJS_WIDGET3D.renderer.setClearColorHex( clearColor, opacity );
      
      domParent.appendChild(THREEJS_WIDGET3D.renderer.domElement);
    }
    
    THREEJS_WIDGET3D.camera = parameters.camera !== undefined ? parameters.camera  : 
      new THREE.PerspectiveCamera(75, 
      THREEJS_WIDGET3D.renderer.domElement.width / THREEJS_WIDGET3D.renderer.domElement.height,
      1, 10000);
    
    THREEJS_WIDGET3D.scene = parameters.scene !== undefined ? parameters.scene : new THREE.Scene();
    
    var mainWindow = false;
    
    if(!WIDGET3D.isInitialized()){
    
      mainWindow = WIDGET3D.init({collisionCallback: {callback: THREEJS_WIDGET3D.checkIfHits},
        container: THREE.Object3D,
        domElement: THREEJS_WIDGET3D.renderer.domElement});
      
      if(!mainWindow){
        console.log("Widget3D init failed!");
        return false;
      }
    }
    else{
      mainWindow = WIDGET3D.getMainWindow();
    }
    
    THREEJS_WIDGET3D.mainWindow = mainWindow;
    
    THREEJS_WIDGET3D.scene.add(THREEJS_WIDGET3D.mainWindow.container_);
    
    THREEJS_WIDGET3D.projector = new THREE.Projector();
    
    THREEJS_WIDGET3D.initialized = true;
    
    return mainWindow;
  }
};

THREEJS_WIDGET3D.checkIfHits = function(event, eventType){

  if(!THREEJS_WIDGET3D.initialized){
    console.log("THREEJS_WIDGET3D is not initialized!");
    console.log("To initialize THREEJS_WIDGET3D: THREEJS_WIDGET3D.init()");
    return false;
  }

  var mouse = WIDGET3D.normalizedMouseCoordinates(event);
  
  var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
  var ray = THREEJS_WIDGET3D.projector.pickingRay(vector, THREEJS_WIDGET3D.camera);
  
  //intersects checks now all the meshes in scene. It might be good to construct
  // a datastructure that contains meshes of mainWindow.childEvents_[eventType] arrays content
  var intersects = ray.intersectObjects(THREEJS_WIDGET3D.mainWindow.meshes_);
  
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
        var objPos = inv.multiplyVector3(intersects[m].point.clone());
        
        var found = THREEJS_WIDGET3D.findObject(closest, eventType);
        
        if(found){
          //found.mousePosition_ = objPos;
          //found.worldPosition_ = intersects[m].point;
          
          event.objectCoordinates = objPos;
          event.worldCoordinates = intersects[m].point;
        }

        return found;
      }
    }
  }
  return false;
};

THREEJS_WIDGET3D.findObject = function(mesh, eventType){

  for(var i = 0; i < THREEJS_WIDGET3D.mainWindow.childEvents_[eventType].length; ++i){
    
    // if the object is not visible it can be the object hit
    // because it's not in the scene.
    if(THREEJS_WIDGET3D.mainWindow.childEvents_[eventType][i].isVisible_){
      
      // If the object is the one we hit, we return the object
      if(mesh === THREEJS_WIDGET3D.mainWindow.childEvents_[eventType][i].mesh_){
        
        return THREEJS_WIDGET3D.mainWindow.childEvents_[eventType][i];
        
      }//if right object
      
    }//if visible
  }//for child events loop
  return false;
};

THREEJS_WIDGET3D.render = function(){
  THREEJS_WIDGET3D.renderer.render(THREEJS_WIDGET3D.scene, THREEJS_WIDGET3D.camera);
};/*
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
THREEJS_WIDGET3D.GridWindow = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.density_ = parameters.density !== undefined ? parameters.density : 10;
  
  var color = parameters.color !== undefined ? parameters.color : 0x6B6B6B;
  var lineWidth = parameters.lineWidth !== undefined ? parameters.lineWidth : 2;
  
  this.clickLocation_;
  this.rotationOnMouseDownY_;
  this.rotationOnMousedownX_;
  this.modelRotationY_ = 0;
  this.modelRotationX_ = 0;
  this.rotate_ = false;
  
  
  var mesh =  new THREE.Mesh( 
    new THREE.PlaneGeometry( this.width_, this.height_, this.density_, this.density_ ),
    new THREE.MeshBasicMaterial({
      color: color,
      opacity: 0.5,
      wireframe: true,
      side : THREE.DoubleSide,
      wireframeLinewidth : lineWidth}) );
  
  this.setMesh(mesh);
  
  //default mouse controls in use
  if(parameters.defaultControls){
    this.addEventListener(WIDGET3D.EventType.onmousedown, this.mousedownHandler, this);
    this.addEventListener(WIDGET3D.EventType.onmouseup, this.mouseupHandler, this);
    this.addEventListener(WIDGET3D.EventType.onmousemove, this.mousemoveHandler, this);
  }
  
};

THREEJS_WIDGET3D.GridWindow.prototype = WIDGET3D.Window.prototype.inheritance();

THREEJS_WIDGET3D.GridWindow.prototype.update = function(){
  var rot = this.getRot();
  this.setRotY(rot.y + ((this.modelRotationY_ - rot.y)*0.03));
  this.setRotX(rot.x + ((this.modelRotationX_ - rot.x)*0.03));
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.GridWindow.prototype.mousedownHandler = function(event, window){
  window.focus();
  if(!window.rotate_){
    window.rotate_ = true;
    
    window.clickLocation_ = WIDGET3D.normalizedMouseCoordinates(event);
    window.rotationOnMouseDownY_ = window.modelRotationY_;
    window.rotationOnMouseDownX_ = window.modelRotationX_;
  }
  
  return false;
};

THREEJS_WIDGET3D.GridWindow.prototype.mouseupHandler = function(event, window){
  window.rotate_ = false;
};

THREEJS_WIDGET3D.GridWindow.prototype.mousemoveHandler = function(event, window){
  if (window.rotate_){
  
    var mouse = WIDGET3D.normalizedMouseCoordinates(event);
    
    window.modelRotationY_ = window.rotationOnMouseDownY_ + ( mouse.x - window.clickLocation_.x );
    window.modelRotationX_ = window.rotationOnMouseDownX_ + ( mouse.y - window.clickLocation_.y );
  }
};


//---------------------------------------------------
// ICONS FOR GRIDWINDOW
//---------------------------------------------------
THREEJS_WIDGET3D.GridIcon = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  var parent = parameters.parent;
  if(parent == undefined){
    console.log("GridIcon needs to have grid window as parent!");
    console.log("Parent has to be given in parameters.");
    return false;
  }
  
  var parameters = parameters || {};
  
  var color = parameters.color !== undefined ? parameters.color : 0xFFFFFF;
  var picture = parameters.picture !== undefined ? parameters.picture : false;
  
  this.width_ = parent.width_/(parent.density_ + 3.3);
  this.height_ = parent.height_/(parent.density_ + 3.3);
  this.depth_ = 30;
  
  var geometry = new THREE.CubeGeometry(this.width_, this.height_, this.depth_);
  
  var texture;
  
  if(picture){
    texture = THREE.ImageUtils.loadTexture(picture);
  }
  else{
    texture = false;
  }
  var material = new THREE.MeshBasicMaterial({map : texture, color: color});
  
  var mesh = new THREE.Mesh( geometry, material);
  
  this.setMesh(mesh);
  parent.addChild(this);
  
  this.setToPlace();
  
};

THREEJS_WIDGET3D.GridIcon.prototype = WIDGET3D.Basic.prototype.inheritance();

THREEJS_WIDGET3D.GridIcon.prototype.setToPlace = function(){

  var parentLoc = this.parent_.getLocation();
  
  var parentLeft = -this.parent_.width_/2.0 + parentLoc.x/this.parent_.width_;
  var parentTop =  this.parent_.height_/2.0 + parentLoc.y/this.parent_.height_;
  
  var stepX = this.parent_.width_/this.parent_.density_;
  var stepY = this.parent_.height_/this.parent_.density_;
  
  var slotCenterX = stepX/2;
  var slotCenterY = stepY/2;
  
  if(this.parent_.children_.length-1 > 0){
  
    var lastIcon = this.parent_.children_[this.parent_.children_.length-2];
    var lastIconLoc = lastIcon.getLocation();
    
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
  this.setLocation(x, y, parentLoc.z/this.parent_.height_);
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
THREEJS_WIDGET3D.TitledWindow = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var that = this;
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 2000;
  this.height_ = parameters.height !== undefined ? parameters.height : 2000;
  
  var title = parameters.title !== undefined ? parameters.title : "title";
  
  var color = parameters.color !== undefined ? parameters.color : 0x808080;
  var texture = parameters.texture;
  var material = parameters.material !== undefined ? parameters.material :  new THREE.MeshBasicMaterial({color : color, map : texture, side : THREE.DoubleSide});
  
  var mesh =  new THREE.Mesh( new THREE.PlaneGeometry( this.width_, this.height_ ), material);
  
  this.setMesh(mesh);
  
  //---------------------------------------------------
  //CLOSE BUTTON
  //---------------------------------------------------
  this.closeButton_ = new WIDGET3D.Basic();
  
  var buttonMesh = new THREE.Mesh( new THREE.PlaneGeometry( this.width_/10.0, this.height_/10.0 ),
    new THREE.MeshBasicMaterial( { color: 0xAA0000, side : this.mesh_.material.side} ) );
  
  this.closeButton_.setMesh(buttonMesh);
  this.closeButton_.setLocation(((this.width_/2.0)-(this.width_/20.0)), ((this.height_/2.0)+(this.height_/20.0)), 0);
  
  this.addChild(this.closeButton_);
  
  //---------------------------------------------------
  //TITLEBAR
  //---------------------------------------------------
  this.title_ = new WIDGET3D.Basic();
  
  this.textureCanvas_ = document.createElement('canvas');
  this.textureCanvas_.width = 512;
  this.textureCanvas_.height = 128;
  this.textureCanvas_.style.display = "none";
  
  document.body.appendChild(this.textureCanvas_);
  this.titleContext_ = this.textureCanvas_.getContext('2d');
  this.setTitle(title);
  
  this.addChild(this.title_);
  
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  //drag controlls
  this.clickStart_ = undefined;
  this.newPos_ = this.getLocation();
  this.drag_ = false;
  this.firstEvent_ = false;
  
  if(this.defaultControls_){
    this.title_.addEventListener(WIDGET3D.EventType.onmousedown, this.mousedownHandler, this);
    this.title_.addEventListener(WIDGET3D.EventType.onmousemove, this.mousemoveHandler, this);
    this.title_.addEventListener(WIDGET3D.EventType.onmouseup, this.mouseupHandler);
    //THREEJS_WIDGET3D.renderer.domElement.addEventListener('mouseup',this.mouseupHandler, true);
  }
  
  this.mouseupHandler = function(event){  
    that.drag_ = false;
    that.clickStart_ = undefined;
    console.log("Hi!");
    //THREEJS_WIDGET3D.renderer.domElement.removeEventListener('mouseup',this.mouseupHandler,false);
  };
};

THREEJS_WIDGET3D.TitledWindow.prototype = WIDGET3D.Window.prototype.inheritance();


THREEJS_WIDGET3D.TitledWindow.prototype.update = function(){
  
  if(this.defaultControls_ && this.firstEvent_){
    
    this.setLocation(this.newPos_.x, this.newPos_.y, this.newPos_.z);
  }
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
  
  WIDGET3D.mainWindow.needsUpdate();
};

//sets titlebar text
THREEJS_WIDGET3D.TitledWindow.prototype.setTitle = function(title){

  this.titleContext_.fillStyle = "#B3B3B3";
  this.titleContext_.fillRect(0, 0, this.textureCanvas_.width, this.textureCanvas_.height);
  
  this.titleContext_.fillStyle = "#000000";
  this.titleContext_.font = "bold 60px Courier New";
  this.titleContext_.align = "center";
  this.titleContext_.textBaseline = "middle";
  this.titleContext_.fillText(title, 10, this.textureCanvas_.height/2);
  var texture = new THREE.Texture(this.textureCanvas_);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, side : this.mesh_.material.side });
  
  this.title_.width_ = this.width_ - this.width_/10.0;
  this.title_.height_ = this.height_/10.0;
  
  var mesh = new THREE.Mesh( new THREE.PlaneGeometry(this.title_.width_, this.title_.height_), material);
  
  this.title_.setMesh(mesh);
  
  this.title_.setY((this.height_/2.0)+(this.height_/20.0));
  this.title_.setX(((this.width_ - this.width_/10.0)/2.0) - (this.width_/2.0));
  
  texture.needsUpdate = true;
};


THREEJS_WIDGET3D.TitledWindow.prototype.mousedownHandler = function(event, window){
  window.focus();
  //If this is the first time the event is fired we need to update the
  //objects position data because it might have changed after constructor.
  if(!window.firstEvent_){
    window.newPos_ = window.getLocation();
    window.firstEvent_ = true;
  }
  
  if(!window.drag_){
    window.drag_ = true;
    window.clickStart_ = event.objectCoordinates;
  }
  return false;
};

THREEJS_WIDGET3D.TitledWindow.prototype.mousemoveHandler = function(event, window){
  if(window.drag_){
    
    var point = event.objectCoordinates;
    
    var dy = (point.y - window.clickStart_.y);
    var dx = (point.x - window.clickStart_.x);
    
    var pos = window.getLocation();
    var rotation = window.getRot();
    
    var tmpX = pos.x + (dx * Math.cos(Math.PI * rotation.y));
    var tmpZ = pos.z + (dx * Math.sin(Math.PI * rotation.y));
    
    window.newPos_.y = pos.y + (dy * Math.cos(Math.PI * rotation.x));
    window.newPos_.z = tmpZ - (dy * Math.sin(Math.PI * rotation.x) * Math.cos(Math.PI * rotation.y));
    window.newPos_.x = tmpX + (dy * Math.sin(Math.PI * rotation.x) * Math.sin(Math.PI * rotation.y));
  }
};


THREEJS_WIDGET3D.TitledWindow.prototype.remove = function(){
  //children needs to be removed
  for(var k = 0; k < this.children_.length; ++k){
    this.children_[k].remove();
  }
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from DOM
  var canvas = this.textureCanvas_;
  document.body.removeChild(canvas);
  
  //removing eventlisteners
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListener(i);
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
THREEJS_WIDGET3D.Dialog = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.text_ = parameters.text !== undefined ? parameters.text : "This is a dialog";
  this.buttonText_ = parameters.buttonText !== undefined ? parameters.buttonText : "submit";
  this.maxTextLength = parameters.maxTextLength !== undefined ? parameters.maxTextLength : undefined;
  
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
  
  this.textBox_ = new WIDGET3D.Text();
  this.textBox_.maxLength_ = this.maxTextLength;
  
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
  
  this.textBox_.addEventListener(WIDGET3D.EventType.onclick, this.textBoxOnclick, this);
  this.textBox_.addEventListener(WIDGET3D.EventType.onkeypress, this.textBoxOnkeypress, this);
  this.textBox_.addEventListener(WIDGET3D.EventType.onkeydown, this.textBoxOnkeypress, this);
};

THREEJS_WIDGET3D.Dialog.prototype = WIDGET3D.Window.prototype.inheritance();

THREEJS_WIDGET3D.Dialog.prototype.update = function(){
  this.textBox_.update();
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
}

THREEJS_WIDGET3D.Dialog.prototype.createDialogText = function(string){

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

THREEJS_WIDGET3D.Dialog.prototype.createButtonText = function(string){

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
  
  var parentLoc = this.getLocation();
  
  var y = parentLoc.y - (this.height_/5.0);
  
  this.button_.setLocation(parentLoc.x, y ,parentLoc.z);
  
  texture.needsUpdate = true;
};

THREEJS_WIDGET3D.Dialog.prototype.createTextBox = function(){
  
  var texture = new THREE.Texture(this.textCanvas_);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh( new THREE.PlaneGeometry(this.width_/1.5, this.height_/10.0), material);
  
  this.textBox_.setMesh(mesh);
  
  var parentLoc = this.getLocation();
  
  var y = parentLoc.y + this.height_/10;
  
  this.textBox_.setLocation(parentLoc.x, y ,parentLoc.z+10);
  
  this.updateTextBox(this);
}

THREEJS_WIDGET3D.Dialog.prototype.updateTextBox = function(window){

  window.textContext_.fillStyle = "#FFFFFF";
  window.textContext_.fillRect(0, 0, window.textCanvas_.width, window.textCanvas_.height);
  
  window.textContext_.fillStyle = "#000000";
  window.textContext_.font = "bold 50px Courier New";
  window.textContext_.align = "center";
  window.textContext_.textBaseline = "middle";
  
  window.textContext_.fillText(window.textBox_.text_, 5, window.textCanvas_.height/2);
  
  window.textBox_.mesh_.material.map.needsUpdate = true;
  
};

THREEJS_WIDGET3D.Dialog.prototype.textBoxOnclick = function(event, window){
  window.textBox_.focus();
};

THREEJS_WIDGET3D.Dialog.prototype.textBoxOnkeypress = function(event, window){
  
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

THREEJS_WIDGET3D.Dialog.prototype.remove = function(){
  
  //children needs to be removed
  for(var k = 0; k < this.children_.length; ++k){
    this.children_[k].remove();
  }
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from dom
  var canvas1 = this.textCanvas_;
  var canvas2 = this.buttonCanvas_;
  document.body.removeChild(canvas1);
  document.body.removeChild(canvas2);
  
  //removing eventlisteners
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListener(i);
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
  
}

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
THREEJS_WIDGET3D.SelectDialog = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.choices_ = parameters.choices !== undefined ? parameters.choices : [];
  this.hasCancel_ = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  this.text_ = parameters.text !== undefined ? parameters.text : false;
  
  if(this.hasCancel_){
    this.cancelText_ = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";
    this.choices_.push({string: this.cancelText_, onclick : {handler : function(event, window){window.remove()}, parameters : this}});
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

THREEJS_WIDGET3D.SelectDialog.prototype = WIDGET3D.Window.prototype.inheritance();

THREEJS_WIDGET3D.SelectDialog.prototype.createText = function(){
  this.textCanvas_ = document.createElement('canvas');
  this.textCanvas_.width = 512;
  this.textCanvas_.height = 128;
  this.textCanvas_.style.display = "none";
  document.body.appendChild(this.textCanvas_);
  var context = this.textCanvas_.getContext('2d');
  
  var material = this.createTitleMaterial(this.text_, context, this.textCanvas_);
  
  this.choiceHeight_ = this.height_/((this.choices_.length+1)*1.2);
  
  var mesh = new THREE.Mesh(new THREE.CubeGeometry(this.width_, this.choiceHeight_, 10), material);

  mesh.position.y = this.height_*0.5 - this.choiceHeight_*0.5;
  
  this.setMesh(mesh);
}

THREEJS_WIDGET3D.SelectDialog.prototype.createChoises = function(){

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
    var mesh = new THREE.Mesh( new THREE.CubeGeometry(width, height, 10), material);
    
    choice.setMesh(mesh);
    
    var parentLoc = this.getLocation();
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
    
    choice.setLocation(parentLoc.x, y ,parentLoc.z);
    
    choice.addEventListener(WIDGET3D.EventType.onclick, this.choices_[i].onclick.handler, this.choices_[i].onclick.parameters);
    choice.menuID_ = i;
    this.addChild(choice);
  }
};

THREEJS_WIDGET3D.SelectDialog.prototype.createButtonMaterial = function(string, context, canvas){

  
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

THREEJS_WIDGET3D.SelectDialog.prototype.createTitleMaterial = function(string, context, canvas){

  
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

THREEJS_WIDGET3D.SelectDialog.prototype.changeChoiceText = function(text, index){
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


THREEJS_WIDGET3D.SelectDialog.prototype.remove = function(){

  //children needs to be removed
  for(var k = 0; k < this.children_.length; ++k){
    this.children_[k].remove();
  }
  
  //removing child canvases from DOM
  for(var i = 0; i < this.choiceCanvases_.length; ++i){
    canvas = this.choiceCanvases_[i];
    document.body.removeChild(canvas);
  }
  
  //hiding the window from scene
  this.hide();
  
  //deleting the background canvas
  var canvas = this.textCanvas_;
  document.body.removeChild(canvas);
  
  //removing eventlisteners
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListener(i);
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

}

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
THREEJS_WIDGET3D.CameraGroup = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.camera_ = parameters.camera !== undefined ? parameters.camera : THREEJS_WIDGET3D.camera;
  this.camera_.position.set(0,0,0);
  this.container_.add(this.camera_);
};

THREEJS_WIDGET3D.CameraGroup.prototype = WIDGET3D.Window.prototype.inheritance();


//Adds the object to cameragroup.
//objects place is its offset from camera (camera is in origo when component is added)
THREEJS_WIDGET3D.CameraGroup.prototype.addChild = function(object, distance){
  var rot = this.getRot();
  var loc = this.getLocation();
  
  var distance = distance || {};
  
  var x = distance.x !== undefined ? distance.x : 0;
  var y = distance.y !== undefined ? distance.y : 0;
  var z = distance.z !== undefined ? distance.z : 0;
  
  var newX = loc.x + x;
  var newY = loc.y + y;
  var newZ = loc.z + z;
    
  console.log("CameraGroup location: ");
  console.log(loc);
  console.log("--------------------");
  
  object.setLocation(newX, newY, newZ);
  object.setParent(this);
  
  console.log("New object location: ");
  console.log(object.getLocation());
  console.log("--------------------");
  
  return object;
};

//setters for location and rotation

//LOCATION
THREEJS_WIDGET3D.CameraGroup.prototype.setLocation = function(x, y, z){

  this.container_.position.set({x: x, y: y, z: z});
  this.camera_.position.set({x: x, y: y, z: z});
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setX = function(x){
  this.container_.position.x = x;
  this.camera_.position.x = x;
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setY = function(y){
  this.container_.position.y = y;
  this.camera_.position.y = y;
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setZ = function(z){
  this.container_.position.z = z;
  this.camera_.position.z = z;
  WIDGET3D.mainWindow.needsUpdate();
};

//ROTATION
THREEJS_WIDGET3D.CameraGroup.prototype.setRot = function(rotX, rotY, rotZ){
  
  this.container_.rotation.set({x: rotX, y: rotY, z: rotZ});
  this.camera_.rotation.set({x: rotX, y: rotY, z: rotZ});
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setRotX = function(rotX){
  this.container_.rotation.x = rotX;
  this.camera_.rotation.x = rotX;
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setRotY = function(rotY){
  this.container_.rotation.y = rotY;
  this.camera_.rotation.y = rotY;
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setRotZ = function(rotZ){
  this.container_.rotation.z = rotZ;
  this.camera_.rotation.z = rotZ;
  
  WIDGET3D.mainWindow.needsUpdate();
};
