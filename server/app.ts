import createError from "http-errors";
import IndexController from "./Routes/IndexController";
import Controller from "./Routes/IndexController";
import * as path from "path";
import express, {Application, NextFunction, Response, Request} from "express";
import {renderFile} from "ejs";
import cookieParser from "cookie-parser";
import {createServer} from "http";
import {Server} from "socket.io";
import {ServerSocket} from "./ServerLogic/Classes/ServerSocket";
import {Utils} from "./ServerLogic/Classes/Utils";

export namespace App {
  export const app: Application = express();

  let port: string | number;

  if(Utils.ENV === "PRODUCTION"){
    port = process.env.PORT || 80; // heroku production
  }else {
    port = process.env.PORT || 8000; // localhost

  }

  const controller: Controller =  new IndexController()
  export let httpServer: any;
  export let io: any;



  export function init() {
    httpServer = createServer(app);
    io = new Server(httpServer);
    initViewEngine();
    initStaticRoutes();
    initControllers();

    httpServer.listen(port);

    ServerSocket.addListener();

  }

  function initViewEngine() {
    app.engine('html', renderFile);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');

    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
  }

  function initControllers() {
    // use all controller routers
    app.use('/', controller.router);

  }

  function initStaticRoutes() {
    // html files
    app.use('/views', express.static(__dirname + '/views/'));

    // static public files
    app.use('/', express.static(__dirname + '/ClientLogic/'));
    app.use('/stylesheets', express.static(__dirname + '/stylesheets/'));
    app.use('/images', express.static(__dirname + '/images/'));

    // modules
    app.use('/pixi', express.static(__dirname + '/../node_modules/pixi.js/dist/browser/'));
    app.use('/pixi_extras', express.static(__dirname + '/../node_modules/@pixi/graphics-extras/dist/browser/'));
    app.use('/pixi_viewport', express.static(__dirname + '/../node_modules/pixi-viewport/dist/'));
    app.use('/socket.io-client', express.static(__dirname + '/../node_modules/socket.io-client/dist/'));
    app.use('/springy', express.static(__dirname + '/../node_modules/springy/'));
  }

  export function handleError() {
    app.use(function (req: Request, res: Response, next: NextFunction) {
      next(createError(404));
    });

    app.use((err: any, req: Request, res: Response) => {
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


  export function serverInfo() {
    const host = httpServer.address().address;
    const port = httpServer.address().port;

    console.log(`hexan is running at http://${host}${port}`);
  }
}

App.init();
App.handleError();
App.serverInfo();