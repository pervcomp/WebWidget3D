// CONTROL BASE CLASS
//

WIDGET3D.Control = function(component){

  this.component = component;
}

WIDGET3D.Control.prototype.remove(){
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