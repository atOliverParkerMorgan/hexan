// singleton
export const ClientSocket = {

    response_types: {
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED: "UNIT_MOVED"
    },
    request_types: {
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        PRODUCE_UNIT: "PRODUCE_UNIT",
        MOVE_UNITS: "MOVE_UNIT",
    },
    socket: io("ws://127.0.0.1:8082", {transports: ['websocket']}),

    send_data: (data)=>{
        ClientSocket.socket.emit("send-data", data);
    },

    add_data_listener: (fun, player_token)=>{
        ClientSocket.socket.on(player_token, (...args) => {
            console.log("RESPONSE: "+args[0]);
            fun(args);
        });
    },

    get_data(request_type, game_token, player_token) {
        ClientSocket.socket.emit("get-data", {
            request_type: request_type,
            data: {
                game_token: game_token,
                player_token: player_token
            }
        })
    },

    set_token() {

    },
}