import CheckMatch from "./lib/CheckMatch";
import CallerMatch from "./lib/CallerMatch";
import { CoffeeCaller, CoffeeCheck, CoffeeMatchArray} from "./contract";
import ListMatch from "./lib/ListMatch";
import ExamBatch from "./lib/ExamBatch";

import fs from "fs"

function printRed(msg : any){
    console.log('\x1b[41m\x1b[30m%s\x1b[0m', ` ${msg} `);
}


const EMPTY : any = {}

export function newFile(file : string) : ExamFile {
    return {
        file,
        hooks : {},
        result  : newResult()
    }
}

let xBatcher = new ExamBatch();
let xFlag_FAILED = false;
let xCurrentResult = xBatcher.currentFile().result
let xTotalResult = newResult();



function reset(){
    xBatcher = new ExamBatch();
    xFlag_FAILED = false;
    xCurrentResult = xBatcher.currentFile().result;
    xTotalResult = newResult();
}


export type Func<T> =  (context : T) => void
type ExamDetail = {
    test : Func<any>,
    name : string,
}
type OngoingEvent<T> = {
    millis : number
    callback : (env : T) => void
    caller : CoffeeCaller
}
export type Recess<T> = (env : T) => number

export type ExamFile = {
    result : TestResult,
    hooks : ExamHooks
    file : string
}

type TestResult = {
    exams : ExamDetail[],
    examsFailed : string[],
    examsSuccess : string[],
    examsIgnored : string[]
    totalFalse : number,
    totalTrue : number

    ongoing : OngoingEvent<any>[]
}

type HelperParam = {
    jest : "ignore" | "remap"
}


export interface ExamParams<T> {
    injectContext? : T
    startTest? : Func<T>,
    endTest? : Func<T>,
    beforeExam? : Func<T>
    afterExam? : Func<T>
    helper? : HelperParam

    dir? : string,
    runAll? : boolean,
    files? : string[],
}

type ExamHooks = {
    startLocal? : Func<any>
    endLocal? : Func<any>,
    beforeExam? : Func<any>,
    afterExam? : Func<any>
    recess? : Recess<any>
}

function pushResult() {
    xCurrentResult.exams.forEach(item => xTotalResult.exams.push(item));
    xCurrentResult.examsFailed.forEach(item => xTotalResult.examsFailed.push(item));
    xCurrentResult.examsIgnored.forEach(item => xTotalResult.examsIgnored.push(item));
    xCurrentResult.examsSuccess.forEach(item => xTotalResult.examsSuccess.push(item));
    xTotalResult.totalFalse += xCurrentResult.totalFalse;
    xTotalResult.totalTrue += xCurrentResult.totalTrue;
}

function newResult() : TestResult {
    return {
        exams : [],
        examsFailed : [],
        examsIgnored : [],
        examsSuccess : [],
        totalFalse : 0,
        totalTrue: 0,
        ongoing: []
    }
}
function basis(func : ()=>void, doesThrow : boolean) : void {
    let didthrow = false;
    try{
        func();
    }catch(e){
        didthrow = true;
    }
    if(didthrow != doesThrow){
        console.trace();
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', `Assertion Basis has failed`);
        process.exit(1);
    }
}

async function testfiles<T>(params? : ExamParams<T>) : Promise<TestResult> {
    const dir = params?.dir ?? "./";
    const filesToRun = params?.files;
    const override = params?.runAll ?? false;

    const files = fs.readdirSync(dir);
    const tests : string[] = [];
    for(let i=0; i < files.length; i++){
        const item = files[i];
        if(item.endsWith(".test.ts")){
            const file = `${item.substring(0, item.length-8)}`
            const testfilePath = `${process.cwd()}\\${dir}\\${item}`
        
            if(override){
                await import(testfilePath);
            }
            else if(filesToRun){
                if(filesToRun.includes(file))
                    await import(testfilePath);
            }else {
                await import(testfilePath);
            }
            pushBatch(file);
        }
    }
    return runBatch(params);
}

export type ListData<T> = {[key : string] : T } | T[]

export function assert(statement : boolean, truth : boolean, msg : string) : void {
    if(statement !== truth){
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', msg);
        console.trace();
        xCurrentResult.totalFalse++
        xFlag_FAILED = true;
        throw msg
    }
    xCurrentResult.totalTrue++
}

export function success(func : ()=>void) : void {
    basis(func, false);
}

export function fail(func : ()=>void): void {
    basis(func, true);
}

export function identity(first : any, second : any) : boolean {
    return Object.is(first, second);
}
export function toString(object : any) : string {
    const asJSON = JSON.stringify(object);
    return asJSON ?? `${object}`
}

export function array<T>(array : ListData<T>) : CoffeeMatchArray<T>{
    return new ListMatch(array, true);
}

export function caller(name? : string, startClosed : boolean = false) : CoffeeCaller {
    return new CallerMatch(true, {
        name,
        open : !startClosed
    });
}


export function check<T>(val : T) : CoffeeCheck<T>{
    return new CheckMatch<T>(val, true);
}

export function timeout(millis : number) : Promise<void>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve()
        }, millis)
    })
}

export async function out(msg : any) {
    console.log("\x1b[32m%s\x1b[0m", `\t${msg}`)
}

export function pendingExams() : number {
    return xBatcher.sizeCurrentBatchExam();
}
export function pendingBatch() : number {
    return xBatcher.sizeBatch();
}

export function pushBatch(name : string) {
    xBatcher.push(name);
}

export function exam<T>(name : string, test : Func<T>) {
    xBatcher.addExam(name, test);
}

export function examIgnore<T>(name : string, test : Func<T>) {
    console.log('\x1b[43m\x1b[30m%s\x1b[0m', `Ignoring Exam:(${name})`)
}

export function beforeExam<T>(func : Func<T>) {
    xBatcher.beforeExam(func);
}

export function afterExam<T>(func : Func<T>) {
    xBatcher.afterExam(func);
}

export function startBatch<T>(func : Func<T>) {
    xBatcher.startLocal(func);
}

export function endBatch<T>(func : Func<T>) {
    xBatcher.endLocal(func);
}


export async function runBatch<T>(params? : ExamParams<T>) : Promise<TestResult> {
    /* Check any exams still batched in current batch if so pushg it */

    const context = params?.injectContext ?? EMPTY;
    const examsToRun = xBatcher.done();

    const {runAll, startTest, endTest, beforeExam, afterExam } = params ?? {}

    console.log('\x1b[33m%s\x1b[0m', "CoffeeTest is Running")
    let success = 0;
    let failed = 0
    let ignored = 0
    /* Run start func then all tests */
    await startTest?.(context)
    out(`Running ${examsToRun.length} exams`)
    for(let j=0; j < examsToRun.length; j++){
        const toRun = examsToRun[j];
        const result = examsToRun[j].result;
        xCurrentResult = result;

        if(toRun.result.exams.length > 0)
            console.log('\x1b[33m%s\x1b[0m', `Batch @[${toRun.file}]`)
        await toRun.hooks.startLocal?.(context);
        startOngoing(toRun, context);
        for(let i=0; i < result.exams.length; i++){
            const myExam = result.exams[i];
            await beforeExam?.(context);
            await toRun.hooks.beforeExam?.(context)
            try {
                if(myExam.name.startsWith("?") && !runAll){
                    ++ignored
                    result.examsIgnored.push(myExam.name);
                    console.log('\x1b[33m%s\x1b[0m', `[${myExam.name}]`)
                    continue
                }
                xFlag_FAILED = false;
                console.log('\x1b[36m%s\x1b[0m', `Run > [${myExam.name}]`)

                /* Where tests runn*/
                {
                    const test : any = myExam.test;
                    await test(context);
                }
                if(xFlag_FAILED){
                    xFlag_FAILED = false;
                    if(!result.examsFailed.includes(myExam.name))
                        result.examsFailed.push(myExam.name);
                    throw `${myExam.name} Failed`
                }
                result.examsSuccess.push(myExam.name);
                ++success
            }catch(e){
                if(!result.examsFailed.includes(myExam.name))
                    result.examsFailed.push(myExam.name);
                ++failed
                printRed(e);
            }
            await afterExam?.(context);
            await toRun.hooks.afterExam?.(context);
        }
        
        const recess = toRun.hooks.recess;
        if(recess){
            out(`awaiting reccess`)
            await timeout(recess(context) * 1000);
        }
        try  {
            await toRun.hooks.endLocal?.(context); 
        }catch(e){
        }
        endOngoing()
        pushResult();
        /* Check recess hook */
        xBatcher = new ExamBatch();

    }
    await endTest?.(context);
    //TODO:dump this in a functuion 'DumpReport'
    console.log('\x1b[33m%s\x1b[0m', `Test Stats`)
    console.log('\x1b[42m\x1b[30m%s\x1b[0m', `${success}/${xTotalResult.exams.length} Tests Successful`);
    if(ignored > 0)
    console.log('\x1b[33m%s\x1b[0m', `${ignored}/${xTotalResult.exams.length} Tests Ignored`);
    if(failed > 0)
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', `${failed}/${xTotalResult.exams.length} Tests Failed`);
    for(let i=0; i < xTotalResult.examsFailed.length; i++){
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', `@> ${xTotalResult.examsFailed[i]}`);
    }
    console.log('\x1b[33m%s\x1b[0m', `Assert Stats`)
    if(xTotalResult.totalFalse > 0)
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', `(${xTotalResult.totalFalse}/${xTotalResult.totalTrue + xTotalResult.totalFalse}) Total Assertion Errors Before Failure`);
        
    console.log('\x1b[42m\x1b[30m%s\x1b[0m', `(${xTotalResult.totalTrue}/${xTotalResult.totalTrue + xTotalResult.totalFalse}) Total Assert Successful`);
    let ret = xTotalResult;
    reset()
    return ret;
}

export function getTests(dir : string = "./") : string[] {
    const testFiles : string[] = [];
    const files = fs.readdirSync(dir);
    for(let i=0; i < files.length; i++){
        if(files[i].endsWith(".test.ts")){
            const testfilePath = `${process.cwd()}\\${dir}\\${files[i]}`
            testFiles.push(testfilePath);
        }
    }
    return testFiles;
} 

export default async function BeginExam<T>(params? : ExamParams<T>) : Promise<TestResult> {
    for(const index in process.argv){
        const arg = process.argv[index];
        if(arg == "--all" && params){
            out('>> Running All Tests')
            params.runAll = true;
        }
    }
    
    return testfiles(params)
}

/* Version 0.6 */
export function ongoing<T>(millis : number, callback : (env : T) => void) : CoffeeCaller {
    const callme = caller();
    xBatcher.addOngoing(Math.max(100, millis), callback, callme);
    return callme
} 
export function recess<T>(callback : Recess<T>) : void {
    xBatcher.addRecess(callback);
}

export function pause(seconds : number) : Promise<void> {
    return timeout(seconds * 1000)
}

let xALL_TIMERS: NodeJS.Timer[] = []

function startOngoing(file : ExamFile, env : any){
    file.result.ongoing.forEach(ev => {
        const res = setInterval(()=>{
            ev.callback(env);
            ev.caller.call()
        }, ev.millis)
        xALL_TIMERS.push(res);
    })
}
function endOngoing(){
    xALL_TIMERS.forEach(timer => clearInterval(timer))
}





