var DEFAULT_EXPERIMENT = {
	"name": "Simple Test",
	"steps": [
		{
			"type": "step",
			"name": "95C for 30 sec",
			"temp": "95",
			"time": "30",
			"rampDuration": "0"
		},
		{
			"type": "cycle",
			"count": "2",
			"steps": [
				{
					"type": "step",
					"name": "Denaturing",
					"temp": "95",
					"time": "30",
					"rampDuration": "0"
				},
				{
					"type": "step",
					"name": "Annealing",
					"temp": "55",
					"time": "30",
					"rampDuration": "0"
				},
				{
					"type": "step",
					"name": "Extending",
					"temp": "72",
					"time": "60",
					"rampDuration": "0"
				}
			]
		},
		{
			"type": "step",
			"name": "Final Hold",
			"time": 0,
			"temp": "20",
			"rampDuration": "0"
		}
	],
	"lidtemp": "110"
};
var BIGDYE = {
	"name": "BigDye Sequencing",
	"steps": [
		{
			"type": "step",
			"name": "Preincubation",
			"temp": "96",
			"time": "60",
			"rampDuration": "0"
		},
		{
			"type": "cycle",
			"count": "25",
			"steps": [
				{
					"type": "step",
					"name": "Denaturing",
					"temp": "96",
					"time": "10",
					"rampDuration": "0"
				},
				{
					"type": "step",
					"name": "Annealing",
					"temp": "50",
					"time": "5",
					"rampDuration": "0"
				},
				{
					"type": "step",
					"name": "Extending",
					"temp": "60",
					"time": "180",
					"rampDuration": "0"
				}
			]
		},
		{
			"type": "step",
			"name": "Final Hold",
			"time": 0,
			"temp": "20",
			"rampDuration": "0"
		}
	],
	"lidtemp": "110"
};
var COLONY = {
	"name": "Colony PCR",
	"steps": [
		{
			"type": "step",
			"name": "Preincubation",
			"temp": "94",
			"time": "180",
			"rampDuration": "0"
		},
		{
			"type": "cycle",
			"count": "35",
			"steps": [
				{
					"type": "step",
					"name": "Denaturing",
					"temp": "94",
					"time": "15",
					"rampDuration": "0"
				},
				{
					"type": "step",
					"name": "Annealing",
					"temp": "55",
					"time": "30",
					"rampDuration": "0"
				},
				{
					"type": "step",
					"name": "Extending",
					"temp": "72",
					"time": "120",
					"rampDuration": "0"
				}
			]
		},
		{
			"type": "step",
			"name": "Final Hold",
			"time": 0,
			"temp": "20",
			"rampDuration": "0"
		}
	],
	"lidtemp": "110"
};
