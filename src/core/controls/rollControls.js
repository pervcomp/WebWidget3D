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
  
  this.component_ = parameters.component;
  this.mouseButton_ = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  this.shiftKey_ = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  this.clickLocation_;
  this.rotationOnMouseDownY_;
  this.rotationOnMousedownX_;
  this.modelRotationY_ = 0;
  this.modelRotationX_ = 0;
  this.rotate_ = false;

  this.mouseupHandler = function(event){
    if(that.rotate_){
      that.rotate_ = false;
      
      var mainWindow = WIDGET3D.getMainWindow();
      mainWindow.removeEventListener("mousemove", that.mousemoveHandler);
      mainWindow.removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  this.mousedownHandler = function(event){
    
    if(event.button === that.mouseButton_ && event.shiftKey === that.shiftKey_){
      that.component_.focus();
      if(!that.rotate_){
        that.rotate_ = true;
        
        that.clickLocation_ = WIDGET3D.mouseCoordinates(event);
        that.rotationOnMouseDownY_ = that.modelRotationY_;
        that.rotationOnMouseDownX_ = that.modelRotationX_;
        
        var mainWindow = WIDGET3D.getMainWindow();
        mainWindow.addEventListener("mousemove", that.mousemoveHandler);
        mainWindow.addEventListener("mouseup", that.mouseupHandler);
      }
    }
  };

  this.mousemoveHandler = function(event){

    if (that.rotate_){
    
      var mouse = WIDGET3D.mouseCoordinates(event);
      
      that.modelRotationY_ = that.rotationOnMouseDownY_ + ( mouse.x - that.clickLocation_.x );
      that.modelRotationX_ = that.rotationOnMouseDownX_ + ( mouse.y - that.clickLocation_.y );
    }

  };
  
  this.component_.addEventListener("mousedown", this.mousedownHandler);
};

//Update must be called before the component is rendered to apply
//the change in components rotation
WIDGET3D.RollControls.prototype.update = function(){

  var rot = this.component_.getRot();
  this.component_.setRotY(rot.y + ((this.modelRotationY_ - rot.y)*0.03));
  this.component_.setRotX(rot.x + ((this.modelRotationX_ - rot.x)*0.03));
  
};

