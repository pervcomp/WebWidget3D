/*
Copyright (C) 2012 Anna-Liisa Mattila

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

WIDGET3D.EventType = {"onclick":0, "ondblclick":1, "onmousemove":2,
  "onmousedown":3, "onmouseup":4, "onmouseover":5, "onmouseout":6,
  "onkeydown":7, "onkeyup":8, "onkeypress":9};
  
WIDGET3D.NUMBER_OF_EVENTS = 10;

//Eventhandler abstraction for WIDGET3D's objects
// needs the gui's main window (root window)
//For mouse events uses mainwindows renderer as domElement!
WIDGET3D.DomEvents = function(collisionCallback, domElement){

  var _that_ = this;
  
  if(domElement){
    _that_.domElement_ = domElement;
  }
  else{
    _that_.domElement_ = document;
  }
  
  _that_.collisions_ = {
    callback: collisionCallback.callback,
    args: collisionCallback.args
  };
  
  _that_.enabled_ = [];
  
  for(var i = 0; i < WIDGET3D.NUMBER_OF_EVENTS; ++i){
    _that_.enabled_.push(false);
  }
  
  _that_.mouseEvent = function(domEvent, eventType){
    
    var hit = _that_.collisions_.callback(domEvent, eventType, _that_.collisions_.args);
    
    //mainwindow click detected
    if(!hit && WIDGET3D.mainWindow.events_[eventType].callback){

      WIDGET3D.mainWindow.events_[eventType].callback(domEvent,
        WIDGET3D.mainWindow.events_[eventType].arguments);
    }
    else if(hit && hit.events_[eventType].callback){
      
      hit.events_[eventType].callback(domEvent,
        hit.events_[eventType].arguments);
    }
  };
  
  _that_.keyboardEvent = function(domEvent, eventType){
    
    //first we call main windows onkeydown callback if there is one
    if(WIDGET3D.mainWindow.events_[eventType].callback){
      console.log("mainwindow event!");
      
      if(WIDGET3D.mainWindow.inFocus_){
        
        WIDGET3D.mainWindow.events_[eventType].callback(domEvent,
          WIDGET3D.mainWindow.events_[eventType].arguments);
      }
    }
    
    //then we check other objects
    for(var i = 0; i < WIDGET3D.mainWindow.childEvents_[eventType].length; ++i){
      if(WIDGET3D.mainWindow.childEvents_[eventType][i].inFocus_){

        WIDGET3D.mainWindow.childEvents_[eventType][i].events_[eventType].callback(domEvent,
          WIDGET3D.mainWindow.childEvents_[eventType][i].events_[eventType].arguments);
       }
      
    }
  };
  
  // Event listeners chatches events from DOM element.
  _that_.onclick = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onclick);
  };
  
  _that_.ondblclick = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.ondblclick);
  };
  
  _that_.onmousemove = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmousemove);
  };
  
  _that_.onmousedown = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmousedown);
  };
  
  _that_.onmouseup = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmouseup);
  };
  
  _that_.onmouseover = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmouseover);
  };
  
  _that_.onmouseout = function(domEvent){
    _that_.mouseEvent(domEvent, WIDGET3D.EventType.onmouseout);
  };
  
  _that_.onkeydown = function(domEvent){
    _that_.keyboardEvent(domEvent, WIDGET3D.EventType.onkeydown);
  };
  
  _that_.onkeyup = function(domEvent){
    _that_.keyboardEvent(domEvent, WIDGET3D.EventType.onkeyup);
  };
  
  _that_.onkeypress = function(domEvent){
    _that_.keyboardEvent(domEvent, WIDGET3D.EventType.onkeypress);
  };
};

// Enables event
WIDGET3D.DomEvents.prototype.enableEvent = function(event){

  switch(event){
  
    case WIDGET3D.EventType.onclick:
      this.domElement_.onclick = this.onclick;
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.ondblclick:
      this.domElement_.ondblclick = this.ondblclick;
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmousemove:
      this.domElement_.onmousemove = this.onmousemove;
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmousedown:
      this.domElement_.onmousedown = this.onmousedown;
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseup:
      this.domElement_.onmouseup = this.onmouseup;
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseover:
      this.domElement_.onmouseover = this.onmouseover;
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseout:
      this.domElement_.onmouseout = this.onmouseout;
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onkeydown:
      //keypress is allways detected in document
      document.onkeydown = this.onkeydown;
      this.enabled_[event] = true;
      break;
    
    case WIDGET3D.EventType.onkeyup:
      //keypress is allways detected in document
      document.onkeyup = this.onkeyup;
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onkeypress:
      //keypress is allways detected in document
      document.onkeypress = this.onkeypress;
      this.enabled_[event] = true;
      break;
      
    default:
      console.log("event types supported: ");
      console.log(WIDGET3D.EventType);
      return;
  }
};

// Disables event
WIDGET3D.DomEvents.prototype.disableEvent = function(event){
  console.log("Disabling events!");
  switch(event){
    case WIDGET3D.EventType.onclick:
      this.domElement_.onclick = null;
      this.enabled_[event] = false;
      break;
      
    case WIDGET3D.EventType.ondblclick:
      this.domElement_.ondblclick = null;
      this.enabled_[event] = false;
      break;
      
    case WIDGET3D.EventType.onmousemove:
      this.domElement_.onmousemove = null;
      this.enabled_[event] = false;
      break;
      
    case WIDGET3D.EventType.onmousedown:
      this.domElement_.onmousedown = null;
      this.enabled_[event] = false;
      break;
      
    case WIDGET3D.EventType.onmouseup:
      this.domElement_.onmouseup = null;
      this.enabled_[event] = false;
      break;
      
    case WIDGET3D.EventType.onmouseover:
      this.domElement_.onmouseover = null;
      this.enabled_[event] = false;
      break;
      
    case WIDGET3D.EventType.onmouseout:
      this.domElement_.onmouseout = null;
      this.enabled_[event] = false;
      break;
      
    case WIDGET3D.EventType.onkeydown:
      document.onkeydown = null;
      this.enabled_[event] = false;
      break;
    
    case WIDGET3D.EventType.onkeyup:
      document.onkeyup = null;
      this.enabled_[event] = false;
      break;
    
    case WIDGET3D.EventType.onkeypress:
      document.onkeypress = null;
      this.enabled_[event] = false;
      break;
      
    default:
      console.log("event types supported: ");
      console.log(WIDGET3D.EventType);
      return;
  }
};


