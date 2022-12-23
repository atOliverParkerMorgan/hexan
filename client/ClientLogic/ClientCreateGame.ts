import {XMLHttpRequest} from "aws-sdk/lib/http_response";
import {ClientSocket} from "./ClientSocket.js";

const REQUEST_TYPES = {
    GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
    FIND_MATCH: "FIND_MATCH",
    START_GAME: "START_GAME"
}

export let interval_id_timer: any;
export function settingsLogicInit(){

    // slider logic
    const args = [400, 900, 1225, 1600, 2025, 2500];
    const element: any = document.querySelector('.slider')

    element.onchange = sliderOnchange;
    element?.setAttribute('step', args[0].toString());

    let map_size: number = 1225;
    function sliderOnchange() {
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


    function changeLastSelectedButtonToRed(){
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
            changeLastSelectedButtonToRed();
            game_mode = GAME_MODE_1v1;
            game_mode_to_1v1_button.classList.remove("w3-red");
            game_mode_to_1v1_button.classList.add("w3-green");
        }
    )

    const game_mode_to_2v2_button = document.getElementById("game_mode_to_2v2_button");
    game_mode_to_2v2_button?.addEventListener("click",  function onEvent() {
            changeLastSelectedButtonToRed();
            game_mode = GAME_MODE_2v2;
            game_mode_to_2v2_button.classList.remove("w3-red");
            game_mode_to_2v2_button.classList.add("w3-green");
        }
    )

    const game_mode_to_AI_button = document.getElementById("game_mode_to_AI_button");
    game_mode_to_AI_button?.addEventListener("click",  function onEvent() {
            changeLastSelectedButtonToRed();
            game_mode = GAME_MODE_AI;
            game_mode_to_AI_button.classList.remove("w3-red");
            game_mode_to_AI_button.classList.add("w3-green");
        }
    )

    const game_mode_to_FRIEND_button = document.getElementById("game_mode_to_FRIEND_button");
    game_mode_to_FRIEND_button?.addEventListener("click",  function onEvent() {
            changeLastSelectedButtonToRed();
            game_mode = GAME_MODE_FRIEND;
            game_mode_to_FRIEND_button.classList.remove("w3-red");
            game_mode_to_FRIEND_button.classList.add("w3-green");
        }
    )


    // play button logic
    const play_button: any = document.getElementById("play_button");

    play_button.onclick = () => {
        const nick_name = localStorage.getItem("nick_name");
        console.log("Nick Name: ", nick_name)
        if (nick_name == null) return;

        const main_div: any = document.getElementById("app");

        // replace index.html with findingAnOpponent.html
        main_div.innerHTML = loadFile("/views/findingAnOpponent.html");

        // starting time
        const start = Date.now();
        updateTimer(main_div, start);

        // update the timer about every second
        interval_id_timer = setInterval(() => updateTimer(main_div, start), 1000);

        ClientSocket.connect();

        if (game_mode === GAME_MODE_AI) {
            (<HTMLInputElement>document.querySelector("#title")).textContent = "LOADING AI";

            console.log("LOADING AI");
            ClientSocket.addDataListener()
            ClientSocket.sendData(ClientSocket.request_types.FIND_AI_OPPONENT,
                {
                    map_size: map_size
                });


        } else if (game_mode === GAME_MODE_1v1) {
            console.log("LOADING 1v1");
            ClientSocket.addDataListener()
            ClientSocket.sendData(ClientSocket.request_types.FIND_1v1_OPPONENT,
                {
                    map_size: map_size
                });
        }


    };
}

function updateTimer(main_div: any, start: number){

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
            settingsLogicInit()
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