//---------------------------------------------
// GUI OBJECT: BASIC EXTENSION FOR THREE.JS
//---------------------------------------------
//
//

//Vector3 basic operations
WIDGET3D.Basic.prototype.getPosition = function(){
  return this.container_.position;
};

WIDGET3D.Basic.prototype.getPositionX = function(){
  return this.container_.position.x;
};

WIDGET3D.Basic.prototype.getPositionY = function(){
  return this.container_.position.y;
};

WIDGET3D.Basic.prototype.getPositionZ = function(){
  return this.container_.position.z;
};

WIDGET3D.Basic.prototype.setPosition = function(x, y, z){
  
  this.container_.position.set(x,y,z);
};

WIDGET3D.Basic.prototype.setPositionX = function(x){
  this.container_.position.setX(x);
};

WIDGET3D.Basic.prototype.setPositionY = function(y){
  this.container_.position.setY(y);
};

WIDGET3D.Basic.prototype.setPositionZ = function(z){
  this.container_.position.setZ(z);
};

WIDGET3D.Basic.prototype.getRotation = function(){
  
  if(this.mehs_.useQuaternion){
    this.container_.rotation.setEulerFromQuaternion(this.container_.quaternion);
  }
  
  return this.container_.rotation;
};

WIDGET3D.Basic.prototype.getRotationX = function(){
  if(this.mehs_.useQuaternion){
    this.container_.rotation.setEulerFromQuaternion(this.container_.quaternion);
  }
  
  return this.container_.rotation.x;
};

WIDGET3D.Basic.prototype.getRotationY = function(){
  if(this.mehs_.useQuaternion){
    this.container_.rotation.setEulerFromQuaternion(this.container_.quaternion);
  }
  return this.container_.rotation.y;
};

WIDGET3D.Basic.prototype.getRotationZ = function(){
  if(this.mehs_.useQuaternion){
    this.container_.rotation.setEulerFromQuaternion(this.container_.quaternion);
  }
  return this.container_.rotation.z;
};

WIDGET3D.Basic.prototype.getRotationMatrix = function(){
  var m1 = new THREE.Matrix4();
  m1.extractRotation( this.container_.matrix );
  
  return m1;
}

WIDGET3D.Basic.prototype.setRotation = function(rotX, rotY, rotZ){
  if(this.container_.useQuaternion){
    this.container_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container_.eulerOrder);
  }
  this.container_.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Basic.prototype.setRotationX = function(rotX){
  if(this.container_.useQuaternion){
    var rotY = this.getRotationY();
    var rotZ = this.getRotationZ();
    this.container_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container_.eulerOrder);
  }
  this.container_.rotation.setX(rotX);
};

WIDGET3D.Basic.prototype.setRotationY = function(rotY){
  if(this.container_.useQuaternion){
    var rotX = this.getRotationX();
    var rotZ = this.getRotationZ();
    this.container_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container_.eulerOrder);
  }
  this.container_.rotation.setY(rotY);
};

WIDGET3D.Basic.prototype.setRotationZ = function(rotZ){
  if(this.container_.useQuaternion){
    var rotX = this.getRotationX();
    var rotY = this.getRotationY();
    this.container_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container_.eulerOrder);
  }
  this.container_.rotation.setZ(rotZ);
};


//Object 3D actions
WIDGET3D.Basic.prototype.useQuaternion = function(){
  this.container_.useQuaternion = true;
};

WIDGET3D.Basic.prototype.setEulerOrder = function(order){
  this.container_.eulerOrder = order;
};

WIDGET3D.Basic.prototype.applyMatrix = function(matrix){
  this.container_.applyMatrix(matrix);
}

WIDGET3D.Basic.prototype.rotateOnAxis = function(axis, angle){
  this.container_.rotateOnAxis(axis, angle);
};

WIDGET3D.Basic.prototype.translateOnAxis = function(axis, distance){
  this.container_.translateOnAxis(axis, distance);
};

WIDGET3D.Basic.prototype.translateX = function(distance){
  this.container_.translateX(distance);
};

WIDGET3D.Basic.prototype.translateY = function(distance){
  this.container_.translateY(distance);
};

WIDGET3D.Basic.prototype.translateZ = function(distance){
  this.container_.translateZ(distance);
};

WIDGET3D.Basic.prototype.localToWorld = function(){
  return (this.container_.localToWorld());
};

WIDGET3D.Basic.prototype.worldToLocal = function(){
  return (this.container_.worldToLocal());
};

WIDGET3D.Basic.prototype.lookAt = function(vector){
  this.container_.lookAt(vector);
};

WIDGET3D.Basic.prototype.updateMatrix = function(){
  this.container_.updateMatrix();
};

WIDGET3D.Basic.prototype.updateMatrixWorld = function(){
  this.container_.updateMatrixWorld();
};

//Geometry properties

WIDGET3D.Basic.prototype.computeBoundingBox = function(){
  this.container_.geometry.computeBoundingBox();
  return this.getBoundingBox();
};

WIDGET3D.Basic.prototype.getBoundingBox = function(){
  return this.container_.geometry.boundingBox;
};

WIDGET3D.Basic.prototype.computeBoundingSphere = function(){
  this.container_.geometry.computeBoundingSphere();
  return this.getBoundingSphere();
};

WIDGET3D.Basic.prototype.getBoundingSphere = function(){
  return this.container_.geometry.boundingSphere;
};

