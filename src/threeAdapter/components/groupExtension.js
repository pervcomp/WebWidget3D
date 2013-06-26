//---------------------------------------------
// GUI OBJECT: GROUP EXTENSION FOR THREE.JS
//---------------------------------------------
//
//

//Vector3 basic operations
WIDGET3D.Group.prototype.getPosition = function(){
  return this.container.position;
};

WIDGET3D.Group.prototype.getPositionX = function(){
  return this.container.position.x;
};

WIDGET3D.Group.prototype.getPositionY = function(){
  return this.container.position.y;
};

WIDGET3D.Group.prototype.getPositionZ = function(){
  return this.container.position.z;
};

WIDGET3D.Group.prototype.setPosition = function(x, y, z){
  
  this.container.position.set(x,y,z);
};

WIDGET3D.Group.prototype.setPositionX = function(x){
  this.container.position.setX(x);
};

WIDGET3D.Group.prototype.setPositionY = function(y){
  this.container.position.setY(y);
};

WIDGET3D.Group.prototype.setPositionZ = function(z){
  this.container.position.setZ(z);
};

WIDGET3D.Group.prototype.getRotation = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation;
};

WIDGET3D.Group.prototype.getRotationX = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.x;
};

WIDGET3D.Group.prototype.getRotationY = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.y;
};

WIDGET3D.Group.prototype.getRotation.z = function(){
  if(this.container.useQuaternion){
    this.container.rotation.setEulerFromQuaternion(this.container.quaternion);
  }
  return this.container.rotation.z;
};

WIDGET3D.Group.prototype.getRotationMatrix = function(){
  var m1 = new THREE.Matrix4();
  m1.extractRotation( this.container.matrix );
  
  return m1;
}

WIDGET3D.Group.prototype.setRotation = function(rotX, rotY, rotZ){

  if(this.container.useQuaternion){
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  
  this.container.rotation.set(rotX, rotY, rotZ);
};

WIDGET3D.Group.prototype.setRotationX = function(rotX){
  if(this.container.useQuaternion){
    var rotY = this.getRotationY();
    var rotZ = this.getRotationZ();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setX(rotX);
};

WIDGET3D.Group.prototype.setRotationY = function(rotY){
  if(this.container.useQuaternion){
    var rotX = this.getRotationX();
    var rotZ = this.getRotationZ();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setY(rotY);
};

WIDGET3D.Group.prototype.setRotationZ = function(rotZ){
  if(this.container.useQuaternion){
    var rotX = this.getRotationX();
    var rotY = this.getRotationY();
    this.container.quaternion.setFromEuler(new THREE.Vec3(rotX, rotY, rotZ), this.container.eulerOrder);
  }
  this.container.rotation.setZ(rotZ);
};


//Object 3D actions

WIDGET3D.Group.prototype.useQuaternion = function(){
  this.container.useQuaternion = true;
};

WIDGET3D.Group.prototype.setEulerOrder = function(order){
  this.container.eulerOrder = order;
};

WIDGET3D.Group.prototype.applyMatrix = function(matrix){
  this.container.applyMatrix(matrix);
}

WIDGET3D.Group.prototype.rotateOnAxis = function(axis, angle){
  this.container.rotateOnAxis(axis, angle);
};

WIDGET3D.Group.prototype.translateOnAxis = function(axis, distance){
  this.container.translateOnAxis(axis, distance);
};

WIDGET3D.Group.prototype.translateX = function(distance){
  this.container.translateX(distance);
};

WIDGET3D.Group.prototype.translateY = function(distance){
  this.container.translateY(distance);
};

WIDGET3D.Group.prototype.translateZ = function(distance){
  this.container.translateZ(distance);
};

WIDGET3D.Group.prototype.localToWorld = function(){
  return (this.container.localToWorld());
};

WIDGET3D.Group.prototype.worldToLocal = function(){
  return (this.container.worldToLocal());
};

WIDGET3D.Group.prototype.lookAt = function(vector){
  this.container.lookAt(vector);
};

WIDGET3D.Group.prototype.updateMatrix = function(){
  this.container.updateMatrix();
};

WIDGET3D.Group.prototype.updateMatrixWorld = function(){
  this.container.updateMatrixWorld();
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
  
  for(var i = 0; i < this.children.length; ++i){
  
    var sphere = this.children[i].computeBoundingSphere();
    
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



