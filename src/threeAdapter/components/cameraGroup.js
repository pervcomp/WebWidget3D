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
  var rot = this.getRotation();
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

  WIDGET3D.Window.prototype.setLocation.call( this, x, y, z);
  this.camera_.position.set({x: x, y: y, z: z});
};

WIDGET3D.CameraGroup.prototype.setX = function(x){
  WIDGET3D.Window.prototype.setX.call( this, x);
  this.camera_.position.x = x;
};

WIDGET3D.CameraGroup.prototype.setY = function(y){
  WIDGET3D.Window.prototype.setY.call( this, y );
  this.camera_.position.y = y;
};

WIDGET3D.CameraGroup.prototype.setZ = function(z){
  WIDGET3D.Window.prototype.setZ.call( this, z );
  this.camera_.position.z = z;
};

//ROTATION
WIDGET3D.CameraGroup.prototype.setRotation = function(rotX, rotY, rotZ){
  
  WIDGET3D.Window.prototype.setRotation.call( this, x, y, z);
  this.camera_.rotation.set({x: rotX, y: rotY, z: rotZ});
};

WIDGET3D.CameraGroup.prototype.setRotationX = function(rotX){
  WIDGET3D.Window.prototype.setRotationX.call( this, x);
  this.camera_.rotation.x = rotX;
};

WIDGET3D.CameraGroup.prototype.setRotationY = function(rotY){
  WIDGET3D.Window.prototype.setRotationY.call( this, y);
  this.camera_.rotation.y = rotY;
};

WIDGET3D.CameraGroup.prototype.setRotationZ = function(rotZ){
  WIDGET3D.Window.prototype.setRotationZ.call( this, z);
  this.camera_.rotation.z = rotZ;
};
