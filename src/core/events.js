/*
Copyright (C) 2012 Anna-Liisa Mattila / Deparment of Pervasive Computing, Tampere University of Technology

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//WIDGET 3D EVENTS
//---------------------------------------------
// DOM EVENTS
//--------------------------------------------


//Eventhandler abstraction for WIDGET3D's objects
// needs the gui's main window (root window)
WIDGET3D.DomEvents = function(collisionCallback){

  var that = this;
  
  var collisions_ = {
    callback: collisionCallback.callback,
    args: collisionCallback.args
  };
  
  that.enabled = {};
  
  //Function for checking the event prototype
  // if event is mouse event mouseEvent function is called
  // if it is a keyboard event keyboarEvent is called and
  // if the event is neither of these triggerEvent is called.
  that.mainEventHandler = function(domEvent){
  
    var proto = Object.getPrototypeOf(domEvent);
    
    if(proto.hasOwnProperty(String("initMouseEvent"))){
      that.mouseEvent(domEvent);
      return false;
    }
    else if(proto.hasOwnProperty(String("initKeyboardEvent"))){
      return that.keyboardEvent(domEvent);
    }
    else{
      that.triggerEvent(domEvent);
    }
    
  };
  
  that.mouseEvent = function(domEvent){
    
    var found = collisions_.callback(domEvent, collisions_.args);
    var name = domEvent.type;
    var mainWindow = WIDGET3D.getApplication();
    
    var bubbles = true;
    
    //Widget event listeners
    for(var i = 0; i < found.length; ++i){
      
      var hit = found[i];
    
      //hit can't be mainWindow because mainWindow doesn't have mesh
      if(hit && hit.events.hasOwnProperty(name.toString())){
        for(var k = 0; k < hit.events[name.toString()].length; ++k){
          
          //All the event handlers of the current object is to be called but
          //bubbling to other widgets is prevented.
          if(!hit.events[name.toString()][k].bubbles){
            bubbles = false;
          }
          
          hit.events[name.toString()][k].callback(domEvent);
        }
      }
      
      if(!bubbles){
        break;
      }
    }
    
    //if mainwindow has eventlistener it is executed also if bubbling is not prevented
    if(bubbles && mainWindow.events.hasOwnProperty(name.toString())){
      for(var j = 0; j < mainWindow.events[name.toString()].length; ++j){
      
        if(!mainWindow.events[name.toString()][j].bubbles){
          bubbles = false;
        }
        
        mainWindow.events[name.toString()][j].callback(domEvent);
      }
    }
    
    return bubbles;
  };
  
  //NOTICE KEYBOARD EVENTS DOESN'T CARE ON BUBBLES PARAMETER!
  that.keyboardEvent = function(domEvent){
    
    var name = domEvent.type;
    var mainWindow = WIDGET3D.getApplication();
    
    //Focused widgets get the event
    for(var k = 0; k < mainWindow.childEvents[name.toString()].length; ++k){
      if(mainWindow.childEvents[name.toString()][k] != mainWindow &&
        mainWindow.childEvents[name.toString()][k].inFocus)
      {
        var object = mainWindow.childEvents[name.toString()][k];
        
        for(var m = 0; m < object.events[name.toString()].length; ++m){
          object.events[name.toString()][m].callback(domEvent);
          
        }
      }
    }
    
    //TODO REFACTOR
    //If mainwindow handler wasn't called yet it will be called now.
    if(!mainWindow.inFocus){
      if(mainWindow.events.hasOwnProperty(name.toString())){      
        for(var l = 0; l < mainWindow.events[name.toString()].length; ++l){
          mainWindow.events[name.toString()][l].callback(domEvent);
        }
      }
    }
  };
  
  // This method can be used to trigger an event
  // if id is specified the event is passed to specific object
  // if the id isn't specified the event is passed to all objects
  // that has the listener for the event.
  //
  that.triggerEvent = function(event, id){
    var name = event.type;
    
    if(!id){
      
      var mainWindow = WIDGET3D.getApplication();
      
      for(var k = 0; k < mainWindow.childEvents[name.toString()].length; ++k){
        
        var object = mainWindow.childEvents[name.toString()][k];
        
        for(var m = 0; m < object.events[name.toString()].length; ++m){
          object.events[name.toString()][m].callback(event);
        }
      }
    }
    else{
      
      var to = WIDGET3D.getObjectById(id);
      for(var i = 0; i < to.events[name.toString()].length; ++i){
        to.events[name.toString()][i].callback(event);
      }
    }
  };

  
};

//Adds event listener to dom element
WIDGET3D.DomEvents.prototype.enableEvent = function(name){
  //if there is no property or if the property is false
  if(!this.enabled.hasOwnProperty(name.toString()) || 
    (this.enabled.hasOwnProperty(name.toString()) && this.enabled[name.toString()] === false))
  {
    window.addEventListener(name, this.mainEventHandler, false); 
    this.enabled[name.toString()] = true;
  }
};

//Removes event listener from dom element
WIDGET3D.DomEvents.prototype.disableEvent = function(name){

  if(this.enabled.hasOwnProperty(name.toString()) && this.enabled[name.toString()] === true){
    
    window.removeEventListener(name, this.mainEventHandler, false);
    
    this.enabled[name.toString()] = false;
    return true;
  }
  return false;
};

