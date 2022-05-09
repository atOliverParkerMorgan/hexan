const server = require("socket.io");
const http = require("http");
const httpServer = http.createServer();
const io = server(httpServer);

const PORT_SOCKET = 8082;

const KNIGHT = 0;
const ARCHER = 1;

let is_listening = false;

function init() {
    if (!is_listening) {
        httpServer.listen(PORT_SOCKET);
        is_listening = true;
    }
}

function send_data(player, data){
    io.on("connection", (socket) => {
        socket.emit(player.token, data);
    });
}

function receive_data(game){
    io.on("connection", (socket) => {
        // receive a message from the client
        socket.on(game.token, (...args) => {
            const request_data = args[0];
            if(request_data.request_type === KNIGHT){
                const player = game.get_player(request_data.token);
                if(player == null) return;
                const city = game.get_city(request_data.city_name, player);
                if(city == null) return;
                console.log(player);
                console.log(request_data.city_name);
                console.log(city);
                city.start_production(5000);
            }
        });
    });
}

module.exports.init = init;
module.exports.send_data = send_data;
module.exports.receive_data = receive_data;