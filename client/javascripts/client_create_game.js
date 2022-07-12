import {init_game} from "./game_graphics/Pixi.js";
import {ClientSocket} from "./ClientSocket.js";


// client game mode logic
const GAME_MODE_1v1 = "1v1";
const GAME_MODE_2v2 = "2v2";
const GAME_MODE_AI = "AI";
const GAME_MODE_FRIEND = "FRIEND";

let game_mode = GAME_MODE_1v1;

function change_last_selected_button_to_red(){
    switch (game_mode){
        case GAME_MODE_1v1:
            game_mode_to_1v1_button.classList.add("w3-red");
            game_mode_to_1v1_button.classList.remove("w3-green");
            break;
        case GAME_MODE_2v2:
            game_mode_to_2v2_button.classList.add("w3-red");
            game_mode_to_2v2_button.classList.remove("w3-green");
            break;
        case GAME_MODE_AI:
            game_mode_to_AI_button.classList.add("w3-red");
            game_mode_to_AI_button.classList.remove("w3-green");
            break;
        case GAME_MODE_FRIEND:
            game_mode_to_FRIEND_button.classList.add("w3-red");
            game_mode_to_FRIEND_button.classList.remove("w3-green");
            break;
    }
}

const game_mode_to_1v1_button = document.getElementById("game_mode_to_1v1_button");
game_mode_to_1v1_button.addEventListener("click",  function onEvent(event) {
        change_last_selected_button_to_red();
        game_mode = GAME_MODE_1v1;
        game_mode_to_1v1_button.classList.remove("w3-red");
        game_mode_to_1v1_button.classList.add("w3-green");
    }
)

const game_mode_to_2v2_button = document.getElementById("game_mode_to_2v2_button");
game_mode_to_2v2_button.addEventListener("click",  function onEvent(event) {
        change_last_selected_button_to_red();
        game_mode = GAME_MODE_2v2;
        game_mode_to_2v2_button.classList.remove("w3-red");
        game_mode_to_2v2_button.classList.add("w3-green");
    }
)

const game_mode_to_AI_button = document.getElementById("game_mode_to_AI_button");
game_mode_to_AI_button.addEventListener("click",  function onEvent(event) {
        change_last_selected_button_to_red();
        game_mode = GAME_MODE_AI;
        game_mode_to_AI_button.classList.remove("w3-red");
        game_mode_to_AI_button.classList.add("w3-green");
    }
)

const game_mode_to_FRIEND_button = document.getElementById("game_mode_to_FRIEND_button");
game_mode_to_FRIEND_button.addEventListener("click",  function onEvent(event) {
        change_last_selected_button_to_red();
        game_mode = GAME_MODE_FRIEND;
        game_mode_to_FRIEND_button.classList.remove("w3-red");
        game_mode_to_FRIEND_button.classList.add("w3-green");
    }
)


let JSON_response;

function update_timer(main_div, start){

    let delta = Date.now() - start;
    let seconds = (Math.floor(delta / 1000));
    let minutes = Math.floor(seconds / 60);
    let seconds_string = seconds % 60 === 1 ? "second": "seconds";
    let minute_string = minutes > 1 ? "minutes": "minute";
    let minute_text = minutes === 0 ? "": (minutes) + " " + minute_string+ "  :  "

    main_div.querySelector("span").innerText =  minute_text + (seconds % 60)+" "+seconds_string;

}


function match_making_listener(...args){
    const response_type = args[0][0].response_type;
    const response_data = args[0][0].data;
    switch (response_type) {
        case ClientSocket.response_types.FOUND_1v1_OPPONENT:
        case ClientSocket.response_types.FOUND_2v2_OPPONENTS:
            init_game();
    }
}

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
                nick_name: nick,
                game_mode: game_mode,
                map_size: 2500,

            }));

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        JSON_response = JSON.parse(xhr.responseText);

                        localStorage.setItem("player_token", JSON_response.player_token);
                        localStorage.setItem("game_token", JSON_response.game_token);

                        const main_div = document.getElementById("app");
                        console.log(game_mode);

                        if(game_mode === GAME_MODE_1v1 || game_mode === GAME_MODE_2v2 ) {
                            // replace index.html with findingAnOpponent.html
                            main_div.innerHTML = loadFile("/views/findingAnOpponent.html");

                            // starting time
                            const start = Date.now();
                            update_timer(main_div, start);

                            // listen for match up!
                            ClientSocket.add_data_listener(match_making_listener, JSON_response.player_token);

                            // update the timer about every second
                            setInterval(()=> update_timer(main_div, start), 1000);
                        }else{
                            //replace index.html with game.html
                            main_div.innerHTML = loadFile("/views/game.html");
                            init_game();
                        }


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