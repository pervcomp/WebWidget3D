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
  // When usin three.js and widget3D, initializing widget3D can be done by WIDGET3D.THREE_Application.
  
  var mainWindow = WIDGET3D.THREE_Application({
    domParent : document.getElementById("container"),
    antialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xf9f9f9,
  });
  
  WIDGET3D.getCameraGroup().setPositionZ(1000);
  
  //--------------------------------------------
  // SUBWINDOW FOR SMALL IMAGES
  //--------------------------------------------
  
  //styled window
  var subWindow = new WIDGET3D.GridWindow({
    width : 600,
    height : 500,
    color : 0x000000,
    defaultControls: true//,
    //hideGrid : true
  });
  
  mainWindow.add(subWindow);
  
  //--------------------------------------------
  // PICUTRE DISPLAY FOR LARGE PICTURE
  //--------------------------------------------
  
  var display = new THREE.Mesh(new THREE.PlaneGeometry(250, 250, 10, 10),
    new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
  
  var pictureDisplay = new WIDGET3D.Basic();
  pictureDisplay.setMesh(display);
  mainWindow.add(pictureDisplay);
  
  var pictureclick = createPictureclickHandler(pictureDisplay);
  
  pictureDisplay.addEventListener("click", pictureclick, false);
  pictureDisplay.hide();
  
  var drop = createDrop({parent: subWindow, display: pictureDisplay});
  
  mainWindow.addEventListener("dragenter", drag);
  mainWindow.addEventListener("dragover", drag);
  mainWindow.addEventListener("drop", drop);
  
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
};

//Drag event handler
var drag = function(event){
  event.stopPropagation();
  event.preventDefault();
};


//drop handler factory
var createDrop = function(parameters){
  return function(event){
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
};

//mouse click handler factory for picture display
var createPictureclickHandler = function(pd){
  return function(){
    pd.hide();
  }
};

var createMouseclickHandler = function(parameters){
  var DISPLAY_DISTANCE = 400;
  var SCALEFACTOR = 525;
  
  return function(event){
  
    var width = parameters.button.container_.material.map.image.naturalWidth;
    var height = parameters.button.container_.material.map.image.naturalHeight;
    var scale = SCALEFACTOR/height;
    
    var display = new THREE.Mesh(new THREE.PlaneGeometry(width*scale, height*scale),
      parameters.button.container_.material);
    
    display.position.z = DISPLAY_DISTANCE;
    
    parameters.pictureDisplay.setMesh(display);
    parameters.pictureDisplay.show();
    
  }
};

var displayPicture = function(subWindow, pictureDisplay, img){
  var button = new WIDGET3D.GridIcon({parent: subWindow, img : img});
  
  var onclick = createMouseclickHandler({button: button, pictureDisplay : pictureDisplay});
  button.addEventListener("click", onclick, false);
};