import {ClientSocket} from "./ClientSocket.js";

const nick_input = document.getElementById("nick_input");
const client_socket = new ClientSocket();
nick_input.addEventListener("keypress", function onEvent(event) {
    let nick = nick_input.value;
    if (event.key === "Enter" && nick.length > 0) {
        client_socket.send_data("create_game_with_ai", nick);
    }
});