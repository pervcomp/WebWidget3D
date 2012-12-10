//---------------------------------------------
// GUI OBJECT : generic abstract object
//---------------------------------------------

//There are ElementType amount of different kind of bjects
//with different properties that are inherited from thisObject.
//So this Object describes all properties and methods that are
//for all types of objects

//GUI OBJECT CONSTRUCTORS
WIDGET3D.GuiObject = function(){
  this.isVisible_ = true;
  this.inFocus_ = false;
  
  this.events_ = {
  
    checkEvent : function(name){
      if(this.hasOwnProperty(name.toString()) && this[name.toString()] != false){
        return true;
      }
      else{
        return false;
      }
    },
    
    addCallback : function(name, callback, arguments, index){
      if(!this.hasOwnProperty(name.toString()) ||
      (this.hasOwnProperty(name.toString()) && this[name.toString()] === false))
      {
        this[name.toString()] = [];  
      }
      this[name.toString()].push({callback : callback, arguments : arguments, index : index});
    },
    
    removeCallback : function(name, callback, arguments){
      if(this.hasOwnProperty(name.toString()) &&
      Object.prototype.toString.apply(this[name.toString()]) === '[object Array]')
      {
        for(var i = 0; i < this[name.toString()].length; ++i){
          if(this[name.toString()][i].callback === callback && this[name.toString()][i].arguments === arguments){
            
            var index = this[name.toString()][i].index;
            this[name.toString()].splice(i, 1);

            if(this[name.toString()].length == 0){
              this[name.toString()] = false;
            }
            return index;
          }
        }
      }
      return false;
    },
    
    removeAll : function(name){
    
      if(this.hasOwnProperty(name.toString()) &&
      Object.prototype.toString.apply(this[name.toString()]) === '[object Array]')
      {
        var index = this[name.toString()][0].index;
        this[name.toString()] = false;
        return index;
      }
      
      return false;
    }
  };
  
};

//TODO: FIX SO THAT MULTIPLE TARGETS CAN BE FOCUSED
//set focus on object
WIDGET3D.GuiObject.prototype.focus = function(){
  if(!this.inFocus_){
  
    WIDGET3D.unfocusFocused();
    this.inFocus_ = true;
    WIDGET3D.addFocus(this);
    
  }
};

//unfocus object
//TODO FIX
WIDGET3D.GuiObject.prototype.unfocus = function(){
  if(this.inFocus_){
    this.inFocus_ = false; 
  }
};

// Adds event listner to object
// callback: callback function that is called when the event is triggered to object
// (args: arguments for callback)
//
// NOTE: event object IS ALLWAYS PASSED TO CALLBACKFUNCTION AS ITS FIRST ARGUMENT
//
WIDGET3D.GuiObject.prototype.addEventListener = function(name, callback, args){

  if(!WIDGET3D.getEvents().enabled_[name.toString()]){
    WIDGET3D.getEvents().enableEvent(name);
  }
  if(!this.events_.checkEvent(name)){    
    var index = WIDGET3D.getMainWindow().childEvents_.addObject(name, this);
  }
  else{
    var index = this.events_[name.toString()][0].index;
  }
  this.events_.addCallback(name, callback, args, index);
};

// Removes eventlistener from object
// Parameters: event = event name
//             callback = binded callbackfunction
//             args = binded arguments for callback
//             custom = boolean flag that tells if the event is dom event or custom event (message)
WIDGET3D.GuiObject.prototype.removeEventListener = function(name, callback, args){

  var index = this.events_.removeCallback(name, callback, args);
  
  if(index === false){
    return false;
  }
  if(this.events_[name.toString()] === false){
    //WIDGET3D.mainWindow.childEvents_[name.toString()].splice(index, 1);
    WIDGET3D.getMainWindow().childEvents_[name.toString()].splice(index, 1);
    
    //if there were no events left lets disable event
    /*if(WIDGET3D.mainWindow.childEvents_[name.toString()].length == 0){
      WIDGET3D.mainWindow.childEvents_.removeEvent(name);
    }*/
    
    if(WIDGET3D.getMainWindow().childEvents_[name.toString()].length == 0){
      WIDGET3D.getMainWindow().childEvents_.removeEvent(name);
    }
    
    /*for(var i = 0; i < WIDGET3D.mainWindow.childEvents_[name.toString()].length; ++i){
      WIDGET3D.mainWindow.childEvents_[name.toString()][i].setNewEventIndex(name, i);
    }*/
    
    for(var i = 0; i < WIDGET3D.getMainWindow().childEvents_[name.toString()].length; ++i){
      WIDGET3D.getMainWindow().childEvents_[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

// Removes eventlisteners from object
WIDGET3D.GuiObject.prototype.removeEventListeners = function(name){
  console.log("removing event: "+name);
  var index = this.events_.removeAll(name);
  if(index === false){
    return false;
  }
  else{
    var mainWindow = WIDGET3D.getMainWindow();
    
    mainWindow.childEvents_[name.toString()].splice(index, 1);
    
    if(mainWindow.childEvents_[name.toString()].length == 0){   
      mainWindow.childEvents_.removeEvent(name);
    }
    
    for(var i = 0; i < mainWindow.childEvents_[name.toString()].length; ++i){
      mainWindow.childEvents_[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

WIDGET3D.GuiObject.prototype.setNewEventIndex = function(name, index){
  
  for(var i = 0; i < this.events_[name.toString()].length; ++i){
    this.events_[name.toString()][i].index = index;
  }
  WIDGET3D.getMainWindow().childEvents_[name.toString()][index] = this;
}

WIDGET3D.GuiObject.prototype.addUpdateCallback = function(callback, args){ 
  this.updateCallback_ = {callback: callback, arguments: args};
};

WIDGET3D.GuiObject.prototype.update = function(){
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
};


//---------------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR ABSTRACT GUI OBJECT
//---------------------------------------------------------
WIDGET3D.GuiObject.prototype.inheritance = function(){
  function guiObjectPrototype(){}
  guiObjectPrototype.prototype = this;
  var created = new guiObjectPrototype();
  return created;
};