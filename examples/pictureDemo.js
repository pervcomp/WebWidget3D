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
  // When usin three.js and widget3D, initializing widget3D can be done by WIDGET3D.createMainWindow_THREE.
  
  var mainWindow = WIDGET3D.createMainWindow_THREE({
    domParent : document.getElementById("container"),
    antialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xf9f9f9
  });
  
  WIDGET3D.camera.position.z = 2000;
  
  //--------------------------------------------
  // SUBWINDOW FOR SMALL IMAGES
  //--------------------------------------------
  
  //styled window
  var subWindow = new WIDGET3D.GridWindow({width : 2000,
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
  
  pictureDisplay.addEventListener("click", pictureclick, pictureDisplay);
  pictureDisplay.hide();
  
  mainWindow.addEventListener("myOwnEventType", clickMessage);
  
  //creates small pictures
  displayPictures(subWindow, pictureDisplay);
  
  var mainLoop = function(){
    requestAnimationFrame( mainLoop );

    subWindow.update();
    
    WIDGET3D.render();
  };
  mainLoop();
}

//event handlers

var clickMessage = function(message){
  document.body.style.backgroundColor = "#B6C560";
  setTimeout(fade, 300);
  
}

var fade = function(){
  var color = colorToHex(document.body.style.backgroundColor);
  
  if(color != "#B6C5BE"){
    var tmp = color.substr(1,6);
    var colorHex = parseInt(tmp, 16);
    colorHex += 0x2;
    color = "#" + colorHex.toString(16).toUpperCase();
    document.body.style.backgroundColor = color;
    setTimeout(fade, 10);
  }
}

var colorToHex = function(color) {
    if (color.substr(0, 1) === '#') {
        return color;
    }
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
    
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    
    var rgb = blue | (green << 8) | (red << 16);
    return (digits[1] + '#' + rgb.toString(16)).toUpperCase();
};

//mouse click handler for small pictures
var mouseclickHandler = function(event, parameters){
  
  var width = parameters.button.mesh_.material.map.image.naturalWidth;
  var height = parameters.button.mesh_.material.map.image.naturalHeight;
  
  var display = new THREE.Mesh(new THREE.PlaneGeometry(width*2, height*2),
    parameters.button.mesh_.material);
  
  display.position.z = 1000;
  
  parameters.pictureDisplay.setMesh(display);
  parameters.pictureDisplay.show();
  
  WIDGET3D.getEvents().triggerEvent({type: "myOwnEventType"});
}

//mouse click handler for picture display
var pictureclick = function(event, pictureDisplay){
  pictureDisplay.hide();
  WIDGET3D.getEvents().triggerEvent({type: "myOwnEventType"});
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

    var button = new WIDGET3D.GridIcon({parent : subWindow, picture : pictures[i]});
    button.addEventListener("click", mouseclickHandler, {button: button, pictureDisplay : pictureDisplay});
    
  }
}


