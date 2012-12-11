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
WIDGET3D.GridWindow = function(parameters){
  
  var that = this;
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.density_ = parameters.density !== undefined ? parameters.density : 6;
  
  this.maxChildren_ = this.density_ * this.density_;
  
  this.color_ = parameters.color !== undefined ? parameters.color : 0x6B6B6B;
  this.lineWidth_ = parameters.lineWidth !== undefined ? parameters.lineWidth : 2;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.5;
  
  this.material_ = new THREE.MeshBasicMaterial({
    color: this.color_,
    opacity: this.opacity_,
    wireframe: true,
    side : THREE.DoubleSide,
    wireframeLinewidth : this.lineWidth_
  });
  
  var geometry = new THREE.PlaneGeometry( this.width_, this.height_, this.density_, this.density_ );
  
  var mesh =  new THREE.Mesh(geometry, this.material_);
  
  this.setMesh(mesh);
  
  //default mouse controls in use
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls_){
  
    this.clickLocation_;
    this.rotationOnMouseDownY_;
    this.rotationOnMousedownX_;
    this.modelRotationY_ = 0;
    this.modelRotationX_ = 0;
    this.rotate_ = false;
  
    this.mouseupHandler = function(event){
      if(that.rotate_){
        that.rotate_ = false;
        
        var mainWindow = WIDGET3D.getMainWindow();
        mainWindow.removeEventListener("mousemove", that.mousemoveHandler);
        mainWindow.removeEventListener("mouseup", that.mouseupHandler);
      }
    };
    
    this.mousedownHandler = function(event){
      that.focus();
      if(!that.rotate_){
        that.rotate_ = true;
        
        that.clickLocation_ = WIDGET3D.mouseCoordinates(event);
        that.rotationOnMouseDownY_ = that.modelRotationY_;
        that.rotationOnMouseDownX_ = that.modelRotationX_;
        
        var mainWindow = WIDGET3D.getMainWindow();
        mainWindow.addEventListener("mousemove", that.mousemoveHandler);
        mainWindow.addEventListener("mouseup", that.mouseupHandler);
      }
    };

    this.mousemoveHandler = function(event){
      if (that.rotate_){
      
        var mouse = WIDGET3D.mouseCoordinates(event);
        
        that.modelRotationY_ = that.rotationOnMouseDownY_ + ( mouse.x - that.clickLocation_.x );
        that.modelRotationX_ = that.rotationOnMouseDownX_ + ( mouse.y - that.clickLocation_.y );
      }
    };
    this.addEventListener("mousedown", this.mousedownHandler);
  }
  
};

WIDGET3D.GridWindow.prototype = WIDGET3D.Window.prototype.inheritance();

WIDGET3D.GridWindow.prototype.update = function(){
  if(this.defaultControls_){
    var rot = this.getRot();
    this.setRotY(rot.y + ((this.modelRotationY_ - rot.y)*0.03));
    this.setRotX(rot.x + ((this.modelRotationX_ - rot.x)*0.03));
  }
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
};

WIDGET3D.GridWindow.prototype.addSlots = function(newDensity){
  this.density_ = newDensity;
  this.maxChildren_ = newDensity * newDensity;
  
  var grid = new THREE.PlaneGeometry( this.width_, this.height_, this.density_, this.density_ );
  
  var gridMesh =  new THREE.Mesh(grid, this.material_);
  
  this.setMesh(gridMesh);
  
  var tmpChilds = this.children_;
  this.children_ = [];
  
  for(var i = 0; i < tmpChilds.length; ++i){
  
    var icon = tmpChilds[i];
    this.children_.push(icon);
    
    icon.width_ = this.width_/(this.density_ + 3.3);
    icon.height_ = this.height_/(this.density_ + 3.3);
    
    var geometry = new THREE.CubeGeometry(icon.width_, icon.height_, icon.depth_);
    
    var mesh = new THREE.Mesh( geometry, icon.material_);
    icon.setMesh(mesh);
    icon.setToPlace();
  }
  
}


//---------------------------------------------------
// ICONS FOR GRIDWINDOW
//---------------------------------------------------
WIDGET3D.GridIcon = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  var parent = parameters.parent;
  if(parent == undefined){
    console.log("GridIcon needs to have grid window as parent!");
    console.log("Parent has to be given in parameters.");
    return false;
  }
  
  if(parent.children_.length >= parent.maxChildren_){
    console.log("Grid is full! Creating bigger one");
    parent.addSlots(Math.ceil(parent.density_ * 1.5));
  }
  
  this.color_ = parameters.color !== undefined ? parameters.color : 0xFFFFFF;
  this.picture_ = parameters.picture !== undefined ? parameters.picture : false;
  
  //object can store metadata in a format that user like
  this.metadata_ = parameters.metadata !== undefined ? parameters.metadata : false;
  
  this.width_ = parent.width_/(parent.density_ + 3.3);
  this.height_ = parent.height_/(parent.density_ + 3.3);
  
  this.depth_ = parameters.depth !== undefined ? parameters.depth : (this.height_/4);
  
  var geometry = new THREE.CubeGeometry(this.width_, this.height_, this.depth_);
  
  this.texture_ = false;
  
  if(this.picture_){
    this.texture_ = THREE.ImageUtils.loadTexture(this.picture_);
  }

  this.material_ = new THREE.MeshBasicMaterial({map : this.texture_, color: this.color_});
  
  var mesh = new THREE.Mesh( geometry, this.material_);
  
  this.setMesh(mesh);
  parent.addChild(this);
  
  this.setToPlace();
  
};

WIDGET3D.GridIcon.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.GridIcon.prototype.setToPlace = function(){

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

