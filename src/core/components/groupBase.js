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
};

//Adds children to the group
WIDGET3D.GroupBase.prototype.add = function(child){

  if(child.parent){
  
    //removing event listeners from former parent
    if(child.parent != WIDGET3D.getApplication()){
      child.parent.removeRelatedEventListeners(child);
    }
  
    child.parent.object3D.remove(child.object3D);
    child.parent.removeFromObjects(child);
  }
  child.parent = this;
  this.children.push(child);
  this.object3D.add(child.object3D);
};

// hides unfocused objects in window
WIDGET3D.GroupBase.prototype.hideNotFocused = function(){
  for(var i = 0; i < this.children.length; ++i){
    if(!this.children[i].inFocus){
      this.children[i].hide();
    }
  }
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