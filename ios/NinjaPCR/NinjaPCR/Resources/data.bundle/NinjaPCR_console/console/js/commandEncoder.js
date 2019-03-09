
/* stepToDeviceCommandString(inputJSON)
 * Takes a JSON object and turns it into a string
 * This is used to load an experiment into the OpenPCR device
 */
function stepToDeviceCommandString(inputJSON) {
	var stepString = "";
	// if single step return something like (1[300|95|Denaturing])
	if (inputJSON.type == "step") {	
		stepString += "[" + inputJSON.time + "|" + inputJSON.temp + "|"
				+ inputJSON.name.slice(0, 13) + "|" + inputJSON.rampDuration
				+ "]";
	}
	// if cycle return something like (35,[60|95|Step A],[30|95|Step B],[30|95|Step C])
	else if (inputJSON.type == "cycle") {
		// add the number of Cycles
		stepString += "(";
		stepString += inputJSON.count;

		for (a = 0; a < inputJSON.steps.length; a++) {
			//						stepString += "[" + inputJSON.steps[a].time + "|" + inputJSON.steps[a].temp + "|" + inputJSON.steps[a].name.slice(0,13) + "]";
			stepString += "[" + inputJSON.steps[a].time + "|"
					+ inputJSON.steps[a].temp + "|"
					+ inputJSON.steps[a].name.slice(0, 13) + "|"
					+ inputJSON.steps[a].rampDuration + "]";
		}
		// close the stepString string
		stepString += ")";
	}
	//alert(stepString);
	return stepString;
}

function programToDeviceCommand (pcrProgram) {
	// now parse it out
	// Start with the signature
	var encodedProgram = "s=ACGTC";
	// Command
	encodedProgram += "&c=start";
	// Command id 
	encodedProgram += "&d=" + window.command_id;
	// Lid Temp NO DECIMALS. Not handeled by UI currently, but just making sure it doesn't make it to OpenPCR
	encodedProgram += "&l=" + Math.round(pcrProgram.lidtemp);
	// Name
	encodedProgram += "&n=" + pcrProgram.name
	// get all the variables from the pre-cycle, cycle, and post-cycle steps
	encodedProgram += "&p=";
	window.lessthan20steps = 0;
	for (i = 0; i < pcrProgram.steps.length; i++) {
		if (pcrProgram.steps[i].type == "step")
		// if it's a step, stepToDeviceCommandString will return something like [300|95|Denaturing]
		// then this loop needs to figure out when to add [1(  and )]
		{
			// if the previous element wasn't a step (i.e. null or cycle)
			if (typeof pcrProgram.steps[i - 1] == 'undefined'
					|| pcrProgram.steps[i - 1].type == "cycle") {
				encodedProgram += "(1";
			}

			encodedProgram += stepToDeviceCommandString(pcrProgram.steps[i]);

			// if the next element isn't a step (i.e. null or cycle)
			if (typeof pcrProgram.steps[i + 1] == 'undefined'
					|| pcrProgram.steps[i + 1].type != "step") {
				encodedProgram += ")";
			}
		}

		else if (pcrProgram.steps[i].type == "cycle")
		// if it's a cycle add the prefix for the number of steps, then each step
		{
			// for example, this should return (35[30,95,Denaturing][60,55,Annealing][60,72,Extension])
			encodedProgram += stepToDeviceCommandString(pcrProgram.steps[i]);
			window.lessthan20steps = pcrProgram.steps[i].steps.length;
		}
	}
	return encodedProgram;
}
