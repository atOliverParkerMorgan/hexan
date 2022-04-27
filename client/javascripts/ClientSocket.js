export class ClientSocket{
    constructor(player_token, game_token){
        this.game_token = game_token;
        this.player_token = player_token;
        this.socket = io("ws://127.0.0.1:8082",  { transports : ['websocket'] });
    }

    send_data(data){
        this.socket.emit(this.game_token, data);
    }

    get_data(fun){
        this.socket.on(this.player_token, (...args) => {
            fun(args);
        });

    }

    set_token(){

    }





}