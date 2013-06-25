//---------------------------------------------
// GENERAL FUNCTIONALITY FOR WINDOWS
//---------------------------------------------
//
// Object that has the functionality that should be
// inherited to all kind of windows but not to any other objects.
//

WIDGET3D.GroupBase = function(){
  this.children_ = [];
  this.container_ = new WIDGET3D.Container();
};

// adds new child to window
/*WIDGET3D.GroupBase.prototype.addChild = function(widget){
  
  widget.setParent(this);
  return widget;
};*/

WIDGET3D.GroupBase.prototype.add = function(child){

  if(child.parent != undefined){
  
    //removing event listeners from former parent
    if(child.parent_ != WIDGET3D.getApplication()){
      child.parent_.removeRelatedEventListeners(child);
    }
  
    child.parent_.container_.remove(child.container_);
    child.parent_.removeFromObjects(child);
  }
  child.parent_ = this;
  this.children_.push(child);
  this.container_.add(child.container_);
};

// hides unfocused objects in window
WIDGET3D.GroupBase.prototype.hideNotFocused = function(){
  for(var i = 0; i < this.children_.length; ++i){
    if(!this.children_[i].inFocus_){
      this.children_[i].hide();
    }
  }
};

//removes object in place 'index' from object list
WIDGET3D.GroupBase.prototype.removeFromObjects = function(widget){
  
  for(var k = 0; k < this.children_.length; ++k){
    if(this.children_[k] === widget){
      var removedObj = this.children_.splice(k, 1);
      return removedObj[0];
    }
  }
  return false;
};