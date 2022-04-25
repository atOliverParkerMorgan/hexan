import {ClientSocket} from "./ClientSocket.js";

const nick_input = document.getElementById("nick_input");
//const client_socket = new ClientSocket();
nick_input.addEventListener("keypress", function onEvent(event) {
    let nick = nick_input.value;
    if (event.key === "Enter" && nick.length > 0) {
        //client_socket.send_data("create_game_with_ai", nick);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:8000/", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            value: nick
        }));
        xhr.onreadystatechange = ()=>
        {
            if (xhr.readyState === 4) {window.location.reload();
                if (xhr.status === 200) {
                    const token = xhr.response;
                    console.log(token);
                    window.location.replace("http://127.0.0.1:8000?token="+token);
                }
            }
        }
    }
});