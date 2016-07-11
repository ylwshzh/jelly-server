/**
 * Created by Ryan on 2016/7/6.
 */
var fs = require("fs");

function makeCurTimeStr() {
    var curDate = new Date();
    var timeStr = "[" +
        curDate.getFullYear() + "-" + curDate.getMonth() + "-" + curDate.getDate() +
        " " + curDate.getHours() + ":" + curDate.getMinutes() + ":" + curDate.getSeconds() +
    "]";

    return timeStr;
}

function makeLogFileName() {
    var curDate = new Date();
    var fileName = "./log/" +
        curDate.getFullYear() + "-" + curDate.getMonth() + "-" + curDate.getDate() +
        ".log";

    return fileName;
}

function log(infoStr) {
    console.log(infoStr);
	var data = makeCurTimeStr();
	data += infoStr;
    var fileName = makeLogFileName();
    fs.appendFile(fileName, infoStr, onWriteFile);

    function onWriteFile(err) {
        if (err) {
            console.log("Write log failed!");
			process.exit(0);
        }
    }
}

exports.log = log;
