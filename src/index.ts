import CheckMatch from "./lib/CheckMatch";
import CallerMatch from "./lib/CallerMatch";
import { CoffeeCaller, CoffeeCheck, CoffeeMatchArray} from "./contract";
import ListMatch from "./lib/ListMatch";
import ExamBatch from "./lib/ExamBatch";

import fs from "fs"

export function newFile(file : string) : ExamFile {
    return {
        file,
        hooks : {},
        result  : newResult()
    }
}

let batcher = new ExamBatch();
let Flag_FAILED = false;
let currentResult = batcher.currentFile().result
let totalResult = newResult();

function reset(){
    batcher = new ExamBatch();
    Flag_FAILED = false;
    currentResult = batcher.currentFile().result;
    totalResult = newResult();
}


export type Func =  ()=>void
type ExamDetail = {
    test : ()=>void,
    name : string,
}

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
}

type ExamParams = {
    dir? : string,
    runAll? : boolean,
    files? : string[],
    startTest? : Func,
    endTest? : Func,
    beforeExam? : Func
    afterExam? : Func
}

type RunParams = {
    forceAll? : boolean,
    startTest? : Func,
    endTest? : Func
    beforeExam? : Func,
    afterExam? : Func
}

type ExamHooks = {
    startLocal? : Func
    endLocal? : Func,
    beforeExam? : Func,
    afterExam? : Func
}

function pushResult(){
    currentResult.exams.forEach(item => totalResult.exams.push(item));
    currentResult.examsFailed.forEach(item => totalResult.examsFailed.push(item));
    currentResult.examsIgnored.forEach(item => totalResult.examsIgnored.push(item));
    currentResult.examsSuccess.forEach(item => totalResult.examsSuccess.push(item));
    totalResult.totalFalse += currentResult.totalFalse;
    totalResult.totalTrue += currentResult.totalTrue;
}

function newResult() : TestResult {
    return {
        exams : [],
        examsFailed : [],
        examsIgnored : [],
        examsSuccess : [],
        totalFalse : 0,
        totalTrue: 0
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

async function testfiles(params? : ExamParams) : Promise<TestResult> {
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
    return runBatch({
        forceAll : override,
        startTest : params?.startTest,
        endTest : params?.endTest,
        beforeExam : params?.beforeExam,
        afterExam  :params?.afterExam
    });
}

export type ListData<T> = {[key : string] : T } | T[]

export function assert(statement : boolean, truth : boolean, msg : string) : void {
    if(statement !== truth){
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', msg);
        console.trace();
        currentResult.totalFalse++
        Flag_FAILED = true;
        throw msg
    }
    currentResult.totalTrue++
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

export function caller(name? : string) : CoffeeCaller {
    return new CallerMatch(true, name);
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
    return batcher.sizeCurrentBatchExam();
}
export function pendingBatch() : number {
    return batcher.sizeBatch();
}

export function pushBatch(name : string) {
    batcher.push(name);
}

export function exam(name : string, test : Func) {
    batcher.addExam(name, test);
}

export function examIgnore(name : string, test : Func) {
    console.log('\x1b[43m\x1b[30m%s\x1b[0m', `Ignoring Exam:(${name})`)
}

export function beforeExam(func : Func) {
    batcher.beforeExam(func);
}

export function afterExam(func : Func) {
    batcher.afterExam(func);
}

export function startBatch(func : Func) {
    batcher.startLocal(func);
}

export function endBatch(func : Func) {
    batcher.endLocal(func);
}

export async function runBatch(params? : RunParams) : Promise<TestResult> {
    /* Check any exams still batched in current batch if so pushg it */
    const examsToRun = batcher.done();

    const {forceAll, startTest, endTest, beforeExam, afterExam } = params ?? {}

    console.log('\x1b[33m%s\x1b[0m', "CoffeeTest is Running")
    let success = 0;
    let failed = 0
    let ignored = 0
    /* Run start func then all tests */
    await startTest?.()
    for(let j=0; j < examsToRun.length; j++){
        const toRun = examsToRun[j];
        const result = examsToRun[j].result;
        currentResult = result;

        if(toRun.result.exams.length > 0)
            console.log('\x1b[33m%s\x1b[0m', `Batch @[${toRun.file}]`)
        await toRun.hooks.startLocal?.();
        for(let i=0; i < result.exams.length; i++){
            const myExam = result.exams[i];
            await beforeExam?.();
            await toRun.hooks.beforeExam?.()
            try{
                if(myExam.name.startsWith("?") && !forceAll){
                    ++ignored
                    result.examsIgnored.push(myExam.name);
                    console.log('\x1b[33m%s\x1b[0m', `[${myExam.name}]`)
                    continue
                }
                Flag_FAILED = false;
                console.log('\x1b[36m%s\x1b[0m', `Run > [${myExam.name}]`)
                await myExam.test();
                if(Flag_FAILED){
                    Flag_FAILED = false;
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
            }
            await afterExam?.();
            await toRun.hooks.afterExam?.();
        }
        await toRun.hooks.endLocal?.();
        pushResult();
        batcher = new ExamBatch();

    }
    await endTest?.();
    //TODO:dump this in a functuion 'DumpReport'
    console.log('\x1b[33m%s\x1b[0m', `Test Stats`)
    console.log('\x1b[42m\x1b[30m%s\x1b[0m', `${success}/${totalResult.exams.length} Tests Successful`);
    if(ignored > 0)
    console.log('\x1b[33m%s\x1b[0m', `${ignored}/${totalResult.exams.length} Tests Ignored`);
    if(failed > 0)
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', `${failed}/${totalResult.exams.length} Tests Failed`);
    for(let i=0; i < totalResult.examsFailed.length; i++){
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', `@> ${totalResult.examsFailed[i]}`);
    }
    console.log('\x1b[33m%s\x1b[0m', `Assert Stats`)
    if(totalResult.totalFalse > 0)
        console.log('\x1b[41m\x1b[30m%s\x1b[0m', `(${totalResult.totalFalse}/${totalResult.totalTrue + totalResult.totalFalse}) Total Assertion Errors Before Failure`);
        
    console.log('\x1b[42m\x1b[30m%s\x1b[0m', `(${totalResult.totalTrue}/${totalResult.totalTrue + totalResult.totalFalse}) Total Assert Successful`);
    let ret = totalResult;
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

export default async function BeginExam(params? : ExamParams) : Promise<TestResult> {
    return testfiles(params)
}





