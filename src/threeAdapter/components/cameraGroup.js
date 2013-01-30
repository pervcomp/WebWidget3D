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
WIDGET3D.CameraGroup = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.camera_ = parameters.camera !== undefined ? parameters.camera : WIDGET3D.camera;
  this.camera_.position.set(0,0,0);
  this.container_.add(this.camera_);
};

WIDGET3D.CameraGroup.prototype = WIDGET3D.Window.prototype.inheritance();


//Adds the object to cameragroup.
//objects place is its offset from camera (camera is in origo when component is added)
WIDGET3D.CameraGroup.prototype.addChild = function(object, distance){
  var rot = this.getRot();
  var loc = this.getLocation();
  
  var distance = distance || {};
  
  var x = distance.x !== undefined ? distance.x : 0;
  var y = distance.y !== undefined ? distance.y : 0;
  var z = distance.z !== undefined ? distance.z : 0;
  
  var newX = loc.x + x;
  var newY = loc.y + y;
  var newZ = loc.z + z;
  
  object.setLocation(newX, newY, newZ);
  object.setParent(this);
  
  return object;
};

//setters for location and rotation

//LOCATION
WIDGET3D.CameraGroup.prototype.setLocation = function(x, y, z){

  this.container_.position.set({x: x, y: y, z: z});
  this.camera_.position.set({x: x, y: y, z: z});
};

WIDGET3D.CameraGroup.prototype.setX = function(x){
  this.container_.position.x = x;
  this.camera_.position.x = x;
};

WIDGET3D.CameraGroup.prototype.setY = function(y){
  this.container_.position.y = y;
  this.camera_.position.y = y;
};

WIDGET3D.CameraGroup.prototype.setZ = function(z){
  this.container_.position.z = z;
  this.camera_.position.z = z;
};

//ROTATION
WIDGET3D.CameraGroup.prototype.setRot = function(rotX, rotY, rotZ){
  
  this.container_.rotation.set({x: rotX, y: rotY, z: rotZ});
  this.camera_.rotation.set({x: rotX, y: rotY, z: rotZ});
};

WIDGET3D.CameraGroup.prototype.setRotX = function(rotX){
  this.container_.rotation.x = rotX;
  this.camera_.rotation.x = rotX;
};

WIDGET3D.CameraGroup.prototype.setRotY = function(rotY){
  this.container_.rotation.y = rotY;
  this.camera_.rotation.y = rotY;
};

WIDGET3D.CameraGroup.prototype.setRotZ = function(rotZ){
  this.container_.rotation.z = rotZ;
  this.camera_.rotation.z = rotZ;
};
