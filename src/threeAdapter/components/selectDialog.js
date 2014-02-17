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

  this.width = parameters.width !== undefined ? parameters.width : 1000;
  this.height = parameters.height !== undefined ? parameters.height : 1000;
  this.depth = parameters.depth !== undefined ? parameters.depth : 10;
  this.color = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  this.choices = parameters.choices !== undefined ? parameters.choices : [];
  this.hasCancel = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  this.text = parameters.text !== undefined ? parameters.text : false;
  
  if(this.hasCancel){
    this.cancelText = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";
    
    var createCancelFunction = function(c){
      return function(){
        c.remove()
      }
    }
    var handler = createCancelFunction(this);
    
    this.choices.push({string: this.cancelText, onclick : {handler : handler}});
  }
  
  if(this.text){
    this.createText();
  }
  else{
    this.choiceHeight = this.height/((this.choices.length)*1.2);
  }
  
  //CREATING CHOICEBUTTONS
  this.choiceCanvases = [];
  this.createChoises();
};

WIDGET3D.SelectDialog.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.SelectDialog.prototype.createText = function(){
  this.textCanvas = document.createElement('canvas');
  this.textCanvas.width = 512;
  this.textCanvas.height = 128;
  this.textCanvas.style.display = "none";
  document.body.appendChild(this.textCanvas);
  var context = this.textCanvas.getContext('2d');
  
  this.choiceHeight = this.height/((this.choices.length+1)*1.2);
  var mesh = this.createTitle(this.text, context, this.textCanvas);
  mesh.position.y = this.height*0.5 - this.choiceHeight*0.5;
  
  var title = new WIDGET3D.Widget();
  title.setObject3D(mesh);
  
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
  
  for(var i = 0; i < this.choices.length; ++i){
    var choice = new WIDGET3D.Widget();
    var choiceCanvas = document.createElement('canvas');
    this.choiceCanvases.push(choiceCanvas);
    choiceCanvas.width = 512;
    choiceCanvas.height = 128;
    choiceCanvas.style.display = "none";
    document.body.appendChild(choiceCanvas);
    var choiceContext = choiceCanvas.getContext('2d');
    
    var width = this.width/1.2;
    var height = this.choiceHeight;
    
    var materials = this.createButtonMaterial(this.choices[i].string, choiceContext, choiceCanvas);
    var geometry = new THREE.CubeGeometry(width, height, this.depth);
    
    for (var j = 0; j < geometry.faces.length; j ++ ){
      var face = geometry.faces[ j ];
      if(j === 4 || j == 5){
        face.materialIndex = 0;
      }
      else{
        face.materialIndex = 1;
      }
    }
    geometry.materials = materials;
    var material = new THREE.MeshFaceMaterial(materials);
    var mesh = new THREE.Mesh(geometry, material);

    choice.setObject3D(mesh);
    
    var parentLoc = this.getPosition();
    var y = 0;
    if(i == 0){
      if(this.text){
        y = this.height*0.5 - height*1.7;
      }
      else{
        y = this.height*0.5 - height*0.5;
      }
    }
    else{
      y = lastY - 1.2*height;
    }
    lastY = y;
    
    choice.setPosition(parentLoc.x, y ,parentLoc.z);
    
    choice.addEventListener("click", this.choices[i].onclick.handler, false);
    choice.menuID = i;
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
  materials.push(new THREE.MeshBasicMaterial({color: this.color, opacity : this.opacity}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color, opacity : this.opacity}));//front & back face
  
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
  materials.push(new THREE.MeshBasicMaterial({color: this.color, opacity : this.opacity}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color, opacity : this.opacity}));//front & back face
  
  var geometry = new THREE.CubeGeometry(this.width, this.choiceHeight, this.depth);
  
  for( var i = 0; i < geometry.faces.length; i ++ ){
    var face = geometry.faces[ i ];
    if(i === 4 || i === 5){
      face.materialIndex = 0;
    }
    else{
      face.materialIndex = 1;
    }
  }
  
  geometry.materials = materials;
  var material = new THREE.MeshFaceMaterial(materials);
  var mesh = new THREE.Mesh(geometry, material);
  
  return mesh;
}

WIDGET3D.SelectDialog.prototype.changeChoiceText = function(text, index){
  var object = false;
  for(var i = 0; i < this.children.length; ++i){
    if(this.children[i].menuID == index){
      object = this.children[i];
      break;
    }
  }
  if(object){
    var canvas = object.object3D.material.map.image;
    var context = object.object3D.material.map.image.getContext('2d');
    var materials = this.createButtonMaterial(text, context, canvas);

    object.object3D.geometry.materials = materials;
    object.object3D.material = new THREE.MeshFaceMaterial(materials);
    object.object3D.needsUpdate = true;
    return true;
  }
  return false;
}


WIDGET3D.SelectDialog.prototype.remove = function(){
  
  //removing child canvases from DOM
  for(var i = 0; i < this.choiceCanvases.length; ++i){
    canvas = this.choiceCanvases[i];
    document.body.removeChild(canvas);
  }
  this.choiceCanvases = null;
  
  //deleting the background canvas
  var canvas = this.textCanvas;
  document.body.removeChild(canvas);
  
  WIDGET3D.Group.prototype.remove.call( this );
};

