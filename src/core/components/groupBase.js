//---------------------------------------------
// GENERAL FUNCTIONALITY FOR WINDOWS
//---------------------------------------------
//
// Object that has the functionality that should be
// inherited to all kind of windows but not to any other objects.
//

WIDGET3D.GroupBase = function(){
  this.children = [];
  this.container = new WIDGET3D.Container();
};

//Adds children to the group
WIDGET3D.GroupBase.prototype.add = function(child){

  if(child.parent != undefined){
  
    //removing event listeners from former parent
    if(child.parent != WIDGET3D.getApplication()){
      child.parent.removeRelatedEventListeners(child);
    }
  
    child.parent.container.remove(child.container);
    child.parent.removeFromObjects(child);
  }
  child.parent = this;
  this.children.push(child);
  this.container.add(child.container);
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
WIDGET3D.GroupBase.prototype.removeFromObjects = function(widget){
  
  for(var k = 0; k < this.children.length; ++k){
    if(this.children[k] === widget){
      var removedObj = this.children.splice(k, 1);
      
      this.container.remove(widget.container);
      
      return removedObj[0];
    }
  }
  return false;
};