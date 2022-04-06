
const socket = io("ws://127.0.0.1:8082",  { transports : ['websocket'] });

socket.emit("client", "test");

socket.on("server", (...args) => {
    console.log(args);
});