var STORAGE_KEY_LAST_HOST_NAME = "ninjapcr_host";
var DEFAULT_HOST = "ninjapcr";

/** 
	Core communicator
	Basic WiFi communication with NinjaPCR device
*/
var DeviceResponse = {
	onDeviceFound : null,
	onReceiveCommandResponse : null,
	callbacks: [] /* commandId:callbackFunction map */
};
DeviceResponse.registerCallback = function (commandId, func) {
	DeviceResponse.callbacks[commandId] = func;
}
DeviceResponse.handleCallback = function (commandId, obj) {
	// Find callback function for command ID and call it.
	if (DeviceResponse.callbacks[commandId]) {
		DeviceResponse.callbacks[commandId](obj);
		DeviceResponse.callbacks[commandId] = null;
	} else {
		console.verbose("CommandID " + commandId + " not found.");
	}
} 


/* Handle connection check response */
DeviceResponse.connect = function (obj, commandId) {
	DeviceResponse.handleCallback(commandId, obj);
};
/* Handle command result */
DeviceResponse.command = function (obj, commandId) {
	DeviceResponse.handleCallback(commandId, obj);
};
/* Handle status response */
DeviceResponse.status = function (obj, commandId) {
	DeviceResponse.handleCallback(commandId, obj);
};

DeviceResponse.onConf = function (obj, commandId) {
	DeviceResponse.handleCallback(commandId, obj);
}
DeviceResponse.onErrorOTAMode = function (obj, commandId) {
	DeviceResponse.handleCallback(commandId, obj);
	$("#ip_status").text("Error");
	$('#isOTAMode').dialog('open');
}

var NetworkCommunicator = function () {
	this.firmwareVersion = null;
	this.commandId = 0;
};
NetworkCommunicator.prototype.loadHostName = function () {
	try {
		if (window.localStorage && localStorage.getItem(STORAGE_KEY_LAST_HOST_NAME)) {
			return localStorage.getItem(STORAGE_KEY_LAST_HOST_NAME);
		}
	} catch (e) {
		console.log(e);
		return null;
	}
};
NetworkCommunicator.prototype.saveHostName = function (hostName) {
	try {
		if (localStorage) {
			localStorage.setItem(STORAGE_KEY_LAST_HOST_NAME, hostName);
		}
	} catch (e) {
		console.log(e);
	}
	
};
// Find ports
NetworkCommunicator.prototype.scan = function (callback) {
	// callback(port)
	DeviceResponse.onDeviceFound = callback;
	$("#HostText").val(this.loadHostName() || DEFAULT_HOST);
	var scope = this;
	$("#ConnectButton").click(function(e) {
		console.log("Check IP: " + $("#HostText").val());
		scope.setDeviceHost($("#HostText").val());
		scope.connect();
	});
	$("#NewDevice").click(function(){
		$("#DeviceSettings").toggle();
	});
};
function loadJSONP (URL, onError) {
	var scriptTag = document.createElement("script");
	scriptTag.type = "text/javascript";
	scriptTag.src = URL;
	document.body.appendChild(scriptTag);
	scriptTag.addEventListener("error", function(){
		console.log("error");
	});
	scriptTag.addEventListener("load", function() {
		scriptTag.parentNode.removeChild(scriptTag);
	});
}

NetworkCommunicator.prototype.sendRequestToDevice = function (path, param, callback, onError) {
	var URL = getDeviceHost() + path + "?x=" + this.commandId;
	if (param) {
		if (param.charAt(0)!="&") {
			URL += "&";
		}
		URL += param;
	}
	console.log("sendRequestToDevice URL=" + URL);
	DeviceResponse.registerCallback(this.commandId, callback);
	loadJSONP(URL, function () {
		console.log.log("sendRequestToDevice error");
		if (onError) {
			onError();
		}
	});
	this.commandId++;
}
NetworkCommunicator.prototype.setDeviceHost = function (newHost) {
	host = newHost;
}
NetworkCommunicator.prototype.connect = function () {
	var scope = this;
	this.sendRequestToDevice("/connect", null, function(obj) {
			// Connected
			$("#DeviceConnectionStatus").attr("class","connected");
			$("#DeviceConnectionStatusLabel").text("Connected");
			scope.saveHostName(host);
			if (obj.running) {
				console.log("Device is RUNNING");
				// TODO show window
				// Resume
				experimentLogger = new ExperimentLogger();
				experimentLog = [];
				
				// write out the file to the OpenPCR device
				
				$("#resumingProfile").html(getLocalizedMessage('resuming').replace('___PROF___',obj.prof));
				$('#resuming').dialog({
					autoOpen : false,
					width : 400,
					modal : true,
					draggable : false,
					resizable : false,
					buttons : {
						"OK" : function() {
							$(this).dialog("close");
							// Show progress view
							showRunningDashboard();
							experimentLogger.start();
							running();
							$('#ex2_p3').show();
							// also, reset the command_id_counter
							window.command_id_counter = 0;
						}
					}
				});
				$('#resuming').dialog('open');
			} else {
				console.log("Device is IDLE");
			}
			scope.firmwareVersion = obj.version;
			console.log("Firmware version=" + scope.firmwareVersion);
			DeviceResponse.onDeviceFound(host, obj.running);
		},
		function () {
			console.log("/connect failed");
		});
	$("#DeviceConnectionStatus").attr("class","connecting");
	$("#DeviceConnectionStatusLabel").text("Connecting...");
}

NetworkCommunicator.prototype.scanOngoingExperiment = function () {
	console.log("TODO scanOngoingExperiment");
	// TODO getPorts -> Open -> (callback) -> getList -> sendRequest -> read -> ...
	callback();
};


NetworkCommunicator.prototype.sendStartCommand = function (commandBody) {
	console.log("TODO sendStartCommand");
	this.sendRequestToDevice("/command", commandBody, function(obj){
			console.log("TODO /command start callback");
		}, function() {
		console.log("/command start failed.");
	});
};

// * Request Status and Wait for Response
NetworkCommunicator.prototype.requestStatus = function (callback) {
	this.sendRequestToDevice("/status", null, function (obj) {
			callback(obj);
		}, function () {
		console.log("/status failed.");
	});
};

// Send "Stop" Command and Wait for Response
NetworkCommunicator.prototype.sendStopCommand = function (command, callback) {
	this.sendRequestToDevice("/command", command, function(obj){
			console.log("Stop command is received.");
			callback();
		}, function () {
		console.log("/command stop failed.");
		
	});
	
};

var communicator = new NetworkCommunicator();
