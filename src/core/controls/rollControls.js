// ROLL CONTROLS
//
//Parameters: component: WIDGET3D.Basic typed object to which the controlls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the controll is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.RollControls = function(parameters){
  
  var that = this;
  
  this.component = parameters.component;
  this.mouseButton = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  this.shiftKey = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  this.clickLocation;
  this.rotationOnMouseDownY;
  this.rotationOnMousedownX;
  
  var initialRotation = this.component.getRotation();
  this.modelRotationY = initialRotation.y;
  this.modelRotationX = initialRotation.x;
  
  this.rotate = false;

  this.mouseupHandler = function(event){
    if(that.rotate){
      
      event.stopPropagation();
      event.preventDefault();
      
      that.rotate = false;
      
      var mainWindow = WIDGET3D.getApplication();
      mainWindow.removeEventListener("mousemove", that.mousemoveHandler);
      mainWindow.removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  this.mousedownHandler = function(event){
    
    if(event.button === that.mouseButton && event.shiftKey === that.shiftKey){
      
      event.stopPropagation();
      event.preventDefault();
      
      that.component.focus();
      if(!that.rotate){
        that.rotate = true;
        
        that.clickLocation = WIDGET3D.mouseCoordinates(event);
        that.rotationOnMouseDownY = that.modelRotationY;
        that.rotationOnMouseDownX = that.modelRotationX;
        
        var mainWindow = WIDGET3D.getApplication();
        mainWindow.addEventListener("mousemove", that.mousemoveHandler, false);
        mainWindow.addEventListener("mouseup", that.mouseupHandler, false);
      }
    }
  };

  this.mousemoveHandler = function(event){

    if (that.rotate){
    
      event.stopPropagation();
      event.preventDefault();
      
      var mouse = WIDGET3D.mouseCoordinates(event);
      that.modelRotationY = that.rotationOnMouseDownY + ( mouse.x - that.clickLocation.x );
      that.modelRotationX = that.rotationOnMouseDownX + ( mouse.y - that.clickLocation.y );
    }
  };
  
  this.component.addEventListener("mousedown", this.mousedownHandler, false);
  
  
  //Animate must be called before the component is rendered to apply
  //the change in components rotation
  this.animate = function(){

    var rot = that.component.getRotation();
    
    var newRotY = rot.y + ((that.modelRotationY - rot.y)*0.04);
    var newRotX = rot.x + ((that.modelRotationX - rot.x)*0.04);
    
    that.component.setRotationY(newRotY);
    that.component.setRotationX(newRotX);
  };
  
  this.component.addUpdateCallback(this.animate);
  
};


WIDGET3D.RollControls.prototype.remove = function(){
};

