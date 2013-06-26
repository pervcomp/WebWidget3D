//---------------------------------------------
// GUI OBJECT : generic abstract object
//---------------------------------------------

//There are ElementType amount of different kind of bjects
//with different properties that are inherited from thisObject.
//So this Object describes all properties and methods that are
//for all types of objects

WIDGET3D.ObjectBase = function(){

  WIDGET3D.GuiObject.call( this );
  
  this.parent = false;
  this.object3D = false;
  this.isVisible = true;
  
  this.controls = new Array();
};

//Sets/changes the 3D object for a widget
WIDGET3D.ObjectBase.prototype.setObject3D = function(obj){

  obj.visible = this.isVisible;
  
  if(this.object3D && this.parent){
    //removes the old obj from the scene    
    this.parent.object3D.remove(this.object3D);
    this.object3D = obj;
    this.parent.object3D.add(this.object3D);
  }
  else if(this.parent){
    this.object3D = obj;
    this.parent.object3D.add(this.object3D);
  }
  else{
    this.object3D = obj;
  }
  
};

WIDGET3D.ObjectBase.prototype.applyControl = function(control){
  control.setComponent(this);
  this.controls.push(control);
};

WIDGET3D.ObjectBase.prototype.removeControl = function(control){
  for(i = 0; i < this.controls.lenght; ++i){
    if(this.controls[i] === control){
      control.remove();
      this.controls.splice(i, 1);
    }
  }
};

//Shows object
WIDGET3D.ObjectBase.prototype.show = function(){
  if(!this.isVisible){
    this.isVisible = true;
    if(this.object3D){
      this.object3D.visible = true;
    }
  }
};

// hides object
WIDGET3D.ObjectBase.prototype.hide = function(){
  if(this.isVisible){
    this.isVisible = false;
    if(this.object3D){
      this.object3D.visible = false;
    }
    if(this.inFocus){
      this.unfocus();
    }
  }
};

//removes object
WIDGET3D.ObjectBase.prototype.remove = function(){
  this.hide();
  
  for(var i = 0; i < this.controls.length; ++i){
    this.controls[i].remove();
  }
  
  this.removeAllListeners();
  this.parent.removeFromObjects(this);
  WIDGET3D.removeObject(this.id);
};


