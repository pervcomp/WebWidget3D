// DRAG CONTROLS for WIDGET3D three.js version
//
//Parameters: component: WIDGET3D object to which the controls are attached
//                       COMPONENT MUST BE GIVEN!
//            mouseButtom: integer 0, 1 or 2. Tells which mouse button the control is attached.
//                         0 = left button (default), 1 = middle button if present, 2 = right button
//            shiftKey: Boolean that tells if the shift key should be pressed down with the mouse button to apply the movement.
//                      Default value is false.
//
WIDGET3D.DragControl = function(component, parameters){
  
  WIDGET3D.Control.call(this, component);
  
  var parameters = parameters || {};
  
  this.mouseButton = parameters.mouseButton !== undefined ? parameters.mouseButton : 0;
  this.shiftKey = parameters.shiftKey !== undefined ? parameters.shiftKey : false;
  
  var that = this;
  
  var width = parameters.width !== undefined ? parameters.width : 2000;
  var height = parameters.height !== undefined ? parameters.height : 2000;
  var debug = parameters.debug !== undefined ? parameters.debug : false;
  
  //invisible plane that is used as a "dragging area".
  //the planes orientation is the same as the cameras orientation.
  this.plane = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 8, 8 ), 
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true, wireframe: true, side : THREE.DoubleSide } ) );
  this.plane.visible = debug;
  
  this.drag = false;
  
  var camera = WIDGET3D.getCamera();
  var offset = new THREE.Vector3();
  
  this.mouseupHandler = function(event){
    if(that.drag){
      that.drag = false;
      
      that.plane.position.copy(that.component.parent.object3D.localToWorld(that.component.getPosition().clone()));

      WIDGET3D.getApplication().removeEventListener("mousemove", mousemoveHandler);
      WIDGET3D.getApplication().removeEventListener("mouseup", that.mouseupHandler);
    }
  };
  
  this.mousedownHandler = function(event){
    if(event.button === that.mouseButton && event.shiftKey === that.shiftKey){
      if(!that.drag){
        
        setPlaneRotation();
        that.plane.position.copy(that.component.parent.object3D.localToWorld(that.component.getPosition().clone()));
        //FORCE TO UPDATE MATRIXES OTHERWISE WE MAY GET INCORRECT VALUES FROM INTERSECTION
        that.plane.updateMatrixWorld(true);
        
        var mouse = WIDGET3D.mouseCoordinates(event);
        var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
        var ray = WIDGET3D.getProjector().pickingRay(vector, camera);
        
        var intersects = ray.intersectObject( that.plane );
        if(intersects.length > 0){
          offset.copy( intersects[ 0 ].point ).sub( that.plane.position );
        }
        
        WIDGET3D.getApplication().addEventListener("mousemove", mousemoveHandler, false);
        WIDGET3D.getApplication().addEventListener("mouseup", that.mouseupHandler, false);
        
        that.component.focus();
        that.drag = true;
      }
    }
  };
  
  var mousemoveHandler = function(event){
    if(that.drag){

      var mouse = WIDGET3D.mouseCoordinates(event);
      var vector	= new THREE.Vector3(mouse.x, mouse.y, 1);
      var ray = WIDGET3D.getProjector().pickingRay(vector, camera);
      
      var intersects = ray.intersectObject( that.plane );
      if(intersects.length > 0){
      
        var pos = intersects[ 0 ].point.sub(offset);
        that.plane.position.copy(pos);
        var vec = that.component.parent.object3D.worldToLocal(pos);
        that.component.setPosition(vec.x, vec.y, vec.z);
        
      }
    }
  };
  
  //To get the right orientation we need to do some matrix tricks
  var setPlaneRotation = function(){
    //The orientation of camera is a combination of its ancestors orientations
    //that's why the rotation needs to be extracted from world matrix
    var matrixWorld = camera.matrixWorld.clone();
    var rotation = new THREE.Matrix4();
    rotation.extractRotation(matrixWorld);
    
    //And then the rotation matrix is applied to the plane
    that.plane.setRotationFromMatrix(rotation);
    that.plane.updateMatrix();
  };
  
  setPlaneRotation();
  WIDGET3D.getScene().add( this.plane );
  
  this.component.addEventListener("mousedown", this.mousedownHandler, false);
};


WIDGET3D.DragControl.prototype = WIDGET3D.Control.prototype.inheritance();

WIDGET3D.DragControl.prototype.remove = function(){

  this.component.removeEventListener("mousedown", this.mousedownHandler);
  
  if(this.drag){
    this.mouseupHandler();
  }
  
  WIDGET3D.getScene().remove(this.plane);
  
  this.plane.geometry.dispose();
  this.plane.material.dispose();
  this.plane = undefined;
  
  WIDGET3D.Control.prototype.remove.call( this );
};

