widget3D
=======
-------

3D widget library for the web.

Experimenting ways to make 3D UIs in the web. At the moment library can be used with the [Three.js] (http://github.com/mrdoob/three.js) 3D-engine version 51.

Work in progress.

Features:
-------
* Basic widget buildingblocks that can be used to create 3D widgets.
* Event system that handles DOM events inside the 3D world. Events are bind directly to 3D widgets.
You need to just define the event handler callback. Collision detection and all the complicated stuff is done by the library.
* Few styled predefined 3D widgets (see the example page!)


Using the library:
-------

To use the library include widget3D-build-min.js or widget3D-build.js. The files can be found from build directory.
This library also needs at the moment Three.js version 51 to work. So you have to include it too.

There isn't any formal documentation yet. Look at the examples from examples directory to get started.

Building the library:
-------

For building the library you need nodejs. Then just run command "node build.js" in build directory.

TODO:
-------
* Event system needs to be redone in more generic way.
* Drag controls for the TitledWindow component needs some work. At the moment drag works only along the objects xy-axis.
This isn't intuitive if camera have rotation.
* Adapters to other 3D engines
* Updating Three.js to it's latest version.