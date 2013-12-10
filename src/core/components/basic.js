//---------------------------------------------
// GUI OBJECT: BASIC
//---------------------------------------------
//
// The basic guiObject that can be moved or hidden and so on.
//
WIDGET3D.Basic = function(){  
  WIDGET3D.Widget.call( this );
};


// inheriting basic from GuiObject
//WIDGET3D.Basic.prototype = WIDGET3D.GuiObject.prototype.inheritance();
WIDGET3D.Basic.prototype = WIDGET3D.Widget.prototype.inheritance();

//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR BASIC OBJECT
//--------------------------------------------------
WIDGET3D.Basic.prototype.inheritance = function(){
  function WIDGET3DBasicPrototype(){};
  WIDGET3DBasicPrototype.prototype = this;
  var created = new WIDGET3DBasicPrototype();
  return created;
};