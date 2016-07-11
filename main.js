var httpServer = require("./httpServer");
var router = require("./router");

httpServer.run(router.router);
