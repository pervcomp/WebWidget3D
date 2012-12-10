//---------------------------------------------
// GENERAL FUNCTIONALITY FOR WINDOWS
//---------------------------------------------
//
// Object that has the functionality that should be
// inherited to all kind of windows but not to any other objects.
//

WIDGET3D.WindowBase = function(){
  this.children_ = [];
  this.container_ = new WIDGET3D.Container();
};

// adds new child to window
WIDGET3D.WindowBase.prototype.addChild = function(object){
  
  object.setParent(this);
  
  return object;
};

// hides unfocused objects in window
WIDGET3D.WindowBase.prototype.hideNotFocused = function(){
  for(var i = 0; i < this.children_.length; ++i){
    if(!this.children_[i].inFocus_){
      this.children_[i].hide();
    }
  }
};

//removes object in place 'index' from object list
WIDGET3D.WindowBase.prototype.removeFromObjects = function(object){
  
  for(var k = 0; k < this.children_.length; ++k){
    if(this.children_[k] === object){
      var removedObj = this.children_.splice(k, 1);
      return removedObj[0];
    }
  }
  return false;
};