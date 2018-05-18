const OTA_TYPE_LOCAL_UPLOAD = 1;
const OTA_TYPE_WEB_DOWNLOAD = 2; // Unavailable

DeviceResponse.checkConnectionInterval = null;
DeviceResponse.onConf = function (obj) {
	console.log(obj);
	console.log(obj.accepted);
	$('#updating_dialog').dialog('open');
	DeviceResponse.checkConnectionInterval = setInterval(function(){
		console.log("Check update...");
		communicator.sendRequestToDevice("/connect");
	}, 3000);
}

var host = "";
function getDeviceHost () {
	return "http://" + host + ".local";
}

DeviceResponse.onUpdate = function (obj) {
	console.log(obj);
	console.log(obj.result);
	// UPDATE_FAILD, NO_UPDATES, UPDATE_OK
	if (obj.result=="UPDATE_FAILD") {
		console.log("Update OK");
	} else {
		console.log("Update Failed");
	}
	// TODO
}
function startOTA () {
	var getURL = getDeviceHost() + "/update";
	loadJSONP(getURL, function(){console.log("Updated");});
}
function setNinjaPCRVersion (obj) {
	console.log(obj);
	FIRMWARE_VERSION_LATEST = obj.firmware.latest;
	FIRMWARE_VERSION_REQUIRED = obj.firmware.required;
	console.log("Latest firmware=" + FIRMWARE_VERSION_LATEST);
	console.log("Required firmware=" + FIRMWARE_VERSION_REQUIRED);
	console.log("Current UI version=" + CURRENT_UI_VERSION);
	console.log("Latest UI version=" + obj.ui);
}
$(document).ready(function(){
	console.log("wifiConfig.init");
	
	$('#isOTAMode').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false
	});
	$("#configButton").click(function(){
		$("#configButton").attr("disabled", "true");
		startOTA();
	});
	$("#buttonOTAModeOpenUpdate").click(function(){
		window.open(getDeviceHost()+ "/");
	});
	$("#buttonOTAModeCancelUpdate").click(function(){
		window.open(getDeviceHost() + "/cancel");
	});
	$("#buttonOTAModeCloseDialog").click(function(){
		$('#isOTAMode').dialog('close');
	});
	$("#buttonStartOTA").click(startOTA);
	
	// Check version
	//loadJSONP("http://ninjapcr.tori.st/js/version.js", function(){/*TODO*/});
	loadJSONP("js/version.js", function(){/*TODO*/});
});
DeviceResponse.onErrorOTAMode = function (obj) {
	$("#ip_status").text("Error");
	$('#isOTAMode').dialog('open');
}