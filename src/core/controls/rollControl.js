// ROLL CONTROLS
//
//Parameters: component: WIDGET3D.Basic typed object to which the controlls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the controll is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.RollControl = function(component, parameters){
  
  var parameters = parameters || {};
  
  WIDGET3D.Control.call(this, component, parameters);
  
  var that = this;
  
  var clickLocation;
  var rotationOnMouseDownY;
  var rotationOnMousedownX;
  
  var modelRotationY = this.component.getRotationY();
  var modelRotationX = this.component.getRotationX();
  
  var rotate = false;

  var mouseupHandler = function(event){
    if(rotate){
      
      event.stopPropagation();
      event.preventDefault();
      
      rotate = false;
      
      var mainWindow = WIDGET3D.getApplication();
      mainWindow.removeEventListener("mousemove", mousemoveHandler);
      mainWindow.removeEventListener("mouseup", mouseupHandler);
      mainWindow.removeEventListener("touchmove", mousemoveHandler);
      mainWindow.removeEventListener("touchend", mouseupHandler);
    }
  };
  
  var mousedownHandler = function(event){
    
    if(event.button === that.mouseButton && event.shiftKey === that.shiftKey){
      
      event.stopPropagation();
      event.preventDefault();
      
      that.component.focus();
      if(!rotate){
        rotate = true;
        
        clickLocation = WIDGET3D.mouseCoordinates(event);
        rotationOnMouseDownY = modelRotationY;
        rotationOnMousedownX = modelRotationX;
        
        var mainWindow = WIDGET3D.getApplication();
        mainWindow.addEventListener("mousemove", mousemoveHandler, false);
        mainWindow.addEventListener("mouseup", mouseupHandler, false);
        mainWindow.addEventListener("touchmove", mousemoveHandler, false);
        mainWindow.addEventListener("touchend", mouseupHandler, false);
      }
    }
  };

  var mousemoveHandler = function(event){

    if (rotate){
    
      event.stopPropagation();
      event.preventDefault();
      
      var mouse = WIDGET3D.mouseCoordinates(event);
      modelRotationY = rotationOnMouseDownY + ( mouse.x - clickLocation.x );
      modelRotationX = rotationOnMousedownX + ( mouse.y - clickLocation.y );
    }
  };
  
  this.component.addEventListener("mousedown", mousedownHandler, false);
  this.component.addEventListener("touchstart", mousedownHandler, false);
  
  
  //Animate must be called before the component is rendered to apply
  //the change in components rotation
  var animate = function(){

    var rot = that.component.getRotation();
    
    var newRotY = rot.y + ((modelRotationY - rot.y)*0.04);
    var newRotX = rot.x + ((modelRotationX - rot.x)*0.04);
    
    that.component.setRotationY(newRotY);
    that.component.setRotationX(newRotX);
  }; 
  this.component.addUpdateCallback(animate);
};

WIDGET3D.RollControl.prototype = WIDGET3D.Control.prototype.inheritance();

