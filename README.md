WebWidget3D
=======
-------

3D widget library for the web.

Experimenting ways to make interactive 3D graphics in the web. At the moment library can be used with the [three.js](http://github.com/mrdoob/three.js) 3D-engine.

WebWidget3D is a interaction wrapper wraps 3D-engine's 3D objects into 3D widget building blocks.

Work in progress.

Features:
-------
* Basic widget buildingblocks that can be used to create 3D widgets.
* Event system that handles DOM events inside the 3D world. Events are bind directly to 3D building blocks.
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
* Example pages.
* More controls.
* Adapters to other 3D engines.
