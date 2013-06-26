//Simple video window demo by Anna-Liisa Mattila
//made with widget3D and three.js

//INIT FUNCTION
var init = function(){
  
  var that = this;
  
  that.DISTANCE = 500;
  that.ANGLE = 0;
  
  var WIDTH = window.InnerWidth;
  var HEIGHT = window.InnerHeight;
  
  //--------------------------------------------
  // WIDGET3D INIT, MAIN WINDOW
  //--------------------------------------------
  
  // THREEJS_WIDGET3D is a adapter that provides nesesary plugin for widget3D
  // widget3D doesn't use any 3D-engine in default
  // THREEJS_WIDGET3D defines the necessary callbacks for widget3D using three.js
  // When usin three.js and widget3D, initializing widget3D can be done by WIDGET3D.THREE_Application.
  
  var mainWindow = WIDGET3D.THREE_Application({
    antialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xf9f9f9
  });
  
  var camera = WIDGET3D.getCamera();
  camera.position.setZ(that.DISTANCE);
  camera.rotation.setX(Math.PI/5);
  
  var cameraGroup = WIDGET3D.getCameraGroup();
  cameraGroup.setRotationX(-Math.PI/5);
  
  
  var testGroup = new WIDGET3D.Group();
  testGroup.setRotationY(Math.PI/8);
  
  cameraGroup.add(testGroup);
  
  //--------------------------------------------
  // TITLED WINDOW WHERE WE SHOW THE VIDEO
  //--------------------------------------------
  
  //Video texture for video display
  var video = document.getElementById( 'video' );
  var texture = texture = new THREE.Texture( video );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  texture.generateMipmaps = false;
  
  //styled window
  var videoWindow = new WIDGET3D.TitledWindow({
    width : 480,
    height : 204,
    title : "video",
    texture : texture,
    defaultControls : true,
    debug : true
  });
  
  videoWindow.setRotationY(-Math.PI/8);
  
  var rollControls = new WIDGET3D.RollControls({component : videoWindow, mouseButton : 0, shiftKey : true});
  
  //CALLBACK FOR UPDATING TEXTURE
  videoWindow.addUpdateCallback(function(texture){texture.needsUpdate = true}, texture);
  
  var createPauseFunction = function(v){
    return function(){
      v.pause();
    }
  }
  var pauseFunction = createPauseFunction(video);
  videoWindow.closeButton.addEventListener("click", pauseFunction);
  
  //mainWindow.add(videoWindow);
  //cameraGroup.add(videoWindow);
  testGroup.add(videoWindow);
  
  var onResize = function(){
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    
    var aspect = WIDTH / HEIGHT;
    
    WIDGET3D.setViewport(WIDTH, HEIGHT, aspect);
  };
  mainWindow.addEventListener("resize", onResize);
  
  var mainLoop = function(){
    requestAnimationFrame( mainLoop );
    WIDGET3D.render();
  };
  
  mainLoop();
}


