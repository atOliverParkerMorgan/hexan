import {ClientSocket} from "./ClientSocket.js";

// Preload the HTML file
async function preloadHtmlFiles(urls: string[]){
    for (const url of urls) {
        try {
            console.log(`${window.location.protocol}//${window.location.hostname}:${window.location.port}:${window.location.port}/${url}`)
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/${url}`);
            const html = await response.text();
            // Cache the HTML in the browser
            const cache = await window.caches.open("html-preload");
            await cache.put(url, new Response(html));

        } catch (error: any) {
            console.error(`Error preloading HTML file ${window.location.protocol}//${window.location.hostname}:${window.location.port}: ${error.message}`);
        }
    }
}


export let interval_id_timer: any;
export function settingsLogicInit(){

    // setup nickname
    (<HTMLInputElement>document.getElementById("nickname")).textContent = localStorage.getItem("nickname");

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
    // const GAME_MODE_AI = "AI";
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

    const game_mode_rules = document.getElementById("game_mode_rules");
    game_mode_rules?.addEventListener("click",  function onEvent() {
            const main_div: any = document.getElementById("app");
            loadFile("/views/gameRules.html").then((html_file)=>{
                main_div.innerHTML = html_file;
                const rulesBackArrow: any = document.getElementById("rulesBackArrow");

                (<HTMLInputElement>rulesBackArrow).onclick = () => {
                    const main_div: any = document.getElementById("app");
                    loadFile("/views/gameSettings.html").then((html_file)=>{
                            main_div.innerHTML = html_file;
                            settingsLogicInit()
                    });
                }

                const enButton: any = document.getElementById("enButton");
                const czButton: any = document.getElementById("czButton");


                enButton.onclick = () =>{
                    (<any> document).getElementById('cs').style.display='none';
                    (<any> document).getElementById('en').style.display='block';
                    enButton.classList.remove("w3-red");
                    enButton.classList.add("w3-green");
                    czButton.classList.remove("w3-green");
                    czButton.classList.add("w3-red");
                }

                czButton.onclick = () => {
                    (<any> document).getElementById('cs').style.display='block';
                    (<any> document).getElementById('en').style.display='none';
                    czButton.classList.remove("w3-red");
                    czButton.classList.add("w3-green");
                    enButton.classList.remove("w3-green");
                    enButton.classList.add("w3-red");

                }
            });
        }
    )

    const game_mode_to_FRIEND_button = document.getElementById("game_mode_to_FRIEND_button");

    game_mode_to_FRIEND_button?.addEventListener("click",  function onEvent() {
        changeLastSelectedButtonToRed();
        game_mode = GAME_MODE_FRIEND;
        game_mode_to_FRIEND_button.classList.remove("w3-red");
        game_mode_to_FRIEND_button.classList.add("w3-green");

        let friend_code: any;
        const main_div: any = document.getElementById("app");
        loadFile("/views/friendSettings.html").then((html_file)=>{
            main_div.innerHTML = html_file;
            // arrow back logic
            const friendSettingsBackArrow: any = document.getElementById("friendBackArrow");
            (<HTMLInputElement>friendSettingsBackArrow).onclick = () => {
                const main_div: any = document.getElementById("app");
                loadFile("/views/gameSettings.html").then((html_file)=>{
                    main_div.innerHTML = html_file;
                    settingsLogicInit();
                });

            }


            // connect
            ClientSocket.connect();
            ClientSocket.socket.on("connect", ()=>{
                (<HTMLInputElement>document.getElementById("code")).innerText =  ClientSocket.socket.id.substring(0, 5);
                ClientSocket.sendData(ClientSocket.request_types.GENERATE_FRIEND_TOKEN,
                    {
                        map_size: map_size
                    })
                ClientSocket.addDataListener();
            });
            const copy_button: HTMLElement | null = document.getElementById("copy_button");
            if(copy_button != null) {
                copy_button.onclick = () => {
                    // Copy the text inside the text field
                    navigator.clipboard.writeText(friend_code)
                        .then(() => {
                            // change icon
                            copy_button.classList.remove("fa-copy")
                            copy_button.classList.add("fa-check")
                        })
                        .catch(()=>{
                            console.error("Error, something went wrong")
                        });
                }
            }

            const connect_button: any = document.getElementById("connect_button");
            connect_button.onclick = ()=>{
                const friend_code: any = (<HTMLInputElement>document.getElementById("friend_code")).value;
                if(friend_code.length != 5){
                    (<HTMLInputElement>document.getElementById("error_msg")).innerText = "Invalid friend code! Must be 5 characters long.";
                }
                else {
                    (<HTMLInputElement>document.getElementById("error_msg")).innerText = "";

                    ClientSocket.sendData(ClientSocket.request_types.CONNECT_WITH_FRIEND, {
                        friend_code: friend_code

                    })
                }
            }
        });
    })

    const edit_nickname_button: any = document.getElementById("editNicknameButton");
    edit_nickname_button.onclick = ()=>{
        const currentNickname = localStorage.getItem("nickname");
        localStorage.removeItem("nickname");

        const main_div: any = document.getElementById("app");
        loadFile("/views/nicknameSettings.html").then((html_file)=>{
            main_div.innerHTML = html_file;
            (<any>document.getElementById("nick_input")).value = currentNickname;
            checkForNicknameInput();
        });
    }

    // play button logic
    const play_button: any = document.getElementById("play_button");

    play_button.onclick = () => {
        const nickname = localStorage.getItem("nickname");
        if (nickname == null) return;

        const main_div: any = document.getElementById("app");

        // replace index.html with findingAnOpponent.html
        loadFile("/views/findingAnOpponent.html").then((html_file)=>{
            main_div.innerHTML = html_file;
            // starting time
            const start = Date.now();
            updateTimer(main_div, start);

            // update the timer about every second
            interval_id_timer = setInterval(() => updateTimer(main_div, start), 1000);

            ClientSocket.connect();

            if (game_mode === GAME_MODE_1v1) {
                ClientSocket.addDataListener()
                ClientSocket.sendData(ClientSocket.request_types.FIND_1v1_OPPONENT,
                    {
                        map_size: map_size
                    });
            }
        });
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


function checkForNicknameInput() {
    // load right away if a nickname exists
    if(localStorage.getItem("nickname") != null){
        const main_div: any = document.getElementById("app");
        loadFile("/views/gameSettings.html").then((html_file)=> {
           main_div.innerHTML = html_file;
           settingsLogicInit();
        });
    }

    const nick_input: any = document.getElementById("nick_input");
    if (nick_input != null) {
        nick_input.addEventListener("keypress", function onEvent(event: any) {
            if (event.key === "Enter" && nick_input.value.length > 0) {
                localStorage.setItem("nickname", nick_input.value);
                const main_div: any = document.getElementById("app");
                loadFile("/views/gameSettings.html").then((html_file)=> {
                    main_div.innerHTML = html_file;
                    settingsLogicInit();
                });

            }
        });
    }
}

// export function loadFile(filePath: string) {
//     let result = null;
//     let xhr = new XMLHttpRequest();
//     xhr.open("GET", filePath, false);
//     xhr.send();
//     if (xhr.status===200) {
//         result = xhr.responseText;
//     }
//     return result;
// }

// Get the HTML data from cache
export async function loadFile(url: string){
    try {
        // Search for the cached HTML file
        const cache = await window.caches.open('html-preload');
        const cachedResponse = await cache.match(url);
        if (!cachedResponse) {
            return null;
        }
        // Return the HTML data
        const htmlData = await cachedResponse.text();
        return htmlData;
    } catch (error: any) {
        console.error(`Error retrieving HTML file ${url} from cache: ${error.message}`);
        return null;
    }
}

// preload all files
preloadHtmlFiles(['views/gameSettings.html', 'views/friendSettings.html', 'views/gameRules.html', 'views/findingAnOpponent.html', 'views/nicknameSettings.html', 'views/unit_item.html',  'views/game.html']).then(()=>{
    (<any>document.getElementById("loading")).style.display = 'none';
    (<any>document.getElementById("nick_input_form")).style.display = 'block';
    // check for input by default because index page starts on nickname input
    checkForNicknameInput();
})