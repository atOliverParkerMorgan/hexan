const http = require("http");
const server = require("socket.io");
const Map = require("./Map");

const PORT_SOCKET = 8082;

const httpServer = http.createServer();
const io = server(httpServer);

function main() {

    io.on("connection", (socket) => {
        let map = new Map(2500, 2);
        map.generate_island_map();
        // test
        console.log(map.a_star(map.all_nodes[map.random_int(0, map.side_length  - 1)][map.random_int(0, map.side_length - 1)],
            map.all_nodes[map.random_int(0, map.side_length  - 1)][map.random_int(0, map.side_length - 1)]));
        // send a message to the client


        socket.emit("server", map.format());


        // receive a message from the client
        socket.on("client", (...args) => {
            console.log(args);
        });
    });

    httpServer.listen(PORT_SOCKET);
}

module.exports = main;