// FPS CONTROLS for WIDGET3D three.js version
//
//Parameters: component: Camera group
//

WIDGET3D.FlyControl = function(component, parameters){
  
  WIDGET3D.Control.call(this, component);
  
  var parameters = parameters || {};
  
  this.left = parameters.leftKeyCode !== undefined ? parameters.leftKeyCode : 65; //a
  this.right = parameters.rightKeyCode !== undefined ? parameters.rigthKeyCode : 68; //d
  this.forward = parameters.forwardKeyCode !== undefined ? parameters.forwardKeyCode : 87; //w
  this.backward = parameters.backwardKeyCode !== undefined ? parameters.backwardKeyCode : 83; //s
  this.up= parameters.upKeyCode !== undefined ? parameters.upKeyCode : 82; //r
  this.down = parameters.downKeyCode !== undefined ? parameters.downKeyCode : 70; //f
  
  
  this.lookLeft = parameters.lookLeftKeyCode !== undefined ? parameters.lookLeftKeyCode : 74; //j
  this.lookRight = parameters.lookRightKeyCode !== undefined ? parameters.lookRightKeyCode : 76; //l
  this.lookUp = parameters.lookUpKeyCode !== undefined ? parameters.lookUpKeyCode : 73; //i
  this.lookDown = parameters.lookDownKeyCode !== undefined ? parameters.lookDownKeyCode : 75; //k
  
  this.ds = parameters.moveDelta !== undefined ? parameters.moveDelta: 50;
  this.da = parameters.angleDelta !== undefined ? parameters.angleDelta : Math.PI/50.0; 
  
  var that = this;
  
  var maxA = Math.PI-(Math.PI/100.0);
  var minA = -maxA;
  
  
  this.onkeydownHandler = function(event){
    switch(event.keyCode){
      case that.left:
        that.component.translateX(-that.ds);
        break;
      case that.right:
        that.component.translateX(that.ds);
        break;
      case that.forward:
        that.component.translateZ(-that.ds);
        break;
      case that.backward:
        that.component.translateZ(that.ds);
        break;
      case that.up:
        that.component.translateY(that.ds);
        break;
      case that.down:
        that.component.translateY(-that.ds);
        break;
      case that.lookLeft:
        that.component.rotateOnAxis(new THREE.Vector3(0,1,0), that.da);
        break;
      case that.lookRight:
        that.component.rotateOnAxis(new THREE.Vector3(0,1,0), -that.da);
        break;
      case that.lookUp:
        that.component.rotateOnAxis(new THREE.Vector3(1,0,0), that.da);
        break;
      case that.lookDown:
        that.component.rotateOnAxis(new THREE.Vector3(1,0,0), -that.da);
        break;
      
      default:
        return;
    }
  };
  
  this.onkeyupHandler = function(event){
  };
  
  WIDGET3D.getApplication().addEventListener("keydown", this.onkeydownHandler);
};


WIDGET3D.FlyControl.prototype = WIDGET3D.Control.prototype.inheritance();

WIDGET3D.FlyControl.prototype.remove = function(){
  
  WIDGET3D.getApplication().removeEventListener("keydown", this.onkeydownHandler);
  WIDGET3D.Control.prototype.remove.call( this );
};
