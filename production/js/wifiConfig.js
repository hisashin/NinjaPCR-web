const OTA_TYPE_LOCAL_UPLOAD = 1;
const OTA_TYPE_WEB_DOWNLOAD = 2; // Unavailable

DeviceResponse.onConf = function (obj) {
	console.log(obj);
	console.log(obj.accepted);
	$("#otaAcceptedMessage").show();
	$("#otaLink").attr("href", getDeviceHost());
	$("#otaLink").html(getDeviceHost());
}
var host = "";
function getDeviceHost () {
	return "http://" + host + ".local";
}

function startOTA () {
	var getURL = getDeviceHost() + "/config?ot=" + OTA_TYPE_LOCAL_UPLOAD;5
	console.log(getURL);
	loadJSONP(getURL, function(){/*TODO*/});
}
function setNinjaPCRVersion (obj) {
	console.log(obj);
	LATEST_FIRMWARE_VERSION = obj.firmware;
	console.log("Latest firmware=" + obj.firmware);
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
		console.log("Config.");
		$("#example2").hide();
		$("#config").show();
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
	loadJSONP("js/version.js", function(){/*TODO*/});
});
DeviceResponse.onErrorOTAMode = function (obj) {
	$("#ip_status").text("Error");
	$('#isOTAMode').dialog('open');
}