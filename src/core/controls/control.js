// CONTROL BASE CLASS
//

WIDGET3D.Control = function(component, parameters){
  
  this.component = component;
  this.component.applyControl(this);
  
  var parameters = parameters || {};
  
  this.mouseButton = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  this.shiftKey = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
}


WIDGET3D.Control.prototype.remove = function(){
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