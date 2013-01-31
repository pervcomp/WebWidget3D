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
  
  var width = parameters.width !== undefined ? parameters.width : 2000;
  var height = parameters.height !== undefined ? parameters.height : 2000;
  
  this.drag_ = false;
  this.offset_ = new THREE.Vector3();
  
  //invisible plane that is used as a "draging area".
  //the planes orientation is the same as the cameras orientation.
  this.plane_ = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 8, 8 ), 
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true, side : THREE.DoubleSide } ) );
  this.plane_.position = this.component_.getLocation();
  that.plane_.rotation = WIDGET3D.camera.rotation;
  //this.plane_.visible = false;
  WIDGET3D.scene.add( this.plane_ );
  
  
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
      if(!that.drag_){
      
        that.plane_.position = that.component_.getLocation();
        that.plane_.rotation = WIDGET3D.camera.rotation;
        
        that.drag_ = true;
        that.component_.focus();
        
        var mouse = WIDGET3D.mouseCoordinates(event);
        var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
        var ray = WIDGET3D.projector.pickingRay(vector, WIDGET3D.camera);
        
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
      var ray = WIDGET3D.projector.pickingRay(vector, WIDGET3D.camera);
      
      var intersects = ray.intersectObject( that.plane_ );
      if(intersects.length > 0){
        
        var pos = intersects[ 0 ].point.sub( that.offset_);
        that.component_.setLocation(pos.x, pos.y, pos.z);
        
      }
      
      that.plane_.position = that.component_.getLocation();
    }
  };
  
  this.component_.addEventListener("mousedown", this.mousedownHandler);
};

