export let player_token;
export let game_token;

let JSON_response;

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
                        player_token = JSON_response.player_token;
                        game_token = JSON_response.game_token;

                        localStorage && (localStorage.player_token = player_token);
                        localStorage && (localStorage.game_token = game_token);

                        window.location.replace("http://127.0.0.1:8000/game");
                    }
                }
            }
        }
    });
}