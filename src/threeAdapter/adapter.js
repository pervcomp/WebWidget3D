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

// three.js plugin for widget3D -library
//

var THREEJS_WIDGET3D = {

  initialized : false,
  
  
  //parameters:
  //    rensrer: THREE renderer object
  //      if renderer no specified width, height, antialias, domParent, clearColor and opacity can be given
  //
  //    camera: THREE camera object
  //      if camera not specified aspect, fow, near and far can be given
  //
  //    scene: THREE scene object
  //
  init : function(parameters){
  
    var renderer_;
    var camera_;
    var cameraGroup_;
    var scene_;
    var projector_;

    if(WIDGET3D != undefined && !THREEJS_WIDGET3D.initialized){
      var parameters = parameters || {};
      
      //seting the three.js renderer
      if(parameters.renderer){
        renderer_ = parameters.renderer;
      }
      else{
        //if there were no renderer given as a parameter, we create one
        var width = parameters.width !== undefined ? parameters.width : window.innerWidth;
        var height = parameters.height !== undefined ? parameters.height : window.innerHeight;
        
        var antialias = parameters.antialias !== undefined ? parameters.antialias : true;
        var domParent = parameters.domParent !== undefined ? parameters.domParent : document.body;
        
        renderer_ = new THREE.WebGLRenderer({antialias: antialias});
        renderer_.setSize( width, height );
        
        var clearColor = parameters.clearColor !== undefined ? parameters.clearColor : 0x333333;
        var opacity = parameters.opacity !== undefined ? parameters.opacity : 1;

        renderer_.setClearColor( clearColor, opacity );
        
        domParent.appendChild(renderer_.domElement);
      }
      
      //setting three.js camera
      if(parameters.camera){
        camera_ = parameters.camera;
      }
      else{        
        var aspect = parameters.aspect !== undefined ? parameters.aspect : (renderer_.domElement.width/renderer_.domElement.height);
        
        var fov = parameters.fov !== undefined ? parameters.fov : 75;
        var near = parameters.near !== undefined ? parameters.near : 1;
        var far = parameters.far !== undefined ? parameters.far : 10000;
        
        camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
      }
      
      scene_ = parameters.scene !== undefined ? parameters.scene : new THREE.Scene();
      
      var mainWindow = false;
      
      //initializing WIDGET3D
      if(!WIDGET3D.isInitialized()){
      
        mainWindow = WIDGET3D.init({
          collisionCallback: {callback: THREEJS_WIDGET3D.checkIfHits},
          container: THREE.Object3D,
          canvas: renderer_.domElement
        });
        
        if(!mainWindow){
          console.log("Widget3D init failed!");
          return false;
        }
      }
      else{
        mainWindow = WIDGET3D.getMainWindow();
      }
      
      scene_.add(mainWindow.container_);
      projector_ = new THREE.Projector();
      
      //Constructing camera group
      WIDGET3D.camera = new WIDGET3D.CameraGroup({camera : camera_});
      mainWindow.addChild(WIDGET3D.camera);
      
      //---------------------------------------------
      //CREATING RENDERING METHOD
      WIDGET3D.render = function(){
        //updating all objects
        var objects = WIDGET3D.getAllObjects();
        for(var i in objects){
          if(objects.hasOwnProperty(i)){
            objects[i].update();
          }
        }
        renderer_.render(scene_, camera_);
      };
      //---------------------------------------------
      
      //---------------------------------------------
      //CREATING RESIZEMETHOD
      //sets the renderer and camera parameters when window is resized
      //HAS TO BE IMPLICITILY CALLED
      WIDGET3D.setViewport = function(width, height, aspect){
        renderer_.setSize( width, height );
        camera_.aspect = aspect;
        camera_.updateProjectionMatrix();
        
      };
      //---------------------------------------------
      
      //---------------------------------------------
      //returns the renderer object
      WIDGET3D.getRenderer = function(){
        return renderer_;
      }
      //---------------------------------------------
      
      //returns three.js camera object
      WIDGET3D.getCamera = function(){
        return camera_;
      }
      
      //return WIDGET3D camera group object
      WIDGET3D.getCameraGroup = function(){
        return cameraGroup_;
      }
      
      //returns three.js projector
      WIDGET3D.getProjector = function(){
        return projector_;
      }
      
      //returns three.js scene
      WIDGET3D.getScene = function(){
        return scene_;
      }
      
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
    var ray = WIDGET3D.getProjector().pickingRay(vector, WIDGET3D.getCamera());
    
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

