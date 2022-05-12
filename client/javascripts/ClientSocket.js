// singleton
export const ClientSocket = {
    socket: io("ws://127.0.0.1:8082", {transports: ['websocket']}),

    send_data: (data)=>{
        ClientSocket.socket.emit("send-data", data);
    },

    add_data_listener: (fun, player_token)=>{
        ClientSocket.socket.on(player_token, (...args) => {
            console.log(args[0]);
            fun(args);
        });
    },

    get_data(request, game_token, player_token) {
        ClientSocket.socket.emit("get-data", {
            request: request,
            game_token: game_token,
            player_token: player_token


        })
    },

    set_token() {

    },
}