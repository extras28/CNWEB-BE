#!/usr/bin/env node
var { server: WebSocketServer } = require("websocket");
const answerController = require("../controllers/answerController");

/**
 * @type {WebSocketServer}
 */
let wsServer;

let conns = [];

/**
 *
 * @param {http.Server} httpServer
 */
function bindHttpServer(httpServer) {
    wsServer = new WebSocketServer({
        httpServer: httpServer,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false,
    });

    function originIsAllowed(origin) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }

    wsServer.on("request", function (request) {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            request.reject();
            console.log(new Date() + " Connection from origin " + request.origin + " rejected.");
            return;
        }

        var connection = request.accept(null, request.origin);
        console.log(new Date() + " Connection accepted.");
        connection.on("message", function (message) {
            if (message.type === "utf8") {
                // console.log("Received Message: " + message.utf8Data);
                connection.sendUTF(JSON.stringify(message.utf8Data));
                answerController.create(message.utf8Data);
                
            } else if (message.type === "binary") {
                console.log("Received Binary Message of " + message.binaryData.length + " bytes");
                connection.sendBytes(JSON.stringify(message.binaryData));
            }

            conns.push(connection);

            wsServer.broadcastUTF(message.utf8Data);
        });
        connection.on("close", function (reasonCode, description) {
            console.log(new Date() + " Peer " + connection.remoteAddress + " disconnected.");
        });
    });
}

module.exports.bindHttpServer = bindHttpServer;
