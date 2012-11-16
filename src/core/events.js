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
  
  _that_.enabled_ = {};
  
  _that_.mouseEvent = function(domEvent){
    
    var hit = _that_.collisions_.callback(domEvent, _that_.collisions_.args);
    
    var name = domEvent.type;

    if(hit && hit.events_[name.toString()].length != 0){
      for(var k = 0; k < hit.events_[name.toString()].length; ++k){
        hit.events_[name.toString()][k].callback(domEvent,
          hit.events_[name.toString()][k].arguments);
      }
    }
    //if mainwindow has eventlistener it is executed also
    if(WIDGET3D.mainWindow.events_[name.toString()].length != 0){
      for(var j = 0; j < WIDGET3D.mainWindow.events_[name.toString()].length; ++j){
        WIDGET3D.mainWindow.events_[name.toString()][j].callback(domEvent,
          WIDGET3D.mainWindow.events_[name.toString()][j].arguments);
      }
    }
  };
  
  _that_.keyboardEvent = function(domEvent){
    
    var name = domEvent.type;
    //first we call main windows onkeydown callback if there is one
    if(WIDGET3D.mainWindow.events_[name.toString()].length != 0){
      console.log("mainwindow event!");
      
      if(WIDGET3D.mainWindow.inFocus_){
        
        for(var l = 0; l < WIDGET3D.mainWindow.events_[name.toString()].length; ++l){
          WIDGET3D.mainWindow.events_[name.toString()][l].callback(domEvent,
            WIDGET3D.mainWindow.events_[name.toString()][l].arguments);
        }
      }
    }
    
    //then we check other objects
    for(var k = 0; k < WIDGET3D.mainWindow.childEvents_[name.toString()].length; ++k){
      if(WIDGET3D.mainWindow.childEvents_[name.toString()][k].inFocus_){
        var object = WIDGET3D.mainWindow.childEvents_[name.toString()][k];
        
        for(var m = 0; m < object.events_[name.toString()].length; ++m){
          object.events_[name.toString()][m].callback(domEvent,
            object.events_[name.toString()][m].arguments);
          
        }
      }
    }
  };
  
  _that_.onEvent = function(event){
    console.log(WIDGET3D.mainWindow.childEvents_);
    if(event.type != "keyup" || event.type != "keydown" || event.type != "keypress"){
      _that_.mouseEvent(event);
    }
    else{
      _that_.keyboardEvent(event);
    }
  }

};

//Enables event
WIDGET3D.DomEvents.prototype.enableEvent = function(name){
  this.domElement_.addEventListener(name, this.onEvent, false);
  this.enabled_[name.toString()] = true;
  console.log(this.enabled_);
  WIDGET3D.mainWindow.childEvents_.addEvent(name);
}

//TODO: DISABLE EVENT


