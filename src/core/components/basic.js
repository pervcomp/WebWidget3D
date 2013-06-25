//---------------------------------------------
// GUI OBJECT: BASIC
//---------------------------------------------
//
// The basic guiObject that can be moved or hidden and so on.
// Any other object than main window is this type of object
//
WIDGET3D.Basic = function(){

  WIDGET3D.GuiObject.call( this );
  
  this.container_;
  this.parent_;
};


// inheriting basic from GuiObject
WIDGET3D.Basic.prototype = WIDGET3D.GuiObject.prototype.inheritance();

WIDGET3D.Basic.prototype.type_ = WIDGET3D.ElementType.BASIC;

//meshes is array of meshes WIDGET3D are part of object
WIDGET3D.Basic.prototype.setMesh = function(mesh){

  mesh.visible = this.isVisible_;
  var mainWindow = WIDGET3D.getApplication();
  
  if(this.container_ && this.parent_){
    //removes the old mesh from the scene    
    this.parent_.container_.remove(this.container_);
    mainWindow.removeMesh(this.container_);
    this.container_ = mesh;
    this.parent_.container_.add(this.container_);
  }
  else if(this.parent_){
  
    this.container_ = mesh;
    this.parent_.container_.add(this.container_);
  }
  else{
    this.container_ = mesh;
  }
  
  
  
  mainWindow.meshes_.push(this.container_);
};

// shows object
WIDGET3D.Basic.prototype.show = function(){
  if(!this.isVisible_){
    this.isVisible_ = true;
    this.container_.visible = true;
  }
};

// hides object
WIDGET3D.Basic.prototype.hide = function(){
  if(this.isVisible_){
    this.isVisible_ = false;
    this.container_.visible = false;
    if(this.inFocus_){
      this.unfocus();
    }
  }
};

//removes object
WIDGET3D.Basic.prototype.remove = function(){
  this.hide();
  //removing event listeners
  this.removeAllListeners();
  //removing mesh
  WIDGET3D.getApplication().removeMesh(this.container_);
  //removing object
  this.parent_.removeFromObjects(this);
  
  WIDGET3D.removeObject(this.id_);
};


//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR BASIC OBJECT
//--------------------------------------------------
WIDGET3D.Basic.prototype.inheritance = function(){
  function WIDGET3DBasicPrototype(){};
  WIDGET3DBasicPrototype.prototype = this;
  var created = new WIDGET3DBasicPrototype();
  return created;
};