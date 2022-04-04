let socket = new WebSocket('ws://' + window.location.host + '/');
console.log('opening websocket connection');

socket.onopen = function (e){
    // key inputs
    document.addEventListener("keydown", function(event) {
        if (event.key === "W" || "w" || "A" || "a" || "S" || "s" || "D" || "d") {
            socket.send(event.key.toLowerCase());
        }
    });

}

socket.onmessage = function(event) {
    alert(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function(event) {
    if (event.wasClean) {
        alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        alert('[close] Connection died');
    }
};

socket.onerror = function(error) {
    alert(`[error] ${error.message}`);
};

// test
// clientWebsocket.send("test");
function isOpen(ws) { return ws.readyState === ws.OPEN }