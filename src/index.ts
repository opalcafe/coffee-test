import ArrayMatch from "./lib/ArrayMatch";
import CheckMatch from "./lib/CheckMatch";
import CallerMatch from "./lib/CallerMatch";
import { CoffeeCaller, CoffeeCheck, CoffeeMatchList } from "./contact";
import ListMatch from "./lib/ListMatch";

type ExamDetail = {
    test : ()=>void,
    name : string
}

const exams : ExamDetail[] = []
export type ListData<T> = T[] | {[key : string | number]:T}

export function assert(statement : boolean, truth : boolean, msg : string){
    //console.log(`${statement}|${truth}|${msg}`)
    if(statement !== truth){
        console.trace();
        throw msg
    }
}
export function success(func : ()=>void){
    func();
}
export function fail(func : ()=>void){
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

export function identity(first : any, second : any){
    return Object.is(first, second);
}
export function toJson(object : any):string{
    return JSON.stringify(object);
}

export function array<T>(array : ListData<T>) : CoffeeMatchList<T>{
    return new ListMatch(array, true);
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
export async function out(msg : string){
    console.log(msg);
}

export function exam(name : string, test : ()=>void){
    exams.push({
        name,
        test
    });
}
export async function run(){
    let success = 0;
    let failed = 0
    let ignored = 0
    for(let i=0; i < exams.length; i++){
        console.log(`Running: ${exams[i].name}`)
        try{
            if(exams[i].name.startsWith("?")){
                ++ignored
                continue
            }
                
            await exams[i].test();
            ++success
        }catch(e){
            ++failed
        }
        console.log("=Done=")
    }
    console.log('\x1b[42m\x1b[30m%s\x1b[0m', `${success}/${exams.length} Tests Successful`);
    if(ignored > 0)
    console.log('\x1b[33m%s\x1b[0m', `${ignored}/${exams.length} Tests Ignored`);
    if(failed > 0)
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', `${failed}/${exams.length} Tests Failed`);
        
}


