// CONTROL BASE CLASS
//

WIDGET3D.Control = function(component){
  
  this.component = component;
  this.component.applyControl(this);
}


WIDGET3D.Control.prototype.remove = function(){
  this.component.removeControl(this);
};

//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR CONTROL
//--------------------------------------------------
WIDGET3D.Control.prototype.inheritance = function(){
  function WIDGET3DControlPrototype(){};
  WIDGET3DControlPrototype.prototype = this;
  var created = new WIDGET3DControlPrototype();
  return created;
};