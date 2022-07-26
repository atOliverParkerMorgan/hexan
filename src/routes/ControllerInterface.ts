import {Router} from "express/ts4.0";
import express, {Request, Response, NextFunction} from "express";

export default interface ControllerInterface {
    router: Router;
    handle_get_request: (req: Request, res: Response, next: NextFunction) => void;
    handle_post_request: (req: Request, res: Response, next: NextFunction) => void;
}