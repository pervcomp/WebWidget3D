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
  
  console.log(this);
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
};