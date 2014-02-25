//---------------------------------------------
// GUI OBJECT : generic abstract object
//---------------------------------------------

//There are ElementType amount of different kind of bjects
//with different properties that are inherited from thisObject.
//So this Object describes all properties and methods that are
//for all types of objects

//GUI OBJECT CONSTRUCTORS
WIDGET3D.GuiObject = function(){

  this.inFocus = false;
  this.id = WIDGET3D.id();
  
  this.updateCallbacks = [];
  
  this.events = {
  
    checkEvent : function(name){
      if(this.hasOwnProperty(name.toString()) && this[name.toString()] != false){
        return true;
      }
      else{
        return false;
      }
    },
    
    addCallback : function(name, callback, index){
      if(!this.hasOwnProperty(name.toString()) ||
      (this.hasOwnProperty(name.toString()) && this[name.toString()] === false))
      {
        this[name.toString()] = [];  
      }
      this[name.toString()].push({callback : callback, index : index});
    },
    
    removeCallback : function(name, callback){
      if(this.hasOwnProperty(name.toString()) &&
      Object.prototype.toString.apply(this[name.toString()]) === '[object Array]')
      {
        for(var i = 0; i < this[name.toString()].length; ++i){
          if(this[name.toString()][i].callback === callback){
            
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
    },
    
    remove : function(){
      var listeners = [];
      for(listener in this){
        if(this.hasOwnProperty(listener) &&
        Object.prototype.toString.apply(this[listener]) === '[object Array]')
        {
          var tmp = {name : listener, index: this[listener][0].index};
          listeners.push(tmp);
          listener = false;
        }
      }
      return listeners;
    }
  };
  
  WIDGET3D.addObject(this);
};

//set focus on object
WIDGET3D.GuiObject.prototype.focus = function(){
  if(!this.inFocus){
    this.inFocus = true;
    WIDGET3D.addFocus(this);
  }
  
  return this;
};

//unfocus object
WIDGET3D.GuiObject.prototype.unfocus = function(){
  if(this.inFocus){
    this.inFocus = false; 
    WIDGET3D.removeFocus(this);
  }
  return this;
};

// Adds event listner to object
// callback: callback function that is called when the event is triggered to object
//
WIDGET3D.GuiObject.prototype.addEventListener = function(name, callback){

  if(!WIDGET3D.getEvents().enabled[name.toString()]){
    WIDGET3D.getEvents().enableEvent(name);
  }
  if(!this.events.checkEvent(name)){
    var index = WIDGET3D.getApplication().childEvents.addObject(name, this);
  }
  else{
    var index = this.events[name.toString()][0].index;
  }
  
  this.events.addCallback(name, callback, index);
  
  return this;
};

// Removes eventlistener from object
// Parameters: event = event name
//             callback = binded callbackfunction
WIDGET3D.GuiObject.prototype.removeEventListener = function(name, callback){

  var index = this.events.removeCallback(name, callback);
  
  if(index === false){
    return false;
  }
  if(this.events[name.toString()] === false){
    var mainWindow = WIDGET3D.getApplication();
    
    mainWindow.childEvents[name.toString()].splice(index, 1);
    
    //if there were no events left lets disable event
    if(mainWindow.childEvents[name.toString()].length == 0){
      mainWindow.childEvents.removeEvent(name);
    }
    for(var i = 0; i < mainWindow.childEvents[name.toString()].length; ++i){
      mainWindow.childEvents[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

// Removes eventlisteners from object
WIDGET3D.GuiObject.prototype.removeEventListeners = function(name){
  var index = this.events.removeAll(name);
  if(index === false){
    return false;
  }
  else{
    var mainWindow = WIDGET3D.getApplication();
    
    mainWindow.childEvents[name.toString()].splice(index, 1);
    
    if(mainWindow.childEvents[name.toString()].length == 0){   
      mainWindow.childEvents.removeEvent(name);
    }
    
    for(var i = 0; i < mainWindow.childEvents[name.toString()].length; ++i){
      mainWindow.childEvents[name.toString()][i].setNewEventIndex(name, i);
    }
    
    return true;
  }
};

WIDGET3D.GuiObject.prototype.removeAllListeners = function(){
  var listeners = this.events.remove();
  
  var mainWindow = WIDGET3D.getApplication();
  for(var i = 0; i < listeners.length; ++i){
    var name = listeners[i].name;
    var index = listeners[i].index;
    
    mainWindow.childEvents[name].splice(index, 1);
    
    if(mainWindow.childEvents[name].length == 0){
      mainWindow.childEvents.removeEvent(name);
    }
    
    for(var k = 0; k < mainWindow.childEvents[name].length; ++k){
      mainWindow.childEvents[name][k].setNewEventIndex(name, k);
    }
  }
  return this;
}

WIDGET3D.GuiObject.prototype.setNewEventIndex = function(name, index){
  
  for(var i = 0; i < this.events[name.toString()].length; ++i){
    this.events[name.toString()][i].index = index;
  }
  WIDGET3D.getApplication().childEvents[name.toString()][index] = this;
}

WIDGET3D.GuiObject.prototype.addUpdateCallback = function(callback){
  this.updateCallbacks.push(callback);
  return this;
};

WIDGET3D.GuiObject.prototype.removeUpdateCallback = function(callback){
  for(var i = 0; i < this.updateCallbacks.length; ++i){
    if(this.updateCallbacks[i] === callback){
      this.updateCallbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

WIDGET3D.GuiObject.prototype.update = function(){
  for(var i = 0; i < this.updateCallbacks.length; ++i){
    this.updateCallbacks[i]();
  }
  return this;
};


//---------------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR ABSTRACT GUI OBJECT
//---------------------------------------------------------
WIDGET3D.GuiObject.prototype.inheritance = function(){
  function WIDGET3DObjectPrototype(){};
  WIDGET3DObjectPrototype.prototype = this;
  var created = new WIDGET3DObjectPrototype();
  return created;
};

