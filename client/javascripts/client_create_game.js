import {init_game} from "./game_graphics/Pixi.js";

let JSON_response;

localStorage.clear()
const nick_input = document.getElementById("nick_input");
if(nick_input != null) {
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

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        JSON_response = JSON.parse(xhr.responseText);

                        localStorage.setItem("player_token", JSON_response.player_token);
                        localStorage.setItem("game_token", JSON_response.game_token);

                        const main_div = document.getElementById("app");

                        // replace index.html with game.html
                        main_div.innerHTML = loadFile("/views/game.html");
                        init_game();
                        // window.location.replace("http://127.0.0.1:8000/");

                    }
                }
            }
        }
    });
}
function loadFile(filePath) {
    let result = null;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status===200) {
        result = xhr.responseText;
    }
    return result;
}