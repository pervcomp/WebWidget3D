widget3D
=======
-------

3D widget library for the web.

Experimenting ways to make 3D UIs in the web. At the moment library can be used with the [three.js](http://github.com/mrdoob/three.js) 3D-engine version 55.

Work in progress.

Some examples:
-------
* [Picture demo](http://www.cs.tut.fi/~mattila3/rimina)
* [Lively3D](http://lively3d.cs.tut.fi/dev)

Features:
-------
* Basic widget buildingblocks that can be used to create 3D widgets.
* Event system that handles DOM events inside the 3D world. Events are bind directly to 3D widgets.
You need to just define the event handler callback. Collision detection and all the complicated stuff is done by the library.
* Few styled predefined 3D widgets (see the examples)


Using the library:
-------

To use the library include widget3D-build-min.js or widget3D-build.js. The files can be found from build directory.
This library also needs at the moment [three.js](http://github.com/mrdoob/three.js) to work so you have to include it too.
You can find the version of three.js that the library supports under externals.

There isn't any formal documentation yet. Look at the examples from examples directory to get started.

Building the library:
-------

For building the library you need nodejs. Then just run command "node build.js" in build directory.

TODO:
-------
* Example pages
* Drag controls needs some work. At the moment drag works only along the objects xy-axis.
This isn't intuitive if camera or the object have rotation.
* Adapters to other 3D engines
