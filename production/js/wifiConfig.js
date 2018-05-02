const OTA_TYPE_LOCAL_UPLOAD = 1;
const OTA_TYPE_WEB_DOWNLOAD = 2; // Unavailable

DeviceResponse.onConf = function (obj) {
	console.log(obj);
	console.log(obj.accepted);
	$("#otaAcceptedMessage").show();
	$("#otaLink").attr("href", getDeviceHost());
}
var host = "";
function getDeviceHost () {
	return "http://" + host + ".local";
}

function startOTA () {
	var getURL = getDeviceHost() + "/config?ot=" + OTA_TYPE_LOCAL_UPLOAD;
	if (otaType == OTA_TYPE_WEB_DOWNLOAD) {
		getURL += "&ou=" + otaURL;
	}
	console.log(getURL);
	loadJSONP(getURL, 4000);
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
});
DeviceResponse.onErrorOTAMode = function (obj) {
	$("#ip_status").text("Error");
	$('#isOTAMode').dialog('open');
}