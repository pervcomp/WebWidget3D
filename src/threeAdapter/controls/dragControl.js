// DRAG CONTROLS for WIDGET3D three.js version
//
//Parameters: component: WIDGET3D.Basic typed object to which the controlls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the controll is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.DragControl = function(component, parameters){

  var parameters = parameters || {};
  WIDGET3D.Control.call(this, component, parameters);
  
  var width = parameters.width !== undefined ? parameters.width : 2000;
  var height = parameters.height !== undefined ? parameters.height : 2000;
  var debug = parameters.debug !== undefined ? parameters.debug : false;
  
  var that = this;
  
  this.start = false;
  this.camera = WIDGET3D.getCamera();
  this.drag = false;
  this.offset = new THREE.Vector3();
  
  //invisible plane that is used as a "draging area".
  //the planes orientation is the same as the cameras orientation.
  this.plane = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 8, 8 ), 
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true, side : THREE.DoubleSide } ) );
  this.plane.visible = debug;
  
  //To get the right orientation we need to have orientation of a cameras parent and camera and add these together
  this.setPlaneRotation = function(){ 
    var camRot = that.camera.rotation.clone();
    var parent = that.camera.parent;
    
    while(parent != undefined && parent != that.component.parent){
    
      camRot.add(parent.rotation.clone());
      parent = parent.parent;
    }
    that.plane.rotation.copy(camRot);
  };
  
  this.setPlaneRotation();
  WIDGET3D.getScene().add( this.plane );
  
  this.mouseupHandler = function(event){
    if(that.drag){
      that.drag = false;
      
      that.plane.position.copy(that.component.parent.object3D.localToWorld(that.component.getPosition().clone()));

      WIDGET3D.getApplication().removeEventListener("mousemove", that.mousemoveHandler);
      WIDGET3D.getApplication().removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  this.mousedownHandler = function(event){
    if(event.button === that.mouseButton && event.shiftKey === that.shiftKey){
      that.start = true;
      if(!that.drag){
        
        that.setPlaneRotation();
        that.plane.position.copy(that.component.parent.object3D.localToWorld(that.component.getPosition().clone()));
        //FORCE TO UPDATE MATRIXES OTHERWISE WE MAY GET INCORRECT VALUES FROM INTERSECTION
        that.plane.updateMatrixWorld(true);
        
        var mouse = WIDGET3D.mouseCoordinates(event);
        var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
        var ray = WIDGET3D.getProjector().pickingRay(vector, that.camera);
        
        var intersects = ray.intersectObject( that.plane );
        if(intersects.length > 0){
          that.offset.copy( intersects[ 0 ].point ).sub( that.plane.position );
        }
        
        
        WIDGET3D.getApplication().addEventListener("mousemove", that.mousemoveHandler, false);
        WIDGET3D.getApplication().addEventListener("mouseup", that.mouseupHandler, false);
        
        that.component.focus();
        that.drag = true;
      }
    }
  };

  this.mousemoveHandler = function(event){
    if(that.drag){

      var mouse = WIDGET3D.mouseCoordinates(event);
      var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
      var ray = WIDGET3D.getProjector().pickingRay(vector, that.camera);
      
      var intersects = ray.intersectObject( that.plane );
      if(intersects.length > 0){
      
        var pos = intersects[ 0 ].point.sub( that.offset);
        that.plane.position.copy(pos);
        var vec = that.component.parent.object3D.worldToLocal(pos);
        that.component.setPosition(vec.x, vec.y, vec.z);
        
      }
    }
  };
  this.component.addEventListener("mousedown", this.mousedownHandler, false);
};


WIDGET3D.DragControl.prototype = WIDGET3D.Control.prototype.inheritance();

WIDGET3D.DragControl.prototype.remove = function(){
  
  WIDGET3D.getScene().remove(this.plane);
  
  this.plane.geometry.dispose();
  this.plane.material.dispose();
  this.plane = undefined;
};

