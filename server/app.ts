import createError from "http-errors";
import IndexController from "./routes/IndexController";
import Controller from "./routes/IndexController";
import ControllerInterface from "./routes/ControllerInterface";
import * as path from "path";
import express, {Application, NextFunction, Response, Request} from "express";
import {renderFile} from "ejs";
import cookieParser from "cookie-parser";

class App {
  public app: Application = express();
  public port: number;
  public controllers: [ControllerInterface]

  constructor(port: number, ...controllers: [ControllerInterface]) {
    this.controllers = controllers
    this.port = port
  }

  init() {
    this.init_view_engine();
    this.init_static_routes();
    this.init_controllers();
    this.server_socket_connection();
  }

  private init_view_engine() {
    this.app.engine('html', renderFile);
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'html');

    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private init_controllers() {
    // use all controller routers
    this.controllers.forEach(controller => {
      this.app.use('/', controller.router);
    })
  }

  private init_static_routes() {
    // html files
    this.app.use('/views', express.static(__dirname + '/views/'));

    // static public files
    this.app.use('/javascript', express.static(__dirname + '/client_logic/'));
    this.app.use('/stylesheets', express.static(__dirname + '/stylesheets/'));
    this.app.use('/images', express.static(__dirname + '/images/'));

    // modules
    this.app.use('/pixi', express.static(__dirname + '/../node_modules/pixi.js/dist/browser/'));
    this.app.use('/pixi_extras', express.static(__dirname + '/../node_modules/@pixi/graphics-extras/dist/browser/'));
    this.app.use('/pixi_viewport', express.static(__dirname + '/../node_modules/pixi-viewport/dist/'));
    this.app.use('/socket.io-client', express.static(__dirname + '/../node_modules/socket.io-client/dist/'));
    this.app.use('/springy', express.static(__dirname + '/../node_modules/springy/'));
  }

  handle_error() {
    this.app.use(function (req: Request, res: Response, next: NextFunction) {
      next(createError(404));
    });

    this.app.use((err: any, req: Request, res: Response) => {
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

  server_socket_connection(){
    // ServerSocket.add_response_listener();
    // ServerSocket.add_request_listener();
  }


  listen() {
    this.app.listen((process.env.PORT || this.port));
    console.log(`--- hexan is running on port: ${process.env.PORT || this.port} ---`);
  }
}

const index_controller: Controller = new IndexController()
const app = new App(8000, index_controller);

app.init();
app.handle_error();
app.listen();