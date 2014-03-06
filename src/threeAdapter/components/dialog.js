//---------------------------------------------------
//
// 3D DIALOG
//
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              deoth = depth in world coordinates
//              color = hexadecimal string
//              opacity = float 0...1
//              title = string presented as a title of the dialog
//              buttons = Array of objects {text: string displayed on button, onclick: onclick handler function}
//              fields = Array of objcets {description: descriptive text of text field, maxLength: maximum text length}
//              hasCancel = boolean,tells if the dialog has cancel button
//              cancelText = string displayed on cancel button
//


//TODO: REFACTOR SO THAT AMOUNT OF TEXTBOXES AND BUTTONS CAN BE PARAMETRISIZED
WIDGET3D.Dialog = function(parameters){
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};

  this.width = parameters.width !== undefined ? parameters.width : 1000;
  this.height = parameters.height !== undefined ? parameters.height : 1000;
  this.depth = parameters.depth !== undefined ? parameters.depth : 20;
  this.color = parameters.color !== undefined ? parameters.color : 0xC0D0D0;
  this.opacity = parameters.opacity !== undefined ? parameters.opacity : 0.9;
  
  
  this.title = parameters.title !== undefined ? parameters.title : "This is a dialog";
  
  this.fields = parameters.fields !== undefined ? parameters.fields : [];
  this.buttons = parameters.buttons !== undefined ? parameters.buttons : [];
  this.hasCancel = parameters.hasCancel !== undefined ? parameters.hasCancel : false;
  
  if(this.hasCancel){
    this.cancelText = parameters.cancelText !== undefined ? parameters.cancelText : "Cancel";   
    var createCancelFunction = function(c){
      return function(){
        c.remove();
      }
    }
    this.buttons.push({text: this.cancelText, onclick : createCancelFunction(this)});
  }
  
  this.componentHeight = this.height /((this.fields.length + 3) * 1.3);
  
  //Creating main mesh
  this.createDialogTitle();
  //Creating buttons
  this.createButtons();
  //Creating textfields
  this.createTextfields();
};

WIDGET3D.Dialog.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.Dialog.prototype.createDialogTitle = function(){
  
  this.canvas = document.createElement('canvas');
  this.canvas.width = 512;
  this.canvas.height = 512;
  this.canvas.style.display = "none";
  document.body.appendChild(this.canvas);
  var context = this.canvas.getContext('2d');
  
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
  context.fillStyle = "#000000";
  context.font = "bold 30px Courier New";
  context.align = "center";
  context.textBaseline = "middle";
  
  var textWidth = context.measureText(this.title).width;
  var textHeight = context.measureText(this.title).height;
  
  context.fillText(this.title, this.canvas.width/2-(textWidth/2), 30);
  var texture = new THREE.Texture(this.canvas);
  texture.needsUpdate = true;
  
  var materials = new Array();
  materials.push(new THREE.MeshBasicMaterial({color: this.color, opacity : this.opacity}));//side faces
  materials.push(new THREE.MeshBasicMaterial({map: texture, color: this.color, opacity: this.opacity}));//front & back face
  
  var geometry = new THREE.CubeGeometry(this.width, this.height, this.depth*0.75);
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
  var title = new WIDGET3D.Widget(mesh);
  //title.setObject3D(mesh);
  this.add(title);
}

WIDGET3D.Dialog.prototype.createButtons = function(){
  
  var buttonWidth = this.width/(this.buttons.length + 2);
  var buttonHeight = this.componentHeight;
  
  var left = -this.width/2.0;
  var bottom = -this.height/2.0 + 1;
  
  var step = this.width/this.buttons.length;
  var slotCenterX = step/2.0;
  var slotCenterY = bottom + buttonHeight / 2.0;
  
  var lastX = 0;
  
  for(var i = 0; i < this.buttons.length; ++i){
  
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    canvas.style.display = "none";
    document.body.appendChild(canvas);
    this.buttons[i].canvas = canvas;
    
    var context = canvas.getContext('2d');

    context.fillStyle = "#B3B3B3";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = "#000000";
    context.font = "bold 60px Courier New";
    context.align = "center";
    context.textBaseline = "middle";
    
    var textWidth = context.measureText(this.buttons[i].text).width;
    context.fillText(this.buttons[i].text, canvas.width/2-(textWidth/2), canvas.height/2);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    var material = new THREE.MeshBasicMaterial({map: texture});//front & back face
    var geometry = new THREE.CubeGeometry(buttonWidth, buttonHeight, this.depth);
    var mesh = this.createFaceMaterialsMesh(material, geometry);
    
    var button = new WIDGET3D.Widget(mesh);
    //button.setObject3D(mesh);
    button.addEventListener("click", this.buttons[i].onclick);
    this.add(button);
    
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
      
      context.fillText(textBox.textHandle, 5, canvas.height/2);
      
      texture.needsUpdate = true;
    }
  };
  
  var fieldWidth = this.width/2.5;
  var fieldHeight = this.componentHeight;
  
  var left = -this.width/2.0;
  var right = this.width/2.0;
  var top = this.height/2.0 - fieldHeight;
  
  var step = (this.height-2*fieldHeight)/this.fields.length;
  var slotCenterY = step/2.0;
  
  var fieldX = right - fieldWidth/1.5;
  var descriptionX = left + fieldWidth/1.5;
  
  var lastY = 0;
  
  for( var i = 0; i < this.fields.length; ++i){
  
    //Creating textfield
    var canvas1 = document.createElement('canvas');
    canvas1.width = 512;
    canvas1.height = 128;
    canvas1.style.display = "none";
    document.body.appendChild(canvas1);
    this.fields[i].canvas1 = canvas1;
    
    var texture = new THREE.Texture(canvas1);
    var material = new THREE.MeshBasicMaterial({map: texture});
    var geometry = new THREE.CubeGeometry(fieldWidth, fieldHeight, this.depth);
    var mesh = this.createFaceMaterialsMesh(material, geometry);
    
    var textfield = new WIDGET3D.Text(mesh, {maxLength : this.fields[i].maxLength});
    
    textfield.setText("");
    
    textfield.addEventListener("click", textBoxClickFactory(textfield));
    textfield.addEventListener("keypress", textBoxKeyFactory(textfield));
    textfield.addEventListener("keydown", textBoxKeyFactory(textfield));
    textfield.addUpdateCallback(textBoxUpdateFactory(canvas1, textfield, texture));
    
    this.fields[i].input = textfield;
    
    this.add(textfield);
    
    //Creating description for field
    var canvas2 = document.createElement('canvas');
    canvas2.width = 512;
    canvas2.height = 128;
    canvas2.style.display = "none";
    document.body.appendChild(canvas2);
    this.fields[i].canvas2 = canvas2;
    var context = canvas2.getContext('2d');
    
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas2.width, canvas2.height);
    
    context.fillStyle = "#000000";
    context.font = "bold 60px Courier New";
    context.align = "center";
    context.textBaseline = "middle";
    
    var textWidth = context.measureText(this.fields[i].description).width;
    context.fillText(this.fields[i].description, canvas2.width/2-(textWidth/2), canvas2.height/2);
    var texture2 = new THREE.Texture(canvas2);
    texture2.needsUpdate = true;
    
    var material2 = new THREE.MeshBasicMaterial({
      map: texture2,
      color: this.color,
      opacity: this.opacity
    });
    var geometry2 = new THREE.CubeGeometry(fieldWidth, fieldHeight, this.depth);
    var mesh2 = this.createFaceMaterialsMesh(material2, geometry2);
    
    var description = new WIDGET3D.Widget(mesh2);
    //description.setObject3D(mesh2);
    this.add(description);
    
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
  materials.push(new THREE.MeshBasicMaterial({color: this.color, opacity : this.opacity}));//side faces
  materials.push(frontMaterial);//front & back face

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
  
  return mesh;
}


WIDGET3D.Dialog.prototype.remove = function(){

  //removing child canvases from DOM
  for(var i = 0; i < this.buttons.length; ++i){
    document.body.removeChild(this.buttons[i].canvas);
  }
  for(var j = 0; j < this.fields.length; ++j){
    document.body.removeChild(this.fields[j].canvas1);
    document.body.removeChild(this.fields[j].canvas2);
  }
  //deleting the background canvas
  document.body.removeChild(this.canvas);
  
  WIDGET3D.Group.prototype.remove.call( this );
};

