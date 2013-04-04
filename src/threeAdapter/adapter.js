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

// three.js plugin for widget3D -library
//

var THREEJS_WIDGET3D = {

  initialized : false,
  
  init : function(parameters){

    if(WIDGET3D != undefined && !THREEJS_WIDGET3D.initialized){
      var parameters = parameters || {};
      
      //seting the three.js renderer
      if(parameters.renderer){
        WIDGET3D.renderer = parameters.renderer;
      }
      else{
        //if there were no renderer given as a parameter, we create one
        var width = parameters.width !== undefined ? parameters.width : window.innerWidth;
        var height = parameters.height !== undefined ? parameters.height : window.innerHeight;
        
        var antialias = parameters.antialias !== undefined ? parameters.antialias : true;
        var domParent = parameters.domParent !== undefined ? parameters.domParent : document.body;
        
        WIDGET3D.renderer = new THREE.WebGLRenderer({antialias: antialias});
        WIDGET3D.renderer.setSize( width, height );
        
        var clearColor = parameters.clearColor !== undefined ? parameters.clearColor : 0x333333;
        var opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
        
        WIDGET3D.renderer.setClearColorHex( clearColor, opacity );
        
        domParent.appendChild(WIDGET3D.renderer.domElement);
      }
      
      //setting three.js camera
      var camera = parameters.camera !== undefined ? parameters.camera  : 
        new THREE.PerspectiveCamera(75, 
          WIDGET3D.renderer.domElement.width / WIDGET3D.renderer.domElement.height,
          1, 10000);
      
      WIDGET3D.scene = parameters.scene !== undefined ? parameters.scene : new THREE.Scene();
      
      var mainWindow = false;
      
      //initializing WIDGET3D
      if(!WIDGET3D.isInitialized()){
      
        mainWindow = WIDGET3D.init({collisionCallback: {callback: THREEJS_WIDGET3D.checkIfHits},
          container: THREE.Object3D,
          domElement: WIDGET3D.renderer.domElement});
        
        if(!mainWindow){
          console.log("Widget3D init failed!");
          return false;
        }
      }
      else{
        mainWindow = WIDGET3D.getMainWindow();
      }
      
      WIDGET3D.scene.add(mainWindow.container_);
      
      WIDGET3D.projector = new THREE.Projector();
      WIDGET3D.camera = new WIDGET3D.CameraGroup({camera : camera});
      
      mainWindow.addChild(WIDGET3D.camera);
      
      //---------------------------------------------
      //CREATING RENDERING METHOD
      WIDGET3D.render = function(){
        //if object is a window, this won't work...
        //if I wanted this to work I had to call in windows update method it's childrens update.
        //maybe a update list?
        for(var i = 0; i < mainWindow.children_.lenght; +i){
          mainWindow.children_[i].update();
        }
        WIDGET3D.renderer.render(WIDGET3D.scene, WIDGET3D.camera.camera_);
      };
      //---------------------------------------------
      
      THREEJS_WIDGET3D.initialized = true;
      
      return mainWindow;
    }
    else{
      console.log("nothing to init");
      return WIDGET3D.getMainWindow();
    }
  },
  
  checkIfHits : function(event){
  
    var mouse = WIDGET3D.mouseCoordinates(event);
    
    var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
    var ray = WIDGET3D.projector.pickingRay(vector, WIDGET3D.camera.camera_);
    
    //intersects checks now all the meshes in scene. It might be good to construct
    // a datastructure that contains meshes of mainWindow.childEvents_.event array content
    var intersects = ray.intersectObjects(WIDGET3D.getMainWindow().meshes_);
    
    var closest = false;
    
    if(intersects.length > 0){
      //finding closest
      //closest object is the first visible object in intersects
      for(var m = 0; m < intersects.length; ++m){
        
        if(intersects[m].object.visible){
          closest = intersects[m].object;
          var inv = new THREE.Matrix4();
          inv.getInverse(intersects[m].object.matrixWorld);
          
          //position where the click happened in object coordinates
          var objPos = intersects[m].point.clone().applyProjection(inv);
          var found = THREEJS_WIDGET3D.findObject(closest, event.type);
          
          if(found){
            //Info about object and world coordinates are atached to
            //the event object so that the data may be used in eventhandlers like
            //controls.
            event.objectCoordinates = objPos;
            event.worldCoordinates = intersects[m].point;
          }
          return found;
        }
      }
    }
    return false;
  },
  
  findObject : function(mesh, name){
  
    var mainWindow = WIDGET3D.getMainWindow();
    
    for(var i = 0; i < mainWindow.childEvents_[name.toString()].length; ++i){
      
      // if the object is not visible it can be the object hit
      // because it's not in the scene.
      if(mainWindow.childEvents_[name.toString()][i].isVisible_){
        
        // If the object is the one we hit, we return the object
        if(mesh === mainWindow.childEvents_[name.toString()][i].mesh_){
          
          return mainWindow.childEvents_[name.toString()][i];
          
        }//if right object
        
      }//if visible
    }//for child events loop
    return false;
  }
};

WIDGET3D.createMainWindow_THREE = THREEJS_WIDGET3D.init;

