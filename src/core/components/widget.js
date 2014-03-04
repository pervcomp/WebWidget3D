//---------------------------------------------
// WIDGET : generic abstract object
//---------------------------------------------

//There are ElementType amount of different kind of bjects
//with different properties that are inherited from thisObject.
//So this Object describes all properties and methods that are
//for all types of objects

WIDGET3D.Widget = function(mesh){

  WIDGET3D.GuiObject.call( this );
  
  this.parent = false;
  this.object3D = mesh !== undefined ? mesh : false;
  this.isVisible = true;
  
  this.controls = new Array();

};

WIDGET3D.Widget.prototype = WIDGET3D.GuiObject.prototype.inheritance();

//Sets/changes the 3D object for a widget
WIDGET3D.Widget.prototype.setObject3D = function(obj){
  
  if(this.parent){
    if(this.object3D){
      //removes the old obj from the scene    
      this.parent.object3D.remove(this.object3D);
      this.object3D = obj;
      this.parent.object3D.add(this.object3D);
    }
    else{
      this.object3D = obj;
      this.parent.object3D.add(this.object3D);
    }
  }
  else{
    this.object3D = obj;
  }
  
  if(!this.isVisible){
    this.object3D.visible = false;
  }

  return this;
};

WIDGET3D.Widget.prototype.applyControl = function(control){
  this.controls.push(control);
  return this;
};

WIDGET3D.Widget.prototype.removeControl = function(control){
  for(i = 0; i < this.controls.lenght; ++i){
    if(this.controls[i] === control){
      control.remove();
      this.controls.splice(i, 1);
      break;
    }
  }
  return this;
};

//Shows object
WIDGET3D.Widget.prototype.show = function(){
  if(!this.isVisible){
    this.isVisible = true;
    if(this.object3D){
      this.object3D.visible = true;
    }
  }
  return this;
};

// hides object
WIDGET3D.Widget.prototype.hide = function(){
  if(this.isVisible){
    this.isVisible = false;
    if(this.object3D){
      this.object3D.visible = false;
    }
    if(this.inFocus){
      this.unfocus();
    }
  }
  return this;
};

//removes object
WIDGET3D.Widget.prototype.remove = function(){
  this.hide();
  
  for(var i = 0; i < this.controls.length; ++i){
    this.controls[i].remove();
  }
  
  this.removeAllListeners();
  this.parent.removeFromObjects(this);
  WIDGET3D.removeObject(this.id);
};

//---------------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR ABSTRACT WIDGET OBJECT
//---------------------------------------------------------
WIDGET3D.Widget.prototype.inheritance = function(){
  function WIDGET3DWidgetPrototype(){};
  WIDGET3DWidgetPrototype.prototype = this;
  var created = new WIDGET3DWidgetPrototype();
  return created;
};

