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
  
  THREEJS_WIDGET3D.camera.position.z = 1500;
  
  //--------------------------------------------
  // Example dialog
  //--------------------------------------------
  
  //styled window
  var dialog = new THREEJS_WIDGET3D.Dialog({height : 1500, width : 1500});
  
  dialog.button_.addEventListener("click",
    function(event, dialog){dialog.remove()}, dialog);
    
  dialog.setX(-800);
  
  mainWindow.addChild(dialog);
  
  mainWindow.addEventListener("keydown", function(event){console.log("keydown")});
  mainWindow.focus();
  
  var choices = [
    {string : "choice1", onclick : {}},
    {string : "choice2", onclick : {}},
    {string : "choice3", onclick : {}},
    {string : "choice4", onclick : {}},
    {string : "choice5", onclick : {}},
    {string : "choice6", onclick : {}}
  ];
  
  var select = new THREEJS_WIDGET3D.SelectDialog({text : "Menu",
    choices: choices,
    hasCancel : true,
    width : 1500,
    height : 1500});
  
  select.setX(800);
  
  mainWindow.addChild(select);
  
  var mainLoop = function(){
    requestAnimationFrame( mainLoop );

    dialog.update();
    
    THREEJS_WIDGET3D.render();
  };
  mainLoop();
}