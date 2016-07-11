var dbMgr = require("./dbMgr");
require("./global");

var gridHandler = {};
gridHandler[" "] = function(layout, row, col, gridsClr, grids) {

};

gridHandler["B"] = function(layout, row, col, gridsClr, grids) {
	layout[row][col] = " ";
	var index = row * gConfig.layout.width + col;
	if (gridsClr[index] === undefined) {
		gridsClr[index] = index;
	}
};

gridHandler["H"] = function(layout, row, col, gridsClr, grids) {
	gridHandler["B"](layout, row, col, grids);
	for (var c = 0; c < gConfig.layout.width; c++) {
		if (layout[row][c] !== " ") {
			if (layout[row][c] === "B") {
				gridHandler[layout[row][c]](layout, row, c, gridsClr, grids);
			} else {
				var index = row * gConfig.layout.width + c;
				if (grids[index] === undefined) {
					grids[index] = index;
				}
			}
		}
	}
};

gridHandler["V"] = function (layout, row, col, gridsClr, grids) {
	gridHandler["B"](layout, row, col, gridsClr, grids);
	for (var r = 0; r < gConfig.layout.height; r++) {
		if (layout[r][col] !== " ") {
			if (layout[r][col] === "B") {
				gridHandler[layout[r][col]](layout, r, col, gridsClr, grids);
			} else {
				var index = r * gConfig.layout.width + col;
				if (grids[index] === undefined) {
					grids[index] = index;
				}
			}
		}
	}
};

gridHandler["S"] = function(layout, row, col, gridsClr, grids) {
	if (layout[row][col] === undefined) {
		return;
	}

	gridHandler["B"](layout, row, col, gridsClr, grids);

    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (layout[i] === undefined || layout[i][j] === undefined) {
                continue;
            }
            if (layout[i][j] === " ") {
                continue;
            }
            if (layout[i][j] === "B") {
				gridHandler[layout[i][j]](layout, i, j, gridsClr, grids);
            } else {
				var index = i * gConfig.layout.width + j;
				if (grids[index] === undefined) {
					grids[index] = index;
				}
            }
        }
    }
};

// ====================================================
// test
	/*var layout = [];
    layout[0] = ["H","B","B","B","S","B","B","B"];
    layout[1] = ["B","B","B","B","B","B","B","B"];
    layout[2] = ["B","S","B","B","B","B","B","B"];
    layout[3] = ["B","B","B","B","V","B","B","B"];
    layout[4] = ["B","H","B","B","B","B","B","B"];
    layout[5] = ["S","B","B","B","B","S","B","B"];
    layout[6] = ["B","B","B","B","B","B","B","B"];
    layout[7] = ["B","B","B","B","B","B","B","B"];*/
// ===================================================
function clear(sessionId, row0, col0, row1, col1, cbFunc) {
	var layout = [];
	for (var i = 0; i < row1 - row0; i++) {
		layout[i] = [];
	}
	dbMgr.getCurLayout(sessionId, onGetCurLayout);
    doMove();

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
		// clear
		var gridsCleared = {};
		_clear(layout, row0, col0, row1, col1, gridsCleared);
		// fill
		_fill(layout, gridsCleared);
		// save
		dbMgr.setCurLayout(sessionId, layout, onSetLayout);
		cbFunc(null, layout);
	}

	function onSetLayout(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}
		
		cbFunc(null, layout);
	}

	function _clear(layout, row0, col0, row1, col1, gridsClr) {
		// clear grids
		var needClear = {};
		for (var row = row0; row <= row1; row++) {
			for (var col = col0; col <= col1; col++) {
				if (layout[row][col] !== " ") {
					gridHandler[layout[row][col]](layout, row, col, gridsClr, needClear);
				}
			}
		}

		clearNeed(gridsClr, needClear);
	}

	function clearNeed(gridsClr, needClear) {
		var isEmpty = true;
		var needClear2 = {};
		for (var index in needClear) {
			isEmpty = false;
			var r = Math.floor(parseInt(index) / gConfig.layout.width);
			var c = parseInt(index) % gConfig.layout.width;
			gridHandler[layout[r][c]](layout, r, c, gridsClr, needClear2);
		}

		if (!isEmpty) {
			clearNeed(gridsClr, needClear2);
		}
	}

	function _fill(layout, grids) {
		// get top grids
		var topGrids = {};
		for (var index in grids) {
			var row = Math.floor(parseInt(index) / gConfig.layout.width);
			var column = parseInt(index) % gConfig.layout.width;
			if (topGrids[column] === undefined) {
				while (layout[row] && layout[row][column] === " ") {
					row--;
				}
				topGrids[column] = row + 1;
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
			height = lowestRow - topGrids[col];

			// fall
            for (var i = topGrids[col] - 1; i >= 0; i--) {
                layout[i + height][col] = layout[i][col];
            }
            // fill
            for (var j = 0; j < height; j++) {
                var randType = Math.floor(Math.random() * 4);
                layout[j][col] = gConfig.gridType[randType];
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
