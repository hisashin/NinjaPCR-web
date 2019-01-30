/* Javascript for OpenPCR
 *
 * http://openpcr.org
 * Copyright (c) 2011 OpenPCR
 */

/*
 * This code is generally broken up into 3 sections, each having to do with the 3 main pages of the OpenPCR interface
 * 1. Home screen + initialization
 * 2. Form screen, entering the PCR protocol
 * 3. Running screen, displaying live information from OpenPCR
 * Extra. Buttons
 */

var FIRMWARE_VERSION_CURRENT = "0.0.0";
var FIRMWARE_VERSION_LATEST = "1.0.5";
var FIRMWARE_VERSION_REQUIRED = "1.0.5";
var CURRENT_UI_VERSION = "1.0.1";
var MIN_FINAL_HOLD_TEMP = 16;

var COLOR_HEATING = "red";
var COLOR_COOLING  = "blue";
var COLOR_STOP = "black";

var profileForm = new ProfileForm();

/**************
 * Home screen*
 ***************/

/* init()
 * Called when the app is loaded.
 * Checks to see if OpenPCR is plugged in (gets the device path if it is) and checks to see if there is an Air update available
 */

var sp2;
var pcrStorage;
function init() {
	pcrStorage = new Storage();
	$(document).keypress(function(event) {
		return disableEnterKey(event);
	});
	prepareButtons();
	sp2 = new Spry.Widget.SlidingPanels('example2');

	// hide Settings button by default
	($("#Settings").hide());

	// Scan serial ports and look for a device
	scanPortsAndDisplay();
	// Get experiments from the local storage
	listExperiments();

}

function checkPlug () {
	scanPortsAndDisplay(2500);
};

function scanPortsAndDisplay (delay) {
	communicator.scan(function(port, isRunning) {
		// TODO Wifi & Chrome
		var deviceFound = !!port;
		var portMessage = (deviceFound)?
				(getLocalizedMessage('deviceFound').replace('___PORT___',port)):getLocalizedMessage('deviceNotFound');
		$("#portLabel").html(portMessage);

		if (deviceFound) {
			$("#runningUnplugged").hide();
			$("#runningPluggedIn").show();
			if (!window.checkPlugInterval) {
				window.clearInterval(window.checkPlugInterval);
			}
			window.pluggedIn = true;

			if($("#Unplugged").is(':visible')){
				// if the "Unplugged" button is visible, switch it to "Start"
				$("#Unplugged").hide();
				$("#Start").show();
			}
			// Alert Firmware Update
			if (!isRunning) {
				checkFirmwareVersion(communicator.firmwareVersion);
			}
		} else {
			$("#runningUnplugged").show();
			$("#runningPluggedIn").hide();
			// Not plugged in.
			console.log('Send "request_status" command and check ongoing experiment (TODO)');
			communicator.scanOngoingExperiment (function () {
				//if (!window.checkPlugInterval) {window.checkPlugInterval = setInterval(checkPlug, 2000); }
				});
		}
	}, delay);
}
function splitIntoInt (str) {
	var tokens = str.split(".");
	var intValues = [];
	for (var i=0; i<tokens.length; i++) {
		intValues.push(parseInt(tokens[i]));
	}
	return intValues;
}
var VersionComparison = {
	Equal: 0,
	Smaller: 1,
	Larger: 2
};
function compareVersion (version, toVersion) {
	console.log("comapreVersion " + version + "<=>" + toVersion);
	var versionNums = splitIntoInt (version);
	var versionToNums = splitIntoInt (toVersion);
	var maxPlaces = Math.max(versionNums.length, versionToNums.length);
	for (var place=0; place<maxPlaces; place++) {
		var versionNum = (place<versionNums.length)?versionNums[place]:0;
		var versionToNum = (place<versionToNums.length)?versionToNums[place]:0;
		if (versionNum > versionToNum) {
			return VersionComparison.Larger;
		}
		if (versionNum < versionToNum) {
			return VersionComparison.Smaller;
		}
	}
	return VersionComparison.Equal;
}

/* listExperiments()
 * Updates the list of Saved Experiments on the home page.
 * Grabs all the files in the Experiments folder and lists them alphabetically
 *
 */
function listExperiments() {
	pcrStorage.loadList(function(experiments) {
	 var lastExperiment = null;
    try {
       lastExperiment = localStorage.getItem("lastExperiment");
       console.log("lastExperiment=" + lastExperiment);
    } catch (e) {
    }
		presetsHTML = "<select id='dropdown'>";
		if (experiments && experiments.length > 0) {
			for ( var i = 0; i < experiments.length; i++) {
				var experiment = experiments[i];
				if (experiment.id && experiment.name) {
				  console.log("ID="+experiment.id)
				  var selected = (experiment.id==lastExperiment)?" selected":"";
					presetsHTML += '<option value="' + experiment.id +  '" ' + selected + '>' + experiment.name + "</option>";
				}
			}
		}
		// if blank, add a "No Saved Experiments" item
		if (presetsHTML == "<select id='dropdown'>") {
			presetsHTML += '<option value=1>-'+getLocalizedMessage('none')+'-</option>';
		}

		// close the drop down HTML tags
		presetsHTML += "</select>";
		// update the HTML on the page
		$("#reRun").html(presetsHTML);

	});
}

/* listSubmit()
 * Loads the selected experiment in the list on the home page
 */
function listSubmit() {
	// what is selected in the drop down menu?
	experimentID = $("#dropdown").val();
	// Save if possible
	try {
	   localStorage.setItem("lastExperiment", experimentID);
	} catch (e) {
	}
	// load the selected experiment
	loadExperiment(experimentID);
}


/* loadExperiment();
 * loads the experiment with the given experimentID
 */
function loadExperiment(experimentID) {
	console.verbose("loadExperiment id=" + experimentID);
	pcrStorage.loadExperiment(experimentID, function(experiment) {
		// Now we've made all the modifications needed, display the Form page

		sp2.showPanel(1);
		// clear the experiment form
		profileForm.clear();
		// read in the file
		experimentJSON = experiment;
		// loads filen into the Form and moves onto Form page
		profileForm.experimentToHTML(experimentJSON);
		// update the buttons to make sure everything is ready to re-run an experiment
		reRunButtons();
	});
}

/*  newExperiment()
 * This function is called when the "New Experiment" button is clicked on the Home page
 * This function brings up a blank experiment
 */
function newExperiment() {
	// clear the experiment form
	profileForm.clear();
	// set up the blank experiment
	profileForm.experimentToHTML(NEW_EXPERIMENT);

	// set interface to have the right buttons
	newExperimentButtons();
	// Now we've made all the modifications needed, display the Form page
	sp2.showPanel(1);
}

/**************
 * Form screen*
 ***************/

/* startOrUnplugged(display)
 * Determines whether to display the "Start" or "Unplugged" button on the Form page.
 * Input: CSS display status of the button
 * Returns: nothing
 */
function startOrUnplugged(display) {
	console.log("############ startOrUnplugged ##########");
	//pick the Start or Unplugged button based on whether the device is plugged in or not
	// if plugged in then
	if (window.pluggedIn == true) {
		// then we definitely want to hide the "Unplugged" button
		$("#Start").css("display", display);
		$("#Unplugged").hide();
	}
	else {
		// else, device is unplugged
		// then we definitely want to hide the "Start" button
		$("#Start").hide();
		$("#Unplugged").css("display", display);
	}
}

/* reRunButtons()
 * puts Form buttons in the state they should be immediately following loading an experiment
 */
function reRunButtons() {
	console.log("reRunButtons");
	// Hide the Delete button
	$('#deleteButton').show();
	// Start with the edit button shown
	$("#editButton").show();
	// Start with the edit buttons hidden
	$(".edit").show();
	// hide the lid temp fields
	$("#lidContainer").hide();
	// all fields locked
	$("input").attr("readonly", "readonly");
	// and 'More options' hidden
	$('#OptionsButton').hide();
	// Hide the Save button
	$('#Save').hide();
	// Hide the Cancel button
	$('#Cancel').hide();
	// Hide the SaveEdits button
	$('#SaveEdits').hide();
	// Show the Start/Unplugged button
	startOrUnplugged("inline");
	$('#singleTemp').hide();
	// pre and post containers should take care of themselves
}

/* newExperimentButtons()
 * puts Form buttons in the state they should be for a new experiment
 */
function newExperimentButtons() {
	// Hide the Delete button
	$('#deleteButton').hide();
	// Start with the edit button hidden
	$("#editButton").hide();
	// Start with the edit buttons hidden
	$(".edit").hide();
	// lid temp hidden
	$("#lidContainer").hide();
	// all fields editable
	$("input").removeAttr("readonly");
	// and 'More options' shown
	$('#OptionsButton').show();
	// Show the Save button
	$('#Save').show();
	// Hide the Cancel button
	$('#Cancel').hide();
	// Hide the SaveEdits button
	$('#SaveEdits').hide();
	// Show the Start/Unplugged button
	startOrUnplugged("inline");
	$('#singleTemp').hide();
	// make sure the "More options" button says so
	$('#OptionsButton').html(getLocalizedMessage('moreOptions'));
}

/* disableEnterKey(e)
 * The Enter/Return key doesn't do anything right now
 */
function disableEnterKey(e) {
	var key;
	if (window.event)
		key = window.event.keyCode; //IE
	else
		key = e.which; //firefox

	return (key != 13);
}


var experimentLogger = null;
function startPCR() {
	experimentLogger = new ExperimentLogger();
	experimentLog = [];

	// check if the form is validated
	if (false == ($("#pcrForm").validate().form())) {
		return 0;
	} // if the form is not valid, show the errors
	// command_id will be a random ID, stored to the window for later use
	window.command_id = Math.floor(Math.random() * 65534);
	// command id can't be 0
	// where is OpenPCR
	var devicePort = communicator.port;
	console.verbose("devicePort=" + devicePort);

	pcrProgram = profileForm.writeoutExperiment();
	var encodedProgram = programToDeviceCommand (pcrProgram);
	// verify that there are no more than 16 top level steps
	console.verbose(pcrProgram.steps.length + " : top level steps");
	console.verbose(window.lessthan20steps + " : cycle level steps");
	var totalSteps = window.lessthan20steps + pcrProgram.steps.length;

	// check that the entire protocol isn't >252 bytes
	console.verbose("encodedProgram=" + encodedProgram);
	if (encodedProgram.length > 512) {
		chromeUtil.alert(getLocalizedMessage('lengthLimit').replace('___LENGTH___', encodedProgram.length));
		return 0;
	}

	// verify the cycle step has no more than 16 steps
	else if (window.lessthan20steps > 16) {
		console.verbose(encodedProgram);
		chromeUtil.alert(getLocalizedMessage('stepLimit').replace('___STEPS___',window.lessthan20steps));
		return 0;
	}

	// and check that the total overall is less than 25
	else if (totalSteps > 25) {
		console.verbose(encodedProgram);
		chromeUtil.alert(getLocalizedMessage('totalStepLimit').replace('___STEPS___',totalSteps));
		return 0;
	}

	//debug
	console.verbose(encodedProgram);

	// go to the Running dashboard
	showRunningDashboard();
	//$('#is_starting_dialog').dialog('open');

	// write out the file to the OpenPCR device
	communicator.sendStartCommand(encodedProgram);
	experimentLogger.start();
	running();

	// then close windows it after 1 second
	/*
	setTimeout(function() {
		$('#is_starting_dialog').dialog('close');
	}, 5000);
	setTimeout(function() {
		$('#ex2_p3').show();
	}, 100);
	*/

	$('#ex2_p3').show();
	// also, reset the command_id_counter
	window.command_id_counter = 0;
}

function showRunningDashboard () {

	// go to the Running dashboard
	sp2.showPanel(2);
	$("#ex2_p3").hide();
	// go to the top of the page
	scrollTo(0, 0);
	//hide the home button on the running page
	$("#homeButton").hide();
	$("#download").hide();

	// show the controller buttons
	$("#stop_link").show();
	$("#pause_link").show();
	$("#resume_link").hide();
	$("#next_step_link").show();
	$("#next_cycle_link").show();
}

/*****************
 * Running screen *
 ******************/

/* running(path)
 * Controls the "running" page of OpenPCR. Reads updates from the running.pcr control file on OpenPCR continuously
 * Input: path, the location of the running.pcr control file
 */

function running() {
	// refresh the running page every 1000 ms
	window.updateRunningPage = setInterval(updateRunning, 1000);
}

/* updateRunning()
 * Updates the Running page variables
 */

function updateRunning() {
	communicator.requestStatus(onReceiveStatus);
}
var experimentLog;

function messageToStatus (message) {
	// split on &
	var splitonAmp = message.split("&");
	// split on =
	var status = new Array();
	for (i = 0; i < splitonAmp.length; i++) {
		var data = splitonAmp[i].split("=");
		if (isNaN(parseFloat(data[1]))) {
			// not a number
			status[data[0]] = data[1];
		}
		else {
			// a number
			status[data[0]] = parseFloat(data[1]);
		}
	}
	return status;
}

// Process Status update
var prevStatus = null;
function onReceiveStatus(message) {
	var status = messageToStatus(message);
	if (prevStatus!=status.s && status.s=="stopped") {
		console.log("Device is restarted.");
		$('#is_stopped_dialog').dialog({
			autoOpen : false,
			width : 400,
			modal : true,
			draggable : false,
			resizable : false,
			buttons : {
				"Close" : function() {
					onStopPCR();
					$(this).dialog("close");
				}
			}
		});
		$('#is_stopped_dialog').dialog('open');
	}
	experimentLog.push(status);
	experimentLogger.log(status);
	 if (status.s == "error") {
    console.log("ERROR!!!");
    // Error code
    console.log(status.w);
    console.log(getLocalizedMessage('errorMessage' + status.w));
    $('#errorDesctiption').html(getLocalizedMessage('errorMessage' + status.w));
    $('#labelErrorCode').html(status.w);
    window.clearInterval(window.updateRunningPage);
    $('#error_dialog').dialog('open');
  }
	prevStatus = status.s;
}
/* onStopPCR()
 * This function is called when the Stop command is accepted.
 */
function onStopPCR () {
	window.clearInterval(window.updateRunningPage);
	createCSV();
	$("#homeButton").show();
}

/* StopPCR()
 * This function is called when the Stop button (Running page) is clicked and confirmed
 * Or when the "Return to home screen" button is clicked
 * Returns: boolean
 */
function stopPCR() {
	// Clear the values in the Running page
	$("#runningExperimentTitle").html("");
	$("#timeProgress").val(0);
	$("#minutesRemaining").html("");

	// Create the string to write out
	var stopCommand = 's=ACGTC&c=stop';
	// contrast
	//// contrast no longer controlled here, delete
	////stopPCR += '&t=50';
	// increment the window.command id and send the new command to the device
	window.command_id++;
	stopCommand += '&d=' + window.command_id;
	console.verbose(stopCommand);
	// Send out the STOP command
	communicator.sendStopCommand(stopCommand, function() {
		onStopPCR();
	});
	return false;
}
/* Send "pause" command to the device */
function pausePCR () {
	communicator.sendControlCommand("pause");
}
/* Send "resume" command to the device */
function resumePCR () {
	communicator.sendControlCommand("resume");
}
/* Send "nxs" command to the device */
function nextStepPCR () {
	communicator.sendControlCommand("nxs");
}
/* Send "nxc" command to the device */
function nextCyclePCR () {
	communicator.sendControlCommand("nxc");
}


function _deleteStep () {
	$(this).parent().slideUp('slow', function() {
		// after animation is complete, remove parent step
		$(this).remove();
		//// if the length is now 0, hide the whole div
	});

}

function activateDeleteButton() {
	$('.deleteStepButton').on('click', function() {
		$(this).parent().slideUp('slow', function() {
			// after animation is complete, remove parent step
			$(this).remove();
			//// if the length is now 0, hide the whole div
		});

	});
}
/**************
 * Buttons     *
 ***************/
function prepareButtons() {

	profileForm.initButtons ();
	$('#newExperimentButton').on('click', newExperiment);
	$('#listSubmitButton').on('click', listSubmit);

	// TODO move to ProfileForm class
	$('#saveForm').on('click', function() {
		$('#Start').click();
	});
	$('#appVersion').html(chromeUtil.getAppVersion());

	/*  "About" button on the OpenPCR Home page
	 * Displays about info
	 */
	$('#About').on('click', function() {

		$('#about_dialog').dialog({
			autoOpen : false,
			width : 400,
			modal : true,
			draggable : false,
			resizable : false,
			buttons : {
				"Close" : function() {
					$(this).dialog("close");
				}
			}
		});
		$('#about_dialog').dialog('open');
	});

	$('#debugLink').on('click', Log.toggleDebugArea);

	/*  "Contrast" button on the OpenPCR Home page
	 * Sets the contrast for OpenPCR
	 */
	$('#Settings').on('click', function() {
		$('#settings_dialog').dialog('open');
	});

	/*  "Home" button on the OpenPCR Form page
	 * Goes Home
	 */
	$('#Home').on('click', function() {
		listExperiments();
		sp2.showPanel(0);
		setTimeout(function(){ profileForm.clear(); }, 500);
	});

	/*  "Home" button on the OpenPCR Running page */
	$('#homeButton').on('click', function() {
		stopPCR();
		if (graph) graph.clear();
		listExperiments();
		sp2.showPanel(0);
		setTimeout(function(){ profileForm.clear(); }, 500);
	});

	/*  "Start" button on the OpenPCR Form page
	 * Sends an experiment to OpenPCR and switches to the Running page
	 */
	$('#Start').on('click', function() {
		console.log("#Start.click");
		startPCR();
	});
	/**
	 * Clear all data
	 */
	$('#ClearData').on('click', function() {
		pcrStorage.clearAllData();
	});
	/*
	 * Graph Scale Button
	 */
	$('#graph_plus').on('click',
			function(){graph.changeScale(-1);}
	);
	$('#graph_minus').on('click',
			function(){graph.changeScale(1);}
	);

	/*  "More options" button on the OpenPCR Form
	 * Display a bunch of options
	 */
	$('#OptionsButton')
			.on(
					'click',
					function() {
						$(".edit").toggle();
						$("#preContainer").show();
						$("#postContainer").show();
						$("#lidContainer").show();
						// get current state
						buttonText = document.getElementById("OptionsButton").value;
						// if we're hiding the options and there are no pre-steps or post-steps, hide those sections appropriately
						if (buttonText == getLocalizedMessage('lessOptions')
								&& $("#preSteps").html() == "") {
							// hide pre steps
							$("#preContainer").hide();
						}
						if (buttonText == getLocalizedMessage('lessOptions')
								&& $("#postSteps").html() == "") {
							// hide post steps
							$("#postContainer").hide();
						}
						// flip the Options button text between "More options" and "Less options"
						var buttonText = (buttonText != getLocalizedMessage('moreOptions') ? getLocalizedMessage('moreOptions')
								: getLocalizedMessage('lessOptions'));
						$('#OptionsButton')[0].value = buttonText;
					});

	$("#firmwareVersion").dblclick(function(){
			$("#update_available_dialog").dialog("open");
			message = getLocalizedMessage('firmwareUpdateAvailable')
				.replace("___LATEST_VERSION___", FIRMWARE_VERSION_LATEST)
				.replace("___INSTALLED_VERSION___", version);
		});
	$('a[href="#"]').attr("href", "javascript:void(0);");
}
/* deleteCurrentExperiment()
 * Deletes the currently loaded experiment (whatever was last selected in the list)
 * Called by the delete dialog box
 */
function deleteCurrentExperiment() {
	// delete the currently loaded Experiment file
	// given an ID, get the path for that ID
	// show a confirmation screen
	pcrStorage.deleteCurrentExperiment  (
	function () {
		$('#delete_done_dialog').dialog('open');
		// then close it after 1 second
		setTimeout(function() {
			$('#delete_done_dialog').dialog('close');
		}, 750);
	});

	//
}

// JQUERY UI stuffs

$(function() {
	// About Dialog
	/*
		$('#about_dialog').dialog({
			autoOpen: false,
			width: 300,
			modal: true,
			draggable: false,
			resizable: false,
			buttons:
				{
				"OK": function() {
					$(this).dialog("close");
					}
				}
		});
	 */
	// Settings Dialog
	$('#settings_dialog').dialog( //TODO Control LCD
					{
						autoOpen : false,
						width : 400,
						modal : true,
						draggable : false,
						resizable : false,
						buttons : {
							"Apply" : function() { //TODO localize
								// grab the value of the slider
								contrast = $("#contrast_slider")
										.slider("value");
								// command id
								window.command_id = Math
										.floor(Math.random() * 65534);
								// set the command
								contrast_string = 's=ACGTC&c=cfg&o=' + contrast
										+ '&d=' + command_id;

								// trace it
								console.verbose("string: " + contrast_string);

								// Write out the  command to CONTROL.TXT
								// name of the output file
								if (window.path != null) {
									var file = window.path
											.resolvePath("CONTROL.TXT");
									// write out all the variables, command id + PCR settings
									var fileStream = new window.runtime.flash.filesystem.FileStream();
									fileStream
											.open(
													file,
													window.runtime.flash.filesystem.FileMode.WRITE);
									fileStream.writeUTFBytes(contrast_string);
									fileStream.close();
								}
							},
							"OK" : function() { //TODO localize
								// grab the value of the slider
								contrast = $("#contrast_slider")
										.slider("value");
								window.command_id = Math
										.floor(Math.random() * 65534);
								contrast_string = 's=ACGTC&c=cfg&o=' + contrast
										+ '&d=' + command_id;
								// trace it
								console.verbose("string: " + contrast_string);
								// Write out the  command to CONTROL.TXT
								// name of the output file
								if (window.path != null) {
									var file = window.path
											.resolvePath("CONTROL.TXT");
									// write out all the variables, command id + PCR settings
									var fileStream = new window.runtime.flash.filesystem.FileStream();
									fileStream
											.open(
													file,
													window.runtime.flash.filesystem.FileMode.WRITE);
									fileStream.writeUTFBytes(contrast_string);
									fileStream.close();
								}
								// close the dialog window
								$(this).dialog("close");
							}

						}
					});

	$(function() {
		$("#contrast_slider").slider({
			min : 1,
			max : 250
		});
	});

	// Save Dialog
	$('#save_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false,
		position : 'center',
		buttons : { //TODO localize
			"Cancel" : function() {
				$(this).dialog("close");
				$("#name").val("");
			},
			"Save" : function() {
				// grab the name from the form
				name = $("#name").val();
				// save the current experiment as the given name
				profileForm.save(name, true);
				// update the experiment name in the UI
				$("#ExperimentName").html(name);
				// close the dialog window
				$(this).dialog("close");
			}
		}
	});

	// Save Confirmation Dialog
	$('#save_done_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false

	});

	// Delete Dialog
	$('#delete_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false,
		buttons : { //TODO localize
			"No" : function() {
				$(this).dialog("close");
			},
			"Yes" : function() {
				// delete the current selected experiment
				deleteCurrentExperiment();
				// Since the experiment was deleted, go to the home screen
				// refresh the list of Presets
				listExperiments();
				// Home screen
				sp2.showPanel(0);
				// close this window
				$(this).dialog("close");
			}
		}
	});

	// Delete Confirmation Dialog
	$('#delete_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false

	});

	// Stop Dialog
	$('#stop_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false,
		buttons : { //TODO localize
			"No" : function() {
				$(this).dialog("close");
			},
			"Yes" : function() {
				$(this).dialog("close");
				stopPCR();
			}
		}
	});

	// Controller buttons
	$('#stop_link').click(function() {
		$('#stop_dialog').dialog('open');
		return false;
	});
	$('#pause_link').click(pausePCR);
	$('#resume_link').click(resumePCR);
	$('#next_step_link').click(nextStepPCR);
	$('#next_cycle_link').click(nextCyclePCR);


	// Starting dialog
	$('#is_starting_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false
	});
	// Disconnected dialog
	$('#disconnected_dialog').dialog({
		autoOpen : false,
		width : 300,
		modal : true,
		draggable : false,
		resizable : false,
		buttons : {
			"OK" : function() {
				$(this).dialog("close");
			}
		}
	});

  // Error dialog
  $('#error_dialog').dialog({
    autoOpen : false,
    width : 400,
    modal : true,
    draggable : false,
    resizable : false,
    buttons : {
      "OK" : function() {
        $(this).dialog("close");
      }
    }

  });


	//hover states on the static widgetson the static widgets
		$('#dialog_link, ul#icons li').hover(
			function() { $(this).addClass('ui-state-hover'); },
			function() { $(this).removeClass('ui-state-hover'); }
		);

});

// Enter/Return Key clicks "Save" on dialog
$('#save_dialog').on('keyup', function(e) {
	if (e.keyCode == 13) {
		$(':button:contains("Save")').click();
	}
});

// TODO include tube temp
function createCSV () {
	var TAB = encodeURIComponent("\t");
	var RET = encodeURIComponent("\n");
	content =
	   "Command ID" + TAB //d
	 + "Status" + TAB //s
	 + "Lid Temp" + TAB //l
	 + "Well Temp" + TAB //b
	 + "Therm State" + TAB //t
	 + "Elapsed Time" + TAB //e
	 + "Remaining Time" + TAB //r
	 + "Num of Cycles" + TAB //u
	 + "Current Step" + RET;//c
	var params = ["d","s","l","b","t","e","r","u","c"];
	for (var i=0; i<experimentLog.length; i++) {
		var line = experimentLog[i];
		for (var j=0; j<params.length; j++) {
			if (j!=0)
				content += TAB;
			if (line[params[j]]!=null)
				content += line[params[j]];
		}
		content += RET;
	}
	$("#download")[0].href = "data:application/octet-stream," + content;
	var fileName = pcrStorage.getLogFileName();
	$("#download")[0].download = fileName;
	$("#download").show();
}

$(document).ready(init);

const GEN_PUG = (obj)=>{
	let a = [];
	for (key in obj) {
		let k = key;
		let v = obj[key].message.replace(/\"/g,"\\\"");
		a.push("\"" + key + "\":\"" + v + "\"," )
	}
	console.log(a.join("\n"))
};

(()=>{
	console.log("Log JA");
	GEN_PUG(window.MESSAGE_JA)
	console.log("Log EN");
	GEN_PUG(window.MESSAGE_EN)
})()
