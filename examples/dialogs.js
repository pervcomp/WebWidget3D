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
  // When usin three.js and widget3D, initializing widget3D can be done by WIDGET3D.THREE_Application.
  
  var mainWindow = WIDGET3D.THREE_Application({
    antialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xf9f9f9
  });
  
  WIDGET3D.getCameraGroup().setPositionZ(1000);
  
  //--------------------------------------------
  // Example dialog
  //--------------------------------------------
  
  //styled window
  //var dialog = new WIDGET3D.Dialog({height : 500, width : 500, maxTextLength : 16});
  
  var fields = [{description : "name"}, {description : "name"}, {description : "name"}, {description : "name"},
    {description : "name"}, {description : "name"}, {description : "name"}];
  var dialog = new WIDGET3D.Dialog({width: 600, height : 600, fields: fields, hasCancel : true});

  dialog.setPositionX(-300);
  dialog.setRotationX(-Math.PI/10);
  var rollControl = new WIDGET3D.RollControl(dialog);
  var drag = new WIDGET3D.DragControl(dialog, {mouseButton : 2, width : 700, height: 700});
  
  mainWindow.add(dialog);
  
  var choices = [
    {string : "choice1", onclick : {handler : function(){alert("clicked choice1");}}},
    {string : "choice2", onclick : {handler : function(){alert("clicked choice2");}}},
    {string : "choice3", onclick : {handler : function(){alert("clicked choice3");}}},
    {string : "choice4", onclick : {handler : function(){alert("clicked choice4");}}}
  ];
  
  var select = new WIDGET3D.SelectDialog({text : "Menu",
    choices: choices,
    hasCancel : true,
    width : 600,
    height : 600,
    depth : 30});
  
  select.setPositionX(300);
  select.setRotationY(Math.PI/10);
  
  var rollControl2 = new WIDGET3D.RollControl(select);
  var drag2 = new WIDGET3D.DragControl(select, {mouseButton : 2, width: 700, height: 700});
  
  mainWindow.add(select);
  
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
