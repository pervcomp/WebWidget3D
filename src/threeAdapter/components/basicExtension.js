//---------------------------------------------
// GUI OBJECT: BASIC EXTENSION FOR THREE.JS
//---------------------------------------------
//
//

//Vector3 basic operations
WIDGET3D.Basic.prototype.getPosition = function(){
  return this.mesh_.position;
};

WIDGET3D.Basic.prototype.getPositionX = function(){
  return this.mesh_.position.x;
};

WIDGET3D.Basic.prototype.getPositionY = function(){
  return this.mesh_.position.y;
};

WIDGET3D.Basic.prototype.getPositionZ = function(){
  return this.mesh_.position.z;
};

WIDGET3D.Basic.prototype.setPosition = function(x, y, z){
  
  this.mesh_.position.set(x,y,z);
};

WIDGET3D.Basic.prototype.setPositionX = function(x){
  this.mesh_.position.setX(x);
};

WIDGET3D.Basic.prototype.setPositionY = function(y){
  this.mesh_.position.setY(y);
};

WIDGET3D.Basic.prototype.setPositionZ = function(z){
  this.mesh_.position.setZ(z);
};

WIDGET3D.Basic.prototype.getRotation = function(){
  
  if(this.mehs_.useQuaternion){
    this.mesh_.rotation.setEulerFromQuaternion(this.mesh_.quaternion);
  }
  
  return this.mesh_.rotation;
};

WIDGET3D.Basic.prototype.getRotationX = function(){
  if(this.mehs_.useQuaternion){
    this.mesh_.rotation.setEulerFromQuaternion(this.mesh_.quaternion);
  }
  
  return this.mesh_.rotation.x;
};

WIDGET3D.Basic.prototype.getRotationY = function(){
  if(this.mehs_.useQuaternion){
    this.mesh_.rotation.setEulerFromQuaternion(this.mesh_.quaternion);
  }
  return this.mesh_.rotation.y;
};

WIDGET3D.Basic.prototype.getRotationZ = function(){
  if(this.mehs_.useQuaternion){
    this.mesh_.rotation.setEulerFromQuaternion(this.mesh_.quaternion);
  }
  return this.mesh_.rotation.z;
};

WIDGET3D.Basic.prototype.setRotation = function(rotX, rotY, rotZ){
  if(this.mesh_.useQuaternion){
    this.mesh_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.mesh_.eulerOrder);
  }
  this.mesh_.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Basic.prototype.setRotationX = function(rotX){
  if(this.mesh_.useQuaternion){
    var rotY = this.getRotationY();
    var rotZ = this.getRotationZ();
    this.mesh_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.mesh_.eulerOrder);
  }
  this.mesh_.rotation.setX(rotX);
};

WIDGET3D.Basic.prototype.setRotationY = function(rotY){
  if(this.mesh_.useQuaternion){
    var rotX = this.getRotationX();
    var rotZ = this.getRotationZ();
    this.mesh_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.mesh_.eulerOrder);
  }
  this.mesh_.rotation.setY(rotY);
};

WIDGET3D.Basic.prototype.setRotationZ = function(rotZ){
  if(this.mesh_.useQuaternion){
    var rotX = this.getRotationX();
    var rotY = this.getRotationY();
    this.mesh_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.mesh_.eulerOrder);
  }
  this.mesh_.rotation.setZ(rotZ);
};


//Object 3D actions
WIDGET3D.Basic.prototype.useQuaternion = function(){
  this.mesh_.useQuaternion = true;
};

WIDGET3D.Basic.prototype.setEulerOrder = function(order){
  this.mesh_.eulerOrder = order;
};

WIDGET3D.Basic.prototype.applyMatrix = function(matrix){
  this.mesh_.applyMatrix(matrix);
}

WIDGET3D.Basic.prototype.rotateOnAxis = function(axis, angle){
  this.mesh_.rotateOnAxis(axis, angle);
};

WIDGET3D.Basic.prototype.translateOnAxis = function(axis, distance){
  this.mesh_.translateOnAxis(axis, distance);
};

WIDGET3D.Basic.prototype.translateX = function(distance){
  this.mesh_.translateX(distance);
};

WIDGET3D.Basic.prototype.translateY = function(distance){
  this.mesh_.translateY(distance);
};

WIDGET3D.Basic.prototype.translateZ = function(distance){
  this.mesh_.translateZ(distance);
};

WIDGET3D.Basic.prototype.localToWorld = function(){
  return (this.mesh_.localToWorld());
};

WIDGET3D.Basic.prototype.worldToLocal = function(){
  return (this.mesh_.worldToLocal());
};

WIDGET3D.Basic.prototype.lookAt = function(vector){
  this.mesh_.lookAt(vector);
};

WIDGET3D.Basic.prototype.updateMatrix = function(){
  this.mesh_.updateMatrix();
};

WIDGET3D.Basic.prototype.updateMatrixWorld = function(){
  this.mesh_.updateMatrixWorld();
};

//Geometry properties

WIDGET3D.Basic.prototype.computeBoundingBox = function(){
  this.mesh_.geometry.computeBoundingBox();
  return this.getBoundingBox();
};

WIDGET3D.Basic.prototype.getBoundingBox = function(){
  return this.mesh_.geometry.boundingBox;
};

WIDGET3D.Basic.prototype.computeBoundingSphere = function(){
  this.mesh_.geometry.computeBoundingSphere();
  return this.getBoundingSphere();
};

WIDGET3D.Basic.prototype.getBoundingSphere = function(){
  return this.mesh_.geometry.boundingSphere;
};

