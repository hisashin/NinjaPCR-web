const OTA_TYPE_LOCAL_UPLOAD = 1;
const OTA_TYPE_WEB_DOWNLOAD = 2; // Unavailable

DeviceResponse.checkConnectionInterval = null;

var host = "";
function getDeviceHost () {
	return "http://" + host + ".local";
}

DeviceResponse.onConf = function (obj) {
	console.log(obj);
	$("#update_starting_dialog").dialog("close");
	$('#updating_dialog').dialog('open');
	DeviceResponse.checkConnectionInterval = setInterval(function(){
		console.log("Check update...");
		communicator.sendRequestToDevice("/connect");
	}, 3000);
}
function startOTA () {
	$('#update_starting_dialog').dialog('open');
	var getURL = getDeviceHost() + "/update";
	loadJSONP(getURL, function(){console.log("Updated");});
}
// Called when version.js is loaded
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
	
	// Init OTA related dialogs
	$('#update_required_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false,
		buttons : {
			"Update" : function() {
			 	startOTA();
				$(this).dialog("close");
			 console.log("Update");
			},
			"Close" : function() {
			 	location.reload();
			}
		}
	});	
	$('#update_available_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false,
		buttons : {
			"Update" : function() {
			 	startOTA();
				$(this).dialog("close");
			},
			"Close" : function() {
				$(this).dialog("close");
			}
		}
	});update_starting_dialog
	$('#update_starting_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false
	});
	$('#updating_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false
	});
	$('#update_finished_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false,
		buttons : {
			"OK" : function() {
				location.reload();
			}
		}
	});
	$('#update_failed_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false,
		buttons : {
			"OK" : function() {
				location.reload();
			}
		}
	});
	
	
	
	// Check version
	//loadJSONP("http://ninjapcr.tori.st/js/version.js", function(){/*TODO*/});
	loadJSONP("js/version.js", function(){/*TODO*/});
});
DeviceResponse.onErrorOTAMode = function (obj) {
	$("#ip_status").text("Error");
	$('#isOTAMode').dialog('open');
}

function checkFirmwareVersion (version) {
	FIRMWARE_VERSION_CURRENT = version;
	console.verbose("Firmware version=" + version + ", Latest version=" + FIRMWARE_VERSION_LATEST);
	var message;
	if (compareVersion(version, FIRMWARE_VERSION_REQUIRED)==VersionComparison.Smaller) {
		console.verbose("Firmware update is required.");
		$("#update_required_dialog").dialog("open");
		message = getLocalizedMessage('firmwareUpdateAvailable')
			.replace("___LATEST_VERSION___", FIRMWARE_VERSION_LATEST)
				.replace("___INSTALLED_VERSION___", version);
		
	} else if (compareVersion(version, FIRMWARE_VERSION_LATEST)==VersionComparison.Smaller) {
		console.verbose("Firmware update is available.");
		$("#update_available_dialog").dialog("open");
		message = getLocalizedMessage('firmwareUpdateAvailable')
			.replace("___LATEST_VERSION___", FIRMWARE_VERSION_LATEST)
				.replace("___INSTALLED_VERSION___", version);
	} else {
		console.verbose("Firmware is up to date");
		message = getLocalizedMessage('firmwareUpToDate')
			.replace("___INSTALLED_VERSION___", version);
	}
}