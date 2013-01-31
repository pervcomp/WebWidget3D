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
WIDGET3D.TitledWindow = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var that = this;
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 2000;
  this.height_ = parameters.height !== undefined ? parameters.height : 2000;
  
  var title = parameters.title !== undefined ? parameters.title : "title";
  
  var color = parameters.color !== undefined ? parameters.color : 0x808080;
  var texture = parameters.texture;
  var material = parameters.material !== undefined ? parameters.material :  new THREE.MeshBasicMaterial({color : color, map : texture, side : THREE.DoubleSide});
  
  //var mesh =  new THREE.Mesh( new THREE.PlaneGeometry( this.width_, this.height_ ), material);
  //this.setMesh(mesh);
  
  //---------------------------------------------------
  //TITLEBAR
  //---------------------------------------------------
  //this.title_ = new WIDGET3D.Basic();
  this.title_ = {};
  
  this.textureCanvas_ = document.createElement('canvas');
  this.textureCanvas_.width = 512;
  this.textureCanvas_.height = 128;
  this.textureCanvas_.style.display = "none";
  
  document.body.appendChild(this.textureCanvas_);
  this.titleContext_ = this.textureCanvas_.getContext('2d');
  this.setTitle(title, material.side);
  
  //---------------------------------------------------
  //CONTENT
  //---------------------------------------------------
  this.content_ =  new WIDGET3D.Basic();
  var mesh =  new THREE.Mesh( new THREE.PlaneGeometry( this.width_, this.height_ ), material);
  this.content_.setMesh(mesh);
  this.addChild(this.content_);
  
  
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
  //CONTROLS
  //---------------------------------------------------
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls_){
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    
    this.controls_ = new WIDGET3D.DragControls({component : this, mouseButton : button, shiftKey : shift,
    width : (this.width_*2), height : ((this.height_+this.title_.height_)*2)});
    
    this.start_ = false;
  }
};

WIDGET3D.TitledWindow.prototype = WIDGET3D.Window.prototype.inheritance();

//sets titlebar text
WIDGET3D.TitledWindow.prototype.setTitle = function(title, side){

  this.titleContext_.fillStyle = "#B3B3B3";
  this.titleContext_.fillRect(0, 0, this.textureCanvas_.width, this.textureCanvas_.height);
  
  this.titleContext_.fillStyle = "#000000";
  this.titleContext_.font = "bold 60px Courier New";
  this.titleContext_.align = "center";
  this.titleContext_.textBaseline = "middle";
  this.titleContext_.fillText(title, 10, this.textureCanvas_.height/2);
  var texture = new THREE.Texture(this.textureCanvas_);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, side : side });
  
  this.title_.width_ = this.width_ - this.width_/10.0;
  this.title_.height_ = this.height_/10.0;
  
  this.titleMesh_ = new THREE.Mesh( new THREE.PlaneGeometry(this.title_.width_, this.title_.height_), material);
  this.titleMesh_.position.y = ((this.height_/2.0)+(this.height_/20.0));
  this.titleMesh_.position.x =(((this.width_ - this.width_/10.0)/2.0) - (this.width_/2.0));
  
  this.setMesh(this.titleMesh_);
  
  texture.needsUpdate = true;
};


WIDGET3D.TitledWindow.prototype.remove = function(){
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from DOM
  var canvas = this.textureCanvas_;
  document.body.removeChild(canvas);
  
  WIDGET3D.Window.prototype.remove.call( this );
};

WIDGET3D.TitledWindow.prototype.getContent = function(){
  return this.content_;
};

WIDGET3D.TitledWindow.prototype.setLocation = function(x, y, z){
  
  WIDGET3D.Window.prototype.setLocation.call( this, x, y, z);
  
  if(this.defaultControls_ && !this.start_){
    this.start_ = this.controls_.startPositionChanged();
  }
};

WIDGET3D.TitledWindow.prototype.setX = function(x){
  
  WIDGET3D.Window.prototype.setX.call( this, x );
  
  if(this.defaultControls_ && !this.start_){
    this.start_ = this.controls_.startPositionChanged();
  }
};

WIDGET3D.TitledWindow.prototype.setY = function(y){

  WIDGET3D.Window.prototype.setY.call( this, y );
  
  if(this.defaultControls_ && !this.start_){
    this.start_ = this.controls_.startPositionChanged();
  }
};

WIDGET3D.TitledWindow.prototype.setZ = function(z){
  WIDGET3D.Window.prototype.setZ.call( this, z );
  
  if(this.defaultControls_ && !this.start_){
    this.start_ = this.controls_.startPositionChanged();
  }
};
