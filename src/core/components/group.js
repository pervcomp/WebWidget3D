//---------------------------------------------
// GUI OBJECT: Group
//---------------------------------------------
// Basic Group that can has children.
// Extends WIDGET3D.Basic object.
//---------------------------------------------
WIDGET3D.Group = function(){
  //WIDGET3D.Basic.call( this );
  WIDGET3D.GuiObject.call( this );
  WIDGET3D.GroupBase.call( this );
   
  this.parent_;
};


//-----------------------------------------------------------------------------------------
// inheriting Group from Basic object
WIDGET3D.Group.prototype = WIDGET3D.Basic.prototype.inheritance();

//inheriting some methods from WindowInterface

// adds new child to Group
//WIDGET3D.Group.prototype.addChild= WIDGET3D.GroupBase.prototype.addChild;
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

WIDGET3D.Group.prototype.add = function(child){

  WIDGET3D.GroupBase.prototype.add.call(this, child);
  
  //Adding event listeners from this object
  this.addRelatedEventListeners(child);
}

// shows Group
WIDGET3D.Group.prototype.show = function(){

  if(!this.isVisible_){
    for(var i = 0; i < this.children_.length; ++i){
      this.children_[i].show();
    }
    this.isVisible_ = true;
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
  
  //container has to be removed from parent's container
  this.parent_.container_.remove(this.container_);
  //removing this from parents objects
  this.parent_.removeFromObjects(this);
  
  WIDGET3D.removeObject(this.id_);
};

WIDGET3D.Group.prototype.addEventListener = function(name, callback, bubbles){
  
  WIDGET3D.GuiObject.prototype.addEventListener.call(this, name, callback, bubbles);

  for(var i = 0; i < this.children_.length; ++i){
    this.children_[i].addEventListener(name, callback, bubbles);
  }
};

WIDGET3D.Group.prototype.removeEventListener = function(name, callback){

  WIDGET3D.GuiObject.prototype.removeEventListener.call(this, name, callback);

  for(var i = 0; i < this.children_.length; ++i){
    this.children_[i].removeEventListener(name, callback);
  }
};

WIDGET3D.Group.prototype.removeEventListeners = function(name){

  for(var i = 0; i < this.events_[name].length; ++i){
    var callback = this.events_[name][i].callback;
        
    for(var k = 0; k < this.children_.length; ++k){
      this.children_[i].removeEventListener(name, callback);
    }
  }
  
  WIDGET3D.GuiObject.prototype.removeEventListeners.call(this, name);
};

WIDGET3D.Group.prototype.removeAllListeners = function(){
  
  for(listener in this.events_){
    if(this.events_.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events_[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events_[listener].length; ++i){
      
        var callback = this.events_[listener][i].callback;
        
        for(var k = 0; k < this.children_.length; ++k){
          this.children_[i].removeEventListener(name, callback);
        }
      }
    }
  }
  
  WIDGET3D.GuiObject.prototype.removeAllListeners.call(this);
};

WIDGET3D.Group.prototype.removeRelatedEventListeners = function(child){
  for(listener in this.events_){
    if(this.events_.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events_[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events_[listener].length; ++i){
      
        var callback = this.events_[listener][i].callback;
        
        child.removeEventListener(name, callback);
      }
    }
  }
};

WIDGET3D.Group.prototype.addRelatedEventListeners = function(child){
  for(listener in this.events_){
    if(this.events_.hasOwnProperty(listener) &&
    Object.prototype.toString.apply(this.events_[listener]) === '[object Array]')
    {
      var name = listener;
      
      for(var i = 0; i < this.events_[listener].length; ++i){
      
        var callback = this.events_[listener][i].callback;
        var bubbles = this.events_[listener][i].bubbles;
        
        child.addEventListener(name, callback);
      }
    }
  }
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


