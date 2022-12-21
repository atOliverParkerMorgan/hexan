import {XMLHttpRequest} from "aws-sdk/lib/http_response";
import {ClientSocket} from "./ClientSocket.js";

const REQUEST_TYPES = {
    GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
    FIND_MATCH: "FIND_MATCH",
    START_GAME: "START_GAME"
}

export let interval_id_timer: any;
export let interval_id_start_game: any;

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

        const main_div: any = document.getElementById("app");

        // replace index.html with findingAnOpponent.html
        main_div.innerHTML = loadFile("/views/findingAnOpponent.html");

        if(game_mode === GAME_MODE_AI){
            const title = document.querySelector("#title");
            if(title != null) {
                title.textContent = "LOADING AI";
            }
        }

        // starting time
        const start = Date.now();
        update_timer(main_div, start);

        // update the timer about every second
        interval_id_timer = setInterval(()=> update_timer(main_div, start), 1000);

        // connect to socket.io
        ClientSocket.connect();
        // client-side
        ClientSocket.socket.on("connect", () => {
            ClientSocket.add_data_listener(ClientSocket.socket.id)
            ClientSocket.send_data({request_type: ClientSocket.request_types.FIND_1v1_OPPONENT,
                data:{ map_size: map_size}
            });
        });


    };
}

function show_opponent_found(){
    const info_div: any = document.getElementById("info");
    info_div.innerHTML = loadFile("/views/opponent_found.html");
}

function show_waiting_for_opponent_to_accept(){
    const info_div: any = document.getElementById("info");
    info_div.innerHTML = loadFile("/views/waiting_for_opponent.html");
}

function show_opponent_didnt_accept(){
    const info_div: any = document.getElementById("info");
    info_div.innerHTML = loadFile("/views/opponent_didnt_accept.html");
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

export function loadFile(filePath: string) {
    let result = null;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status===200) {
        result = xhr.responseText;
    }
    return result;
}