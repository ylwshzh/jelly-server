var httpServer = require("./httpServer");
var dbMgr = require("./dbMgr");
var util = require("./util");
var logMgr = require("./logMgr");

function startLevel(response, query) {
	var res = "";
	if (query.level === undefined || isNaN(query.level)) {
		res = gRes.invalidParams;
		return httpServer.response(response, res);
	}

	dbMgr.getOriginalLayout(query.level, onGetLayout);

	var layoutStr = "";
	function onGetLayout(err, reply) {
		if (err) {
			logMgr.log(String(err));
			res = gRes.dbError;
			return httpServer.response(response, res);
		}

		var layout = JSON.parse(reply);
		for (var i = 0; i < layout.length; i++) {
			var rowStr = "";
			for (var j = 0; j < layout[i].length; j++) {
				rowStr += layout[i][j];
			}
			layoutStr += rowStr + "\n";
		}
		
		dbMgr.makeSessionId(query.level, onMakeSessionId);
	}
	
	function onMakeSessionId(err, reply) {
		if (err) {
			logMgr.log(String(err));
			res = gRes.dbError;
			return httpServer.response(response, res);
		}
		
		res = reply + "\n" +
			layoutStr.substr(0, layoutStr.length - 1);
		httpServer.response(response, res);
	}
}

function move(response, query) {
	var res = "";
	dbMgr.verifySessionId(query.sessionId, onVerify);
		util.clear(query.sessionId,
			parseInt(query.row0), parseInt(query.col0),
			parseInt(query.row1), parseInt(query.col1),
			onClear);

	function onVerify(err, isRight) {
		if (err) {
			logMgr.log(String(err));
			res = gRes.dbError;
			return httpServer.response(response, res);
		}

		if (!isRight) {
			res = gRes.invalidParams;
			return httpServer.response(response, res);
		}
		if (query.row0 < 0 || query.row0 > gConfig.layout.height ||
			query.col0 < 0 || query.col0 > gConfig.layout.width ||
			query.row1 < 0 || query.row1 > gConfig.layout.height ||
			query.col1 < 0 || query.col1 > gConfig.layout.width) {
			res = gRes.invalidParams;
			return httpServer.response(response, res);
		}

		util.clear(query.sessionId,
			parseInt(query.row0), parseInt(query.col0),
			parseInt(query.row1), parseInt(query.col1),
			onClear);
	}

	function onClear(err, reply) {
		if (err) {
			logMgr.log(String(err));
			res = gRes.dbError;
			return httpServer.response(response, res);
		}

		var layout = reply;
		var layoutStr = "";
		for (var i = 0; i < layout.length; i++) {
			var rowStr = "";
			for (var j = 0; j < layout[i].length; j++) {
				rowStr += layout[i][j];
			}
			layoutStr += rowStr + "\n";
		}
		httpServer.response(response, layoutStr.substr(0, layoutStr.length - 1));
	}
}

exports.startLevel = startLevel;
exports.move = move;
