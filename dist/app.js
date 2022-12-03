"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
var http_errors_1 = __importDefault(require("http-errors"));
var IndexController_1 = __importDefault(require("./routes/IndexController"));
var path = __importStar(require("path"));
var express_1 = __importDefault(require("express"));
var ejs_1 = require("ejs");
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var ServerSocket_1 = require("./server_logic/ServerSocket");
var App;
(function (App) {
    App.app = (0, express_1.default)();
    var port = 8000;
    var controller = new IndexController_1.default();
    function init() {
        App.httpServer = (0, http_1.createServer)(App.app);
        App.io = new socket_io_1.Server(App.httpServer);
        init_view_engine();
        init_static_routes();
        init_controllers();
        App.httpServer.listen(port);
        ServerSocket_1.ServerSocket.add_request_listener();
        ServerSocket_1.ServerSocket.add_response_listener();
    }
    App.init = init;
    function init_view_engine() {
        App.app.engine('html', ejs_1.renderFile);
        App.app.set('views', path.join(__dirname, 'views'));
        App.app.set('view engine', 'html');
        App.app.use((0, cookie_parser_1.default)());
        App.app.use(express_1.default.json());
        App.app.use(express_1.default.urlencoded({ extended: false }));
    }
    function init_controllers() {
        // use all controller routers
        App.app.use('/', controller.router);
    }
    function init_static_routes() {
        // html files
        App.app.use('/views', express_1.default.static(__dirname + '/views/'));
        // static public files
        App.app.use('/javascript', express_1.default.static(__dirname + '/client_logic/'));
        App.app.use('/stylesheets', express_1.default.static(__dirname + '/stylesheets/'));
        App.app.use('/images', express_1.default.static(__dirname + '/images/'));
        // modules
        App.app.use('/pixi', express_1.default.static(__dirname + '/../node_modules/pixi.js/dist/browser/'));
        App.app.use('/pixi_extras', express_1.default.static(__dirname + '/../node_modules/@pixi/graphics-extras/dist/browser/'));
        App.app.use('/pixi_viewport', express_1.default.static(__dirname + '/../node_modules/pixi-viewport/dist/'));
        App.app.use('/socket.io-client', express_1.default.static(__dirname + '/../node_modules/socket.io-client/dist/'));
        App.app.use('/springy', express_1.default.static(__dirname + '/../node_modules/springy/'));
    }
    function handle_error() {
        App.app.use(function (req, res, next) {
            next((0, http_errors_1.default)(404));
        });
        App.app.use(function (err, req, res) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            // render the error page
            console.error(err);
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }
    App.handle_error = handle_error;
    function server_info() {
        var host = App.httpServer.address().address;
        var port = App.httpServer.address().port;
        console.log("hexan is running at http://".concat(host, ":").concat(port));
    }
    App.server_info = server_info;
})(App = exports.App || (exports.App = {}));
App.init();
App.handle_error();
App.server_info();
