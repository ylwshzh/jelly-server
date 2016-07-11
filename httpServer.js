/**
 * Created by Ryan on 2016/7/6.
 */

var http = require("http");
var url = require("url");
var querystring = require("querystring");

function run(router) {
    function onRequest(request, response) {
        console.log("Request received.");

        var urlObj = url.parse(request.url);
		console.log(urlObj.pathname);
		if (typeof router[urlObj.pathname] === "function") {
			router[urlObj.pathname](response, querystring.parse(urlObj.query));
		} else {
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write("hello");
			response.end();
		}
    }

    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
}

function response(response, str) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(str);
    response.end();
}

exports.run = run;
exports.response = response;
