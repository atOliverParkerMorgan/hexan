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
var http_errors_1 = __importDefault(require("http-errors"));
var IndexController_1 = __importDefault(require("./routes/IndexController"));
var path = __importStar(require("path"));
var express_1 = __importDefault(require("express"));
var ejs_1 = require("ejs");
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var App = /** @class */ (function () {
    function App(port) {
        var controllers = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            controllers[_i - 1] = arguments[_i];
        }
        this.app = (0, express_1.default)();
        this.controllers = controllers;
        this.port = port;
    }
    App.prototype.init = function () {
        this.init_view_engine();
        this.init_static_routes();
        this.init_controllers();
        this.server_socket_connection();
    };
    App.prototype.init_view_engine = function () {
        this.app.engine('html', ejs_1.renderFile);
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'html');
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
    };
    App.prototype.init_controllers = function () {
        var _this = this;
        // use all controller routers
        this.controllers.forEach(function (controller) {
            _this.app.use('/', controller.router);
        });
    };
    App.prototype.init_static_routes = function () {
        // html files
        this.app.use('/views', express_1.default.static(__dirname + '/views/'));
        // static public files
        this.app.use('/javascript', express_1.default.static(__dirname + '/client_logic/'));
        this.app.use('/stylesheets', express_1.default.static(__dirname + '/stylesheets/'));
        this.app.use('/images', express_1.default.static(__dirname + '/images/'));
        // modules
        this.app.use('/pixi', express_1.default.static(__dirname + '/../node_modules/pixi.js/dist/browser/'));
        this.app.use('/pixi_extras', express_1.default.static(__dirname + '/../node_modules/@pixi/graphics-extras/dist/browser/'));
        this.app.use('/pixi_viewport', express_1.default.static(__dirname + '/../node_modules/pixi-viewport/dist/'));
        this.app.use('/socket.io-client', express_1.default.static(__dirname + '/../node_modules/socket.io-client/dist/'));
        this.app.use('/springy', express_1.default.static(__dirname + '/../node_modules/springy/'));
    };
    App.prototype.handle_error = function () {
        this.app.use(function (req, res, next) {
            next((0, http_errors_1.default)(404));
        });
        this.app.use(function (err, req, res) {
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
    };
    App.prototype.server_socket_connection = function () {
        // ServerSocket.add_response_listener();
        // ServerSocket.add_request_listener();
    };
    App.prototype.listen = function () {
        this.app.listen((process.env.PORT || this.port));
        console.log("--- hexan is running on port: ".concat(process.env.PORT || this.port, " ---"));
    };
    return App;
}());
var index_controller = new IndexController_1.default();
var app = new App(8000, index_controller);
app.init();
app.handle_error();
app.listen();
