//Picturedisplay demo by Anna-Liisa Mattila
//made with widget3D and three.js

//INIT FUNCTION
var init = function(){
  
  var WIDTH = 0.90 * window.innerWidth;
  var HEIGHT = 0.83 * window.innerHeight;
  
  //--------------------------------------------
  // WIDGET3D INIT, MAIN WINDOW
  //--------------------------------------------
  
  // THREEJS_WIDGET3D is a adapter that provides nesesary plugin for widget3D
  // widget3D doesn't use any 3D-engine in default
  // THREEJS_WIDGET3D defines the necessary callbacks for widget3D using three.js
  // When usin three.js and widget3D, initializing widget3D can be done by WIDGET3D.createMainWindow_THREE.
  
  var mainWindow = WIDGET3D.createMainWindow_THREE({
    domParent : document.getElementById("container"),
    antialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xf9f9f9
  });
  
  WIDGET3D.camera.setZ(2000);
  
  //--------------------------------------------
  // SUBWINDOW FOR SMALL IMAGES
  //--------------------------------------------
  
  //styled window
  var subWindow = new WIDGET3D.GridWindow({width : 2400,
    height : 2000,
    color : 0x000000,
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
  
  pictureDisplay.addEventListener("click", pictureclick, pictureDisplay);
  pictureDisplay.hide();
  
  mainWindow.addEventListener("dragenter", drag);
  mainWindow.addEventListener("dragover", drag);
  mainWindow.addEventListener("drop", drop, {parent: subWindow, display: pictureDisplay});
  
  var onResize = function(){
    WIDTH = 0.90 * window.innerWidth;
    HEIGHT = 0.83 * window.innerHeight;
    
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

//event handlers

//mouse click handler for small pictures
var mouseclickHandler = function(event, parameters){
  
  var width = parameters.button.mesh_.material.map.image.naturalWidth;
  var height = parameters.button.mesh_.material.map.image.naturalHeight;
  var scale = 1050/height;
  
  var display = new THREE.Mesh(new THREE.PlaneGeometry(width*scale, height*scale),
    parameters.button.mesh_.material);
  
  display.position.z = 1250;
  
  parameters.pictureDisplay.setMesh(display);
  parameters.pictureDisplay.show();
}

//mouse click handler for picture display
var pictureclick = function(event, pictureDisplay){
  pictureDisplay.hide();
}

//Drag and drop events
var drag = function(event){
  event.stopPropagation();
  event.preventDefault();
}

var drop = function(event, parameters){
  
  event.stopPropagation();
  event.preventDefault();

  var files = event.dataTransfer.files;

  for(var i = 0; i < files.length; ++i){
    var file = files[i];
    var imageType = /image.*/;
    
    if ( !file.type.match(imageType) ){
      console.log("filetype missmatch");
      continue;
    }
    
    var img = new Image();
    
    var reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) {
      
      aImg.onload = function(){
        displayPicture(parameters.parent, parameters.display, aImg);
      }
      
      aImg.src = e.target.result;
      
     
      
    }; })(img);
    reader.readAsDataURL(file);   
  }
}

var displayPicture = function(subWindow, pictureDisplay, img){

  var button = new WIDGET3D.GridIcon({parent: subWindow, img : img});
  button.addEventListener("click", mouseclickHandler, {button: button, pictureDisplay : pictureDisplay});
}



