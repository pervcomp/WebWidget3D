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
  
  this.camera = parameters.camera;
  this.object3D.add(this.camera);
};

WIDGET3D.CameraGroup.prototype = WIDGET3D.Group.prototype.inheritance();