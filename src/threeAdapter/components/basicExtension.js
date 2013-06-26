//---------------------------------------------
// GUI OBJECT: BASIC EXTENSION FOR THREE.JS
//---------------------------------------------
//
//

//Vector3 basic operations
WIDGET3D.Basic.prototype.getPosition = function(){
  return this.container.position;
};

WIDGET3D.Basic.prototype.getPositionX = function(){
  return this.container.position.x;
};

WIDGET3D.Basic.prototype.getPositionY = function(){
  return this.container.position.y;
};

WIDGET3D.Basic.prototype.getPositionZ = function(){
  return this.container.position.z;
};

WIDGET3D.Basic.prototype.setPosition = function(x, y, z){
  
  this.container.position.set(x,y,z);
};

WIDGET3D.Basic.prototype.setPositionX = function(x){
  this.container.position.setX(x);
};

WIDGET3D.Basic.prototype.setPositionY = function(y){
  this.container.position.setY(y);
};

WIDGET3D.Basic.prototype.setPositionZ = function(z){
  this.container.position.setZ(z);
};

WIDGET3D.Basic.prototype.getRotation = function(){
  
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  
  return this.container.rotation;
};

WIDGET3D.Basic.prototype.getRotationX = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  
  return this.container.rotation.x;
};

WIDGET3D.Basic.prototype.getRotationY = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.y;
};

WIDGET3D.Basic.prototype.getRotationZ = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.z;
};

WIDGET3D.Basic.prototype.getRotationMatrix = function(){
  var m1 = new THREE.Matrix4();
  m1.extractRotation( this.container.matrix );
  
  return m1;
}

WIDGET3D.Basic.prototype.setRotation = function(rotX, rotY, rotZ){
  if(this.container.useQuaternion){
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Basic.prototype.setRotationX = function(rotX){
  if(this.container.useQuaternion){
    var rotY = this.getRotationY();
    var rotZ = this.getRotationZ();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setX(rotX);
};

WIDGET3D.Basic.prototype.setRotationY = function(rotY){
  if(this.container.useQuaternion){
    var rotX = this.getRotationX();
    var rotZ = this.getRotationZ();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setY(rotY);
};

WIDGET3D.Basic.prototype.setRotationZ = function(rotZ){
  if(this.container.useQuaternion){
    var rotX = this.getRotationX();
    var rotY = this.getRotationY();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setZ(rotZ);
};


//Object 3D actions
WIDGET3D.Basic.prototype.useQuaternion = function(){
  this.container.useQuaternion = true;
};

WIDGET3D.Basic.prototype.setEulerOrder = function(order){
  this.container.eulerOrder = order;
};

WIDGET3D.Basic.prototype.applyMatrix = function(matrix){
  this.container.applyMatrix(matrix);
}

WIDGET3D.Basic.prototype.rotateOnAxis = function(axis, angle){
  this.container.rotateOnAxis(axis, angle);
};

WIDGET3D.Basic.prototype.translateOnAxis = function(axis, distance){
  this.container.translateOnAxis(axis, distance);
};

WIDGET3D.Basic.prototype.translateX = function(distance){
  this.container.translateX(distance);
};

WIDGET3D.Basic.prototype.translateY = function(distance){
  this.container.translateY(distance);
};

WIDGET3D.Basic.prototype.translateZ = function(distance){
  this.container.translateZ(distance);
};

WIDGET3D.Basic.prototype.localToWorld = function(){
  return (this.container.localToWorld());
};

WIDGET3D.Basic.prototype.worldToLocal = function(){
  return (this.container.worldToLocal());
};

WIDGET3D.Basic.prototype.lookAt = function(vector){
  this.container.lookAt(vector);
};

WIDGET3D.Basic.prototype.updateMatrix = function(){
  this.container.updateMatrix();
};

WIDGET3D.Basic.prototype.updateMatrixWorld = function(){
  this.container.updateMatrixWorld();
};

//Geometry properties

WIDGET3D.Basic.prototype.computeBoundingBox = function(){
  this.container.geometry.computeBoundingBox();
  return this.getBoundingBox();
};

WIDGET3D.Basic.prototype.getBoundingBox = function(){
  return this.container.geometry.boundingBox;
};

WIDGET3D.Basic.prototype.computeBoundingSphere = function(){
  this.container.geometry.computeBoundingSphere();
  return this.getBoundingSphere();
};

WIDGET3D.Basic.prototype.getBoundingSphere = function(){
  return this.container.geometry.boundingSphere;
};

