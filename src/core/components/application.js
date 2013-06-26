//------------------------------------------------
// MAIN WINDOW: Singleton root window
//
// The Main Window is inited by widget3d by default.
//
// Extends WIDGET3D.GuiObject object.
//---------------------------------------------------

WIDGET3D.Application = function(){
  
  WIDGET3D.GuiObject.call( this );
  WIDGET3D.GroupBase.call( this );
  
  this.childEvents = {
    
    addObject : function(name, child){
      if(!this.hasOwnProperty(name.toString()) ||
        (this.hasOwnProperty(name.toString()) && this[name.toString()] == false))
      {
        this[name.toString()] = [];
      }
      this[name.toString()].push(child);
      var index = this[name.toString()].length-1;
      return index;
    },

    removeEvent : function(name){
      if(this.hasOwnProperty(name.toString()) && this[name.toString()].length == 0){
        this[name.toString()] = false;
        WIDGET3D.getEvents().disableEvent(name);
        return true;
      }
      return false;
    }
  };
};


//-----------------------------------------------------------------------------------------
// inheriting Application from GuiObject
WIDGET3D.Application.prototype = WIDGET3D.GuiObject.prototype.inheritance();


//inheriting some methods from WindowInterface
// adds new child to window
WIDGET3D.Application.prototype.add = WIDGET3D.GroupBase.prototype.add;
// hides unfocused objects in window
WIDGET3D.Application.prototype.hideNotFocused = WIDGET3D.GroupBase.prototype.hideNotFocused;
// removes object from window
WIDGET3D.Application.prototype.removeFromObjects = WIDGET3D.GroupBase.prototype.removeFromObjects;

//-----------------------------------------------------------------------------------------
WIDGET3D.Application.prototype.type = WIDGET3D.ElementType.APPLICATION;
//-----------------------------------------------------------------------------------------


