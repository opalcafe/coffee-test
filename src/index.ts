import ArrayMatch from "./lib/ArrayMatch";
import CheckMatch from "./lib/CheckMatch";
import CallerMatch from "./lib/CallerMatch";
import { CoffeeCaller, CoffeeCheck, CoffeeMatchArray } from "./contact";

export function Assert(statement : boolean, truth : boolean, msg : string){
    //console.log(`${statement}|${truth}|${msg}`)
    if(statement !== truth){
        console.trace();
        throw msg
    }
}
export function Success(func : ()=>void){
    func();
}
export function Fail(func : ()=>void){
    let thrown = false;
    try{
        func();
    }catch(e){
        thrown = true;
    }
    if(thrown == false){
        console.trace();
        throw "Test Assertion Failed"
    }
}

export function Identity(first : any, second : any){
    return Object.is(first, second);
}
export function ToJson(object : any):string{
    return JSON.stringify(object);
}


export function array<T>(array : T[]) : CoffeeMatchArray<T>{
    return new ArrayMatch(array, true);
}

export function caller(name? : string) : CoffeeCaller {
    return new CallerMatch(true, name);
}

export function check<T>(val : T) : CoffeeCheck<T>{
    return new CheckMatch<T>(val, true);
}

export function waitfor(millis : number):Promise<void>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve()
        }, millis)
    })
}

export async function exam(name : string, test : ()=>void){
    console.log(`Running: ${name}`);
    await test();
    console.log("Done")
}


