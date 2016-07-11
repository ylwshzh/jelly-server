/**
 * Created by Ryan on 2016/7/5.
 */

var layout = {};
layout.width = 8;
layout.height = 8;
global.gConfig = {};
global.gConfig.layout = layout;

global.gConfig.gridType = ["B", "H", "V", "S"];
global.gConfig.mysqlConfig = {
	"ip" : "127.0.0.1",
    "port" : 3306,
    "user" : "root",
    "pwd" : "root@mysql",
    "db" : "jelly"
};

global.gConfig.randStr = {
    "range": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
    "charNum": 6
};

global.gRes = {
    "invalidParams" : "INVALID PARAMS",
    "dbError" : "DATABASE ERROR",
    "otherError" : "OTHER ERROR"
};
