import { Assert } from "..";
import { CoffeeCaller } from "../contact";

export default class CallerMatch implements CoffeeCaller {
    private name : string
    private callCount = 0;
    private truth : boolean
    private frozen = false;
    not! : CoffeeCaller

    constructor(truth : boolean, name?: string){
        this.name=  name ?? "NA";
        this.truth = truth;
        if(truth)
            this.not = new CallerMatch(false, name);

    }
    call(){
        if(this.frozen){
            console.trace();
            throw `${this.name} <caller is frozen>`
        }
        this.callCount++;
    }
    freeze(){
        this.frozen = true;
    }
    count() : number {
        return this.callCount;
    }
    
    
    isCalled(){
        Assert(this.callCount > 0, this.truth,  `${this.name} <caller.isCalled> ${this.callCount}`)
    }
    isCalledTimes(called : number){
        Assert(this.callCount === called, this.truth,  `${this.name} actual: ${this.callCount} <caller.isCalledTimes> expect: ${called}`)
    }
    isCalledTimesGreater(called : number){
        Assert(this.callCount > called, this.truth,  `${this.name} actual: ${this.callCount} <caller.isCalledTimesGreater> expect: ${called}`)
    }
    isCalledTimesGreaterOrEqual(called : number){
        Assert(this.callCount >= called, this.truth,  `${this.name} actual: ${this.callCount} <caller.isCalledTimesGreaterOrEqual> expect: ${called}`)
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