//Picturedisplay demo by Anna-Liisa Mattila
//made with widget3D and three.js

//INIT FUNCTION
var init = function(){

  var WIDTH = 824;
  var HEIGHT = 668;
  
  //--------------------------------------------
  // WIDGET3D INIT, MAIN WINDOW
  //--------------------------------------------
  
  // THREEJS_WIDGET3D is a adapter that provides nesesary plugin for widget3D
  // widget3D doesn't use any 3D-engine in default
  // THREEJS_WIDGET3D defines the necessary callbacks for widget3D using three.js
  // When usin three.js and widget3D, initializing widget3D can be done by THREEJS_WIDGET3D.
  
  var mainWindow = THREEJS_WIDGET3D.init({domParent : document.getElementById("container"),
    aintialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xf9f9f9
  });
  
  THREEJS_WIDGET3D.camera.position.z = 2000;
  
  //--------------------------------------------
  // SUBWINDOW FOR SMALL IMAGES
  //--------------------------------------------
  
  //styled window
  var subWindow = new THREEJS_WIDGET3D.GridWindow({width : 2000,
    height : 2000,
    color : 0x213D30,
    defaultControls: true});
  
  mainWindow.addChild(subWindow);
  
  //--------------------------------------------
  // PICUTRE DISPLAY FOR LARGE PICTURE
  //--------------------------------------------
  
  var display = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10),
    new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
  
  var pictureDisplay = new WIDGET3D.Basic();
  pictureDisplay.setMesh(display);
  mainWindow.addChild(pictureDisplay);
  
  pictureDisplay.addEventListener(WIDGET3D.EventType.onclick, pictureclick, pictureDisplay);
  pictureDisplay.hide();
  
  //creates small pictures
  displayPictures(subWindow, pictureDisplay);
  
  var mainLoop = function(){
    requestAnimationFrame( mainLoop );

    subWindow.update();
    
    THREEJS_WIDGET3D.render();
  };
  mainLoop();
}

//event handlers

//mouse click handler for small pictures
var mouseclickHandler = function(event, parameters){
  
  var width = parameters.button.mesh_.material.map.image.naturalWidth;
  var height = parameters.button.mesh_.material.map.image.naturalHeight;
  
  var display = new THREE.Mesh(new THREE.PlaneGeometry(width*2, height*2),
    parameters.button.mesh_.material);
  
  display.position.z = 1000;
  
  parameters.pictureDisplay.setMesh(display);
  parameters.pictureDisplay.show();
}

//mouse click handler for picture display
var pictureclick = function(event, pictureDisplay){
  pictureDisplay.hide();
}

//constructing picture grid and gui buttons

//creating small pictures
var displayPictures = function(subWindow, pictureDisplay){

  var pictures = ["img/jp1.jpg", "img/jp2.jpg", "img/jp3.jpg", "img/jp4.jpg", "img/jp5.jpg",
  "img/jp6.jpg", "img/jp7.jpg", "img/jp8.jpg", "img/jp9.jpg", "img/jp10.jpg",
  "img/jp11.jpg", "img/jp12.jpg", "img/jp13.jpg", "img/jp15.jpg",
  "img/jp16.jpg", "img/jp17.jpg", "img/jp18.jpg", "img/jp19.jpg", "img/jp20.jpg",
  "img/jp21.jpg","img/jp22.jpg","img/jp23.jpg","img/jp24.jpg","img/jp25.jpg",
  "img/jp26.jpg","img/jp27.jpg","img/jp28.jpg"];

  for (var i = 0; i < pictures.length; ++i){

    var button = new THREEJS_WIDGET3D.GridIcon({parent : subWindow, picture : pictures[i]});
    button.addEventListener(WIDGET3D.EventType.onclick, mouseclickHandler, {button: button, pictureDisplay : pictureDisplay});
    
  }
}


