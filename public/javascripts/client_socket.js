class Client_socket{
    constructor() {
        this.socket = io("ws://127.0.0.1:8082",  { transports : ['websocket'] });
    }

    send_data(event, data){
        this.socket.emit("client", "test");
    }

    get_data(fun){
        this.socket.on("server", (...args) => {
           //map = args;
        });
    }


}