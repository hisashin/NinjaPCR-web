var STORAGE_KEY_LAST_HOST_NAME = "ninjapcr_host";
var DEFAULT_HOST = "ninjapcr";
var DeviceResponse = {
		onDeviceFound : null,
		onReceiveCommandResponse : null,
		onReceiveStatus : null
};


/* Handle connection check response */
DeviceResponse.connect = function (obj) {
	console.log("DeviceResponse.connect:" + obj);
	if (obj && obj.connected) {
		// Connected
		$("#DeviceConnectionStatus").attr("class","connected");
		$("#DeviceConnectionStatusLabel").text("Connected");
		
		try {
			if (localStorage) {
				localStorage.setItem(STORAGE_KEY_LAST_HOST_NAME, host);
			} else {
				localStorage.setItem(STORAGE_KEY_LAST_HOST_NAME, DEFAULT_HOST);
			}
		} catch (e) {
			console.log(e);
		}
		
		if (obj.running) {
			console.log("Device is RUNNING");
			// Resume
			experimentLogger = new ExperimentLogger();
			experimentLog = [];
			showRunningDashboard();
			
			// write out the file to the OpenPCR device
			experimentLogger.start();
			running();
			
			// then close windows it after 1 second
			setTimeout(function() {
				$('#starting').dialog('close');
			}, 5000);
			setTimeout(function() {
				$('#ex2_p3').show();
			}, 100);
			// also, reset the command_id_counter
			window.command_id_counter = 0;
		} else {
			console.log("Device is IDLE");
		}
		communicator.firmwareVersionversion = obj.version;
		console.log("Firmware version=" + communicator.firmwareVersionversion);
		DeviceResponse.onDeviceFound("DEVICE");
	}
};
/* Handle command result */
DeviceResponse.command = function (obj) {
	console.log("DeviceResponse.command: " + obj);
};
/* Handle status response */
DeviceResponse.status = function (obj) {
	console.log("DeviceResponse.status:" + obj);
	if (DeviceResponse.onReceiveStatus) {
		DeviceResponse.onReceiveStatus(obj);
	}
};

var NetworkCommunicator = function () {
	this.firmwareVersion = "1.0.5";
};
// Find ports
NetworkCommunicator.prototype.scan = function (callback) {
	// callback(port)
	DeviceResponse.onDeviceFound = callback;
	try {
		if (window.localStorage && localStorage.getItem(STORAGE_KEY_LAST_HOST_NAME)) {
			$("#HostText").val(localStorage.getItem(STORAGE_KEY_LAST_HOST_NAME));
		}
	} catch (e) {
		console.log(e);
	}
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
function loadJSONP (URL, timeoutMsec) {
	var scriptTag = document.createElement("script");
	scriptTag.type = "text/javascript";
	scriptTag.src = URL;
	document.body.appendChild(scriptTag);
	scriptTag.addEventListener("error", function(){
		console.log("error");
	});
	scriptTag.addEventListener("load", function(){
		console.log("loaded");
		scriptTag.parentNode.removeChild(scriptTag);
	});
}
NetworkCommunicator.prototype.sendRequestToDevice = function (path, param) {
	var URL = getDeviceHost() + path;
	if (param) {
		if (param.charAt(0)!="?") {
			URL += "?";
		}
		URL += param;
	}
	console.log("sendRequestToDevice URL=" + URL);
	loadJSONP(URL, 4000);
}
NetworkCommunicator.prototype.setDeviceHost = function (newHost) {
	host = newHost;
}
NetworkCommunicator.prototype.connect = function () {
	this.sendRequestToDevice("/connect");
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
	this.sendRequestToDevice("/command", commandBody);
};

// * Request Status and Wait for Response
NetworkCommunicator.prototype.requestStatus = function (callback) {
	this.sendRequestToDevice("/status");
	DeviceResponse.onReceiveStatus = callback;
};

// Send "Stop" Command and Wait for Response
NetworkCommunicator.prototype.sendStopCommand = function (command, callback) {
	// self.startListeningStatus(self.port, connectionId, callback);
	
};

var communicator = new NetworkCommunicator();
