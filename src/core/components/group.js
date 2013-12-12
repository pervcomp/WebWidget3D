//---------------------------------------------
// GUI OBJECT: Group
//---------------------------------------------
// Basic Group that can has children.
// Extends WIDGET3D.Basic object.
//---------------------------------------------
WIDGET3D.Group = function(){

  WIDGET3D.Widget.call( this );
  WIDGET3D.GroupBase.call( this );
  
  this.parent;
  //this.isVisible = true;
};


//-----------------------------------------------------------------------------------------
// inheriting Group from Basic object
//WIDGET3D.Group.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.Group.prototype = WIDGET3D.Widget.prototype.inheritance();

//inheriting some methods from WindowInterface

// adds new child to Group
//WIDGET3D.Group.prototype.addChild= WIDGET3D.GroupBase.prototype.addChild;
// hides unfocused objects in Group
WIDGET3D.Group.prototype.hideNotFocused = WIDGET3D.GroupBase.prototype.hideNotFocused;
// removes object from Group
WIDGET3D.Group.prototype.removeFromObjects = WIDGET3D.GroupBase.prototype.removeFromObjects;

WIDGET3D.Group.prototype.show = WIDGET3D.GroupBase.prototype.show;

WIDGET3D.Group.prototype.hide = WIDGET3D.GroupBase.prototype.hide;

WIDGET3D.Group.prototype.add = function(child){

  if(WIDGET3D.GroupBase.prototype.add.call(this, child)){
    //Adding event listeners from this object
    this.addRelatedEventListeners(child);
    return this;
  }
  else{
    return false;
  }
}

//removes Group and it's children
WIDGET3D.Group.prototype.remove = function(){

  //children needs to be removed   
  while(this.children.length > 0){
    this.children[0].remove();
  }
  
  WIDGET3D.Widget.prototype.remove.call(this);
};

WIDGET3D.Group.prototype.addEventListener = function(name, callback, bubbles){
  
  WIDGET3D.GuiObject.prototype.addEventListener.call(this, name, callback, bubbles);

  for(var i = 0; i < this.children.length; ++i){
    this.children[i].addEventListener(name, callback, bubbles);
  }
  
  return this;
};

WIDGET3D.Group.prototype.removeEventListener = function(name, callback){

  WIDGET3D.GuiObject.prototype.removeEventListener.call(this, name, callback);

  for(var i = 0; i < this.children.length; ++i){
    this.children[i].removeEventListener(name, callback);
  }
  
  return this;
};

WIDGET3D.Group.prototype.removeEventListeners = function(name){

  for(var i = 0; i < this.events[name].length; ++i){
    var callback = this.events[name][i].callback;
        
    for(var k = 0; k < this.children.length; ++k){
      this.children[i].removeEventListener(name, callback);
    }
  }
  WIDGET3D.GuiObject.prototype.removeEventListeners.call(this, name);
  
  return this;
};

WIDGET3D.Group.prototype.removeAllListeners = function(){
  
  for(listener in this.events){
    if(this.events.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events[listener].length; ++i){
      
        var callback = this.events[listener][i].callback;
        
        for(var k = 0; k < this.children.length; ++k){
          this.children[i].removeEventListener(name, callback);
        }
      }
    }
  }
  WIDGET3D.GuiObject.prototype.removeAllListeners.call(this);
  
  return this;
};

WIDGET3D.Group.prototype.removeRelatedEventListeners = function(child){
  for(listener in this.events){
    if(this.events.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events[listener].length; ++i){
      
        var callback = this.events[listener][i].callback;
        
        child.removeEventListener(name, callback);
      }
    }
  }
  
  return this;
};

WIDGET3D.Group.prototype.addRelatedEventListeners = function(child){
  for(listener in this.events){
    if(this.events.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events[listener].length; ++i){
      
        var callback = this.events[listener][i].callback;
        var bubbles = this.events[listener][i].bubbles;
        
        child.addEventListener(name, callback);
      }
    }
  }
  return this;
};


//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR Group OBJECT
//--------------------------------------------------
WIDGET3D.Group.prototype.inheritance = function(){
  function WIDGET3DGroupPrototype(){};
  WIDGET3DGroupPrototype.prototype = this;
  var created = new WIDGET3DGroupPrototype();
  return created;
};


