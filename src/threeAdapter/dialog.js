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
THREEJS_WIDGET3D.Dialog = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.text_ = parameters.text !== undefined ? parameters.text : "This is a dialog";
  this.buttonText_ = parameters.buttonText !== undefined ? parameters.buttonText : "submit";
  this.maxTextLength = parameters.maxTextLength !== undefined ? parameters.maxTextLength : undefined;
  
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
  
  this.textBox_ = new WIDGET3D.Text();
  this.textBox_.maxLength_ = this.maxTextLength;
  
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
  
  this.textBox_.addEventListener(WIDGET3D.EventType.onclick, this.textBoxOnclick, this);
  this.textBox_.addEventListener(WIDGET3D.EventType.onkeypress, this.textBoxOnkeypress, this);
  this.textBox_.addEventListener(WIDGET3D.EventType.onkeydown, this.textBoxOnkeypress, this);
};

THREEJS_WIDGET3D.Dialog.prototype = WIDGET3D.Window.prototype.inheritance();

THREEJS_WIDGET3D.Dialog.prototype.update = function(){
  this.textBox_.update();
  
  if(this.updateCallback_){
    this.updateCallback_.callback(this.updateCallback_.arguments);
  }
}

THREEJS_WIDGET3D.Dialog.prototype.createDialogText = function(string){

  this.context_.fillStyle = "#FFFFFF";
  this.context_.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
  
  this.context_.fillStyle = "#000055";
  this.context_.font = "bold 30px Courier New";
  this.context_.align = "center";
  this.context_.textBaseline = "middle";
  
  var textWidth = this.context_.measureText(string).width;
  this.context_.fillText(string, this.canvas_.width/2-(textWidth/2), 40);
  var texture = new THREE.Texture(this.canvas_);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, color: this.color_, opacity: this.opacity_});
  
  texture.needsUpdate = true;
  
  return material;
  
}

THREEJS_WIDGET3D.Dialog.prototype.createButtonText = function(string){

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
  
  var parentLoc = this.getLocation();
  
  var y = parentLoc.y - (this.height_/5.0);
  
  this.button_.setLocation(parentLoc.x, y ,parentLoc.z);
  
  texture.needsUpdate = true;
};

THREEJS_WIDGET3D.Dialog.prototype.createTextBox = function(){
  
  var texture = new THREE.Texture(this.textCanvas_);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var mesh = new THREE.Mesh( new THREE.PlaneGeometry(this.width_/1.5, this.height_/10.0), material);
  
  this.textBox_.setMesh(mesh);
  
  var parentLoc = this.getLocation();
  
  var y = parentLoc.y + this.height_/10;
  
  this.textBox_.setLocation(parentLoc.x, y ,parentLoc.z+10);
  
  this.updateTextBox(this);
}

THREEJS_WIDGET3D.Dialog.prototype.updateTextBox = function(window){

  window.textContext_.fillStyle = "#FFFFFF";
  window.textContext_.fillRect(0, 0, window.textCanvas_.width, window.textCanvas_.height);
  
  window.textContext_.fillStyle = "#000000";
  window.textContext_.font = "bold 50px Courier New";
  window.textContext_.align = "center";
  window.textContext_.textBaseline = "middle";
  
  window.textContext_.fillText(window.textBox_.text_, 5, window.textCanvas_.height/2);
  
  window.textBox_.mesh_.material.map.needsUpdate = true;
  
};

THREEJS_WIDGET3D.Dialog.prototype.textBoxOnclick = function(event, window){
  window.textBox_.focus();
};

THREEJS_WIDGET3D.Dialog.prototype.textBoxOnkeypress = function(event, window){
  
  if(event.charCode != 0){
    //if event is a character key press
    var letter = String.fromCharCode(event.charCode);
    window.textBox_.addLetter(letter);
  }
  else if(event.type == "keydown" && (event.keyCode == 8 || event.keyCode == 46)){
    //if event is a backspace or delete key press
    window.textBox_.erase(1);
  }

};

THREEJS_WIDGET3D.Dialog.prototype.remove = function(){
  
  //children needs to be removed
  for(var k = 0; k < this.children_.length; ++k){
    this.children_[k].remove();
  }
  
  //hiding the window from scene
  this.hide();
  
  //removing texturecanvases from dom
  var canvas1 = this.textCanvas_;
  var canvas2 = this.buttonCanvas_;
  document.body.removeChild(canvas1);
  document.body.removeChild(canvas2);
  
  //removing eventlisteners
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListeners(i);
    }
  }
  
  //If wondow has a mesh, it has to be removed allso
  if(this.mesh_){
    var mesh = WIDGET3D.mainWindow.removeMesh(this.mesh_);
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
  
}

