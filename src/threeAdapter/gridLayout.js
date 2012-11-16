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
  
  var that = this;
  
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
      side : THREE.DoubleSide,
      wireframeLinewidth : lineWidth}) );
  
  this.setMesh(mesh);
  
  //default mouse controls in use
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls_){
  
    this.mouseupHandler = function(event){
      if(that.rotate_){
        that.rotate_ = false;
        
        THREEJS_WIDGET3D.mainWindow.removeEventListener("mousemove", that.mousemoveHandler);
        THREEJS_WIDGET3D.mainWindow.removeEventListener("mouseup", that.mouseupHandler);
      }
    };
    
    this.mousedownHandler = function(event){
      that.focus();
      if(!that.rotate_){
        that.rotate_ = true;
        
        that.clickLocation_ = WIDGET3D.mouseCoordinates(event);
        that.rotationOnMouseDownY_ = that.modelRotationY_;
        that.rotationOnMouseDownX_ = that.modelRotationX_;
        
        THREEJS_WIDGET3D.mainWindow.addEventListener("mousemove", that.mousemoveHandler);
        THREEJS_WIDGET3D.mainWindow.addEventListener("mouseup", that.mouseupHandler);
      }
    };

    this.mousemoveHandler = function(event){
      if (that.rotate_){
      
        var mouse = WIDGET3D.mouseCoordinates(event);
        
        that.modelRotationY_ = that.rotationOnMouseDownY_ + ( mouse.x - that.clickLocation_.x );
        that.modelRotationX_ = that.rotationOnMouseDownX_ + ( mouse.y - that.clickLocation_.y );
      }
    };
    
    //this.addEventListener(WIDGET3D.EventType.onmousedown, this.mousedownHandler);
    this.addEventListener("mousedown", this.mousedownHandler);
  }
  
};

THREEJS_WIDGET3D.GridWindow.prototype = WIDGET3D.Window.prototype.inheritance();

THREEJS_WIDGET3D.GridWindow.prototype.update = function(){
  if(this.defaultControls_){
    var rot = this.getRot();
    this.setRotY(rot.y + ((this.modelRotationY_ - rot.y)*0.03));
    this.setRotX(rot.x + ((this.modelRotationX_ - rot.x)*0.03));
  }
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
};


//---------------------------------------------------
// ICONS FOR GRIDWINDOW
//---------------------------------------------------
THREEJS_WIDGET3D.GridIcon = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  var parent = parameters.parent;
  if(parent == undefined){
    console.log("GridIcon needs to have grid window as parent!");
    console.log("Parent has to be given in parameters.");
    return false;
  }
  
  var parameters = parameters || {};
  
  var color = parameters.color !== undefined ? parameters.color : 0xFFFFFF;
  var picture = parameters.picture !== undefined ? parameters.picture : false;
  
  this.width_ = parent.width_/(parent.density_ + 3.3);
  this.height_ = parent.height_/(parent.density_ + 3.3);
  this.depth_ = 30;
  
  var geometry = new THREE.CubeGeometry(this.width_, this.height_, this.depth_);
  
  var texture;
  
  if(picture){
    texture = THREE.ImageUtils.loadTexture(picture);
  }
  else{
    texture = false;
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
    
    if(((this.parent_.children_.length-1) % this.parent_.density_) == 0)
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

