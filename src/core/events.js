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

WIDGET3D.EventTable = {

  addEvent : function(name){
    if(!this.name){
      this.name = [];
      return true;
    }
    return false;
  },
  
  addCallback : function(event, callback, arguments, object){
    if(this.event){
      this.event.push({callback : callback, arguments : arguments, object : object});
      return (this.event.length-1);
    }
    return false;
  }
};

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

    if(hit && hit.events_[eventType].length != 0){
      for(var k = 0; k < hit.events_[eventType].length; ++k){
        hit.events_[eventType][k].callback(domEvent,
          hit.events_[eventType][k].arguments);
      }
    }
    //if mainwindow has eventlistener it is executed also
    if(WIDGET3D.mainWindow.events_[eventType].length != 0){
      for(var j = 0; j < WIDGET3D.mainWindow.events_[eventType].length; ++j){
        WIDGET3D.mainWindow.events_[eventType][j].callback(domEvent,
          WIDGET3D.mainWindow.events_[eventType][j].arguments);
      }
    }
  };
  
  _that_.keyboardEvent = function(domEvent, eventType){
    
    //first we call main windows onkeydown callback if there is one
    if(WIDGET3D.mainWindow.events_[eventType].length != 0){
      console.log("mainwindow event!");
      
      if(WIDGET3D.mainWindow.inFocus_){
        
        for(var l = 0; l < WIDGET3D.mainWindow.events_[eventType].length; ++l){
          WIDGET3D.mainWindow.events_[eventType][l].callback(domEvent,
            WIDGET3D.mainWindow.events_[eventType][l].arguments);
        }
      }
    }
    
    //then we check other objects
    for(var k = 0; k < WIDGET3D.mainWindow.childEvents_[eventType].length; ++k){
      if(WIDGET3D.mainWindow.childEvents_[eventType][k].inFocus_){
        var object = WIDGET3D.mainWindow.childEvents_[eventType][k];
        
        for(var m = 0; m < object.events_[eventType].length; ++m){
          object.events_[eventType][m].callback(domEvent,
            object.events_[eventType][m].arguments);
          
        }
      }
    }
  };
  
  _that_.onEvent = function(event){
    if(event.button){
      _that_.mouseEvent(event);
    }
    else{
      _that_.keyboardEvent(event);
    }
  }
  
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
      this.domElement_.addEventListener('click',this.onclick,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.ondblclick:
      this.domElement_.addEventListener('dblclick',this.ondblclick,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmousemove:
      this.domElement_.addEventListener('mousemove',this.onmousemove,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmousedown:
      this.domElement_.addEventListener('mousedown',this.onmousedown,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseup:
      this.domElement_.addEventListener('mouseup',this.onmouseup,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseover:
      this.domElement_.addEventListener('mouseover',this.onmouseover,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onmouseout:
      this.domElement_.addEventListener('mouseout',this.onmouseout,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onkeydown:
      //keypress is allways detected in document
      document.addEventListener('keydown',this.onkeydown,false);
      this.enabled_[event] = true;
      break;
    
    case WIDGET3D.EventType.onkeyup:
      //keypress is allways detected in document
      document.addEventListener('keyup',this.onkeyup,false);
      this.enabled_[event] = true;
      break;
      
    case WIDGET3D.EventType.onkeypress:
      //keypress is allways detected in document
      document.addEventListener('keypress',this.onkeypress,false);
      this.enabled_[event] = true;
      break;
      
    default:
      console.log("event types supported: ");
      console.log(WIDGET3D.EventType);
      return;
  }
};


