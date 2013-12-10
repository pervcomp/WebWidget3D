//Picture display demo by Anna-Liisa Mattila
//made with widget3D and three.js

//INIT FUNCTION
var init = function(){
  
  var WIDTH = 0.90 * window.innerWidth;
  var HEIGHT = 0.83 * window.innerHeight;
  
  //--------------------------------------------
  // WIDGET3D INIT, MAIN WINDOW
  //--------------------------------------------
  
  // THREEJS_WIDGET3D is a adapter that provides necessary plug-in for widget3D
  // widget3D doesn't use any 3D-engine in default
  // THREEJS_WIDGET3D defines the necessary callbacks for widget3D using three.js
  // When using three.js and widget3D, initializing widget3D can be done by WIDGET3D.THREE_Application.
  
  var mainWindow = WIDGET3D.THREE_Application({
    domParent : document.getElementById("container"),
    antialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xFAFAFA,
  });
  
  WIDGET3D.getCameraGroup().setPositionZ(1000);
  
  //--------------------------------------------
  // SUBWINDOW FOR SMALL IMAGES
  //--------------------------------------------
  
  //styled window
  var subWindow = new WIDGET3D.GridWindow({
    width : 600,
    height : 500,
    color : 0x000030,
    defaultControls: true
  });
  
  var dragControl = new WIDGET3D.DragControl(subWindow, {
    mouseButton : 2,
    width: 800,
    height: 600
  });
  
  mainWindow.add(subWindow);
  
  //--------------------------------------------
  // PICUTRE DISPLAY FOR LARGE PICTURE
  //--------------------------------------------
  
  var display = new THREE.Mesh(new THREE.PlaneGeometry(250, 250, 10, 10),
    new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
  
  var pictureDisplay = new WIDGET3D.Basic();
  pictureDisplay.setObject3D(display);
  mainWindow.add(pictureDisplay);
  
  var pictureclick = createPictureclickHandler(pictureDisplay);
  
  pictureDisplay.addEventListener("click", pictureclick, false);
  pictureDisplay.hide();
  
  var drop = createDrop({parent: subWindow, display: pictureDisplay});
  
  mainWindow.addEventListener("dragenter", drag);
  mainWindow.addEventListener("dragover", drag);
  mainWindow.addEventListener("drop", drop);
  
  var onResize = function(){
    
    var WIDTH = 0.90 * window.innerWidth;
    var HEIGHT = 0.83 * window.innerHeight;
    
    var minWidth = 600;
    var minCanvasHeight = 128;
    if(WIDTH < minWidth){
      WIDTH = minWidth;
    }
    if(HEIGHT < minCanvasHeight){
      HEIGHT = minCanvasHeight;
    }
    WIDTH = Math.floor(WIDTH);
    HEIGHT = Math.floor(HEIGHT);
    
    var aspect = WIDTH / HEIGHT;
    WIDGET3D.setViewport(WIDTH, HEIGHT, aspect);

    var container = document.getElementById("container");
    container.style.width = WIDTH.toString()+"px";
    container.style.height = HEIGHT.toString()+"px";

  
    //AND THEN WE SCALE THE FONT AND EVERYTHING ELSE!!
    var minStatsHeight = 30;
    var statsHeight = HEIGHT/20;
    if(statsHeight < minStatsHeight){
      statsHeight = minStatsHeight;
    }
  
    var navigation = document.getElementById("navigation");
    navigation.style.width = WIDTH.toString()+"px";
    navigation.style.height = statsHeight.toString()+"px";
    var footer = document.getElementById("footer");
    
    footer.style.width = navigation.style.width;
    footer.style.height = navigation.style.height;
  
    document.getElementById("data").style.width = navigation.style.width;
  
    //For footer and navigation
    var scaleFactor = 0.15;
    var maxScale = 85;
    var minScale = 60;
    
    var fontSize = WIDTH * scaleFactor;
    if (fontSize > maxScale){
      fontSize = maxScale;
    }
    if (fontSize < minScale){
      fontSize = minScale;
    }
    navigation.style.fontSize = fontSize.toString()+"%";
    footer.style.fontSize = navigation.style.fontSize;

  };
  onResize();
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
  var SCALEFACTOR = 512;
  
  return function(event){
  
    var width = parameters.button.object3D.material.map.image.naturalWidth;
    var height = parameters.button.object3D.material.map.image.naturalHeight;
    var scale = SCALEFACTOR/height;
    
    var display = new THREE.Mesh(new THREE.PlaneGeometry(width*scale, height*scale),
      parameters.button.object3D.material);
    
    display.position.z = DISPLAY_DISTANCE;
    
    parameters.pictureDisplay.setObject3D(display);
    parameters.pictureDisplay.show();
    
  }
};

var displayPicture = function(subWindow, pictureDisplay, img){
  var button = new WIDGET3D.GridIcon({parent: subWindow, img : img});
  
  var onclick = createMouseclickHandler({button: button, pictureDisplay : pictureDisplay});
  button.addEventListener("click", onclick, false);
};
