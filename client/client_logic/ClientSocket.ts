// singleton

export namespace ClientSocket {
    export const response_types: {readonly MAP_RESPONSE: string, readonly UNITS_RESPONSE: string,
                                readonly ALL_RESPONSE: string, readonly UNIT_MOVED_RESPONSE: string,
                                readonly MENU_INFO_RESPONSE: string, readonly FOUND_1v1_OPPONENT: string,
                                readonly FOUND_2v2_OPPONENTS: string} = {
        // game play
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",

        // match making
        FOUND_1v1_OPPONENT: "FOUND_1v1_OPPONENT",
        FOUND_2v2_OPPONENTS: "FOUND_2v2_OPPONENTS"

    };
    export const request_types:{readonly GET_MAP: string, readonly GET_UNITS: string, readonly GET_ALL: string,
                            readonly GET_MENU_INFO: string, readonly PRODUCE_UNIT: string, readonly MOVE_UNITS: string,
                            readonly FIND_1v1_OPPONENT: string, readonly FIND_2v2_OPPONENTS: string } = {
        // game play
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        PRODUCE_UNIT: "PRODUCE_UNIT",
        MOVE_UNITS: "MOVE_UNIT",

        // match making
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };
    // @ts-ignore
    export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("ws://127.0.0.1:3000", {transports: ['websocket']});

    export function send_data(data: any): void{
        ClientSocket.socket.emit("send-data", data);
    }

    export function add_data_listener(fun: (...args: any[]) => void, player_token: string): void{
        console.log("add_data_listener");
        ClientSocket.socket.on(player_token, (...args: any[]) => {
            console.log("RESPONSE: "+args[0].response_type);
            fun(args);
        });
    }

    export function get_data(request_type: string, game_token: string, player_token: string): void{
        console.log("REQUEST: "+request_type);
        ClientSocket.socket.emit("get_data", {
            request_type: request_type,
            data: {
                game_token: game_token,
                player_token: player_token
            }
        })
    }
}