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

//some kind of gui thing

WIDGET3D = {
  //Creating functions
  createFunctions : function(){
    //Some private variables inside a closure
    
    var focused_ = [];
    var allObjects_ = {};
    var application_;
    var container_;
    var events_;
    var canvas_;
    
    var initialized_ = false;
    
    var makeId = function(){
      var i = 0;
      return function(){
        return ++i;
      }
    };
    WIDGET3D.id = makeId();
      
    WIDGET3D.getEvents = function(){
      return events_;
    };
    
    WIDGET3D.getCanvas = function(){
      return canvas_;
    };
    
    WIDGET3D.getApplication = function(){
      return application_;
    };
    
    WIDGET3D.addObject = function(widget){
      allObjects_[(widget.id)] = widget;
    };
    
    WIDGET3D.removeObject = function(id){
      delete allObjects_[id];
    };
    
    WIDGET3D.getObjectById = function(id){
      return allObjects_[id];
    };
    
    WIDGET3D.getAllObjects = function(){
      return allObjects_;
    };
    
    WIDGET3D.getFocused = function(){
      return focused_;
    };
    
    WIDGET3D.addFocus = function(object){
      focused_.push(object);
    };
    
    WIDGET3D.removeFocus = function(object){
      for(var i = 0; i < focused_.length; ++i){
        if(focused_[i] === object){
          focused_.splice(i, 1);
          
          return true;
        }
      }
      return false;
    };
    
    WIDGET3D.unfocusFocused = function(){
      for(var i = 0; i < focused_.length; ++i){
        focused_[i].unfocus();
      }
      focused_ = [];
    };
    
    WIDGET3D.isInitialized = function(){
      return initialized_;
    };
    
    //Initializes the widget system core
    //
    //PARAMETERS:
    //  scene: Scene where gui objects are drawn. Meshes and containers are added here. Should provide add and remove
    //    methods.
    //
    //  collisionCallback: JSON object containing attributes callback and args (arguments for callback, optional).
    //    collisionCallback is used detecting mouse events on guiObjects. collisionCallback should return
    //    list of visible meshes which were hit by cursor or false if hit weren't occured.
    //
    //  container: object containing constructor method of container (descriped above).
    //  
    //  canvas : the canvas element where the WebGL context is rendered
    //
    //RETURNS:
    //  root window which is Application typed gui object.
    //
    WIDGET3D.init = function(parameters){
      
      var parameters = parameters || {};
      
      //INITIALIZING CODE
      
      //Container is a object that contains constructor method of container (eg. in three.js Object3D)
      // Container is used in group to manage it's childs. Container has to provide
      // add and remove methods for meshes and other containers it allso needs to provide
      // mutable position.x, position.y position.z and rotation.x, rotation.y, rotation.z values.
      // position value changes has to be inherited to containers children.
      // This interface is mandatory!!!
      if(parameters.container != undefined){
        WIDGET3D.Container = parameters.container;
      }
      else{
        console.log("Container must be specified!");
        console.log("Container has to be constructor method of container of used 3D-engine (eg. in three.js THREE.Object3D");
        console.log("Initializing WIDGET3D failed!");
        
        return false;
      }
      
      if(parameters.canvas != undefined){
        canvas_ = parameters.canvas;
      }
      else{
        console.log("Canvas must be specified!");
        console.log("Initializing WIDGET3D failed!");
        
        return false;
      }
      
      application_ = new WIDGET3D.Application();
      
      if(parameters.collisionCallback != undefined && 
      parameters.collisionCallback.callback != undefined){
      
        events_ = new WIDGET3D.DomEvents(parameters.collisionCallback);
      }
      else{
        console.log("CollisionCallback has to be JSON object containing attributes callback (and args, optional)");
        console.log("Initializing WIDGET3D failed!");
        
        return false;
      }
      
      initialized_ = true;
      
      return application_;
    }
  }
};
WIDGET3D.createFunctions();







