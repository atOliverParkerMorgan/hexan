import {init_game} from "./game_graphics/Pixi.js";

const REQUEST_TYPES = {
    GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
    FIND_MATCH: "FIND_MATCH"
}

let interval_id_timer: any;
let interval_id_match_request: any;

function settings_logic_init(){

    // slider logic
    const args = [400, 900, 1225, 1600, 2025, 2500];
    const element: any = document.querySelector('.slider')

    element.onchange = slider_onchange;
    element?.setAttribute('step', args[0].toString());

    let map_size: number = 1225;
    function slider_onchange() {
        element?.removeAttribute('step')
        map_size = element.value
        for (let i = 0; i < args.length; i++) {
            if (args[i] > map_size) {
                map_size = args[i];
                element.value = args[i]
                break;
            }
        }
        const node_num_text: any =  document.getElementById('number_of_nodes');
        node_num_text.innerText = map_size.toString();
    }

    // game mode button logic
    const GAME_MODE_1v1 = "1v1";
    const GAME_MODE_2v2 = "2v2";
    const GAME_MODE_AI = "AI";
    const GAME_MODE_FRIEND = "FRIEND";

    let game_mode = GAME_MODE_1v1;


    function change_last_selected_button_to_red(){
        switch (game_mode){
            case GAME_MODE_1v1:
                game_mode_to_1v1_button?.classList.add("w3-red");
                game_mode_to_1v1_button?.classList.remove("w3-green");
                break;
            case GAME_MODE_2v2:
                game_mode_to_2v2_button?.classList.add("w3-red");
                game_mode_to_2v2_button?.classList.remove("w3-green");
                break;
            case GAME_MODE_AI:
                game_mode_to_AI_button?.classList.add("w3-red");
                game_mode_to_AI_button?.classList.remove("w3-green");
                break;
            case GAME_MODE_FRIEND:
                game_mode_to_FRIEND_button?.classList.add("w3-red");
                game_mode_to_FRIEND_button?.classList.remove("w3-green");
                break;
        }
    }

    const game_mode_to_1v1_button = document.getElementById("game_mode_to_1v1_button");
    game_mode_to_1v1_button?.addEventListener("click",  function onEvent() {
            change_last_selected_button_to_red();
            game_mode = GAME_MODE_1v1;
            game_mode_to_1v1_button.classList.remove("w3-red");
            game_mode_to_1v1_button.classList.add("w3-green");
        }
    )

    const game_mode_to_2v2_button = document.getElementById("game_mode_to_2v2_button");
    game_mode_to_2v2_button?.addEventListener("click",  function onEvent() {
            change_last_selected_button_to_red();
            game_mode = GAME_MODE_2v2;
            game_mode_to_2v2_button.classList.remove("w3-red");
            game_mode_to_2v2_button.classList.add("w3-green");
        }
    )

    const game_mode_to_AI_button = document.getElementById("game_mode_to_AI_button");
    game_mode_to_AI_button?.addEventListener("click",  function onEvent() {
            change_last_selected_button_to_red();
            game_mode = GAME_MODE_AI;
            game_mode_to_AI_button.classList.remove("w3-red");
            game_mode_to_AI_button.classList.add("w3-green");
        }
    )

    const game_mode_to_FRIEND_button = document.getElementById("game_mode_to_FRIEND_button");
    game_mode_to_FRIEND_button?.addEventListener("click",  function onEvent() {
            change_last_selected_button_to_red();
            game_mode = GAME_MODE_FRIEND;
            game_mode_to_FRIEND_button.classList.remove("w3-red");
            game_mode_to_FRIEND_button.classList.add("w3-green");
        }
    )


    // play button logic
    const play_button: any = document.getElementById("play_button");
    play_button.onclick = ()=> {
        const nick_name = localStorage.getItem("nick_name");
        if(nick_name == null) return;
        //client_socket.send_data("create_game_with_ai", nick);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:8000/", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        console.log(`nick_name: ${nick_name} map_size: ${map_size} game_mode: ${game_mode} request_type: ${REQUEST_TYPES.GENERATE_PLAYER_TOKEN}`)
        xhr.send(JSON.stringify({
            nick_name: nick_name,
            map_size: map_size,
            game_mode: game_mode,
            request_type: REQUEST_TYPES.GENERATE_PLAYER_TOKEN
        }));

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let JSON_response = JSON.parse(xhr.responseText);

                    localStorage.setItem("player_token", JSON_response.player_token);

                    const main_div: any = document.getElementById("app");


                    // replace index.html with findingAnOpponent.html
                    main_div.innerHTML = loadFile("/views/findingAnOpponent.html");

                    // starting time
                    const start = Date.now();
                    update_timer(main_div, start);

                    // update the timer about every second
                    interval_id_timer = setInterval(()=> update_timer(main_div, start), 1000);

                    // send POST request if there is a available match
                    interval_id_match_request = setInterval(() => request_match_status_update(JSON_response.player_token, nick_name, map_size, game_mode), 5000);

                }
            }
        }
    };
}

// ask if there server has a match
function request_match_status_update(player_token: string, nick_name: string, map_size: number, game_mode: string){
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        nick_name: nick_name,
        player_token: player_token,
        map_size: map_size,
        game_mode: game_mode,
        request_type: REQUEST_TYPES.FIND_MATCH
    }));
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // store game token
                let JSON_response = JSON.parse(xhr.responseText);
                localStorage.setItem("game_token", JSON_response.game_token);

                // init game
                const main_div: any = document.getElementById("app");
                //replace index.html with game.html
                main_div.innerHTML = loadFile("/views/game.html");
                init_game();

                clearInterval(interval_id_timer);
                clearInterval(interval_id_match_request);
            }
        }
    }
}

function update_timer(main_div: any, start: number){

    let delta = Date.now() - start;
    let seconds = (Math.floor(delta / 1000));
    let minutes = Math.floor(seconds / 60);
    let seconds_string = seconds % 60 === 1 ? "second": "seconds";
    let minute_string = minutes > 1 ? "minutes": "minute";
    let minute_text = minutes === 0 ? "": (minutes) + " " + minute_string+ "  :  "

    main_div.querySelector("span").innerText =  minute_text + (seconds % 60)+" "+seconds_string;
}

const nick_input: any = document.getElementById("nick_input");
if(nick_input != null) {
    nick_input.addEventListener("keypress", function onEvent(event: any) {
        if (event.key === "Enter" && nick_input.value.length > 0) {
            localStorage.setItem("nick_name", nick_input.value);
            const main_div: any = document.getElementById("app");
            main_div.innerHTML = loadFile("/views/gameSettings.html");
            settings_logic_init()
        }
    });
}

function loadFile(filePath: string) {
    let result = null;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status===200) {
        result = xhr.responseText;
    }
    return result;
}