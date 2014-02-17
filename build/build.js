#!/usr/bin/env node
/*
	Build script for Widget3D + THREE_Widget3D.
	Widely based on Paul Brunt's GLGE build.js
*/
var util = require('util');
var fs = require('fs');
var sys = require('sys');
var spawn = require('child_process').spawn;

var type = "all";

var flags = {
	all:{
		Widget3D: true, extras: true, uglify: true
	},
  
	widget3d:{
		Widget3D: true, uglify: true
	}
	
};

var helpGiven = false;
process.argv.forEach(function(val, index, array){
	if ( val == "--help" ){
		helpGiven = true;
		return;
	}
	if(flags[val]){
		flags = flags[val];
		type = val;
	}
});


if ( flags[type] ){
	flags=flags[type];
}

if ( helpGiven == true ){
	return;
}


var srcFiles = {
	Widget3D: ["../src/core/widget3D.js", "../src/core/common.js", "../src/core/events.js",
  
    "../src/core/components/guiObject.js",
    "../src/core/components/widget.js",
    "../src/core/components/groupBase.js",
    
    "../src/core/components/group.js",
    "../src/core/components/application.js",
    
    "../src/core/components/text.js",
    "../src/core/components/cameraGroup.js",
    
    
    "../src/core/controls/control.js",
    "../src/core/controls/rollControl.js",
    
    "../src/threeAdapter/adapter.js",
    
    "../src/threeAdapter/extensions/widget.js", "../src/threeAdapter/extensions/group.js",
    
    "../src/threeAdapter/components/gridLayout.js", "../src/threeAdapter/components/titledWindow.js",
    "../src/threeAdapter/components/dialog.js", "../src/threeAdapter/components/selectDialog.js",
    
    
    "../src/threeAdapter/controls/dragControl.js",
    "../src/threeAdapter/controls/flyControl.js"
  ]
}

var deps = {
	"../src/core/widget3D.js": [],
  "../src/core/common.js" : ["../src/core/widget3D.js"],
	"../src/core/events.js": ["../src/core/widget3D.js", "../src/core/common.js"],
  
  "../src/core/components/guiObject.js" : ["../src/core/events.js"],
  "../src/core/components/widget.js" : ["../src/core/components/guiObject.js"],
  "../src/core/components/groupBase.js" : ["../src/core/components/widget.js"],
  
  "../src/core/components/application.js" : ["../src/core/components/guiObject.js", "../src/core/components/groupBase.js"],
  
  "../src/core/components/group.js" : ["../src/core/components/widget.js", "../src/core/components/groupBase.js"],
  
  "../src/core/components/text.js" : ["../src/core/components/widget.js"],
  "../src/core/components/cameraGroup.js": ["../src/core/components/group.js"],
  
  "../src/core/controls/control.js": ["../src/core/events.js"],
  "../src/core/controls/rollControl.js": ["../src/core/controls/control.js"],
  
	"../src/threeAdapter/adapter.js": ["../src/core/events.js"],
  
  "../src/threeAdapter/extensions/widget.js": ["../src/threeAdapter/adapter.js", "../src/core/components/widget.js"],
  "../src/threeAdapter/extensions/group.js": ["../src/threeAdapter/adapter.js", "../src/core/components/group.js"],
  
	"../src/threeAdapter/components/gridLayout.js": ["../src/core/components/widget.js", "../src/core/components/group.js", "../src/threeAdapter/adapter.js"],
	"../src/threeAdapter/components/titledWindow.js": ["../src/core/components/widget.js", "../src/core/components/group.js", "../src/threeAdapter/adapter.js"],
  "../src/threeAdapter/components/dialog.js" : ["../src/core/components/widget.js", "../src/core/components/group.js", "../src/threeAdapter/adapter.js"],
  "../src/threeAdapter/components/selectDialog.js" : ["../src/core/components/widget.js", "../src/core/components/group.js", "../src/threeAdapter/adapter.js"],
  
  "../src/threeAdapter/controls/dragControl.js": ["../src/core/controls/control.js", "../src/threeAdapter/adapter.js"],
  "../src/threeAdapter/controls/flyControl.js": ["../src/core/controls/control.js", "../src/threeAdapter/adapter.js"]
};

var listFiles = function(list, all){
	var addDeps = function(file, list){
		if ( deps[file] ){
			for ( var i = 0; i < deps[file].length; i++ ){
				addDeps(deps[file][i], list);
				if (list.indexOf(deps[file][i]) < 0){
					list.push(deps[file][i]);
				}
			}
		}
	}
	
	if(!list){
		list = [];
	}
	
	for ( var i in flags ){
		if ((flags[i] || all ) && srcFiles[i] ){
			for ( var j = 0; j < srcFiles[i].length; j++){
				
				addDeps(srcFiles[i][j], list);
				if (list.indexOf(srcFiles[i][j]) < 0 ){
					list.push(srcFiles[i][j]);
				}
			}
		}
	}
	
	return list;
};

var filearray = listFiles();

var files = listFiles([], true);

var combinedList = [];

if ( flags.Widget3D ){
	for ( var i = 0; i < filearray.length; i++ ){
		console.log("Reading file: " + filearray[i]);
		combinedList.push(fs.readFileSync(filearray[i]));
	}

	if ( filearray.length > 0 ){
		console.log("Writing combined javascript file: widget3d-compiled.js");
		combinedList = combinedList.join("");
		fs.writeFileSync('widget3d-compiled.js', combinedList);
		
		var match = combinedList.match(/^\s*(\/\*[\s\S]+?\*\/)/);
		var license = match[0];
		license = license.replace(/^\s*\/\*/, '/*!');
		
		if ( flags.uglify ){
			var jsp = require("../externals/uglifyjs/lib/parse-js");
			var pro = require('../externals/uglifyjs/lib/process');
			
			console.log("Parsing JavaScript..");
			var ast = jsp.parse(combinedList);
			console.log("Minifying..");
			ast = pro.ast_mangle(ast)
			console.log("Optimizing..");
			ast = pro.ast_squeeze(ast);
			console.log("Generating minified code..");
			var final_code = license + "\n" + pro.gen_code(ast);
			console.log("Writing minified code: widget3d-compiled-min.js");
			fs.writeFileSync("widget3d-compiled-min.js", final_code);
			console.log("Copying to the output directory..");
			
			var cp = spawn('cp', ["widget3d-compiled-min.js", "build"]);
			cp.on('exit', function(code){
				if (code == 0 ){
					console.log("Copied minified Widget3D to output-directory.");
				}
			});
		}
	}
}