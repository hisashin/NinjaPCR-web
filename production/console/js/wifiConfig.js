const OTA_TYPE_LOCAL_UPLOAD = 1;
const OTA_TYPE_WEB_DOWNLOAD = 2; // Unavailable

DeviceResponse.checkConnectionInterval = null;

var host = "";
var hostIpAddress = null;
function getDeviceHost () {
  if (hostIpAddress) {
    return "http://" + hostIpAddress;
  }
	return "http://" + host + ".local";
}
function startOTA () {
	console.log("startOTA");
	$('#update_starting_dialog').dialog('open');
	communicator.sendRequestToDevice("/update", null, function(obj) {
		console.log("Starting OTA...");
		$("#update_starting_dialog").dialog("close");
		$('#updating_dialog').dialog('open');
		DeviceResponse.checkConnectionInterval = setInterval(function(){
			console.log("Check update...");
			communicator.sendRequestToDevice("/connect", null, function (obj) {
				// Waiting for update
				console.log("Updated.");
				$("#updating_dialog").dialog("close");
				$(".labelVersionAfterUpdate").html("(Version " + obj.version + ")");
				if (obj.version==FIRMWARE_VERSION_LATEST) {
					$("#update_finished_dialog").dialog("open");
				} else {
					$("#update_failed_dialog").dialog("open");
				}
				if (DeviceResponse.checkConnectionInterval) {
					clearInterval(DeviceResponse.checkConnectionInterval);
				}
			}, function(){
				console.log("TODO /connect check connection failed");
			});
		}, 3000);

	}, function(){}, true);
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

	$('#is_ota_mode_dialog').dialog({
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
		$('#is_ota_mode_dialog').dialog('close');
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

	// Check version -> wouldn't it be possible to retrieve the hostname from somewhere and set it to the one to which the machine is actually connected?
	loadJSONP("http://ninjapcr.tori.st/update/version.js?" + new Date().getTime(), function(){});
});

function checkFirmwareVersion (version) {
	FIRMWARE_VERSION_CURRENT = version;
  //FIRMWARE_VERSION_LATEST = "1.1";
	console.verbose("Firmware version=" + version + ", Latest version=" + FIRMWARE_VERSION_LATEST);
	if (location.href.indexOf("?update_firmware_anyway")>0) {
		$(".labelVersionCurrent").html(FIRMWARE_VERSION_CURRENT);
		$(".labelVersionLatest").html(FIRMWARE_VERSION_LATEST);
		$("#firmwareVersion").show();
	}
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

  /*
    Version-specific styles: Resume/Pause/Next step/Next cycle buttons are
    available only ver 1.1 or later
  */
  if (compareVersion(version, "1.1")==VersionComparison.Smaller) {
    console.log("HIDE");
    $(".v1_1").hide();
  } else {

      console.log("SHOW");

  }
}
