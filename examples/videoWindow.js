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
  // When usin three.js and widget3D, initializing widget3D can be done by WIDGET3D.createMainWindow_THREE.
  
  var mainWindow = WIDGET3D.createMainWindow_THREE({
    antialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xf9f9f9
  });
  
  var camera = WIDGET3D.getCameraGroup();
  camera.setZ(that.DISTANCE);
  //camera.setRotation(Math.PI/10, Math.PI/10, Math.PI/10);
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
    defaultControls : true
  });
  
  var rollControls = new WIDGET3D.RollControls({component : videoWindow, mouseButton : 0, shiftKey : true});
  
  //CALLBACK FOR UPDATING TEXTURE
  videoWindow.addUpdateCallback(function(texture){texture.needsUpdate = true}, texture);
  
  videoWindow.closeButton_.addEventListener("click",
    function(event, p){p.video.pause(); p.screen.remove()},
    {video : video, screen : videoWindow});

  
  mainWindow.addChild(videoWindow);
  
  var cameraControls= function(event, camera){
    var alpha = Math.PI/30;
    
    if(event.keyCode == 39){
      that.ANGLE += alpha;
      camera.setX(Math.cos( that.ANGLE ) * that.DISTANCE);
      camera.setZ(Math.sin( that.ANGLE ) * that.DISTANCE);
    }
    else if(event.keyCode == 37){
      that.ANGLE -= alpha;
      camera.setX(Math.cos( that.ANGLE ) * that.DISTANCE);
      camera.setZ(Math.sin( that.ANGLE ) * that.DISTANCE);
    }
  };
  mainWindow.addEventListener("keydown", cameraControls, camera);
  
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


