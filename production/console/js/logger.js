var Log = {};
Log.Level =
{
		VERBOSE: 1,
		DEBUG: 2,
		INFO: 3,
		WARNING: 4,
		ERROR: 5
};
Log.FILTER_LEVEL = Log.Level.VERBOSE;

Log._getDate = function () {

	var time = new Date();
	var str = fillZero(time.getFullYear(),4);
	str += "/";
	str += fillZero(time.getMonth()+1,2);
	str += "/";
	str += fillZero(time.getDate(),2);
	str += " ";
	str += fillZero(time.getHours(),2);
	str += ":";
	str += fillZero(time.getMinutes(),2);
	str += ":";
	str += fillZero(time.getSeconds(),2);
	return str;
}
Log._write = function (message, level, label) {
	if (level >= Log.FILTER_LEVEL)
	{
		console.log ("[NinjaPCR]\t" + "[" + label + "]\t" + Log._getDate() + "\t" + message);
	}
}
//log, info, warn, error
Log.showInDebugArea = function (tag, msg) {
	var debugArea = document.getElementById("debugText");
	if (debugArea) {
		debugArea.innerHTML += "\n";
		debugArea.innerHTML += "[" + tag +"] " + Log._getDate() + " " + msg;
	}
}

console.log_orig = console.log;
console.log = function(msg) {
	console.log_orig(msg);
	Log.showInDebugArea("L", msg);
	
};
console.verbose = function(msg) {
	console.log_orig(msg);
	Log.showInDebugArea("V", msg);
	
};
console.info_orig = console.info;
console.info = function(msg) {
	console.info_orig(msg);
	Log.showInDebugArea("I", msg);
	
};
console.warn_orig = console.warn;
console.warn = function(msg) {
	Log.showInDebugArea("W", msg);
	console.warn_orig(msg);
	
};
console.error_orig = console.error;
console.error = function(msg) {
	Log.showInDebugArea("E", msg);
	console.error_orig(msg);
	
};
Log.toggleDebugArea = function () {

var debugArea = document.getElementById("debugText");
	if (debugArea) {
		debugArea.style.display = (debugArea.style.display=="none")?"block":"none";
	}
};


