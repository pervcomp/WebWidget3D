//---------------------------------------------
// GUI OBJECT: BASIC
//---------------------------------------------
//
// The basic guiObject that can be moved or hidden and so on.
// Any other object than main window is this type of object
//
WIDGET3D.Basic = function(){

  WIDGET3D.GuiObject.call( this );
  
  this.container;
  this.parent;
  this.isVisible = true;
};


// inheriting basic from GuiObject
WIDGET3D.Basic.prototype = WIDGET3D.GuiObject.prototype.inheritance();

WIDGET3D.Basic.prototype.type = WIDGET3D.ElementType.BASIC;

WIDGET3D.Basic.prototype.setMesh = function(mesh){

  mesh.visible = this.isVisible;
  
  if(this.container && this.parent){
    //removes the old mesh from the scene    
    this.parent.container.remove(this.container);
    this.container = mesh;
    this.parent.container.add(this.container);
  }
  else if(this.parent){
  
    this.container = mesh;
    this.parent.container.add(this.container);
  }
  else{
    this.container = mesh;
  }
};

//shows object
WIDGET3D.Basic.prototype.show = function(){
  if(!this.isVisible){
    this.isVisible = true;
    this.container.visible = true;
  }
};

//hides object
WIDGET3D.Basic.prototype.hide = function(){
  if(this.isVisible){
    this.isVisible = false;
    this.container.visible = false;
    if(this.inFocus){
      this.unfocus();
    }
  }
};

//removes object
WIDGET3D.Basic.prototype.remove = function(){
  this.hide();
  //removing event listeners
  this.removeAllListeners();
  //removing object
  this.parent.removeFromObjects(this);
  WIDGET3D.removeObject(this.id);
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