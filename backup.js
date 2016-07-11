var dbMgr = require("./dbMgr");

var gridHandler = {};
gridHandler[" "] = function(layout, row, col, grids) {

};

gridHandler["B"] = function(layout, row, col, grids) {
	var index = row * gConfig.layout.width + col;
	if (grids[index] === undefined) {
		grids[index] = index;
		layout[row][col] = " ";
	}
};

gridHandler["H"] = function(layout, row, col, grids) {
	gridHandler["B"](layout, row, col, grids);
	var count = 0;
	for (var i = 0; i < gConfig.layout.width; i++) {
		if (layout[row][i] === " ") {
			count++;
		}
	}
	if (count === gConfig.layout.width) {
		return;
	}

		debugger;
	for (var c = 0; c < gConfig.layout.width; c++) {
		if (layout[row][c] !== " ") {
			gridHandler[layout[row][c]](layout, row, c, grids);
		}
	}
};

gridHandler["V"] = function (layout, row, col, grids) {
	gridHandler["B"](layout, row, col, grids);
	var count = 0;
	for (var i = 0; i < gConfig.layout.height; i++) {
		if (layout[i][col] === " ") {
			count++;
		}
	}
	if (count === gConfig.layout.height) {
		return;
	}

	debugger;
	for (var r = 0; r < gConfig.layout.height; r++) {
		if (layout[r][col] !== " ") {
			gridHandler[layout[r][col]](layout, r, col, grids);
		}
	}
};

gridHandler["S"] = function(layout, row, col, grids) {
	if (layout[row][col] === undefined) {
		return;
	}

	gridHandler["B"](layout, row, col, grids);
	// cur row
	if (layout[row][col - 1] !== undefined) {
		if (layout[row][col - 1] !== " ") {
			gridHandler[layout[row][col - 1]](layout, row, col - 1, grids);
		}
	}
	if (layout[row][col + 1] !== undefined) {
		if (layout[row][col + 1] !== " ") {
			gridHandler[layout[row][col + 1]](layout, row, col + 1, grids);
		}
	}

	// pre row
	if (layout[row - 1] !== undefined) {
		if (layout[row - 1][col - 1] !== undefined) {
			if (layout[row - 1][col - 1] !== " ") {
				gridHandler[layout[row - 1][col - 1]](layout, row, col - 1, grids);
			}
		}
		if (layout[row - 1][col] !== " ") {
			gridHandler[layout[row - 1][col]](layout, row, col, grids);
		}
		if (layout[row - 1][col + 1] !== undefined) {
			if (layout[row - 1][col + 1] !== " ") {
				gridHandler[layout[row - 1][col + 1]](layout, row, col + 1, grids);
			}
		}
	}

	// next row
	if (layout[row + 1] === undefined) {
		if (layout[row + 1][col - 1] === undefined) {
			if (layout[row + 1][col - 1] !== " ") {
				gridHandler[layout[row + 1][col - 1]](layout, row, col - 1, grids);
			}
		}
		if (layout[row + 1][col] !== " ") {
			gridHandler[layout[row + 1][col]](layout, row, col, grids);
		}
		if (layout[row + 1][col + 1] === undefined) {
			if (layout[row + 1][col + 1] !== " ") {
				gridHandler[layout[row + 1][col + 1]](layout, row, col + 1, grids);
			}
		}
	}
};

function clear(sessionId, row0, col0, row1, col1, cbFunc) {
	var layout = [];
	for (var i = 0; i < row1 - row0; i++) {
		layout[i] = [];
	}
	dbMgr.getCurLayout(sessionId, onGetCurLayout);

	function onGetCurLayout(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}

		if (reply.length <= 0) {
			dbMgr.getOriginalLayout(sessionId.substr(gConfig.randStr.charNum), onGetLayout);
		} else {
			layout = JSON.parse(reply[0].layout);
			doMove();
		}
	}
	
	function onGetLayout(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}
		
		if (reply === null) {
			cbFunc(new Error("No layout data."), null);
			return;
		}
		
		layout = JSON.parse(reply);
		doMove();
	}

	function doMove() {
		console.log(layout);
		// clear
		var gridsCleared = {};
		_clear(layout, row0, col0, row1, col1, gridsCleared);
		console.log(layout);
		// fill
		_fill(layout, gridsCleared);
		// save
		dbMgr.setCurLayout(sessionId, layout, onSetLayout);
	}

	function onSetLayout(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}
		
		console.log(layout);
		cbFunc(null, layout);
	}

	function _clear(layout, row0, col0, row1, col1, gridsClr) {
		// clear grids
		for (var row = row0; row <= row1; row++) {
			for (var col = col0; col <= col1; col++) {
				debugger;
				console.log(layout[row][col]);
				if (layout[row][col] !== " ") {
					gridHandler[layout[row][col]](layout, row, col, gridsClr);
				}
			}
		}
	}

	function _fill(layout, grids) {
		// get top grids
		var topGrids = {};
		for (var index in grids) {
			var row = Math.floor(parseInt(index) / gConfig.layout.width);
			var column = parseInt(index) % gConfig.layout.height;
			if (topGrids[column] === undefined) {
				while (layout[row][column] && layout[row][column] === " ") {
					row--;
				}
				if (row < 0) {
					row = 0;
				}
				topGrids[column] = row;
			}
		}

		// fall down
		for (var col in topGrids) {
			// calc falling height
			var height = 0;
			var lowestRow = topGrids[col];
			while (layout[lowestRow] && layout[lowestRow][col] === " ") {
				lowestRow++;
			}
			height = row - topGrids[col];

			// fall
			for (var i = height - 1; i >= 0; i--) {
				var r = topGrids[col];
				if (layout[r + i - height]) {
					layout[r + i][col] = layout[r + i - height][col];

	 				var randType = Math.floor(Math.random() * 4);
	 				layout[r + i - height][col] = gConfig.gridType[randType];
	 			} else {
	 				// put random
	 				var randType = Math.floor(Math.random() * 4);
	 				layout[r + i][col] = gConfig.gridType[randType];
	 			}
			}
		}
	}
}

function getRandStr() {
	var str = "";
	var range = gConfig.randStr.range;
	for (var i = 0; i < gConfig.randStr.charNum; i++) {
		var index = Math.floor(Math.random() * range.length);
		str += range.charAt(index);
	}
	
	return str;
}

exports.clear = clear;
exports.getRandStr = getRandStr;
