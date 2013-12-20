// ROLL CONTROLS
//
//Parameters: component: WIDGET3D.Basic typed object to which the controls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the control is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.RollControl = function(component, parameters){
  
  WIDGET3D.Control.call(this, component);
  
  var parameters = parameters || {};
  
  this.mouseButton = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  this.shiftKey = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  this.velocity = parameters.velocity !== undefined ? parameters.velocity : 0.04;
  this.rotate = false;
  
  var that = this;
  
  var clickLocation;
  var rotationOnMouseDownY;
  var rotationOnMousedownX;
  
  var modelRotationY = this.component.getRotationY();
  var modelRotationX = this.component.getRotationX();

  this.mouseupHandler = function(event){
    if(that.rotate){
      
      event.stopPropagation();
      event.preventDefault();
      
      that.rotate = false;
      
      var mainWindow = WIDGET3D.getApplication();
      mainWindow.removeEventListener("mousemove", mousemoveHandler);
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
        
        clickLocation = WIDGET3D.mouseCoordinates(event);
        rotationOnMouseDownY = modelRotationY;
        rotationOnMousedownX = modelRotationX;
        
        var mainWindow = WIDGET3D.getApplication();
        mainWindow.addEventListener("mousemove", mousemoveHandler);
        mainWindow.addEventListener("mouseup", that.mouseupHandler);
      }
    }
  };

  var mousemoveHandler = function(event){

    if(that.rotate){
      event.stopPropagation();
      event.preventDefault();
      
      var mouse = WIDGET3D.mouseCoordinates(event);
      modelRotationY = rotationOnMouseDownY + ( mouse.x - clickLocation.x );
      modelRotationX = rotationOnMousedownX + ( mouse.y - clickLocation.y );
    }
  };
  
  this.component.addEventListener("mousedown", this.mousedownHandler);
  
  //Animate must be called before the component is rendered to apply
  //the change in components rotation
  var animate = function(){

    var rot = that.component.getRotation();
    
    var newRotY = rot.y + ((modelRotationY - rot.y)*that.velocity);
    var newRotX = rot.x + ((modelRotationX - rot.x)*that.velocity);
    
    that.component.setRotationY(newRotY);
    that.component.setRotationX(newRotX);
  }; 
  this.component.addUpdateCallback(animate);
};

WIDGET3D.RollControl.prototype = WIDGET3D.Control.prototype.inheritance();

WIDGET3D.RollControl.prototype.remove = function(){

  this.component.removeEventListener("mousedown", this.mousedownHandler);
  
  if(this.rotate){
    this.mouseupHandler();
  }
  
  WIDGET3D.Control.prototype.remove.call( this );
};

