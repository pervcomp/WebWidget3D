//---------------------------------------------
// GENERAL FUNCTIONALITY FOR WINDOWS
//---------------------------------------------
//
// Object that has the functionality that should be
// inherited to all kind of windows but not to any other objects.
//

WIDGET3D.GroupBase = function(){
  this.children = [];
  this.object3D = new WIDGET3D.Container();
  
  this.isVisible = true;
};

//Adds children to the group
WIDGET3D.GroupBase.prototype.add = function(child){

  if(child != this){
    if(child.parent){
    
      //removing event listeners from former parent
      if(child.parent != WIDGET3D.getApplication()){
        child.parent.removeRelatedEventListeners(child);
      }
      child.parent.removeFromObjects(child);
    }
    child.parent = this;
    this.children.push(child);
    this.object3D.add(child.object3D);
    return this;
  }
  else{
    console.log("You can't add object to it self!");
    return false;
  }
  
};

// shows Group
WIDGET3D.GroupBase.prototype.show = function(){

  if(!this.isVisible){
    for(var i = 0; i < this.children.length; ++i){
      this.children[i].show();
    }
    
    WIDGET3D.Widget.prototype.show.call(this);
  }
  
  return this;
};

//hide group
WIDGET3D.GroupBase.prototype.hide = function(){

  if(this.isVisible){
    for(var i = 0; i < this.children.length; ++i){
      this.children[i].hide();
    }
    
    WIDGET3D.Widget.prototype.hide.call(this);
  }
  return this;
};


// hides unfocused objects in window
WIDGET3D.GroupBase.prototype.hideNotFocused = function(){
  for(var i = 0; i < this.children.length; ++i){
    if(!this.children[i].inFocus){
      this.children[i].hide();
    }
  }
  return this;
};

//removes object in place 'index' from object list
WIDGET3D.GroupBase.prototype.removeFromObjects = function(child){
  
  for(var k = 0; k < this.children.length; ++k){
    if(this.children[k] === child){
      var removedObj = this.children.splice(k, 1);
      
      this.object3D.remove(child.object3D);
      
      return removedObj[0];
    }
  }
  return false;
};

