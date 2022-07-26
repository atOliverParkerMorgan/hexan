import createError from "http-errors";
import express, {Request, Response, NextFunction, Application} from "express";
import path from "path";
import cookieParser from "cookie-parser";
import IndexController from "./routes/IndexController";
import Controller from "./routes/IndexController";
import {ServerSocket} from './server/ServerSocket";
import ControllerInterface from "./routes/ControllerInterface";

class App {
  public app: Application = express();
  public port: number;
  public controllers: [ControllerInterface]

  constructor(...controllers: [ControllerInterface], port: number) {
    this.controllers = controllers
    this.port = port
  }

  init() {
    this.app.use(express.static(path.join(__dirname, '/client')));
    this.init_view_engine();
    this.init_static_routes();
    this.init_controllers();
  }

  private init_view_engine() {
    this.app.engine('html', require('ejs').renderFile);
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: false}));

  }

  private init_controllers() {
    // use all controller routers
    this.controllers.forEach(controller => {
      this.app.use('/', controller.router);
    })
  }

  private init_static_routes() {
    // modules
    this.app.use('/pixi', express.static(__dirname + '/../node_modules/pixi.js/dist/browser/'));
    this.app.use('/pixi_extras', express.static(__dirname + '/../node_modules/@pixi/graphics-extras/dist/browser/'));
    this.app.use('/pixi_viewport', express.static(__dirname + '/../node_modules/pixi-viewport/dist/'));
    this.app.use('/socket.io-client', express.static(__dirname + '/../node_modules/socket.io-client/dist/'));

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

  listen() {
    this.app.listen((this.port));
    console.log("🔥🔥🔥 hexan is running on port: ${this.port} 🔥🔥🔥")
  }
}

const index_controller: Controller = new IndexController()
const app: App = new App([index_controller], 8000)

app.init();
app.handle_error();
app.listen();
