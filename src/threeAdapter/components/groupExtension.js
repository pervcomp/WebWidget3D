//---------------------------------------------
// GUI OBJECT: GROUP EXTENSION FOR THREE.JS
//---------------------------------------------
//
//

//Vector3 basic operations
WIDGET3D.Group.prototype.getPosition = function(){
  return this.container_.position;
};

WIDGET3D.Group.prototype.getPositionX = function(){
  return this.container_.position.x;
};

WIDGET3D.Group.prototype.getPositionY = function(){
  return this.container_.position.y;
};

WIDGET3D.Group.prototype.getPositionZ = function(){
  return this.container_.position.z;
};

WIDGET3D.Group.prototype.setPosition = function(x, y, z){
  
  this.container_.position.set(x,y,z);
};

WIDGET3D.Group.prototype.setPositionX = function(x){
  this.container_.position.setX(x);
};

WIDGET3D.Group.prototype.setPositionY = function(y){
  this.container_.position.setY(y);
};

WIDGET3D.Group.prototype.setPositionZ = function(z){
  this.container_.position.setZ(z);
};

WIDGET3D.Group.prototype.getRotation = function(){
  if(this.container_.useQuaternion){
    this.container_.rotation.setEulerFromQuaternion(this.container_.quaternion);
  }
  return this.container_.rotation;
};

WIDGET3D.Group.prototype.getRotationX = function(){
  if(this.container_.useQuaternion){
    this.container_.rotation.setEulerFromQuaternion(this.container_.quaternion);
  }
  return this.container_.rotation.x;
};

WIDGET3D.Group.prototype.getRotationY = function(){
  if(this.container_.useQuaternion){
    this.container_.rotation.setEulerFromQuaternion(this.container_.quaternion);
  }
  return this.container_.rotation.y;
};

WIDGET3D.Group.prototype.getRotation.z = function(){
  if(this.container_.useQuaternion){
    this.container_.rotation.setEulerFromQuaternion(this.container_.quaternion);
  }
  return this.container_.rotation.z;
};

WIDGET3D.Group.prototype.setRotation = function(rotX, rotY, rotZ){

  if(this.container_.useQuaternion){
    this.container_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container_.eulerOrder);
  }
  
  this.container_.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Group.prototype.setRotationX = function(rotX){
  if(this.container_.useQuaternion){
    var rotY = this.getRotationY();
    var rotZ = this.getRotationZ();
    this.container_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container_.eulerOrder);
  }
  this.container_.rotation.setX(rotX);
};

WIDGET3D.Group.prototype.setRotationY = function(rotY){
  if(this.container_.useQuaternion){
    var rotX = this.getRotationX();
    var rotZ = this.getRotationZ();
    this.container_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container_.eulerOrder);
  }
  this.container_.rotation.setY(rotY);
};

WIDGET3D.Group.prototype.setRotationZ = function(rotZ){
  if(this.container_.useQuaternion){
    var rotX = this.getRotationX();
    var rotY = this.getRotationY();
    this.container_.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container_.eulerOrder);
  }
  this.container_.rotation.setZ(rotZ);
};


//Object 3D actions

WIDGET3D.Group.prototype.useQuaternion = function(){
  this.container_.useQuaternion = true;
};

WIDGET3D.Group.prototype.setEulerOrder = function(order){
  this.container_.eulerOrder = order;
};

WIDGET3D.Group.prototype.applyMatrix = function(matrix){
  this.container_.applyMatrix(matrix);
}

WIDGET3D.Group.prototype.rotateOnAxis = function(axis, angle){
  this.container_.rotateOnAxis(axis, angle);
};

WIDGET3D.Group.prototype.translateOnAxis = function(axis, distance){
  this.container_.translateOnAxis(axis, distance);
};

WIDGET3D.Group.prototype.translateX = function(distance){
  this.container_.translateX(distance);
};

WIDGET3D.Group.prototype.translateY = function(distance){
  this.container_.translateY(distance);
};

WIDGET3D.Group.prototype.translateZ = function(distance){
  this.container_.translateZ(distance);
};

WIDGET3D.Group.prototype.localToWorld = function(){
  return (this.container_.localToWorld());
};

WIDGET3D.Group.prototype.worldToLocal = function(){
  return (this.container_.worldToLocal());
};

WIDGET3D.Group.prototype.lookAt = function(vector){
  this.container_.lookAt(vector);
};

WIDGET3D.Group.prototype.updateMatrix = function(){
  this.container_.updateMatrix();
};

WIDGET3D.Group.prototype.updateMatrixWorld = function(){
  this.container_.updateMatrixWorld();
};


//Bounding boxes and spheres
WIDGET3D.Group.prototype.computeBoundingBox = function(){

  var sphere = this.getBoundingSphere();
  if(sphere == undefined){
    sphere = this.computeBoundingSphere();
  }
  this.boundingBox = sphere.getBoundingBox();
  
  return this.boundingBox;
};

WIDGET3D.Group.prototype.getBoundingBox = function(){
  return this.boundingBox;
};

WIDGET3D.Group.prototype.computeBoundingSphere = function(){
  var center = this.getPosition();
  
  var radius = 0;
  
  for(var i = 0; i < this.children_.length; ++i){
  
    var sphere = this.children_[i].computeBoundingSphere();
    
    var distance = center.distanceTo(sphere.center) + sphere.radius;
    
    if(i == 0){
      radius = distance;
    }
    
    if(distance > radius){
      radius = distance;
    }
  }
  
  this.boundingSphere = new THREE.Sphere(center, radius);
  
  return this.boundingSphere;
};

WIDGET3D.Group.prototype.getBoundingSphere = function(){
  return this.boundingSphere;
};



