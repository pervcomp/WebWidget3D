// DRAG CONTROLS for WIDGET3D three.js version
//
//Parameters: component: WIDGET3D.Basic typed object to which the controlls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the controll is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.DragControls = function(parameters){
  
  var that = this;
  
  this.component_ = parameters.component;
  this.mouseButton_ = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  this.shiftKey_ = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  this.drag_ = false;
  this.offset_ = new THREE.Vector3();
  
  //invisible plane that is used to detect where the component should be draged.
  this.plane_ = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), 
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
  this.plane_.visible = false;
  WIDGET3D.scene.add( this.plane_ );
  
  
  this.mouseupHandler = function(event){
    if(that.drag_){
      that.drag_ = false;
      
      that.plane_.position = that.component_.getLocation();
      
      that.component_.removeEventListener("mousemove", that.mousemoveHandler);
      WIDGET3D.getMainWindow().removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  this.mousedownHandler = function(event){
    if(event.button === that.mouseButton_ && event.shiftKey === that.shiftKey_){
      if(!that.drag_){
        that.drag_ = true;
        that.component_.focus();

        that.offset_.copy(event.worldCoordinates).sub( that.plane_.position );
        
        that.component_.addEventListener("mousemove", that.mousemoveHandler);
        WIDGET3D.getMainWindow().addEventListener("mouseup", that.mouseupHandler);
      }
    }
  };

  this.mousemoveHandler = function(event){
    if(that.drag_){
      
      var pos = event.worldCoordinates.sub( that.offset_ );
      that.component_.setLocation(pos.x, pos.y, pos.z);
      that.plane_.position = that.component_.getLocation();
      
      that.plane_.lookAt( WIDGET3D.camera.position );
    }
  };
  
  this.component_.addEventListener("mousedown", this.mousedownHandler);
};

WIDGET3D.DragControls.prototype.update = function(){
};

