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

var THREEJS_WIDGET3D = {};
  
THREEJS_WIDGET3D.initialized = false;

THREEJS_WIDGET3D.Container = THREE.Object3D;

THREEJS_WIDGET3D.init = function(parameters){

  if(WIDGET3D != undefined && !THREEJS_WIDGET3D.initialized){
    
    var parameters = parameters || {};
    
    if(parameters.renderer){
      THREEJS_WIDGET3D.renderer = parameters.renderer;
    }
    else{
      //if there were no renderer given as a parameter, we create one
      var width = parameters.width !== undefined ? parameters.width : window.innerWidth;
      var height = parameters.height !== undefined ? parameters.height : window.innerHeight;
      
      var antialias = parameters.antialias !== undefined ? parameters.antialias : true;
      var domParent = parameters.domParent !== undefined ? parameters.domParent : document.body;
      
      THREEJS_WIDGET3D.renderer = new THREE.WebGLRenderer({antialias: antialias});
      THREEJS_WIDGET3D.renderer.setSize( width, height );
      
      var clearColor = parameters.clearColor !== undefined ? parameters.clearColor : 0x333333;
      var opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
      
      THREEJS_WIDGET3D.renderer.setClearColorHex( clearColor, opacity );
      
      domParent.appendChild(THREEJS_WIDGET3D.renderer.domElement);
    }
    
    THREEJS_WIDGET3D.camera = parameters.camera !== undefined ? parameters.camera  : 
      new THREE.PerspectiveCamera(75, 
      THREEJS_WIDGET3D.renderer.domElement.width / THREEJS_WIDGET3D.renderer.domElement.height,
      1, 10000);
    
    THREEJS_WIDGET3D.scene = parameters.scene !== undefined ? parameters.scene : new THREE.Scene();
    
    var mainWindow = false;
    
    if(!WIDGET3D.isInitialized()){
    
      mainWindow = WIDGET3D.init({collisionCallback: {callback: THREEJS_WIDGET3D.checkIfHits},
        container: THREE.Object3D,
        domElement: THREEJS_WIDGET3D.renderer.domElement});
      
      if(!mainWindow){
        console.log("Widget3D init failed!");
        return false;
      }
    }
    else{
      mainWindow = WIDGET3D.getMainWindow();
    }
    
    THREEJS_WIDGET3D.mainWindow = mainWindow;
    
    THREEJS_WIDGET3D.scene.add(THREEJS_WIDGET3D.mainWindow.container_);
    
    THREEJS_WIDGET3D.projector = new THREE.Projector();
    
    THREEJS_WIDGET3D.initialized = true;
    
    return mainWindow;
  }
};

THREEJS_WIDGET3D.checkIfHits = function(event, eventType){

  if(!THREEJS_WIDGET3D.initialized){
    console.log("THREEJS_WIDGET3D is not initialized!");
    console.log("To initialize THREEJS_WIDGET3D: THREEJS_WIDGET3D.init()");
    return false;
  }

  var mouse = WIDGET3D.mouseCoordinates(event);
  
  var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
  var ray = THREEJS_WIDGET3D.projector.pickingRay(vector, THREEJS_WIDGET3D.camera);
  
  //intersects checks now all the meshes in scene. It might be good to construct
  // a datastructure that contains meshes of mainWindow.childEvents_[eventType] arrays content
  var intersects = ray.intersectObjects(THREEJS_WIDGET3D.mainWindow.meshes_);
  
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
        var objPos = inv.multiplyVector3(intersects[m].point.clone());
        
        var found = THREEJS_WIDGET3D.findObject(closest, eventType);
        
        if(found){
          //found.mousePosition_ = objPos;
          //found.worldPosition_ = intersects[m].point;
          
          event.objectCoordinates = objPos;
          event.worldCoordinates = intersects[m].point;
        }

        return found;
      }
    }
  }
  return false;
};

THREEJS_WIDGET3D.findObject = function(mesh, eventType){

  for(var i = 0; i < THREEJS_WIDGET3D.mainWindow.childEvents_[eventType].length; ++i){
    
    // if the object is not visible it can be the object hit
    // because it's not in the scene.
    if(THREEJS_WIDGET3D.mainWindow.childEvents_[eventType][i].isVisible_){
      
      // If the object is the one we hit, we return the object
      if(mesh === THREEJS_WIDGET3D.mainWindow.childEvents_[eventType][i].mesh_){
        
        return THREEJS_WIDGET3D.mainWindow.childEvents_[eventType][i];
        
      }//if right object
      
    }//if visible
  }//for child events loop
  return false;
};

THREEJS_WIDGET3D.render = function(){
  THREEJS_WIDGET3D.renderer.render(THREEJS_WIDGET3D.scene, THREEJS_WIDGET3D.camera);
};