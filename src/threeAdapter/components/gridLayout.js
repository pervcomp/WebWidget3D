//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// GRID LAYOUTED Group
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              color = hexadecimal
//
WIDGET3D.GridWindow = function(parameters){
  
  var that = this;
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.density_ = parameters.density !== undefined ? parameters.density : 6;
  this.depth_ = (this.width_/this.density_);
  
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
  
  var geometry = new THREE.CubeGeometry( this.width_, this.height_, this.depth_, this.density_, this.density_, 1 );
  
  var mesh =  new THREE.Mesh(geometry, this.material_);
  
  this.setMesh(mesh);
  
  //default mouse controls in use
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls_){
    
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    
    this.controls_ = new WIDGET3D.RollControls({component : this, mouseButton : button, shiftKey : shift});
  }
};

WIDGET3D.GridWindow.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.GridWindow.prototype.addSlots = function(newDensity){
  this.density_ = newDensity;
  this.maxChildren_ = newDensity * newDensity;
  this.depth_ = (this.width_/this.density_);
  
  var grid = new THREE.CubeGeometry( this.width_, this.height_, this.depth_, this.density_, this.density_, 1 );
  
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
  this.url_ = parameters.url !== undefined ? parameters.url : false;
  this.img_ = parameters.img !== undefined ? parameters.img : false;
  
  //object can store metadata in a format that user like
  this.metadata_ = parameters.metadata !== undefined ? parameters.metadata : false;
  
  this.width_ = parent.width_/(parent.density_ + 3.3);
  this.height_ = parent.height_/(parent.density_ + 3.3);
  
  this.depth_ = parameters.depth !== undefined ? parameters.depth : this.height_;
  
  var geometry = new THREE.CubeGeometry(this.width_, this.height_, this.depth_);
  
  this.texture_ = false;
  
  if(this.img_){
    this.texture_ = new THREE.Texture(this.img_);
    this.texture_.needsUpdate = true;
  }
  else if(this.url_){
    this.texture_ = THREE.ImageUtils.loadTexture(this.url_);
  }

  this.material_ = new THREE.MeshBasicMaterial({map : this.texture_, color: this.color_});
  
  var mesh = new THREE.Mesh( geometry, this.material_);
  
  this.setMesh(mesh);
  parent.addChild(this);
  
  this.setToPlace();
  
};

WIDGET3D.GridIcon.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.GridIcon.prototype.setToPlace = function(){

  var parentLoc = this.parent_.getPosition();
  
  var parentLeft = -this.parent_.width_/2.0 + parentLoc.x/this.parent_.width_;
  var parentTop =  this.parent_.height_/2.0 + parentLoc.y/this.parent_.height_;
  
  var stepX = this.parent_.width_/this.parent_.density_;
  var stepY = this.parent_.height_/this.parent_.density_;
  
  var slotCenterX = stepX/2;
  var slotCenterY = stepY/2;
  
  if(this.parent_.children_.length-1 > 0){
  
    var lastIcon = this.parent_.children_[this.parent_.children_.length-2];
    var lastIconLoc = lastIcon.getPosition();
    
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
  this.setPosition(x, y, parentLoc.z/this.parent_.height_);
};

