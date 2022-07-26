import Unit from "./Unit";

class Cavalry extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;
    constructor(...args: any[]) {
         super(args[0], args[1], args[2], args[3], args[4]);
    }
}

export default Cavalry;