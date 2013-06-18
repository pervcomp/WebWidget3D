//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// CAMERA GROUP
//
// components that needs to follow camera are added to this group
//---------------------------------------------------
//
// PARAMETERS:  camera : 3D engine specific camera object
//
WIDGET3D.CameraGroup = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};
  
  this.camera_ = parameters.camera;
  this.container_.add(this.camera_);
};

WIDGET3D.CameraGroup.prototype = WIDGET3D.Group.prototype.inheritance();