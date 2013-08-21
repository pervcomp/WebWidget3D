//---------------------------------------------
// EXTENSION FOR THREE.JS TO WIDGET PROPERTIES
//---------------------------------------------
//
//
//Vector3 Widget operations
WIDGET3D.Widget.prototype.getPosition = function(){
  return this.object3D.position;
};

WIDGET3D.Widget.prototype.getPositionX = function(){
  return this.object3D.position.x;
};

WIDGET3D.Widget.prototype.getPositionY = function(){
  return this.object3D.position.y;
};

WIDGET3D.Widget.prototype.getPositionZ = function(){
  return this.object3D.position.z;
};

WIDGET3D.Widget.prototype.setPosition = function(x, y, z){
  this.object3D.position.set(x,y,z);
  return this;
};

WIDGET3D.Widget.prototype.setPositionX = function(x){
  this.object3D.position.setX(x);
  return this;
};

WIDGET3D.Widget.prototype.setPositionY = function(y){
  this.object3D.position.setY(y);
  return this;
};

WIDGET3D.Widget.prototype.setPositionZ = function(z){
  this.object3D.position.setZ(z);
  return this;
};

WIDGET3D.Widget.prototype.getRotation = function(){
  
  if(this.object3D.useQuaternion){
    this.object3D.rotation.setEulerFromQuaternion(this.object3D.quaternion);
  }
  
  return this.object3D.rotation;
};

WIDGET3D.Widget.prototype.getRotationX = function(){
  if(this.object3D.useQuaternion){
    this.object3D.rotation.setEulerFromQuaternion(this.object3D.quaternion);
  }
  
  return this.object3D.rotation.x;
};

WIDGET3D.Widget.prototype.getRotationY = function(){
  if(this.object3D.useQuaternion){
    this.object3D.rotation.setEulerFromQuaternion(this.object3D.quaternion);
  }
  return this.object3D.rotation.y;
};

WIDGET3D.Widget.prototype.getRotationZ = function(){
  if(this.object3D.useQuaternion){
    this.object3D.rotation.setEulerFromQuaternion(this.object3D.quaternion);
  }
  return this.object3D.rotation.z;
};

WIDGET3D.Widget.prototype.getRotationMatrix = function(){
  var m1 = new THREE.Matrix4();
  m1.extractRotation( this.object3D.matrix );
  
  return m1;
}

WIDGET3D.Widget.prototype.setRotation = function(rotX, rotY, rotZ){
  if(this.object3D.useQuaternion){
    this.object3D.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.object3D.eulerOrder);
  }
  this.object3D.rotation.set(rotX, rotY, rotZ);
  
  return this;
};

WIDGET3D.Widget.prototype.setRotationX = function(rotX){
  if(this.object3D.useQuaternion){
    var rotY = this.getRotationY();
    var rotZ = this.getRotationZ();
    this.object3D.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.object3D.eulerOrder);
  }
  this.object3D.rotation.setX(rotX);
  
  return this;
};

WIDGET3D.Widget.prototype.setRotationY = function(rotY){
  if(this.object3D.useQuaternion){
    var rotX = this.getRotationX();
    var rotZ = this.getRotationZ();
    this.object3D.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.object3D.eulerOrder);
  }
  this.object3D.rotation.setY(rotY);
  
  return this;
};

WIDGET3D.Widget.prototype.setRotationZ = function(rotZ){
  if(this.object3D.useQuaternion){
    var rotX = this.getRotationX();
    var rotY = this.getRotationY();
    this.object3D.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.object3D.eulerOrder);
  }
  this.object3D.rotation.setZ(rotZ);
  
  return this;
};


//Object 3D actions
WIDGET3D.Widget.prototype.useQuaternion = function(){
  this.object3D.useQuaternion = true;
  return this;
};

WIDGET3D.Widget.prototype.setEulerOrder = function(order){
  this.object3D.eulerOrder = order;
  return this;
};

WIDGET3D.Widget.prototype.applyMatrix = function(matrix){
  this.object3D.applyMatrix(matrix);
  return this;
}

WIDGET3D.Widget.prototype.rotateOnAxis = function(axis, angle){
  var rot = this.object3D.rotateOnAxis(axis, angle);
  return this;
};

WIDGET3D.Widget.prototype.translateOnAxis = function(axis, distance){
  this.object3D.translateOnAxis(axis, distance);
  return this;
};

WIDGET3D.Widget.prototype.translateX = function(distance){
  this.object3D.translateX(distance);
  return this;
};

WIDGET3D.Widget.prototype.translateY = function(distance){
  this.object3D.translateY(distance);
  return this;
};

WIDGET3D.Widget.prototype.translateZ = function(distance){
  this.object3D.translateZ(distance);
  return this;
};

WIDGET3D.Widget.prototype.localToWorld = function(vector){
  return (this.object3D.localToWorld(vector));
};

WIDGET3D.Widget.prototype.worldToLocal = function(vector){
  return (this.object3D.worldToLocal(vector));
};

WIDGET3D.Widget.prototype.lookAt = function(vector){
  this.object3D.lookAt(vector);
  return this;
};

WIDGET3D.Widget.prototype.updateMatrix = function(){
  this.object3D.updateMatrix();
  return this;
};

WIDGET3D.Widget.prototype.updateMatrixWorld = function(){
  this.object3D.updateMatrixWorld();
  return this;
};

//Geometry properties

WIDGET3D.Widget.prototype.computeBoundingBox = function(){
  this.object3D.geometry.computeBoundingBox();
  return this.getBoundingBox();
};

WIDGET3D.Widget.prototype.getBoundingBox = function(){
  return this.object3D.geometry.boundingBox;
};

WIDGET3D.Widget.prototype.computeBoundingSphere = function(){
  this.object3D.geometry.computeBoundingSphere();
  return this.getBoundingSphere();
};

WIDGET3D.Widget.prototype.getBoundingSphere = function(){
  return this.object3D.geometry.boundingSphere;
};

