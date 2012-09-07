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
//                 onclick : {handler : function, parameters : object}}
//
THREEJS_WIDGET3D.SelectDialog = function(parameters){
  
  WIDGET3D.Window.call( this );
  
  var parameters = parameters || {};

  this.width_ = parameters.width !== undefined ? parameters.width : 1000;
  this.height_ = parameters.height !== undefined ? parameters.height : 1000;
  this.color_ = parameters.color !== undefined ? parameters.color : 0xFFFFFF;
  this.opacity_ = parameters.opacity !== undefined ? parameters.opacity : 0.7;
  this.choices_ = parameters.choices !== undefined ? parameters.choices : [];
  this.hasCancel_ = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  this.text_ = parameters.text !== undefined ? parameters.text : false;
  
  if(this.hasCancel_){
    this.cancelText_ = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";
    this.choices_.push({string: this.cancelText_, onclick : {handler : function(event, window){window.remove()}, parameters : this}});
  }
  
  if(this.text_){
    this.createText();
  }
  
  //CREATING CHOICEBUTTONS
  this.choiceCanvases_ = [];
  this.createChoises();

};

THREEJS_WIDGET3D.SelectDialog.prototype = WIDGET3D.Window.prototype.inheritance();

THREEJS_WIDGET3D.SelectDialog.prototype.createText = function(){
  this.textCanvas_ = document.createElement('canvas');
  this.textCanvas_.width = 512;
  this.textCanvas_.height = 128;
  this.textCanvas_.style.display = "none";
  document.body.appendChild(this.textCanvas_);
  var context = this.textCanvas_.getContext('2d');
  
  var material = this.createTitleMaterial(this.text_, context, this.textCanvas_);
  
  if(!this.hasCancel_){
    var height = this.height_/((this.choices_.length+1)*1.2);
  }
  else{
    var height = this.height_/(((this.choices_.length+2)*1.2)+0.7);
  }
  
  
  var mesh = new THREE.Mesh(new THREE.CubeGeometry(this.width_, height, 10), material);

  mesh.position.y = this.height_ - height*0.5;
  
  this.setMesh(mesh);
}

THREEJS_WIDGET3D.SelectDialog.prototype.createChoises = function(){

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
    
    var material = this.createButtonMaterial(this.choices_[i].string, choiceContext, choiceCanvas);
    var width = this.width_/1.2;
    if(!this.hasCancel_ && !this.text_){
      var height = this.height_/((this.choices_.length)*1.2);
    }
    else if(this.hasCancel_ && !this.text_){
      var height = this.height_/(((this.choices_.length+1)*1.2)+0.7);
    }
    else if(!this.hasCancel_ && this.text_){
      var height = this.height_/((this.choices_.length+1)*1.2);
    }
    else{
      var height = this.height_/(((this.choices_.length+2)*1.2)+0.7);
    }
    var mesh = new THREE.Mesh( new THREE.CubeGeometry(width, height, 10), material);
    
    choice.setMesh(mesh);
    
    var parentLoc = this.getLocation();
    var y = 0;
    if(i == 0){
      if(this.text_){
        y = this.height_ - height*1.7;
      }
      else{
        y = this.height_ - height*0.5;
      }
    }
    else if(this.hasCancel_ && i > 1 && i == this.choices_.length-1){
      y = lastY - 1.7*height;
    }
    else{
      y = lastY - 1.2*height;
    }
    lastY = y;
    
    choice.setLocation(parentLoc.x, y ,parentLoc.z);
    
    choice.addEventListener(WIDGET3D.EventType.onclick, this.choices_[i].onclick.handler, this.choices_[i].onclick.parameters);
    choice.menuID_ = i;
    this.addChild(choice);
  }
};

THREEJS_WIDGET3D.SelectDialog.prototype.createButtonMaterial = function(string, context, canvas){

  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 40px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  var textWidth = context.measureText(string).width;
  context.fillText(string, canvas.width/2-(textWidth/2), canvas.height/2);
  
  var texture = new THREE.Texture(canvas);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, color: this.color_, opacity : this.opacity_});
  texture.needsUpdate = true;
  
  return material;
}

THREEJS_WIDGET3D.SelectDialog.prototype.createTitleMaterial = function(string, context, canvas){

  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 45px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  var textWidth = context.measureText(string).width;
  context.fillText(string, canvas.width/2-(textWidth/2), canvas.height/2);
  
  var texture = new THREE.Texture(canvas);
  
  var material = new THREE.MeshBasicMaterial({ map: texture, color: this.color_, opacity : this.opacity_});
  texture.needsUpdate = true;
  
  return material;
}

THREEJS_WIDGET3D.SelectDialog.prototype.changeChoiceText = function(text, index){
  var object = false;
  for(var i = 0; i < this.children_.length; ++i){
    if(this.children_[i].menuID_ == index){
      object = this.children_[i];
      break;
    }
  }
  if(object){
    var canvas = object.mesh_.material.map.image;
    var context = object.mesh_.material.map.image.getContext('2d');
    var material = this.createButtonMaterial(text, context, canvas);
    object.mesh_.material = material;
    object.mesh_.needsUpdate = true;
    return true;
  }
  return false;
}


THREEJS_WIDGET3D.SelectDialog.prototype.remove = function(){

  //children needs to be removed
  for(var k = 0; k < this.children_.length; ++k){
    this.children_[k].remove();
  }
  
  //removing child canvases from DOM
  for(var i = 0; i < this.choiceCanvases_.length; ++i){
    canvas = this.choiceCanvases_[i];
    document.body.removeChild(canvas);
  }
  
  //hiding the window from scene
  this.hide();
  
  //deleting the background canvas
  var canvas = this.textCanvas_;
  document.body.removeChild(canvas);
  
  //removing eventlisteners
  for(var i = 0; i < this.events_.length; ++i){
    if(this.events_[i].callback){
      this.removeEventListener(i);
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

