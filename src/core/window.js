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
    var mesh = WIDGET3D.getMainWindow().removeMesh(this.mesh_);
  }
  //container has to be removed from parent's container
  this.parent_.container_.remove(this.container_);
  //removing this from parents objects
  var obj = this.parent_.removeFromObjects(this);
};

//setters and getters for location and rotation

//TODO: MOVE TO THE ADAPTER SIDE
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

 
//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR WINDOW OBJECT
//--------------------------------------------------
WIDGET3D.Window.prototype.inheritance = function(){
  function guiWindowPrototype(){}
  guiWindowPrototype.prototype = this;
  var created = new guiWindowPrototype();
  return created;
};