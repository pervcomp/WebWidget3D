//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// TITLED Group
//---------------------------------------------------
//
// PARAMETERS:  title :           title string
//              width :           widht in world coordinate space
//              height:           height in world coordinate space
//              defaultControls : boolean that tells if the default mouse controls are used
//              *color:           hexadecimal color for Group
//              *texture :        three.js texture object
//              *material :       three.js material object
//              * if material is given texture and color doens't apply
//
//              All parameters are optional
//
WIDGET3D.TitledWindow = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var that = this;
  
  var parameters = parameters || {};
  
  this.width_ = parameters.width !== undefined ? parameters.width : 2000;
  this.height_ = parameters.height !== undefined ? parameters.height : 2000;
  
  var title = parameters.title !== undefined ? parameters.title : "title";
  
  var color = parameters.color !== undefined ? parameters.color : 0x808080;
  var texture = parameters.texture;
  var material = parameters.material !== undefined ? parameters.material :  new THREE.MeshBasicMaterial({color : color, map : texture, side : THREE.DoubleSide});
  
  
  //---------------------------------------------------
  //TITLEBAR, ACTS AS THE BODY FOR THE WINDOW
  //---------------------------------------------------
  this.title_ = {};
  var mainMesh = this.createTitle(title, material.side);
  this.setMesh(mainMesh);
  
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
  this.closeButton_.setPosition(((this.width_/2.0)-(this.width_/20.0)), ((this.height_/2.0)+(this.height_/20.0)), 0);
  
  this.addChild(this.closeButton_);
  
  //---------------------------------------------------
  //CONTROLS
  //---------------------------------------------------
  this.defaultControls_ = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls_){
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    var attached = parameters.attached !== undefined ? parameters.attached : false;
    var debug = parameters.debug !== undefined ? parameters.debug : false;
    
    this.controls_ = new WIDGET3D.DragControls({
      debug: debug,
      component : this,
      mouseButton : button,
      shiftKey : shift,
      width : (this.width_*2),
      height : ((this.height_+this.title_.height_)*2)
    });
    
    this.start_ = false;
  }
};

WIDGET3D.TitledWindow.prototype = WIDGET3D.Group.prototype.inheritance();

//sets titlebar text
WIDGET3D.TitledWindow.prototype.createTitle = function(title, side){

  this.textureCanvas_ = document.createElement('canvas');
  this.textureCanvas_.width = 512;
  this.textureCanvas_.height = 128;
  this.textureCanvas_.style.display = "none";
  
  document.body.appendChild(this.textureCanvas_);
  
  this.setTitle(title);
  
  var texture = new THREE.Texture(this.textureCanvas_);
  texture.needsUpdate = true;
  
  var material = new THREE.MeshBasicMaterial({ map: texture, side : side });
  
  this.title_.width_ = this.width_ - this.width_/10.0;
  this.title_.height_ = this.height_/10.0;
  
  var titleMesh = new THREE.Mesh( new THREE.PlaneGeometry(this.title_.width_, this.title_.height_), material);
  titleMesh.position.y = ((this.height_/2.0)+(this.height_/20.0));
  titleMesh.position.x =(((this.width_ - this.width_/10.0)/2.0) - (this.width_/2.0));
  
  return titleMesh;
};

WIDGET3D.TitledWindow.prototype.setTitle = function(title){

  var titleContext = this.textureCanvas_.getContext('2d');

  titleContext.fillStyle = "#B3B3B3";
  titleContext.fillRect(0, 0, this.textureCanvas_.width, this.textureCanvas_.height);
  
  titleContext.fillStyle = "#000000";
  titleContext.font = "bold 60px Courier New";
  titleContext.align = "center";
  titleContext.textBaseline = "middle";
  titleContext.fillText(title, 10, this.textureCanvas_.height/2);
};

WIDGET3D.TitledWindow.prototype.updateTitle = function(title){

  this.setTitle(title);
  this.mesh_.material.map.needsUpdate = true;
}


WIDGET3D.TitledWindow.prototype.remove = function(){
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from DOM
  var canvas = this.textureCanvas_;
  document.body.removeChild(canvas);
  
  if(this.defaultControls_){
    this.controls_.remove();
  }
  
  WIDGET3D.Group.prototype.remove.call( this );
};

WIDGET3D.TitledWindow.prototype.getContent = function(){
  return this.content_;
};
