/*
Copyright (C) 2012 Anna-Liisa Mattila

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// TITLED WINDOW
//---------------------------------------------------
//
// PARAMETERS:  title :           title string
//              width :           widht in world coordinate space
//              height:           height in world coordinate space
//              defaultControls : boolean that tells if the default mouse controls are used
//              *color:           hexadecimal color for window
//              *texture :        three.js texture object
//              *material :       three.js material object
//              * if material is given texture and color doens't apply
//
//              All parameters are optional
//
THREEJS_WIDGET3D.TitledWindow = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 2000;
  this.height_ = parameters.height !== undefined ? parameters.height : 2000;
  
  var title = parameters.title !== undefined ? parameters.title : "title";
  
  var color = parameters.color !== undefined ? parameters.color : 0x808080;
  var texture = parameters.texture;
  var material = parameters.material !== undefined ? parameters.material :  new THREE.MeshBasicMaterial({color : color, map : texture});
  
  var mesh =  new THREE.Mesh( new THREE.PlaneGeometry( this.width_, this.height_ ), material);
  
  mesh.doubleSided = true;
  mesh.flipSided = true;
  mesh.rotation.x = Math.PI/2;
  
  this.setMesh(mesh);
  
  //drag controlls
  this.clickLocation_;
  this.locationOnMouseDownY_;
  this.locationOnMousedownX_;
  this.modelLocationY_ = this.getLocation().y;
  this.modelLocationX_ = this.getLocation().x;
  this.drag_ = false;
  
  //---------------------------------------------------
  //CLOSE BUTTON
  //---------------------------------------------------
  this.closeButton_ = new WIDGET3D.Basic();
  
  var buttonMesh = new THREE.Mesh( new THREE.PlaneGeometry( this.width_/10.0, this.height_/10.0 ),
    new THREE.MeshBasicMaterial( { color: 0xAA0000} ) );
  
  buttonMesh.doubleSided = true;
  buttonMesh.flipSided = true;
  buttonMesh.rotation.x = Math.PI/2;
  
  this.closeButton_.setMesh(buttonMesh);
  this.closeButton_.setLocation(((this.width_/2.0)-(this.width_/20.0)), ((this.height_/2.0)+(this.height_/20.0)), 0);
  
  this.addChild(this.closeButton_);
  
  //---------------------------------------------------
  //TITLEBAR
  //---------------------------------------------------
  this.title_ = new WIDGET3D.Basic();
  
  this.textureCanvas_ = document.createElement('canvas');
  this.textureCanvas_.width = 512;
  this.textureCanvas_.height = 128;
  this.textureCanvas_.style.display = "none";
  
  document.body.appendChild(this.textureCanvas_);
  this.titleContext_ = this.textureCanvas_.getContext('2d');
  this.setTitle(title);
  
  this.addChild(this.title_);
  
  if(parameters.defaultControls){
    this.title_.addEventListener(WIDGET3D.EventType.onmousedown, this.mousedownHandler, this);
    this.title_.addEventListener(WIDGET3D.EventType.onmouseup, this.mouseupHandler, this);
    this.title_.addEventListener(WIDGET3D.EventType.onmousemove, this.mousemoveHandler, this);
  }
};

THREEJS_WIDGET3D.TitledWindow.prototype = WIDGET3D.Window.prototype.inheritance();


//TODO: FIX DRAG CONTROLLS TO TAKE ROTATIONS ON COUNT AND FIX THE MOUSE POSITION THING TOO
THREEJS_WIDGET3D.TitledWindow.prototype.update = function(){
  
  var point = new THREE.Vector3( this.modelLocationX_, this.modelLocationY_, 1.0);

  THREEJS_WIDGET3D.projector.unprojectVector( point, THREEJS_WIDGET3D.camera ).normalize();
  
  point.x = point.x * WIDGET3D.getRealWidth();
  point.y = point.y * WIDGET3D.getRealHeight();
  
  var loc = this.getLocation();
  this.setY(loc.y + (point.y - loc.y ));
  this.setX(loc.x + (point.x - loc.x ));
    
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
  
  WIDGET3D.mainWindow.needsUpdate();
};

//sets titlebar text
THREEJS_WIDGET3D.TitledWindow.prototype.setTitle = function(title){

  this.titleContext_.fillStyle = "#B3B3B3";
  this.titleContext_.fillRect(0, 0, this.textureCanvas_.width, this.textureCanvas_.height);
  
  this.titleContext_.fillStyle = "#000000";
  this.titleContext_.font = "bold 60px Courier New";
  this.titleContext_.align = "center";
  this.titleContext_.textBaseline = "middle";
  this.titleContext_.fillText(title, 10, this.textureCanvas_.height/2);
  var texture = new THREE.Texture(this.textureCanvas_);
  
  var material = new THREE.MeshBasicMaterial({ map: texture });
  
  var mesh = new THREE.Mesh( new THREE.PlaneGeometry(this.width_ - this.width_/10.0, this.height_/10.0), material);
  
  mesh.doubleSided = true;
  mesh.flipSided = true;
  mesh.rotation.x = Math.PI/2;
  
  this.title_.setMesh(mesh);
  
  this.title_.setY((this.height_/2.0)+(this.height_/20.0));
  this.title_.setX(((this.width_ - this.width_/10.0)/2.0) - (this.width_/2.0));
  
  texture.needsUpdate = true;
};


THREEJS_WIDGET3D.TitledWindow.prototype.mousedownHandler = function(event, window){

  window.focus();
  
  window.drag_ = true;
  
  window.clickLocation_ = WIDGET3D.normalizedMouseCoordinates(event);
  
  window.locationOnMouseDownY_ = window.modelLocationY_;
  window.locationOnMouseDownX_ = window.modelLocationX_;
  
};

THREEJS_WIDGET3D.TitledWindow.prototype.mouseupHandler = function(event, window){
  window.drag_ = false;
};

THREEJS_WIDGET3D.TitledWindow.prototype.mousemoveHandler = function(event, window){
  if (window.drag_){
  
    var mouse = WIDGET3D.normalizedMouseCoordinates(event);
    
    window.modelLocationY_ = window.locationOnMouseDownY_ + ( mouse.y - window.clickLocation_.y );
    window.modelLocationX_ = window.locationOnMouseDownX_ + ( mouse.x - window.clickLocation_.x );
  }
};

THREEJS_WIDGET3D.TitledWindow.prototype.remove = function(){
  //children needs to be removed
  for(var k = 0; k < this.children_.length; ++k){
    this.children_[k].remove();
  }
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from DOM
  var canvas = this.textureCanvas_;
  document.body.removeChild(canvas);
  
  //removing eventlisteners
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListener(i);
    }
  }
  
  //If wondow has a mesh, it has to be removed allso
  if(this.mesh_){
    var mesh = WIDGET3D.mainWindow.removeMesh(this.mesh_);
    if(mesh != this.mesh_){
      console.log("removed mesh was wrong! " + mesh);
    }
  }
  
  //container has to be removed from parent's container
  this.parent_.container_.remove(this.container_);
  
  //removing this from parents objects
  var obj = this.parent_.removeFromObjects(this);
  if(obj != this){
    console.log(obj);
    console.log(this);
    console.log("removed object was wrong! " + obj);
  }
}


