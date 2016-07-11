require("./global");
var mysql = require("mysql");
var logMgr = require("./logMgr");
var util = require("./util");

var mysqlPara = {
	"host" : gConfig.mysqlConfig.ip,
	"port" : gConfig.mysqlConfig.port,
	"user" : gConfig.mysqlConfig.user,
	"password" : gConfig.mysqlConfig.pwd,
	"database" : gConfig.mysqlConfig.db
};
var mysqlConn = mysql.createConnection(mysqlPara);

mysqlConn.on('error', onMysqlError);
function onMysqlError(err)
{
	logMgr.log(err);
	process.exit(0);
}

function getOriginalLayout(level, cbFunc) {
	mysqlConn.query("SELECT `layout` FROM `original_layout` WHERE `level` = ?",
		[
		parseInt(level)
		],
		onGetLayout
		);

	function onGetLayout(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}

		cbFunc(null, reply[0].layout);
	}
}

function getCurLayout(sessionId, cbFunc) {
	mysqlConn.query("SELECT layout FROM `cur_layout` WHERE session_id = ?",
		[
		sessionId
		],
		onGetLayout
		);

	function onGetLayout(err, reply) {
		if (err !== null) {
			cbFunc(err, null);
			return;
		}

		cbFunc(null, reply);
	}
}

function setCurLayout(sessionId, layout, cbFunc) {
	debugger;
	var level = parseInt(sessionId.substr(gConfig.randStr.charNum));
	mysqlConn.query("INSERT INTO `cur_layout` (session_id, level, layout) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE layout = ?",
		[
		sessionId, level, JSON.stringify(layout), JSON.stringify(layout)
		],
		onSetLayout);

	function onSetLayout(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}

		cbFunc(null, reply);
	}
}

function verifySessionId(sessionId, cbFunc) {
	mysqlConn.query("SELECT session_id FROM `session` WHERE session_id = ?", [sessionId], onGetSessionId);
	
	function onGetSessionId(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}

		cbFunc(null, reply.length > 0);
	}
}

function makeSessionId(level, cbFunc) {
	var sessionId = util.getRandStr() + level;
	var count = 0;
	mysqlConn.query("SELECT session_id FROM `session` WHERE session_id = ?", [sessionId], onGetSessionId);

	function onGetSessionId(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}

		if (reply.length > 0) {
			count++;
			if (count > 3) {
				cbFunc(new Error("make session id error"), null);
				return;
			}
			
			sessionId = util.getRandStr() + level;
			mysqlConn.query("SELECT session_id FROM `session` WHERE session_id = ?", [sessionId], onGetSessionId);
		} else {
			mysqlConn.query("INSERT INTO `session` (session_id) VALUES(?) ON DUPLICATE KEY UPDATE session_id = ?",
				[
					sessionId, sessionId
				],
				onSetSessionId);
		}
	}
	
	function onSetSessionId(err, reply) {
		if (err) {
			cbFunc(err, null);
			return;
		}

		cbFunc(null, sessionId);
	}
}

exports.getOriginalLayout = getOriginalLayout;
exports.getCurLayout = getCurLayout;
exports.setCurLayout = setCurLayout;
exports.verifySessionId = verifySessionId;
exports.makeSessionId = makeSessionId;
