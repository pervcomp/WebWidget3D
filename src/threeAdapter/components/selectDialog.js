//---------------------------------------------------
//
// 3D SELECT DIALOG
//
//---------------------------------------------------
//
// PARAMETERS:  width : width in world coordinates
//              height : height in world coordinates
//              color : hexadecimal string
//              text : string, title text
//              choices = array of choises 
//                {string: choice name displayed, 
//                 onclick : function}
//
//
// TODO: ENABLE DIFFERENT LAYOUT
WIDGET3D.SelectDialog = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.depth_ = parameters.depth !== undefined ? parameters.depth : 10;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.choices_ = parameters.choices !== undefined ? parameters.choices : [];
  this.hasCancel_ = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  this.text_ = parameters.text !== undefined ? parameters.text : false;
  
  if(this.hasCancel_){
    this.cancelText_ = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";
    
    var createCancelFunction = function(c){
      return function(){
        c.remove()
      }
    }
    var handler = createCancelFunction(this);
    
    this.choices_.push({string: this.cancelText_, onclick : {handler : handler}});
  }
  
  if(this.text_){
    this.createText();
  }
  else{
    this.choiceHeight_ = this.height_/((this.choices_.length)*1.2);
  }
  
  //CREATING CHOICEBUTTONS
  this.choiceCanvases_ = [];
  this.createChoises();
};

WIDGET3D.SelectDialog.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.SelectDialog.prototype.createText = function(){
  this.textCanvas_ = document.createElement('canvas');
  this.textCanvas_.width = 512;
  this.textCanvas_.height = 128;
  this.textCanvas_.style.display = "none";
  document.body.appendChild(this.textCanvas_);
  var context = this.textCanvas_.getContext('2d');
  
  this.choiceHeight_ = this.height_/((this.choices_.length+1)*1.2);
  var mesh = this.createTitle(this.text_, context, this.textCanvas_);
  mesh.position.y = this.height_*0.5 - this.choiceHeight_*0.5;
  
  var title = new WIDGET3D.Basic();
  title.setMesh(mesh);
  
  this.add(title);
  
  this.addEventListener("click",
    function(event){
      event.stopPropagation();
      event.preventDefault();
    }, 
  false);
}

WIDGET3D.SelectDialog.prototype.createChoises = function(){

  var lastY = 0;
  
  for(var i = 0; i < this.choices_.length; ++i){
    var choice = new WIDGET3D.Basic();
    var choiceCanvas = document.createElement('canvas');
    this.choiceCanvases_.push(choiceCanvas);
    choiceCanvas.width = 512;
    choiceCanvas.height = 128;
    choiceCanvas.style.display = "none";
    document.body.appendChild(choiceCanvas);
    var choiceContext = choiceCanvas.getContext('2d');
    
    var width = this.width_/1.2;
    var height = this.choiceHeight_;
    
    var materials = this.createButtonMaterial(this.choices_[i].string, choiceContext, choiceCanvas);
    var geometry = new THREE.CubeGeometry(width, height, this.depth_);
    
    for (var j = 0; j < geometry.faces.length; j ++ ){
      var face = geometry.faces[ j ];
      if(j === 4 || j == 5){
        face.materialIndex = 1;
      }
      else{
        face.materialIndex = 0;
      }
    }
    geometry.materials = materials;
    var material = new THREE.MeshFaceMaterial(materials);
    var mesh = new THREE.Mesh(geometry, material);

    choice.setMesh(mesh);
    
    var parentLoc = this.getPosition();
    var y = 0;
    if(i == 0){
      if(this.text_){
        y = this.height_*0.5 - height*1.7;
      }
      else{
        y = this.height_*0.5 - height*0.5;
      }
    }
    else{
      y = lastY - 1.2*height;
    }
    lastY = y;
    
    choice.setPosition(parentLoc.x, y ,parentLoc.z);
    
    choice.addEventListener("click", this.choices_[i].onclick.handler, false);
    choice.menuID_ = i;
    this.add(choice);
  }
};

WIDGET3D.SelectDialog.prototype.createButtonMaterial = function(string, context, canvas){

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 40px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  var textWidth = context.measureText(string).width;
  context.fillText(string, canvas.width/2-(textWidth/2), canvas.height/2);
  
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color_, opacity : this.opacity_}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color_, opacity : this.opacity_}));//front & back face
  
  return materials;
}

WIDGET3D.SelectDialog.prototype.createTitle = function(string, context, canvas){

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 45px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  var textWidth = context.measureText(string).width;
  context.fillText(string, canvas.width/2-(textWidth/2), canvas.height/2);
  
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color_, opacity : this.opacity_}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color_, opacity : this.opacity_}));//front & back face
  
  var geometry = new THREE.CubeGeometry(this.width_, this.choiceHeight_, this.depth_);
  
  for( var i = 0; i < geometry.faces.length; i ++ ){
    var face = geometry.faces[ i ];
    if(i === 4 || i === 5){
      face.materialIndex = 1;
    }
    else{
      face.materialIndex = 0;
    }
  }
  
  geometry.materials = materials;
  var material = new THREE.MeshFaceMaterial(materials);
  var mesh = new THREE.Mesh(geometry, material);
  
  return mesh;
}

WIDGET3D.SelectDialog.prototype.changeChoiceText = function(text, index){
  var object = false;
  for(var i = 0; i < this.children_.length; ++i){
    if(this.children_[i].menuID_ == index){
      object = this.children_[i];
      break;
    }
  }
  if(object){
    var canvas = object.container_.material.map.image;
    var context = object.container_.material.map.image.getContext('2d');
    var materials = this.createButtonMaterial(text, context, canvas);

    object.container_.geometry.materials = materials;
    object.container_.material = new THREE.MeshFaceMaterial(materials);
    object.container_.needsUpdate = true;
    return true;
  }
  return false;
}


WIDGET3D.SelectDialog.prototype.remove = function(){
  
  //removing child canvases from DOM
  for(var i = 0; i < this.choiceCanvases_.length; ++i){
    canvas = this.choiceCanvases_[i];
    document.body.removeChild(canvas);
  }
  this.choiceCanvases_ = null;
  
  //deleting the background canvas
  var canvas = this.textCanvas_;
  document.body.removeChild(canvas);
  
  WIDGET3D.Group.prototype.remove.call( this );
};

