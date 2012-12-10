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
  
  var that = this;
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 2000;
  this.height_ = parameters.height !== undefined ? parameters.height : 2000;
  
  var title = parameters.title !== undefined ? parameters.title : "title";
  
  var color = parameters.color !== undefined ? parameters.color : 0x808080;
  var texture = parameters.texture;
  var material = parameters.material !== undefined ? parameters.material :  new THREE.MeshBasicMaterial({color : color, map : texture, side : THREE.DoubleSide});
  
  var mesh =  new THREE.Mesh( new THREE.PlaneGeometry( this.width_, this.height_ ), material);
  
  this.setMesh(mesh);
  
  //---------------------------------------------------
  //CLOSE BUTTON
  //---------------------------------------------------
  this.closeButton_ = new WIDGET3D.Basic();
  
  var buttonMesh = new THREE.Mesh( new THREE.PlaneGeometry( this.width_/10.0, this.height_/10.0 ),
    new THREE.MeshBasicMaterial( { color: 0xAA0000, side : this.mesh_.material.side} ) );
  
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
  
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  //drag controlls
  this.clickStart_ = undefined;
  this.newPos_ = this.getLocation();
  this.drag_ = false;
  this.firstEvent_ = false;
  
  if(this.defaultControls_){
  
    this.mouseupHandler = function(event){
      if(that.drag_){
        that.drag_ = false;
        that.clickStart_ = undefined;
        
        that.title_.removeEventListener("mousemove", that.mousemoveHandler);
        WIDGET3D.getMainWindow().removeEventListener("mouseup", that.mouseupHandler);
      }
    };
    
    this.mousedownHandler = function(event){
      that.focus();
      //If this is the first time the event is fired we need to update the
      //objects position data because it might have changed after constructor.
      if(!that.firstEvent_){
        that.newPos_ = that.getLocation();
        that.firstEvent_ = true;
      }
      
      if(!that.drag_){
        that.drag_ = true;
        that.clickStart_ = event.objectCoordinates;
        
        that.title_.addEventListener("mousemove", that.mousemoveHandler);
        WIDGET3D.getMainWindow().addEventListener("mouseup", that.mouseupHandler);
      }
      return false;
    };

    this.mousemoveHandler = function(event){
      if(that.drag_){
        
        var point = event.objectCoordinates;
        
        var dy = (point.y - that.clickStart_.y);
        var dx = (point.x - that.clickStart_.x);
        
        var pos = that.getLocation();
        var rotation = that.getRot();
        
        var tmpX = pos.x + (dx * Math.cos(Math.PI * rotation.y));
        var tmpZ = pos.z + (dx * Math.sin(Math.PI * rotation.y));
        
        that.newPos_.y = pos.y + (dy * Math.cos(Math.PI * rotation.x));
        that.newPos_.z = tmpZ - (dy * Math.sin(Math.PI * rotation.x) * Math.cos(Math.PI * rotation.y));
        that.newPos_.x = tmpX + (dy * Math.sin(Math.PI * rotation.x) * Math.sin(Math.PI * rotation.y));
      }
    };
    this.title_.addEventListener("mousedown", this.mousedownHandler);
  }
};

THREEJS_WIDGET3D.TitledWindow.prototype = WIDGET3D.Window.prototype.inheritance();


THREEJS_WIDGET3D.TitledWindow.prototype.update = function(){
  
  if(this.defaultControls_ && this.firstEvent_){
    
    this.setLocation(this.newPos_.x, this.newPos_.y, this.newPos_.z);
  }
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
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
  
  var material = new THREE.MeshBasicMaterial({ map: texture, side : this.mesh_.material.side });
  
  this.title_.width_ = this.width_ - this.width_/10.0;
  this.title_.height_ = this.height_/10.0;
  
  var mesh = new THREE.Mesh( new THREE.PlaneGeometry(this.title_.width_, this.title_.height_), material);
  
  this.title_.setMesh(mesh);
  
  this.title_.setY((this.height_/2.0)+(this.height_/20.0));
  this.title_.setX(((this.width_ - this.width_/10.0)/2.0) - (this.width_/2.0));
  
  texture.needsUpdate = true;
};


THREEJS_WIDGET3D.TitledWindow.prototype.remove = function(){
  //children needs to be removed  
  while(this.children_.length > 0){
    this.children_[0].remove();
  }
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from DOM
  var canvas = this.textureCanvas_;
  document.body.removeChild(canvas);
  
  //removing eventlisteners
  this.removeAllListeners();
  
  //If wondow has a mesh, it has to be removed allso
  if(this.mesh_){
    var mesh = WIDGET3D.getMainWindow().removeMesh(this.mesh_);
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
};


