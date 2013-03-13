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
  
  this.camera_ = parameters.camera !== undefined ? parameters.camera : WIDGET3D.camera;
  this.attached_ = parameters.attached !== undefined ? parameters.attached : false;
  
  var width = parameters.width !== undefined ? parameters.width : 2000;
  var height = parameters.height !== undefined ? parameters.height : 2000;
  
  var debug = parameters.debug !== undefined ? parameters.debug : false;
  
  this.drag_ = false;
  this.offset_ = new THREE.Vector3();
  
  //invisible plane that is used as a "draging area".
  //the planes orientation is the same as the cameras orientation.
  this.plane_ = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 8, 8 ), 
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true, side : THREE.DoubleSide } ) );
  
  that.plane_.visible = debug;

  that.plane_.position = this.component_.getLocation();
  that.plane_.rotation = WIDGET3D.camera.camera_.rotation;
  
  if(!that.attached_){  
    WIDGET3D.scene.add( this.plane_ );
  }
  else{
    that.camera_.container_.add(this.plane_);
  }
  
  
  this.start_ = false;
  
  this.mouseupHandler = function(event){
    if(that.drag_){
      that.drag_ = false;
      
      that.plane_.position = that.component_.getLocation();

      WIDGET3D.getMainWindow().removeEventListener("mousemove", that.mousemoveHandler);
      WIDGET3D.getMainWindow().removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  this.mousedownHandler = function(event){
    if(event.button === that.mouseButton_ && event.shiftKey === that.shiftKey_){
      that.start_ = true;
      if(!that.drag_){
      
        that.plane_.position = that.component_.getLocation();
        that.plane_.rotation = WIDGET3D.camera.camera_.rotation;
        
        that.drag_ = true;
        that.component_.focus();
        
        var mouse = WIDGET3D.mouseCoordinates(event);
        var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
        var ray = WIDGET3D.projector.pickingRay(vector, WIDGET3D.camera.camera_);
        
        var intersects = ray.intersectObject( that.plane_ );
        if(intersects.length > 0){
          that.offset_.copy( intersects[ 0 ].point ).sub( that.plane_.position );
        }
        
        WIDGET3D.getMainWindow().addEventListener("mousemove", that.mousemoveHandler);
        WIDGET3D.getMainWindow().addEventListener("mouseup", that.mouseupHandler);
      }
    }
  };

  this.mousemoveHandler = function(event){
    if(that.drag_){
    
      var mouse = WIDGET3D.mouseCoordinates(event);
      var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
      var ray = WIDGET3D.projector.pickingRay(vector, WIDGET3D.camera.camera_);
      
      var intersects = ray.intersectObject( that.plane_ );
      if(intersects.length > 0){
        
        var pos = intersects[ 0 ].point.sub( that.offset_);
        that.component_.setLocation(pos.x, pos.y, pos.z);
        
      }
      
      that.plane_.position = that.component_.getLocation();
    }
  };
  
  this.component_.addEventListener("mousedown", this.mousedownHandler);

  this.startPositionChanged = function(){
    if(!this.start_){
      this.plane_.position = this.component_.getLocation();
      return true;
    }
    return false;
  };
  
  
  this.remove = function(){
  
    WIDGET3D.scene.remove( this.plane_ );
    
    this.plane_.geometry.dispose();
    this.plane_.material.dispose();
    this.plane_ = undefined;
  };
  
};






