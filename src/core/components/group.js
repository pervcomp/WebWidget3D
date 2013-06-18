//---------------------------------------------
// GUI OBJECT: Group
//---------------------------------------------
// Basic Group that can has children.
// Extends WIDGET3D.Basic object.
//---------------------------------------------
WIDGET3D.Group = function(){
  WIDGET3D.Basic.call( this );
  WIDGET3D.GroupBase.call( this );
  
  this.isVisible_;
};


//-----------------------------------------------------------------------------------------
// inheriting Group from Basic object
WIDGET3D.Group.prototype = WIDGET3D.Basic.prototype.inheritance();

//inheriting some methods from WindowInterface

// adds new child to Group
WIDGET3D.Group.prototype.addChild= WIDGET3D.GroupBase.prototype.addChild;
// hides unfocused objects in Group
WIDGET3D.Group.prototype.hideNotFocused = WIDGET3D.GroupBase.prototype.hideNotFocused;
// removes object from Group
WIDGET3D.Group.prototype.removeFromObjects = WIDGET3D.GroupBase.prototype.removeFromObjects;

//-----------------------------------------------------------------------------------------
WIDGET3D.Group.prototype.type_ = WIDGET3D.ElementType.GROUP;
//-----------------------------------------------------------------------------------------

//sets parent Group for object
WIDGET3D.Group.prototype.setParent = function(widget){
  
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

//sets mesh for Group
WIDGET3D.Group.prototype.setMesh = function(mesh){
  var mainWindow =  WIDGET3D.getApplication();
  
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

// shows Group
WIDGET3D.Group.prototype.show = function(){

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

// hides Group
WIDGET3D.Group.prototype.hide = function(){

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

//removes Group and it's children
WIDGET3D.Group.prototype.remove = function(){
  //children needs to be removed  
  while(this.children_.length > 0){
    this.children_[0].remove();
  }
  //hiding the Group from scene
  this.hide();
  //removing event listeners
  this.removeAllListeners();
  
  //If Group has a mesh, it has to be removed allso
  if(this.mesh_){
    WIDGET3D.getApplication().removeMesh(this.mesh_);
  }
  //container has to be removed from parent's container
  this.parent_.container_.remove(this.container_);
  //removing this from parents objects
  this.parent_.removeFromObjects(this);
  
  WIDGET3D.removeObject(this.id_);
};
 
//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR Group OBJECT
//--------------------------------------------------
WIDGET3D.Group.prototype.inheritance = function(){
  function guiWindowPrototype(){}
  guiWindowPrototype.prototype = this;
  var created = new guiWindowPrototype();
  return created;
};


