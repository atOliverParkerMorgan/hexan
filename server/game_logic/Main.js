// const http = require("http");
// const server = require("socket.io");
// const Map = require("./Map");
//
// const PORT_SOCKET = 8082;
//
// const httpServer = http.createServer();
// const io = server(httpServer);
//
// function main() {
//
//     io.on("connection", (socket) => {
//         let map = new Map(2500, 4);
//         map.generate_island_map();
//
//         // send a message to the client
//         socket.emit("server", map.format());
//
//
//         // receive a message from the client
//         socket.on("client", (...args) => {
//             console.log(args);
//         });
//         socket.on("create_game_with_ai", (...args) => {
//             console.log(args);
//         });
//     });
//
//     httpServer.listen(PORT_SOCKET);
// }
//
function main(){}
module.exports = main;