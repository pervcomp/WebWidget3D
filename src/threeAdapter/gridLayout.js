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
// GRID LAYOUTED WINDOW
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              color = hexadecimal
//
THREEJS_WIDGET3D.GridWindow = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.density_ = parameters.density !== undefined ? parameters.density : 10;
  
  var color = parameters.color !== undefined ? parameters.color : 0x6B6B6B;
  var lineWidth = parameters.lineWidth !== undefined ? parameters.lineWidth : 2;
  
  this.clickLocation_;
  this.rotationOnMouseDownY_;
  this.rotationOnMousedownX_;
  this.modelRotationY_ = 0;
  this.modelRotationX_ = 0;
  this.rotate_ = false;
  
  
  var mesh =  new THREE.Mesh( 
    new THREE.PlaneGeometry( this.width_, this.height_, this.density_, this.density_ ),
    new THREE.MeshBasicMaterial({
      color: color,
      opacity: 0.5,
      wireframe: true,
      wireframeLinewidth : lineWidth}) );
  
  mesh.doubleSided = true;
  mesh.flipSided = true;
  mesh.rotation.x = Math.PI/2;
  
  this.setMesh(mesh);
  
  //default mouse controls in use
  if(parameters.defaultControls){
    this.addEventListener(WIDGET3D.EventType.onmousedown, this.mousedownHandler, this);
    this.addEventListener(WIDGET3D.EventType.onmouseup, this.mouseupHandler, this);
    this.addEventListener(WIDGET3D.EventType.onmousemove, this.mousemoveHandler, this);
  }
  
};

THREEJS_WIDGET3D.GridWindow.prototype = WIDGET3D.Window.prototype.inheritance();

THREEJS_WIDGET3D.GridWindow.prototype.update = function(){
  var rot = this.getRot();
  this.setRotY(rot.y + ((this.modelRotationY_ - rot.y)*0.03));
  this.setRotX(rot.x + ((this.modelRotationX_ - rot.x)*0.03));
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
  
  WIDGET3D.mainWindow.needsUpdate();
};

THREEJS_WIDGET3D.GridWindow.prototype.mousedownHandler = function(event, window){
  window.rotate_ = true;
  
  window.clickLocation_ = WIDGET3D.normalizedMouseCoordinates(event);
  window.rotationOnMouseDownY_ = window.modelRotationY_;
  window.rotationOnMouseDownX_ = window.modelRotationX_;
  
  return false;
};

THREEJS_WIDGET3D.GridWindow.prototype.mouseupHandler = function(event, window){
  window.rotate_ = false;
};

THREEJS_WIDGET3D.GridWindow.prototype.mousemoveHandler = function(event, window){
  if (window.rotate_){
  
    var mouse = WIDGET3D.normalizedMouseCoordinates(event);
    
    window.modelRotationY_ = window.rotationOnMouseDownY_ + ( mouse.x - window.clickLocation_.x );
    window.modelRotationX_ = window.rotationOnMouseDownX_ + ( mouse.y - window.clickLocation_.y );
  }
};


//---------------------------------------------------
// ICONS FOR GRIDWINDOW
//---------------------------------------------------
THREEJS_WIDGET3D.GridIcon = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  var parent = parameters.parent !== undefined ? parameters.parent : WIDGET3D.getMainWindow();
  
  this.width_ = parent.width_/(parent.density_ + 3.3);
  this.height_ = parent.height_/(parent.density_ + 3.3);
  this.depth_ = 30;
  
  var geometry = new THREE.CubeGeometry(this.width_, this.height_, this.depth_);
  
  var color = parameters.color;
  var picture = parameters.picture;
  
  var texture;
  
  if(picture){
    texture = THREE.ImageUtils.loadTexture(picture);
  }
  var material = new THREE.MeshBasicMaterial({map : texture, color: color});
  
  var mesh = new THREE.Mesh( geometry, material);
  
  this.setMesh(mesh);
  parent.addChild(this);
  
  this.setToPlace();
  
};

THREEJS_WIDGET3D.GridIcon.prototype = WIDGET3D.Basic.prototype.inheritance();

THREEJS_WIDGET3D.GridIcon.prototype.setToPlace = function(){

  var parentLoc = this.parent_.getLocation();
  
  var parentLeft = -this.parent_.width_/2.0 + parentLoc.x/this.parent_.width_;
  var parentTop =  this.parent_.height_/2.0 + parentLoc.y/this.parent_.height_;
  
  var stepX = this.parent_.width_/this.parent_.density_;
  var stepY = this.parent_.height_/this.parent_.density_;
  
  var slotCenterX = stepX/2;
  var slotCenterY = stepY/2;
  
  if(this.parent_.children_.length-1 > 0){
  
    var lastIcon = this.parent_.children_[this.parent_.children_.length-2];
    var lastIconLoc = lastIcon.getLocation();
    
    //somehow this isn't wirking properly. the modulo is never 0 which is weird..
    if((this.parent_.children_.length-1 % this.parent_.density_) == 0 ||
      this.parent_.children_.length-1 == this.parent_.density_)
    {  
      var x = parentLeft + slotCenterX;
      var y = lastIconLoc.y - stepY;
    }
    else{
      var x = lastIconLoc.x + stepX;
      var y = lastIconLoc.y;
    
    }
  }
  else{
    
    var x = parentLeft + slotCenterX;
    var y = parentTop - slotCenterY;
    
  }
  this.setLocation(x, y, parentLoc.z/this.parent_.height_);
};

