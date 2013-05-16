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
  
  //To get the right orientation we need to have orientation of a cameras parent and camera and add these together
  that.setPlaneRotation = function(){
    
    var camRot = that.camera_.rotation.clone();
    var parent = that.camera_.parent;
    
    
    while(parent != undefined && parent != that.component_.parent){
    
      camRot.add(parent.rotation.clone());
      parent = parent.parent;
    }
    
    that.plane_.rotation.copy(camRot);
    
  }; 
  
  that.component_ = parameters.component;
  that.mouseButton_ = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  that.shiftKey_ = parameters.shiftKey !== undefined ? parameters.shiftKey : false;

  that.camera_ = WIDGET3D.getCamera();
  
  var width = parameters.width !== undefined ? parameters.width : 2000;
  var height = parameters.height !== undefined ? parameters.height : 2000;
  
  var debug = parameters.debug !== undefined ? parameters.debug : false;
  
  that.drag_ = false;
  that.offset_ = new THREE.Vector3();
  
  //invisible plane that is used as a "draging area".
  //the planes orientation is the same as the cameras orientation.
  that.plane_ = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 8, 8 ), 
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true, side : THREE.DoubleSide } ) );
  
  that.plane_.visible = debug;
  
  that.setPlaneRotation();
  
  WIDGET3D.getScene().add( that.plane_ );
  
  that.mouseupHandler = function(event){
    if(that.drag_){
      that.drag_ = false;
      
      that.plane_.position.copy(that.component_.parent_.container_.localToWorld(that.component_.getPosition().clone()));

      WIDGET3D.getMainWindow().removeEventListener("mousemove", that.mousemoveHandler);
      WIDGET3D.getMainWindow().removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  that.mousedownHandler = function(event){
    if(event.button === that.mouseButton_ && event.shiftKey === that.shiftKey_){
      that.start_ = true;
      if(!that.drag_){
        
        that.setPlaneRotation();
        that.plane_.position.copy(that.component_.parent_.container_.localToWorld(that.component_.getPosition().clone()));
        //FORCE TO UPDATE MATRIXES OTHERWISE WE MAY GET INCORRECT VALUES FROM INTERSECTION
        that.plane_.updateMatrixWorld(true);
        
        var mouse = WIDGET3D.mouseCoordinates(event);
        var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
        var ray = WIDGET3D.getProjector().pickingRay(vector, that.camera_);
        
        var intersects = ray.intersectObject( that.plane_ );
        if(intersects.length > 0){
          that.offset_.copy( intersects[ 0 ].point ).sub( that.plane_.position );
        }
        
        
        WIDGET3D.getMainWindow().addEventListener("mousemove", that.mousemoveHandler);
        WIDGET3D.getMainWindow().addEventListener("mouseup", that.mouseupHandler);
        
        that.component_.focus();
        that.drag_ = true;
      }
    }
  };

  that.mousemoveHandler = function(event){
    if(that.drag_){

      var mouse = WIDGET3D.mouseCoordinates(event);
      var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
      var ray = WIDGET3D.getProjector().pickingRay(vector, that.camera_);
      
      var intersects = ray.intersectObject( that.plane_ );
      if(intersects.length > 0){
      
        var pos = intersects[ 0 ].point.sub( that.offset_);
        that.plane_.position.copy(pos);
        var vec = that.component_.parent_.container_.worldToLocal(pos);
        that.component_.setPosition(vec.x, vec.y, vec.z);
        
      }
    }
  };
  
  that.component_.addEventListener("mousedown", that.mousedownHandler);
  
  
  that.remove = function(){
  
    WIDGET3D.getScene().remove( that.plane_ );
    
    that.plane_.geometry.dispose();
    that.plane_.material.dispose();
    that.plane_ = undefined;
  };
  
};






