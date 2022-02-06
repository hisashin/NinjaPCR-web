'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProfileForm = function () {
  function ProfileForm() {
    _classCallCheck(this, ProfileForm);

    this.cyclesCount = 0;
  }
  /* clear()
   * Reset all elements on the Forms page
   */

  _createClass(ProfileForm, [{
    key: 'clear',
    value: function clear() {
      console.log("ProfileForm.clear()"); // empty everything

      $('#preSteps').empty();
      $('#cycles').empty();
      $('#postSteps').empty();
      $('#holdSteps').empty();
      $('#lidTemp').empty(); // hide everything

      $('#preContainer').hide();
      $('#cyclesContainer').hide();
      $('#postContainer').hide();
      $('#holdContainer').hide();
      $('#lidContainer').hide(); // reset the size of the DIV to 700 px
      //defaultHeight = "700";
      //$(".SlidingPanelsContent").height(defaultHeight);
      //$(".SlidingPanels").height(defaultHeight);
    }
    /* experimentToHTML(inputJSON)
     * Takes a given experiment JSON object and loads it into the OpenPCR interface
     */

  }, {
    key: 'experimentToHTML',
    value: function experimentToHTML(inputJSON) {
      console.log("ProfileForm.experimentToHTML()"); // store the experiment to the JSON. This can be modified using the interface buttons, sent to OpenPCR, or saved

      window.experiment = inputJSON; // clear the Form

      this.clear(); // Update the experiment name

      var experimentName = inputJSON.name; // only use the first 20 chars of the experimentName

      experimentName = experimentName.slice(0, 18);
      $("#ExperimentName").html(experimentName); // for every .steps in the experiment, convert it to HTML

      var experimentHTML = ""; // break the rest of the experiment up into "pre cycle" (0), "cycle" (1), and "post cycle" (2) sections

      var count = 0; // add the lid temperature div but hide it

      $('#lidContainer').hide(); // max temp 120, min temp 0 (off)

      $('#lidTemp').html('<span class="title">' + getLocalizedMessage('heaterLid') + '</span>' + this.getInputTag(inputJSON.lidtemp, {
        name: "lid_temp",
        id: "lid_temp",
        maxlength: 3,
        min: 0,
        max: 120
      })); // 5 or more possibile DIVs
      // pre-steps, first cycle steps, second cycle steps,... post-steps, and final hold step
      // Add the experiment to the page

      for (i = 0; i < inputJSON.steps.length; i++) {
        var step = inputJSON.steps[i]; // pre-cycle to start

        if (count == 0 & step.type == "step" && step.time != 0) // if it's for pre-cycle, and not a final hold (0 time)
          {
            // show the preContainer div
            $('#preContainer').show();
            $('#preSteps').append(this.stepToHTML(step));
          } else if (step.type == "cycle") // if it's cycle, put the cycle in the Cycle container
          {
            $('#cyclesContainer').show();
            $('#cycles').append(this.cycleToHTML(step));
            count = 1;
          } else if (count == 1 && step.type == "step" && step.time != 0) // if it's post (but not a final hold), put the steps in the Post container
          {
            $('#postContainer').show();
            $('#postSteps').append(this.stepToHTML(step));
          } else if (step.type == "step" && step.time == 0) // if it's the final hold (time = 0), put it in the final hold container
          {
            $('#holdContainer').show();
            $('#holdSteps').append(this.stepToHTML(step));
          }
      }

      activateDeleteButton();
    }
    /* writeoutExperiment
     * Reads out all the variables from the OpenPCR form into a JSON object to "save" the experiment
     * Separate function is used to write out the experiment to the device
     */

  }, {
    key: 'writeoutExperiment',
    value: function writeoutExperiment() {
      // grab the Experiment Name
      var experimentName = document.getElementById("ExperimentName").innerHTML; // grab the pre cycle variables if any exist

      var preArray = [];
      $("#preContainer .textinput").each(function (index, elem) {
        //just throw them in an array for now
        if ($(this) != null) preArray.push($(this).val());
      });
      var cycles = [];
      $("#cycles .cycle").each(function () {
        var textInputs = $(this).find(".textinput");

        if (textInputs.size() > 0) {
          if (parseInt(textInputs.get(0).value) <= 0) {
            return;
          }

          console.log("RepeatCount=" + textInputs.get(0).value);
        } else {
          return;
        }

        var cycle = {
          "type": "cycle",
          "count": textInputs.get(0).value,
          "steps": []
        };
        $(this).find(".step").each(function (stelIndex, stepElem) {
          var titleLabels = $(this).find(".title");
          var textInputs = $(this).find(".textinput");

          if (textInputs.size() == 3 && titleLabels.size() > 0) {
            var step = {
              "type": "step",
              "name": globalizeStepName($(titleLabels.get(0)).text()),
              "temp": textInputs.get(0).value,
              "time": textInputs.get(1).value,
              "rampDuration": textInputs.get(2).value
            };
            cycle.steps.push(step);
          }
        });
        cycles.push(cycle);
      }); // grab the post cycle variables if any exist

      var postArray = [];
      $("#postContainer .textinput").each(function (index, elem) {
        //just throw them in an array for now
        postArray.push($(this).val());
      }); // grab the final hold steps if any exist

      var holdArray = [];
      $("#holdContainer .textinput").each(function (index, elem) {
        //just throw them in an array for now
        holdArray.push($(this).val());
      }); // grab the lid temp

      var lidTemp = 0;
      $("#lidContainer .textinput").each(function (index, elem) {
        lidTemp = $(this).val();
      }); // Push variables into an experiment JSON object

      var experimentJSON = new Object(); // Experiment name

      experimentJSON.name = experimentName;
      experimentJSON.steps = [];
      experimentJSON.lidtemp = lidTemp; // Pre Steps
      // every step will have 3 elements in preArray (Time, temp, rampDuration)

      var preLength = preArray.length / 3;

      for (var a = 0; a < preLength; a++) {
        experimentJSON.steps.push({
          "type": "step",
          "name": "Initial Step",
          "temp": preArray.shift(),
          "time": preArray.shift(),
          "rampDuration": preArray.shift()
        });
      } // Push cycles


      for (var i = 0; i < cycles.length; i++) {
        experimentJSON.steps.push(cycles[i]);
      } // every step will have 3 elements in preArray (Time, temp, rampDuration)
      // a better way to do this would be for a=0, postArray!=empty, a++


      var postLength = postArray.length / 3;

      for (a = 0; a < postLength; a++) {
        experimentJSON.steps.push({
          "type": "step",
          "name": "Final Step",
          "temp": postArray.shift(),
          "time": postArray.shift(),
          "rampDuration": postArray.shift()
        });
      } // Final Hold step


      if (holdArray.length > 0) {
        experimentJSON.steps.push({
          "type": "step",
          "name": "Final Hold",
          "time": 0,
          "temp": holdArray.shift(),
          "rampDuration": 0
        });
      }

      console.log(JSON.stringify(experimentJSON)); // return the experiment JSON object

      return experimentJSON;
    }
    /* save(name)
     * Writes out the current window.experiment to the app:/Experiments directory
     * Input: name, name of the file to be written out (add .pcr extension)
     */

  }, {
    key: 'save',
    value: function save(name, isNew, callback) {
      console.verbose("save " + name + ", isNew=" + isNew); // grab the current experiment and update window.experiment

      var pcrProgram = this.writeoutExperiment();
      console.log("pcrProgram=" + pcrProgram); // update the name of the experiment

      pcrProgram.name = name; // turn the pcrProgram into a string

      if (isNew) {
        pcrStorage.insertExperiment(name, pcrProgram, function (result) {
          console.verbose("result=" + result);

          if (callback) {
            callback();
          }

          $('#save_done_dialog').dialog('open'); // then close it after 1 second

          setTimeout(function () {
            $('#save_done_dialog').dialog('close');
          }, 750);
        });
      } else {
        pcrStorage.updateCurrentExperiment(name, pcrProgram, function (result) {
          console.verbose("result=" + result);

          if (callback) {
            callback();
          }

          $('#save_done_dialog').dialog('open'); // then close it after 1 second

          setTimeout(function () {
            $('#save_done_dialog').dialog('close');
          }, 750);
        });
      }
    }
  }, {
    key: 'getInputTag',
    value: function getInputTag(value, options) {
      var div = document.createElement("DIV");
      var tag = document.createElement("INPUT");
      options.style = "font-weight:normal";
      options.class = "required number textinput";
      tag.type = "text";
      tag.setAttribute("value", value || '');

      for (var key in options) {
        tag.setAttribute(key, options[key]);
      }

      div.appendChild(tag);
      return div.innerHTML;
    }
  }, {
    key: 'cycleToHTML',
    value: function cycleToHTML(cycle) {
      var stepHTML = "";
      var divId = "cycle" + this.cyclesCount;
      var cycleDiv = $('<div class="cycle"></div>'); // printhe "Number of Cycles" div
      // max 99 cycles
      //stepHTML += '<div class="cycle">';

      stepHTML += '<div id="' + divId + '">';
      stepHTML += '<label for="number_of_cycles"></label><div><span class="title">' + getLocalizedMessage('numberOfCycles') + ':</span>';
      stepHTML += this.getInputTag(cycle.count, {
        name: "number_of_cycles_" + String(this.cyclesCount),
        id: "number_of_cycles_" + String(this.cyclesCount),
        maxlength: 2,
        min: 0,
        max: 99
      });
      stepHTML += '</div><br />'; // steps container
      // print each individual step

      for (var a = 0; a < cycle.steps.length; a++) {
        // make the js code a little easier to read
        var step_number = String(this.cyclesCount) + "_" + String(a);
        var step_name = localizeStepName(cycle.steps[a].name);
        var step_temp = cycle.steps[a].temp;
        var step_time = cycle.steps[a].time;
        var step_rampDuration = cycle.steps[a].rampDuration;

        if (step_rampDuration == null) {
          step_rampDuration = 0;
        } // print HTML for the step
        // min,max temp = -20, 105
        // min,max time = 0, 6000, 1 decimal point


        stepHTML += '<div class="step"><span id="step' + step_number + '_name" class="title step_name">' + step_name + ' </span><a class="edit deleteStepButton minusButton"></a>' + '<table><tr>' + '<th><label for="step' + step_number + '_temp">' + getLocalizedMessage('tempShort') + ':</label> <div class="step' + step_number + '_temp">';
        stepHTML += this.getInputTag(step_temp, {
          name: "step" + step_number + "_temp",
          id: "step" + step_number + "_temp",
          maxlength: 4,
          min: -20,
          max: 120
        });
        stepHTML += '</div><span htmlfor="openpcr_temp" generated="true" class="units">&deg;C</span> </th>' + '<th><label for="step' + step_number + '_time">' + getLocalizedMessage('stepDuration') + ':</label> <div class="">';
        stepHTML += this.getInputTag(step_time, {
          name: "step" + step_number + "_time",
          id: "step" + step_number + "_time",
          maxlength: 4,
          min: 0,
          max: 6000
        });
        stepHTML += '</div><span htmlfor="openpcr_time" generated="true" class="units">' + getLocalizedMessage('sec') + '</span></th>' + '<th><label for="step' + step_number + '_rampDuration">' + getLocalizedMessage('rampDuration') + ':</label> <div class="">';
        stepHTML += this.getInputTag(step_rampDuration, {
          name: "step" + step_number + "_rampDuration",
          id: "step" + step_number + "_rampDuration",
          maxlength: 6,
          min: 0,
          max: 999999
        });
        stepHTML += '</div><span htmlfor="openpcr_rampDuration" generated="true" class="units">' + getLocalizedMessage('sec') + '</span></th>' + '</tr></table></div>';
      }

      stepHTML += "</div>";
      var addStepButton = $('<a class="edit plusButton" id="addStepButton">' + getLocalizedMessage('step') + '</a>'); // stepHTML += "</div>"

      var scope = this;
      addStepButton.on("click", function () {
        scope.addStep(divId);
      });
      cycleDiv.append(stepHTML);
      cycleDiv.append(addStepButton);
      this.cyclesCount++;
      return cycleDiv;
    }
    /* stepToHTML(step)
     * Turns a step into HTML. However, this HTML doesn't have a container div/fieldset
     * If the step is a cycle, it will return html with all the cycles represented.
     * If the step is a single step, html with just one cycle is returned
     */

  }, {
    key: 'stepToHTML',
    value: function stepToHTML(step) {
      console.log("stepToHTML type=" + step.type);
      var stepHTML = ""; // if cycle

      if (step.type == "cycle") {
        console.log("WARNING: stepToHTML should not be called for \"cycle\" type.");
      } // if single step
      else if (step.type == "step") {
          // make the js code a little easier to read
          var step_number = new Date().getTime();
          var step_name = localizeStepName(step.name);
          var step_time = step.time;
          var step_temp = step.temp;
          var step_rampDuration = step.rampDuration;
          if (step_rampDuration == null) step_rampDuration = 0; // main HTML, includes name and temp

          stepHTML += '<div class="step"><span id="' + step_number + '" class="title step_name">' + step_name + ' </span><a class="edit deleteStepButton minusButton"></a>' + '<table cellspacing="20"><tr>' + '<th><label>' + getLocalizedMessage('tempShort') + ':</label> <div>';
          stepHTML += this.getInputTag(step_temp, {
            name: "temp_" + step_number,
            maxlength: 4,
            min: MIN_FINAL_HOLD_TEMP,
            max: 120
          });
          stepHTML += '</div><span htmlfor="openpcr_temp" generated="true" class="units">&deg;C</span> </th>'; // if the individual step has 0 time (or blank?) time, then it is a "hold" step and doesn't have a "time" component

          if (step_time != 0) {
            stepHTML += '<th><label>' + getLocalizedMessage('stepDuration') + ':</label> <div class="">';
            stepHTML += this.getInputTag(step_time, {
              name: "time_" + step_number,
              maxlength: 4,
              min: 0,
              max: 6000
            });
            stepHTML += '</div><span htmlfor="openpcr_time" generated="true" class="units">' + getLocalizedMessage('sec') + '</span></th>';
            stepHTML += '<th><label>' + getLocalizedMessage('rampDuration') + ':</label> <div class="">';
            stepHTML += this.getInputTag(step_rampDuration, {
              name: "rampDuration_" + step_number,
              maxlength: 6,
              min: 0,
              max: 999999
            });
            stepHTML += '</div><span htmlfor="openpcr_rampDuration" generated="true" class="units">' + getLocalizedMessage('sec') + '</span></th>';
          }
        } else {
          chromeUtil.alert(getLocalizedMessage('error') + " #1986");
        }

      stepHTML += '</tr></table></div>';
      return stepHTML;
    }
    /* addStep()
     * Add the HTML for a blank step to the desired css selector div
     */

  }, {
    key: 'addStep',
    value: function addStep(location) {
      var step_name; // add to HTML

      if (location == "preSteps") {
        step_name = localizeStepName("Initial Step");
      }

      if (location == "postSteps") {
        step_name = localizeStepName("Final Step");
      }

      if (location.indexOf("cycle") >= 0) {
        step_name = localizeStepName("Step");
      }

      var step_number = new Date().getTime();
      var step = '<div class="step">' + '<span class="title step_name">' + step_name + ' </span>' + '<a class="edit deleteStepButton minusButton"></a>' + '<table cellspacing="20">' + '<tr>' + '<th><label>' + getLocalizedMessage('tempShort') + '</label><div>';
      step += this.getInputTag("", {
        name: "temp_" + step_number,
        maxlength: 4,
        min: 0,
        max: 120
      });
      step += '</div><span htmlfor="openpcr_temp" generated="true" class="units">&deg;C</span> </th>' + '<th><label>' + getLocalizedMessage('stepDuration') + '</label><div class="">';
      step += this.getInputTag("", {
        name: "time_" + step_number,
        maxlength: 4,
        min: 0,
        max: 1000
      });
      step += '</div><span htmlfor="openpcr_time" generated="true" class="units">' + getLocalizedMessage('sec') + '</span></th>' + '<th><label>' + getLocalizedMessage('rampDuration') + '</label><div class="">';
      step += this.getInputTag("", {
        name: "rampDuration_" + step_number,
        maxlength: 6,
        min: 0,
        max: 999999
      });
      step += '</div><span htmlfor="openpcr_rampDuration" generated="true" class="units">' + getLocalizedMessage('sec') + '</span></th>' + '</tr>' + '</table>' + '</div>'; // append a new step to location

      $('#' + location).append(step); // make sure the form elements are editable

      $("input").removeAttr("readonly"); //// make the window bigger
      // make all the delete buttons shown
      // and if there are any other parts of a "step" that are hide/show, they need to be included here

      activateDeleteButton();
      $(".edit").show();
    }
  }, {
    key: 'addCycle',
    value: function addCycle(location) {
      var step_name;
      var location = "cycles";
      step_name = localizeStepName("Step");
      var step_number = new Date().getTime(); // Search for a cycle in the new_experiment

      var templateCycle;

      for (var i = 0; i < NEW_EXPERIMENT.steps.length; i++) {
        if (NEW_EXPERIMENT.steps[i].type == "cycle") {
          templateCycle = NEW_EXPERIMENT.steps[i]; // take the first cycle in the new_experiment as a template

          break;
        }
      }

      $('#cycles').append(this.cycleToHTML(templateCycle));
      $("#cycles input").removeAttr("readonly"); //// make the window bigger
      // make all the delete buttons shown
      // and if there are any other parts of a "step" that are hide/show, they need to be included here

      activateDeleteButton();
      $(".edit").show();
    }
  }, {
    key: 'addFinalStep',
    value: function addFinalStep() {
      // add the step to the postContainer
      this.addStep("postSteps");
    }
  }, {
    key: 'addInitialStep',
    value: function addInitialStep() {
      // add the step to the preContainer
      this.addStep("preSteps");
    }
  }, {
    key: 'initButtons',
    value: function initButtons() {
      var scope = this;
      $('#initialStep').on('click', function () {
        scope.addInitialStep();
      }); // TODO move to ProfileForm class

      $('#finalStep').on('click', function () {
        scope.addFinalStep();
      }); // TODO move to ProfileForm class

      /*  "Save" button on the OpenPCR Form
       * Ask for a "name" and save the protocol to name.pcr in the user's Experiments folder
       */

      $('#Save').on('click', function () {
        // Save Dialog
        // check if the form is validated
        if (false == $("#pcrForm").validate().form()) {
          return 0; // if not, don't do anything
        } // otherwise, the form is valid. Open the "Save" dialog box


        $('#save_dialog').dialog('open');
      });
      /*  "Save" on the OpenPCR Form in EDIT MODE
       * This will overwrite the old experiment with the edited settings
       */

      $('#SaveEdits').on('click', function () {
        // check if the form is validated
        if (false == $("#pcrForm").validate().form()) {
          return 0; // if not, don't do anything
        } // Grab the Experiment name, could also do this by reading from the experiments list on the homepage


        name = document.getElementById("ExperimentName").innerHTML; // Save the file, overwriting the existing file

        scope.save(name, false, function () {
          loadExperiment(experimentID);
        });
      });
      /*  "Cancel" button on the OpenPCR Form in EDIT MODE
       * This will cancel any changes made to the form and re-load the experiment as it was last saved
       */

      $('#Cancel').on('click', function () {
        // what is selected in the drop down menu on the front page?
        experimentID = $("#dropdown").val();

        try {
          localStorage.setItem("lastExperiment", experimentId);
        } catch (e) {} // clear the form


        scope.clear(); // load the selected experiment

        loadExperiment(experimentID);
      });
      /*  "Edit" button on the OpenPCR Form with a saved experiment
       */

      $('#editButton').on('click', function () {
        scope.editButton();
      });
      /*  "Delete" button on the OpenPCR Form in EDIT MODE
       */

      $('#deleteButton').on('click', function () {
        $('#delete_dialog').dialog('open');
      });
      /*  "+ Add Cycle" button on the OpenPCR Form
       * Add a new simple cycle to the end of other cycles
       */

      $('#addCycleButton').on('click', function () {
        var location = $(this).parent().attr("id");
        scope.addCycle(location);
      });
      /*  "- Delete Step" on the OpenPCR Form
       * Delete the step
       */

      $('.deleteStepButton').on('click', function () {
        console.verbose("deleteStepButton");
        $(this).parent().slideUp('slow', function () {
          // after animation is complete, remove parent step
          $(this).remove(); //// if the length is now 0, hide the whole div
        });
      });
      /*  "Delete" button on the OpenPCR Form in EDIT MODE
       */

      $('#deleteButton').on('click', function () {
        $('#delete_dialog').dialog('open');
      });
      /*  "- Delete Step" on the OpenPCR Form
       * Delete the step
       */

      $('.deleteStepButton').on('click', function () {
        console.verbose("deleteStepButton");
        $(this).parent().slideUp('slow', function () {
          // after animation is complete, remove parent step
          $(this).remove(); //// if the length is now 0, hide the whole div
        });
      });
      /* Init debug buttons */

      if (location.href.indexOf("debug=true") > 0) {
        $("#debugProfile").show();
        $(".debug").show();
        $("#debugProfile").on("click", function () {
          scope.debugProfile();
          sp2.showPanel(2);
        });
      }
    }
    /* editButton()
     * Function that is called when the "Edit" button is pressed on a "Saved Preset" page. Makes the "Save preset" and "Cancel" buttons
     * show up, "Add" and "Subtract" steps buttons, and makes all fields editable
     * Returns: nothing
     */

  }, {
    key: 'editButton',
    value: function editButton() {
      // Show the Delete button
      $('#deleteButton').show(); // Start with the Edit button hidden

      $("#editButton").show(); // show the edit buttons

      $(".edit").show(); // show the lid temp fields

      $("#lidContainer").show(); // all fields editable

      $("input").removeAttr("readonly"); // and 'More options' hidden

      $('#OptionsButton').hide(); // show the Save button to save a modified preset as a new program

      $('#Save').show(); // show the Cancel button

      $('#Cancel').show(); // show the SaveEdits button

      $('#SaveEdits').show(); // show the Start/Unplugged button to run the program without saving
      // startOrUnplugged("none");
      // show the Single Temp mode button

      $('#singleTemp').show(); // show the Add Step buttons

      $("#preContainer").show();
      $("#postContainer").show();
    }
  }, {
    key: 'debugProfile',
    value: function debugProfile() {
      if (false == $("#pcrForm").validate().form()) {
        return 0; // if not, don't do anything
      }

      console.log(this.writeoutExperiment());
    }
  }]);

  return ProfileForm;
}();
/* End class ProfileForm */

var STEP_NAMES = [["stepStep", "Step"], ["stepDenaturing", "Denaturing"], ["stepAnnealing", "Annealing"], ["stepExtending", "Extending"], ["stepFinalHold", "Final Hold"], ["stepInitialStep", "Initial Step"], ["stepFinalStep", "Final Step"]];

function localizeStepName(stepName) {
  for (var i = 0; i < STEP_NAMES.length; i++) {
    if (STEP_NAMES[i][1] == stepName) return getLocalizedMessage(STEP_NAMES[i][0]);
  }

  return stepName;
}

function globalizeStepName(_stepName) {
  var stepName = _stepName.replace(/^[ \t\n]+/g, '').replace(/[ \t\n]+$/g, '');

  for (var i = 0; i < STEP_NAMES.length; i++) {
    if (getLocalizedMessage(STEP_NAMES[i][0]) == stepName) return STEP_NAMES[i][1];
  }

  return stepName;
}

var CycleEditor = function CycleEditor() {
  _classCallCheck(this, CycleEditor);
};
"use strict";

