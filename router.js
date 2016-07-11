var handler = require("./handler");

var router = {};

router["/start-level"] = handler.startLevel;
router["/move"] = handler.move;

exports.router = router;
