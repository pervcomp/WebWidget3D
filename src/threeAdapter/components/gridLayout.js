//---------------------------------------------------
//
// STYLED WIDGETS THAT CAN BE USED WITH THREEJS PLUGIN
//
//---------------------------------------------------

//---------------------------------------------------
// GRID LAYOUTED Group
//---------------------------------------------------
//
// PARAMETERS:  width = width in world coordinates
//              height = height in world coordinates
//              color = hexadecimal
//
WIDGET3D.GridWindow = function(parameters){
  
  var that = this;
  
  WIDGET3D.Group.call( this );
  
  var parameters = parameters || {};
  
  this.width = parameters.width !== undefined ? parameters.width : 1000;
  this.height = parameters.height !== undefined ? parameters.height : 1000;
  this.density = parameters.density !== undefined ? parameters.density : 6;
  this.depth = (this.width/this.density);
  
  this.maxChildren = this.density * this.density;
  
  this.color = parameters.color !== undefined ? parameters.color : 0x6B6B6B;
  this.lineWidth = parameters.lineWidth !== undefined ? parameters.lineWidth : 2;
  this.opacity = parameters.opacity !== undefined ? parameters.opacity : 0.5;
  
  this.material = new THREE.MeshBasicMaterial({
    color: this.color,
    opacity: this.opacity,
    wireframe: true,
    side : THREE.DoubleSide,
    wireframeLinewidth : this.lineWidth
  });
  
  var geometry = new THREE.CubeGeometry( this.width, this.height, this.depth, this.density, this.density, 1 );
  var mesh =  new THREE.Mesh(geometry, this.material);
  this.grid = new WIDGET3D.Basic();
  this.grid.setObject3D(mesh);
  
  var hideGrid = parameters.hideGrid !== undefined ? parameters.hideGrid : false;
  if(hideGrid){
    this.grid.hide();
  }
  this.add(this.grid);
  
  this.icons = new Array();
  
  //default mouse controls in use
  this.defaultControls = parameters.defaultControls !== undefined ? parameters.defaultControls : false;
  
  if(this.defaultControls){
    
    var button = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
    var shift = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
    
    var control = new WIDGET3D.RollControl(this, {mouseButton : button, shiftKey : shift});
  }
};

WIDGET3D.GridWindow.prototype = WIDGET3D.Group.prototype.inheritance();

WIDGET3D.GridWindow.prototype.addSlots = function(newDensity){
  this.density = newDensity;
  this.maxChildren = newDensity * newDensity;
  this.depth = (this.width/this.density);
  
  var grid = new THREE.CubeGeometry( this.width, this.height, this.depth, this.density, this.density, 1 );
  var gridMesh =  new THREE.Mesh(grid, this.material);
  this.grid.setObject3D(gridMesh);
  
  var tmpChilds = this.icons;
  this.icons = new Array();
  
  for(var i = 0; i < tmpChilds.length; ++i){
  
    var icon = tmpChilds[i];
    this.icons.push(icon);
    
    icon.width = this.width/(this.density + 3.3);
    icon.height = this.height/(this.density + 3.3);
    
    var geometry = new THREE.CubeGeometry(icon.width, icon.height, icon.depth);
    var mesh = new THREE.Mesh( geometry, icon.material);
    icon.setObject3D(mesh);
    
    icon.setToPlace();
  }
  
  return this;
};

//Adds children to the group
WIDGET3D.GridWindow.prototype.add = function(child){

  if(child != this){
    if(child.parent){
      //removing event listeners from former parent
      if(child.parent != WIDGET3D.getApplication()){
        child.parent.removeRelatedEventListeners(child);
      }
    
      child.parent.object3D.remove(child.object3D);
      child.parent.removeFromObjects(child);
      child.parent.removeFromIcons(child);
      
      for(var i = 0; i < child.parent.icons.length; ++i){
        child.parent.icons[i].setToPlace();
      }
    }
    child.parent = this;
    this.children.push(child);
    this.object3D.add(child.object3D);
    
    if(child != this.grid){
      this.icons.push(child);
      if(this.icons.length > this.maxChildren){
        console.log("Grid is full! Creating bigger one");
        this.addSlots(Math.ceil(this.density * 1.5));
      }
      else{
        child.setToPlace();
      }
    }
    
    return this;
  }
  else{
    console.log("You can't add object to it self!");
    return false;
  }
  
};

WIDGET3D.GridWindow.prototype.removeFromIcons = function(child){
  for(var k = 0; k < this.icons.length; ++k){
    if(this.icons[k] === child){
      var removedObj = this.icons.splice(k, 1);
      
      this.object3D.remove(child.object3D);
      
      return removedObj[0];
    }
  }
  return false;
}

//---------------------------------------------------
// ICONS FOR GRIDWINDOW
//---------------------------------------------------
WIDGET3D.GridIcon = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  var parent = parameters.parent;
  if(parent == undefined){
    console.log("GridIcon needs to have grid window as parent!");
    console.log("Parent has to be given in parameters.");
    return false;
  }
    
  this.color = parameters.color !== undefined ? parameters.color : 0xFFFFFF;
  this.url = parameters.url !== undefined ? parameters.url : false;
  this.img = parameters.img !== undefined ? parameters.img : false;
  //object can store metadata in a format that user like
  this.metadata = parameters.metadata !== undefined ? parameters.metadata : false;
  
  this.width = parent.width/(parent.density + 3.3);
  this.height = parent.height/(parent.density + 3.3);
  
  this.depth = parameters.depth !== undefined ? parameters.depth : this.height;
  
  var geometry = new THREE.CubeGeometry(this.width, this.height, this.depth);
  
  this.texture = false;
  
  if(this.img){
    this.texture = new THREE.Texture(this.img);
    this.texture.needsUpdate = true;
  }
  else if(this.url){
    this.texture = THREE.ImageUtils.loadTexture(this.url);
  }

  this.material = new THREE.MeshBasicMaterial({map : this.texture, color: this.color});
  
  var mesh = new THREE.Mesh( geometry, this.material);
  
  this.setObject3D(mesh);
  parent.add(this);
};

WIDGET3D.GridIcon.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.GridIcon.prototype.setToPlace = function(){

  var parentLoc = this.parent.getPosition();
  
  var parentLeft = -this.parent.width/2.0 + parentLoc.x/this.parent.width;
  var parentTop =  this.parent.height/2.0 + parentLoc.y/this.parent.height;
  
  var stepX = this.parent.width/this.parent.density;
  var stepY = this.parent.height/this.parent.density;
  
  var slotCenterX = stepX/2;
  var slotCenterY = stepY/2;
  
  if(this.parent.icons.length-1 > 0){
  
    var lastIcon = this.parent.icons[this.parent.icons.length-2];
    var lastIconLoc = lastIcon.getPosition();
    
    if(((this.parent.icons.length-1) % this.parent.density) == 0)
    {  
      var x = parentLeft + slotCenterX;
      var y = lastIconLoc.y - stepY;
    }
    else{
      var x = lastIconLoc.x + stepX;
      var y = lastIconLoc.y;
    
    }
  }
  else{
    
    var x = parentLeft + slotCenterX;
    var y = parentTop - slotCenterY; 
  }
  this.setPosition(x, y, parentLoc.z/this.parent.height);
  
  return this;
};

