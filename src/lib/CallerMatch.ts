import { assert } from "..";
import { CoffeeCaller, CoffeeTrap } from "../contract";
import TrapMatch from "./TrapMatch"

type CParam ={
    name? : string
    open? : boolean
}



export default class CallerMatch implements CoffeeCaller {
    private name : string
    private callCount = 0;
    private truth : boolean
    private frozen = false;

    private _open = true

    not! : CoffeeCaller

    private trapList : TrapMatch[] = []

    constructor(truth : boolean, param?: CParam){
        this.name=  param?.name ?? "NA";
        this._open = param?.open ?? true
       
        this.truth = truth;
        if(truth == true)
            this.not = new CallerMatch(false, param);
    }
    trap(triggerOnCount: number, callback: (trap: CoffeeTrap) => void): CoffeeTrap {
        const trap = new TrapMatch(true, triggerOnCount, callback);
        this.trapList.push(trap)
        return trap;
    }
    call(){
        if(!this.open)
            throw `${this.name} <caller is not open>`
        if(this.frozen){
            console.trace();
            throw `${this.name} <caller is frozen>`
        }
        this.not?.call()
        this.callCount++;
        this.trapList.forEach(trap => trap.count())
    }
    open(){
        this._open = true;
    }
    close(){
        this._open = false;
    }
    freeze(){
        this.frozen = true;
        this.not?.freeze();
    }
    count() : number {
        return this.callCount;
    }
    isCalled(){
        assert(this.callCount > 0, this.truth,  `${this.name} <caller.isCalled> ${this.callCount}`)
    }
    isCalledTimes(called : number){
        assert(this.callCount === called, this.truth,  `${this.name} actual: ${this.callCount} <caller.isCalledTimes> expect: ${called}`)
    }
    isCalledTimesGreater(called : number){
        assert(this.callCount > called, this.truth,  `${this.name} actual: ${this.callCount} <caller.isCalledTimesGreater> expect: ${called}`)
    }
    isCalledTimesGreaterOrEqual(called : number){
        assert(this.callCount >= called, this.truth,  `${this.name} actual: ${this.callCount} <caller.isCalledTimesGreaterOrEqual> expect: ${called}`)
    }
    allCalled(callers : CoffeeCaller[]){
        callers.forEach(item =>item.isCalled());
    }
    allCalledTimes(callers : CoffeeCaller[], times : number){
        callers.forEach(item =>item.isCalledTimes(times));
    }
    allCalledTimesGreater(callers : CoffeeCaller[], times : number){
        callers.forEach(item =>item.isCalledTimesGreater(times));
    }
    allCalledTimesGreaterOrEqual(callers : CoffeeCaller[], times : number){
        callers.forEach(item =>item.isCalledTimesGreaterOrEqual(times));
    }
    
}