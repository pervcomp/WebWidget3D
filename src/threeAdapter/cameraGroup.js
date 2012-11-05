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

//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// CAMERA GROUP
//
// components that needs to follow camera are added to
// this group and the coordinates given to added component
// are offset from the camera
//---------------------------------------------------
//
// PARAMETERS:  camera : three.js camera object
//
THREEJS_WIDGET3D.CameraGroup = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.camera_ = parameters.camera !== undefined ? parameters.camera : THREEJS_WIDGET3D.camera;
  this.camera_.position.set(0,0,0);
  this.container_.add(this.camera_);
};

THREEJS_WIDGET3D.CameraGroup.prototype = WIDGET3D.Window.prototype.inheritance();


//Adds the object to cameragroup.
//objects place is its offset from camera (camera is in origo when component is added)
THREEJS_WIDGET3D.CameraGroup.prototype.addChild = function(object){
  var rot = this.getRot();
  var loc = this.getLocation();
  
  var locO = object.getLocation();
  
  var newX = loc.x + locO.x;
  var newY = loc.y + locO.y;
  var newZ = loc.z + locO.z;
  
  console.log("CameraGroup location: ");
  console.log(loc);
  console.log("--------------------");
  
  object.setParent(this);
  object.setLocation(newX, newY, newZ);
  
  console.log("New object location: ");
  console.log(object.getLocation());
  console.log("--------------------");
  
  return object;
};

//setters for location and rotation

//LOCATION
THREEJS_WIDGET3D.CameraGroup.prototype.setLocation = function(x, y, z){

  this.container_.position.set({x: x, y: y, z: z});
  this.camera_.position.set({x: x, y: y, z: z});
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setX = function(x){
  this.container_.position.x = x;
  this.camera_.position.x = x;
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setY = function(y){
  this.container_.position.y = y;
  this.camera_.position.y = y;
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setZ = function(z){
  this.container_.position.z = z;
  this.camera_.position.z = z;
  WIDGET3D.mainWindow.needsUpdate();
};

//ROTATION
THREEJS_WIDGET3D.CameraGroup.prototype.setRot = function(rotX, rotY, rotZ){
  /*this.container_.rotation.x = rotX;
  this.container_.rotation.y = rotY;
  this.container_.rotation.z = rotZ;
  
  this.camera_.rotation.x = rotX;
  this.camera_.rotation.y = rotY;
  this.camera_.rotation.z = rotZ;*/
  
  this.container_.rotation.set({x: rotX, y: rotY, z: rotZ});
  this.camera_.rotation.set({x: rotX, y: rotY, z: rotZ});
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setRotX = function(rotX){
  this.container_.rotation.x = rotX;
  this.camera_.rotation.x = rotX;
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setRotY = function(rotY){
  this.container_.rotation.y = rotY;
  this.camera_.rotation.y = rotY;
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.CameraGroup.prototype.setRotZ = function(rotZ){
  this.container_.rotation.z = rotZ;
  this.camera_.rotation.z = rotZ;
  
  WIDGET3D.mainWindow.needsUpdate();
};
