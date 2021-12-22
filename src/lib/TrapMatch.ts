import { CoffeeTrap } from "../contract";
import { assert } from "..";

export default class TrapMatch implements CoffeeTrap {
    not! : TrapMatch;
    private truth : boolean
    private triggerCount : number
    private callback : (trap : CoffeeTrap) => void

    private counter = 0

    private trapCalled = false;
    constructor(truth : boolean, triggerCount : number, callback : (trap : CoffeeTrap)=>void) {
        this.truth = truth;
        this.triggerCount = triggerCount;
        this.callback = callback
        if(truth == true)
            this.not = new TrapMatch(false, triggerCount, ()=>{
                //TODO:not caller
            });
    }
    count() : void {
        this.not?.count();
        this.counter++;
        if(this.counter >= this.triggerCount && !this.trapCalled){ 
            this.callback(this);
            this.trapCalled = true;
        }
        
    }

    isTrapped(): void {
        assert(this.trapCalled, this.truth, "<trap.isTrapped>")
    }

}