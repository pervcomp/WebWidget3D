//Simple video window demo by Anna-Liisa Mattila
//made with widget3D and three.js

//INIT FUNCTION
var init = function(){

  var WIDTH = window.InnerWidth;
  var HEIGHT = window.InnerHeight;
  
  //--------------------------------------------
  // WIDGET3D INIT, MAIN WINDOW
  //--------------------------------------------
  
  // THREEJS_WIDGET3D is a adapter that provides nesesary plugin for widget3D
  // widget3D doesn't use any 3D-engine in default
  // THREEJS_WIDGET3D defines the necessary callbacks for widget3D using three.js
  // When usin three.js and widget3D, initializing widget3D can be done by THREEJS_WIDGET3D.
  
  var mainWindow = THREEJS_WIDGET3D.init({
    aintialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xf9f9f9
  });
  
  THREEJS_WIDGET3D.camera.position.z = 2000;
  
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
  var videoWindow = new THREEJS_WIDGET3D.TitledWindow({width : 480*7,
    height : 204*7,
    title : "video",
    texture : texture,
    defaultControls : true});
  
  //CALLBACK FOR UPDATING TEXTURE
  videoWindow.addUpdateCallback(function(texture){texture.needsUpdate = true}, texture);
  
  //ONCLICK EVENT LISTENER FOR CLOSE BUTTON
  /*videoWindow.closeButton_.addEventListener(WIDGET3D.EventType.onclick,
    function(event, p){p.video.pause(); p.window.remove()},
    {video : video, window : videoWindow});*/
  
  videoWindow.closeButton_.addEventListener("click",
    function(event, p){p.video.pause(); p.window.remove()},
    {video : video, window : videoWindow});

  mainWindow.addChild(videoWindow);
  
  var mainLoop = function(){
    requestAnimationFrame( mainLoop );

    videoWindow.update();
    
    THREEJS_WIDGET3D.render();
  };
  mainLoop();
}
