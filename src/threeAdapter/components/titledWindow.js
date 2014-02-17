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
  
  this.width = parameters.width !== undefined ? parameters.width : 2000;
  this.height = parameters.height !== undefined ? parameters.height : 2000;
  
  var text = parameters.title !== undefined ? parameters.title : "title";
  
  var color = parameters.color !== undefined ? parameters.color : 0x808080;
  var texture = parameters.texture;
  var material = parameters.material !== undefined ? parameters.material :  new THREE.MeshBasicMaterial({color : color, map : texture, side : THREE.DoubleSide});
  
  
  //---------------------------------------------------
  //TITLEBAR, ACTS AS THE BODY FOR THE WINDOW
  //---------------------------------------------------
  this.title = new WIDGET3D.Widget();
  var mainMesh = this.createTitle(text, material.side);
  this.title.setObject3D(mainMesh);
  this.add(this.title);
  
  //---------------------------------------------------
  //CONTENT
  //---------------------------------------------------
  this.content =  new WIDGET3D.Widget();
  var mesh =  new THREE.Mesh( new THREE.PlaneGeometry( this.width, this.height ), material);
  this.content.setObject3D(mesh);
  this.add(this.content);
  
  
  //---------------------------------------------------
  //CLOSE BUTTON
  //---------------------------------------------------
  this.closeButton = new WIDGET3D.Widget();
  
  var buttonMesh = new THREE.Mesh( new THREE.PlaneGeometry( this.width/10.0, this.height/10.0 ),
    new THREE.MeshBasicMaterial( { color: 0xAA0000, side : material.side} ) );
  
  this.closeButton.setObject3D(buttonMesh);
  this.closeButton.setPosition(((this.width/2.0)-(this.width/20.0)), ((this.height/2.0)+(this.height/20.0)), 0);
  
  this.add(this.closeButton);
  
  var createCloseFunction = function(p){
    return function(){
      p.remove();
    };
  }
  this.closeButton.addEventListener("click", createCloseFunction(this));
  
  //---------------------------------------------------
  //CONTROLS
  //---------------------------------------------------
  this.defaultControls = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls){
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    var attached = parameters.attached !== undefined ? parameters.attached : false;
    var debug = parameters.debug !== undefined ? parameters.debug : false;
    
    var control = new WIDGET3D.DragControl(this, {
      debug: debug,
      mouseButton : button,
      shiftKey : shift,
      width : (this.width*2),
      height : ((this.height+this.title.height)*2)
    });
  }
};

WIDGET3D.TitledWindow.prototype = WIDGET3D.Group.prototype.inheritance();

//sets titlebar text
WIDGET3D.TitledWindow.prototype.createTitle = function(text, side){

  this.textureCanvas = document.createElement('canvas');
  this.textureCanvas.width = 512;
  this.textureCanvas.height = 128;
  this.textureCanvas.style.display = "none";
  
  document.body.appendChild(this.textureCanvas);
  
  this.setTitle(text);
  
  var texture = new THREE.Texture(this.textureCanvas);
  texture.needsUpdate = true;
  
  var material = new THREE.MeshBasicMaterial({ map: texture, side : side });
  
  this.title.width = this.width - this.width/10.0;
  this.title.height = this.height/10.0;
  
  var titleMesh = new THREE.Mesh( new THREE.PlaneGeometry(this.title.width, this.title.height), material);
  titleMesh.position.y = ((this.height/2.0)+(this.height/20.0));
  titleMesh.position.x =(((this.width - this.width/10.0)/2.0) - (this.width/2.0));
  
  return titleMesh;
};

WIDGET3D.TitledWindow.prototype.setTitle = function(text){

  var titleContext = this.textureCanvas.getContext('2d');

  titleContext.fillStyle = "#B3B3B3";
  titleContext.fillRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);
  
  titleContext.fillStyle = "#000000";
  titleContext.font = "bold 60px Courier New";
  titleContext.align = "center";
  titleContext.textBaseline = "middle";
  titleContext.fillText(text, 10, this.textureCanvas.height/2);
};

WIDGET3D.TitledWindow.prototype.updateTitle = function(text){
  this.setTitle(text);
  this.title.object3D.material.map.needsUpdate = true;
  
  return this;
}


WIDGET3D.TitledWindow.prototype.remove = function(){
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from DOM
  var canvas = this.textureCanvas;
  document.body.removeChild(canvas);
  
  WIDGET3D.Group.prototype.remove.call( this );
};

WIDGET3D.TitledWindow.prototype.getContent = function(){
  return this.content;
};


