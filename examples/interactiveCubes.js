//INIT FUNCTION
var init = function(){
  
  var WIDTH = 0.90 * window.innerWidth;
  var HEIGHT = 0.83 * window.innerHeight;
  
  var CUBES = 10;
  
  //--------------------------------------------
  // WIDGET3D INIT, MAIN WINDOW
  //--------------------------------------------
  
  var mainWindow = WIDGET3D.THREE_Application({
    domParent : document.getElementById("container"),
    antialias : true,
    width : WIDTH,
    height : HEIGHT,
    clearColor : 0xFAFAFA,
    far : 20000
  });
  
  WIDGET3D.getCameraGroup().setPositionZ(1000);
  
  //--------------------------------------------
  // Selected icons are kept in one container
  //--------------------------------------------
  var selected = new WIDGET3D.Group();
  var dragControl = new WIDGET3D.DragControl(selected, {
    mouseButton : 2,
    width: 10000,
    height: 10000,
    debug: false
  });
  
  
  var cameraMovement = new WIDGET3D.FlyControl(WIDGET3D.getCameraGroup());
  
  mainWindow.add(selected);
  
  var selectCube = function(cube, group, application){
  
    return function(event){
      if(cube.parent != group){
        if(event.ctrlKey){
          var position = cube.getPosition().clone();
          
          group.worldToLocal(position);
          group.add(cube);
          cube.setPosition(position.x, position.y, position.z);
          

        }
        else{
          while(group.children.length > 0){
          
            var child = group.children[0];
            var position = child.getPosition().clone();
            
            group.localToWorld(position);
            application.add(child);
            
            child.setPosition(position.x, position.y, position.z);
          }
          
          var position = cube.getPosition().clone();
          
          group.worldToLocal(position);
          group.add(cube);
          cube.setPosition(position.x, position.y, position.z);
        }
      }
    };
  };
  
  var cubeSize = 100;
  
  //Creating cubes that can be dragged
  for(var i = 0; i < CUBES; ++i){
    var geometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
    var material = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF*Math.random()
    });
    var mesh= new THREE.Mesh(geometry, material);
    
    var cube = new WIDGET3D.Basic();
    cube.setObject3D(mesh);
    
    cube.setPositionX(-((cubeSize+(cubeSize/4.0))*CUBES/2.0)+(i*(cubeSize+(cubeSize/2.0))));
    
    //cube.addEventListener("mousedown", selectCube(cube, selected, mainWindow));
    
    var roll = new WIDGET3D.RollControl(cube, {
      mouseButton : 0,
      shiftKey : true
    });
    
    var drag = new WIDGET3D.DragControl(cube, {
      mouseButton: 0,
      shiftKey: false,
      width : 20*cubeSize,
      height : 20*cubeSize,
      debug : false
    });
    
    selected.add(cube);
  }
  
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
    footer.style.height = (statsHeight*2.0).toString()+"px";
  
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
  
  //Rendering happens here
  var mainLoop = function(){
    requestAnimationFrame( mainLoop );
    WIDGET3D.render();
  };
  mainLoop();
};

