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
//              buttonText = string
//              maxTextLength = integer
//
WIDGET3D.Dialog = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.text_ = parameters.text !== undefined ? parameters.text : "This is a dialog";
  this.buttonText_ = parameters.buttonText !== undefined ? parameters.buttonText : "submit";
  this.maxTextLength_ = parameters.maxTextLength !== undefined ? parameters.maxTextLength : undefined;
  
  this.canvas_ = document.createElement('canvas');
  this.canvas_.width = 512;
  this.canvas_.height = 512;
  this.canvas_.style.display = "none";
  document.body.appendChild(this.canvas_);
  this.context_ = this.canvas_.getContext('2d');
  
  this.material_ = this.createDialogText(this.text_);
  
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width_, this.height_), this.material_);
  
  this.setMesh(mesh);
  
  //CREATING DIALOG BUTTON
  this.button_ = new WIDGET3D.Basic();
  
  this.buttonCanvas_ = document.createElement('canvas');
  this.buttonCanvas_.width = 512;
  this.buttonCanvas_.height = 128;
  this.buttonCanvas_.style.display = "none";
  document.body.appendChild(this.buttonCanvas_);
  this.buttonContext_ = this.buttonCanvas_.getContext('2d');
  
  this.createButtonText(this.buttonText_);
  
  this.addChild(this.button_);
  
  //CREATING TEXTBOX
  
  this.textBox_ = new WIDGET3D.Text({maxLength : this.maxTextLength_});
  
  this.textCanvas_ = document.createElement('canvas');
  this.textCanvas_.width = 512;
  this.textCanvas_.height = 128;
  this.textCanvas_.style.display = "none";
  document.body.appendChild(this.textCanvas_);
  this.textContext_ = this.textCanvas_.getContext('2d');
  
  this.createTextBox();
  this.textBox_.addUpdateCallback(this.updateTextBox, this);
  
  this.addChild(this.textBox_);
  this.textBox_.setText("");
  
  this.textBox_.addEventListener("click", this.textBoxOnclick, this);
  this.textBox_.addEventListener("keypress", this.textBoxOnkeypress, this);
  this.textBox_.addEventListener("keydown", this.textBoxOnkeypress, this);
};

WIDGET3D.Dialog.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.Dialog.prototype.createDialogText = function(string){

  this.context_.fillStyle = "#FFFFFF";
  this.context_.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
  
  this.context_.fillStyle = "#000055";
  this.context_.font = "bold 30px Courier New";
  this.context_.align = "center";
  this.context_.textBaseline = "middle";
  
  var textWidth = this.context_.measureText(string).width;
  this.context_.fillText(string, this.canvas_.width/2-(textWidth/2), 40);
  var texture = new THREE.Texture(this.canvas_);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, color: this.color_, opacity: this.opacity_, side : THREE.DoubleSide});
  
  texture.needsUpdate = true;
  
  return material;
  
}

WIDGET3D.Dialog.prototype.createButtonText = function(string){

  this.buttonContext_.fillStyle = "#B3B3B3";
  this.buttonContext_.fillRect(0, 0, this.buttonCanvas_.width, this.buttonCanvas_.height);
  
  this.buttonContext_.fillStyle = "#000000";
  this.buttonContext_.font = "bold 60px Courier New";
  this.buttonContext_.align = "center";
  this.buttonContext_.textBaseline = "middle";
  
  var textWidth = this.buttonContext_.measureText(string).width;
  this.buttonContext_.fillText(string, this.buttonCanvas_.width/2-(textWidth/2), this.buttonCanvas_.height/2);
  var texture = new THREE.Texture(this.buttonCanvas_);
  
  var material = new THREE.MeshBasicMaterial({ map: texture });
  
  var mesh = new THREE.Mesh( new THREE.CubeGeometry(this.width_/2.0, this.height_/10.0, 20), material);
  
  this.button_.setMesh(mesh);
  
  var parentLoc = this.getPosition();
  
  var y = parentLoc.y - (this.height_/5.0);
  
  this.button_.setPosition(parentLoc.x, y ,parentLoc.z);
  
  texture.needsUpdate = true;
};

WIDGET3D.Dialog.prototype.createTextBox = function(){
  
  var texture = new THREE.Texture(this.textCanvas_);
  var material = new THREE.MeshBasicMaterial({ map: texture});
  var mesh = new THREE.Mesh( new THREE.CubeGeometry(this.width_/1.5, this.height_/10.0, 20), material);
  
  this.textBox_.setMesh(mesh);
  
  var parentLoc = this.getPosition();
  
  var y = parentLoc.y + this.height_/10;
  
  this.textBox_.setPosition(parentLoc.x, y ,parentLoc.z);
  
  this.updateTextBox(this);
}

WIDGET3D.Dialog.prototype.updateTextBox = function(dialog){

  dialog.textContext_.fillStyle = "#FFFFFF";
  dialog.textContext_.fillRect(0, 0, dialog.textCanvas_.width, dialog.textCanvas_.height);
  
  dialog.textContext_.fillStyle = "#000000";
  dialog.textContext_.font = "bold 50px Courier New";
  dialog.textContext_.align = "center";
  dialog.textContext_.textBaseline = "middle";
  
  dialog.textContext_.fillText(dialog.textBox_.textHandle_, 5, dialog.textCanvas_.height/2);
  
  dialog.textBox_.mesh_.material.map.needsUpdate = true;
  
};

WIDGET3D.Dialog.prototype.textBoxOnclick = function(event, dialog){
  dialog.textBox_.focus();
};

WIDGET3D.Dialog.prototype.textBoxOnkeypress = function(event, dialog){
  
  if(event.charCode != 0){
    //if event is a character key press
    var letter = String.fromCharCode(event.charCode);
    dialog.textBox_.addLetter(letter);
  }
  else if(event.type == "keydown" && (event.keyCode == 8 || event.keyCode == 46)){
    //if event is a backspace or delete key press
    dialog.textBox_.erase(1);
  }

};

WIDGET3D.Dialog.prototype.remove = function(){
  
  //hiding the Group from scene
  this.hide();
  
  //removing texturecanvases from dom
  var canvas1 = this.textCanvas_;
  var canvas2 = this.buttonCanvas_;
  document.body.removeChild(canvas1);
  document.body.removeChild(canvas2);
  
  WIDGET3D.Group.prototype.remove.call( this );
}

