//---------------------------------------------------
//
// 3D DIALOG
//
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              color = hexadecimal string
//              text = string
//              submitText = string
//              maxTextLength = integer
//


//TODO: REFACTOR SO THAT AMOUNT OF TEXTBOXES AND BUTTONS CAN BE PARAMETRISIZED
WIDGET3D.Dialog = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.depth_ = parameters.depth !== undefined ? parameters.depth : 20;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  
  
  this.title_ = parameters.title !== undefined ? parameters.title : "This is a dialog";
  
  this.fields_ = parameters.fields !== undefined ? parameters.fields : [];
  this.buttons_ = parameters.buttons !== undefined ? parameters.buttons : [];
  this.hasCancel_ = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  
  if(this.hasCancel_){
    this.cancelText_ = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";   
    var createCancelFunction = function(c){
      return function(){
        c.remove();
      }
    }
    this.buttons_.push({text: this.cancelText_, onclick : createCancelFunction(this)});
  }
  
  this.componentHeight_ = this.height_ /((this.fields_.length + 3) * 1.3);
  
  //Creating main mesh
  this.createDialogTitle();
  //Creating buttons
  this.createButtons();
  //Creating textfields
  this.createTextfields();
};

WIDGET3D.Dialog.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.Dialog.prototype.createDialogTitle = function(){
  
  this.canvas_ = document.createElement('canvas');
  this.canvas_.width = 512;
  this.canvas_.height = 512;
  this.canvas_.style.display = "none";
  document.body.appendChild(this.canvas_);
  var context = this.canvas_.getContext('2d');
  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 30px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  
  var textWidth = context.measureText(this.title_).width;
  var textHeight = context.measureText(this.title_).height;
  
  context.fillText(this.title_, this.canvas_.width/2-(textWidth/2), 30);
  var texture = new THREE.Texture(this.canvas_);
  texture.needsUpdate = true;
  
  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color_, opacity : this.opacity_}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color_, opacity: this.opacity_}));//front & back face
  
  var geometry = new THREE.CubeGeometry(this.width_, this.height_, this.depth_*0.75);
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
  
  this.setMesh(mesh);
  
  this.addEventListener("click",
    function(event){
      event.stopPropagation();
      event.preventDefault();
    }, 
  false);
}

WIDGET3D.Dialog.prototype.createButtons = function(){
  
  var buttonWidth = this.width_/(this.buttons_.length + 2);
  var buttonHeight = this.componentHeight_;
  
  var left = -this.width_/2.0;
  var bottom = -this.height_/2.0 + 1;
  
  var step = this.width_/this.buttons_.length;
  var slotCenterX = step/2.0;
  var slotCenterY = bottom + buttonHeight / 2.0;
  
  var lastX = 0;
  
  for(var i = 0; i < this.buttons_.length; ++i){
  
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    canvas.style.display = "none";
    document.body.appendChild(canvas);
    this.buttons_[i].canvas = canvas;
    
    var context = canvas.getContext('2d');

    context.fillStyle = "#B3B3B3";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = "#000000";
    context.font = "bold 60px Courier New";
    context.align = "center";
    context.textBaseline = "middle";
    
    var textWidth = context.measureText(this.buttons_[i].text).width;
    context.fillText(this.buttons_[i].text, canvas.width/2-(textWidth/2), canvas.height/2);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    var material = new THREE.MeshBasicMaterial({map: texture});//front & back face
    var geometry = new THREE.CubeGeometry(buttonWidth, buttonHeight, this.depth_);
    var mesh = this.createFaceMaterialsMesh(material, geometry);
    
    var button = new WIDGET3D.Basic();
    button.setMesh(mesh);
    button.addEventListener("click", this.buttons_[i].onclick, false);
    this.addChild(button);
    
    if(i == 0){
      var x = left + slotCenterX;
    }
    else{
      var x = lastX + step;
    }
    button.setPosition(x, slotCenterY, this.getPosition().z);
    lastX = x;
  }
};

WIDGET3D.Dialog.prototype.createTextfields = function(){
  
  var textBoxClickFactory = function(t){
    return function(event){
      event.stopPropagation();
      event.preventDefault();
      WIDGET3D.unfocusFocused();
      t.focus();
    }
  };
  
  var textBoxKeyFactory = function(t){
    return function(event){
    
      event.stopPropagation();
      
      if(event.charCode != 0){
        //if event is a character key press
        var letter = String.fromCharCode(event.charCode);
        t.addLetter(letter);
      }
      else if(event.type == "keydown" && (event.keyCode == 8 || event.keyCode == 46)){
        //if event is a backspace or delete key press
        t.erase(1);
      }
    }
  };
  
  var textBoxUpdateFactory = function(canvas, textBox, texture){
    
    return function(){
      var context = canvas.getContext('2d');
      
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.fillStyle = "#000000";
      context.font = "bold 50px Courier New";
      context.align = "center";
      context.textBaseline = "middle";
      
      context.fillText(textBox.textHandle_, 5, canvas.height/2);
      
      texture.needsUpdate = true;
      
      //textBox.mesh_.material.needsUpdate = true;
    }
  };
  
  var fieldWidth = this.width_/2.5;
  var fieldHeight = this.componentHeight_;
  
  var left = -this.width_/2.0;
  var right = this.width_/2.0;
  var top = this.height_/2.0 - fieldHeight;
  
  var step = (this.height_-2*fieldHeight)/this.fields_.length;
  var slotCenterY = step/2.0;
  
  var fieldX = right - fieldWidth/1.5;
  var descriptionX = left + fieldWidth/1.5;
  
  var lastY = 0;
  
  for( var i = 0; i < this.fields_.length; ++i){
  
    //Creating textfield
    var canvas1 = document.createElement('canvas');
    canvas1.width = 512;
    canvas1.height = 128;
    canvas1.style.display = "none";
    document.body.appendChild(canvas1);
    this.fields_[i].canvas1 = canvas1;
    
    var texture = new THREE.Texture(canvas1);
    var material = new THREE.MeshBasicMaterial({map: texture});
    var geometry = new THREE.CubeGeometry(fieldWidth, fieldHeight, this.depth_);
    var mesh = this.createFaceMaterialsMesh(material, geometry);
    
    var textfield = new WIDGET3D.Text({maxLength : this.fields_[i].maxLength});
    
    textfield.setText("");
    textfield.setMesh(mesh);
    
    textfield.addEventListener("click", textBoxClickFactory(textfield), false);
    textfield.addEventListener("keypress", textBoxKeyFactory(textfield));
    textfield.addEventListener("keydown", textBoxKeyFactory(textfield));
    textfield.addUpdateCallback(textBoxUpdateFactory(canvas1, textfield, texture));
    
    this.addChild(textfield);
    
    //Creating description for field
    var canvas2 = document.createElement('canvas');
    canvas2.width = 512;
    canvas2.height = 128;
    canvas2.style.display = "none";
    document.body.appendChild(canvas2);
    this.fields_[i].canvas2 = canvas2;
    var context = canvas2.getContext('2d');
    
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas2.width, canvas2.height);
    
    context.fillStyle = "#000000";
    context.font = "bold 60px Courier New";
    context.align = "center";
    context.textBaseline = "middle";
    
    var textWidth = context.measureText(this.fields_[i].description).width;
    context.fillText(this.fields_[i].description, canvas2.width/2-(textWidth/2), canvas2.height/2);
    var texture2 = new THREE.Texture(canvas2);
    texture2.needsUpdate = true;
    
    var material2 = new THREE.MeshBasicMaterial({
      map: texture2,
      color: this.color_,
      opacity: this.opacity_
    });
    var geometry2 = new THREE.CubeGeometry(fieldWidth, fieldHeight, this.depth_);
    var mesh2 = this.createFaceMaterialsMesh(material2, geometry2);
    
    var description = new WIDGET3D.Basic();
    description.setMesh(mesh2);
    this.addChild(description);
    
    //positioning
    if(i == 0){
      var y = top - slotCenterY;
    }
    else{
      var y = lastY - step;
    }
    textfield.setPosition(fieldX, y, this.getPosition().z);
    description.setPosition(descriptionX, y, this.getPosition().z);
    
    lastY = y;
  }
};


WIDGET3D.Dialog.prototype.createFaceMaterialsMesh = function(frontMaterial, geometry){

  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color_, opacity : this.opacity_}));//side faces
  materials.push(frontMaterial);//front & back face

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
  
  return mesh;
}


WIDGET3D.Dialog.prototype.remove = function(){

  //removing child canvases from DOM
  for(var i = 0; i < this.buttons_.length; ++i){
    document.body.removeChild(this.buttons_[i].canvas);
  }
  for(var j = 0; j < this.fields_.length; ++j){
    document.body.removeChild(this.fields_[j].canvas1);
    document.body.removeChild(this.fields_[j].canvas2);
  }
  //deleting the background canvas
  document.body.removeChild(this.canvas_);
  
  WIDGET3D.Group.prototype.remove.call( this );
};

