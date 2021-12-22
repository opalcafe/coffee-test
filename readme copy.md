
# Coffee Test - Typescript Lightweight Testing Framework

## Whats New In 0.6.0 ?
Coffee-Test has added support for long running tests using the `ongoing` function

```typescript
import { recess, ongoing } from "coffee-test"
//will fire off every 2s
ongoing(2000, () => {
    //tODO: do ongoing loop work
})

//must add a recess when doing ongoing work as by default the framework will move to the next test after completion
recess(() => {
    return 10
})
```
Caller macthers not have 'trap' functions which can trigger when a certain number of calls is made


```typescript
import { caller } from "coffee-test"

const didcall = caller();

//will trigger when did call is called 5 times
const trapMatch = didcall.trap(5, () => {
    //TOOD: fill trap call
})

//trap returns a  trap matcher 

```



## Whats New In 0.5.0 ?

This release features a new feature I wanted to add, you can now `inject env /config` objects with `typed exams`. As stated below the idea behind `coffee-test` is to have each directory as a sub test environment with it's own logic. That is why there is no global binary executable like `jest`. To support this all exam functions and hooks can be typed with a single type for a `inject context` you can access the object in the function lamda
 object.

### Context Injection
An exam function can now inject a context. The purpose behind `inject context` is to reduce the import dependencies of the file. This will allowing testing of interfaces independent of what's imported. The context object is a place to put things like debug login functions, config files & any dedicated testing functionality

Define a TestEnvironment
```typescript
interface Api {
    doSomething() : Promise<string>
}

interface TestEnv {
    debugLogin() : Promise<void>
    api() : Api
}
```
Inside the exam test files add a type declare to the `exam` function
```typescript
import { exam } from "coffee-test"

exam<TestEnv>("My Exam" async env => {
    //use var lambda to access environment
    await env.debugLogin()
    await env.api().doSomething()
})

/*Can be used with hooks as well*/
startBatch<TestEnv>(env => {
    //do start code
})
```
## Inject the Context
to inject the actual object, set the `injectContext` in the `runBatch` or `BeginExam` functions

```typescript 
import { BeginExam } from "coffee-test"

const env : TestEnv = {...}

BeginExam({
    injectContext : env
})
```
## Testing All Interfaces and Implementations In Same File

The power of dependency injected testing is that you can test all implementations of an interface in with the same file, no need to rewrite & you can test multiple in same file

```typescript
//define interface to test
interface MyApi {
    doCall() : Promise<string>
}
//Define implementation array to test in TestEnv config
interface TestEnv {
    implementations : MyApi[]
}
//inject context with   injectContext : env
BeginExam({
    injectContext : TestEnv = {... instantiate}
})
```
Make you exam types with `TestEnv`
```typescript
import { exam } from "coffee-test"

exam<TestEnv>("My Exam" async env => {
    //test all implementations in env
    env.implementations.forEach(imp => {
        //TODO: write assertions for implementation
    })
})
```
Having the implementation objects in the `test-runner env` means that you can swap implementations on the fly
and distribute test files to external consumers who implement said interface without any breaking changes

## Summary

CoffeeTest `(coffee-test)` is a lightweight typescript testing library/framework

### Inception

This project started when I was looking for a JavaScript/Typescript framework to 
test the libraries and packages I was making. I was using `jest/ts-jest`
I had issues testing my async code it would 'timeout' and fail jest.
Also jest was designed primarily with javascript in mind. `coffee-test` fully leverages the typing ability
of typescript to improve test writing with inferred type assertions.

## Purpose

`coffee-test` is designed to be a lightweight & flexible staging area for code. It does not 
provide a binary or executable to run tests from a command line but does provide
the assertion library and an out of the box solution to easily run tests in a single `test runner`

# Usage
## Write a Test
use the `exam` function from the library to run a test. The signature is compatible with `jest`

```typescript
import { exam } from 'coffee-test'

exam("My Test Name", () => {
    //implement test with matchers
})
```

## Matchers
Similar to `jest` syntax `coffee-test` providers matchers to assert the state of data & code flow.

Taking advantage of the type system `coffee-test` provides 3 matchers to assert state & code flow

- [CheckMatch] - Can check a value against an assertion
- [ArrayMatch] - Can assert state of arrays or `typed maps`
- [CallerMatch] - Asserts callbacks with functions

Coffee test leverages the type system to write faster tests with type inference in the IDE
> Note: all matchers can be inverted using the `.not` property to flip the assertion
> eg: `check(2).not.is(3)`
> eg `caller().not.isCalled()`
> eg: `array(["name"]).not.contains("not inside")`

## CheckMatch
`check` from index.js can assert a value against an expected value
```typescript
import { check } from "coffee-test"

exam("check data", () => {
    const age = 21
     //checks age is 21. is() is a type param
    check(age).is(21)

    //'not' will invert the check value when asserting the state
    check(age).not.is(34) 

    let name
    //will cause the test to fail as not defined
    check(name).isDefined()

    /*  use isAny to pass 'any' object to assertion 
        should use .is() where possible
    */
    check("2").not.isAny(null);

    /*this is where the power of typescript comes to help
    this will issue a compilation error since string is not a number
    */
    check("5").is(5);

})
```
### AutoComplete / Inferred assertions
Inferred typescript assertions come in extremely useful when dealing with
`union` types. when because `.is()` is typed, the IDE can auto-complete
and infer a type and throw compile error if doesn't match
```typescript
import { check } from "coffee-test"

type ApiType = "object"  | "array"  | "boolean"

exam("check data", () => {
    const response : ApiType = "array"

    check(response).is(..) //<--- can auto complete this 'object' | 'array' | 'boolean'

    check(response).is("not valid") //<--- will throw compile error since it's not an 'ApiType'
}

```

## ArrayMatch
Array matcher can assert the state of `arrays` or `typed maps`
```typescript
import { array } from "coffee-test"

exam("check data", () => {
    const data : string[] = ["apples", "shark"] 
    //check the array has 'apples'
    array(data).contains("apples") 

    //check array not empty
    array(data).not.empty() 
    // check index 1 is 'shark'
    array(data).index(1, "popcorn")
})
```
> Note: there are 2 ways to check if a value is in array.

> 1) Using the `array(list).contains(val)` matcher 

> 2) On the value itself with `check(val).in(array)`

## ListData / Typed Maps
`array` accepts native arrays but also `mapped types` defined as
```typescript
/* what array(...) accepts  */
export type ListData<T> = {[key : string] : T } | T[]
```

## CallMatcher
Call matchers are used when trying to assert whether a callback has been called

This is similar to `jest's expect(func).isCalled()`
```typescript
import { caller } from "coffee-test"

exam("check caller", () => {
     //create a caller matcher object
    const didcall = caller()

    const lamda = () => {
        //add to the call count
        didcall.call();  
    }
     //invoke the lamda
    lamda()

    /*Assert caller*/
    didcall.isCalled() //check caller was called at least once 'count > 0'

    /*You can 'freeze the caller meaning it will not except any future calls*/
    didcall.freeze()

    lamda() //will trigger a assertion fail since caller was frozen
})
```

## Matcher Interface
This is the full definition of all the 3 type of Test Matchers

```typescript

export interface CoffeeCheck<T> {
    not : CoffeeCheck<T>

    is(val : T) : void
    isAny(val : any) : void
    isTrue():void
    isFalse():void
    isNull():void
    isUndefined():void
    isDefined() : void
    isTruthy() : void
    isGreater(check  : T):void
    isGreaterOrEqual(check : T) : void
    isLesser(check : T) :void,
    isLesserOrEqual(check  :T) : void
    isRange(lower : T, upper : T) : void
    isRangeExclude(lower : T, upper : T)  : void
    isInstance<T>(type : T):void
    isNumber():void
    isBoolean():void
    isString():void
    isObject():void
    isFunction():void
    isBigInt():void
    isMatch(regex : RegExp) : void

    hasKey(key : string | number):void,
    hasKeySize(size : number):void
    
    in(collection : any):void

    throws():void
}

export interface CoffeeMatchArray<T> {
    not : CoffeeMatchArray<T>

    is(another : ListData<T>) : void
    length(size : number) : void
    empty():void
    contains(val : T) : void
    index(index : number, val : T) : void
    values(another : ListData<T>) : void
    first(expect : T)  : void
    last(expect : T) : void
    
    appearsExactly(val  :T, times : number):void
    appearsGreater(val : T, times : number):void
    appearsGreaterOrEqual(val : T, times : number):void
    appearsLesser(val : T, times : number):void
    appearsLesserOrEqual(val: T, times : number):void
}

export interface CoffeeCaller {
    not : CoffeeCaller

    call() : void
    
    freeze() : void
    count() : number

    isCalled() : void
    isCalledTimes(called : number) : void
    isCalledTimesGreater(called : number) : void
    isCalledTimesGreaterOrEqual(called : number) : void

    allCalled(callers : CoffeeCaller[]):void
    allCalledTimes(callers : CoffeeCaller[], times : number) : void
    allCalledTimesGreater(callers : CoffeeCaller[], times : number) : void
    allCalledTimesGreaterOrEqual(callers : CoffeeCaller[], times : number) : void
}
```

## Test Runner
As stated earlier `coffee-test` does not provider a command line binary or executable to automatically run all tests, this is by design, but a default simple test batcher is provided as shown in the example. The default export from `coffee-test` can run all `.test.ts` files in a directory



### Write a `test runner`

```typescript
/* MyRunner.ts */
import BeginExam from 'coffee-test'

BeginExam({
    dir : 'test/module' //will run tets in './test/module' directory
})
```
> Note: `BeginExam` from default export will run tests shallow / Only in the specified director not anywhere else
    
    
> Also note the `dir` parameter in `BeginExam` is relative to the current working directory
In NPM this will be relative to the `package.json` file



## Ignore Exam (Temporary)
You can ignore an exam temporarily by putting a `'?'` mark in from of the test name
```typescript
exam("?Ignore Me", () => {
    //test will be ignored
})
```
> You can force to run all tests in `BeginExam` with an override flag
```typescript
import BeginExam from 'coffee-test'

BeginExam({
    dir : 'test/module',
    runAll : true

    /*'runAll' will force the batcher to run all tests even ignored ones*/
})
```
## Selective Running of Tests
When you are live testing in most cases you only want to run select files that contain
the tests you want to run.

Use the `files` parameter in `BeginExam` to only run those files
> Note: Ensure that `runAll : false | undefined` as runAll true will skip this 
```typescript
BeginExam({
    dir : 'test/module',
    runAll : false,
    files : ["MyTest.test.ts"]

    /* only run 'MyTest.test.ts in module dir'*/
})
```

## Test File Hooks
When using `BeginExam` to run a set of tests inside a directory, you can use several hooks to run extra code
before and after certain events

```typescript
import { beforeExam, afterExam, startBatch, endBatch } from 'coffee-test'

beforeExam(()=>{
    //Runs BEFORE each exam in the current batch
})

afterExam(()=>{
    //runs AFTER each exam in the current batch
})

startBatch(()=>{
    //runs at the START of a current batch
})

endBatch(()=> {
    //runs at the END of the current batch
})
```
> `startBatch, endBatch` run when the current exam batch is pushed. When using `BeginExam` this is inside the file
When Manual Batching this is when `pushBatch` & `runBatch` are called to create and run a custom batch



## Run All Tests (Single Directory)
Set `runAll : true` in `BeginExam` to run all exams expect ones inside `examIgnore()`



# Manual Batching
While `BeginExam` provides a simple quick way to run tests in a single directory. The API exposes some functions to batch and run tests in a more manual way.

Under the hood `coffee-test` will batch tests in separate groups to allow the hooks to be swapped out for each file


`pushBatch, exam, runBatch` can be used to batch exams manually

```typescript
import { exam, runBatch, pushBatch } from 'coffee-test'

exam("Custom Batched Exam" ,() => {
    ///TODO:
})

pushBatch("Custom Batch Name");

runBatch() //runParams optional?

```
> Note when custom batching a test it's recommended ensure `BeginExam` is not begin used on that file otherwise
you will duplicate the results and exams will run twice

## Hooking with manual batching
When using the `beforeExam, afterExam, startBatch, endBatch` test codes to run custom code
when manual batching you must call these before `pushBatch` is called as these hooks are tied to
the current batch you can working with

```typescript
import { exam, runBatch, pushBatch, startBatch, beforeExam } from 'coffee-test'

exam("Test 1" ,()=> {})

exam("Test 2", () => {})

startBatch(()=>{
    console.log("Starting Batch")
})
startExam(() => {
    console.log("Start Exam");
})

pushBatch("Custom File");
runBatch() //runParams optional?

/*
Prints:

    Starting Batch
    Start Exam
    Start Exam <-- called twice as there are 2 exams before 'pushBatch' is called

*/
```

# Example Setup
This is a full example setup to showcase how to use `coffee-test`
### Workspace Details
- VSCode, NPM, Typescript, ts-node-dev (to run typescript live)

### Folder Structure
```
.
├── src/
│   └── .. [Source Files]
├── test/
│   ├── live-test/
│   │   ├── #run.ts
│   │   ├── TestFile1.test.ts
│   │   ├── TestFile2.test.ts
│   │   └── ...
│   └── more-test/
│       └── #run-more.ts/
│           ├── MoreTest.test.ts
│           └── ...
└── package.json
    
```
### package.json
```json
{
  "name": "--Your Project --",
  "version": "0.0.1-beta",
 
  "scripts": {
    "live-test": "ts-node-dev --respawn ./test/live-test/#run.ts",
  }
  ...
}
```
I am a big fan of `ts-node-dev` to run a live testing environment. If you create a test runner using `ts-node-dev` you can
test while your write code and get instant feedback
### (test/live-test/#run.ts)
```typescript
import BeginExam from "coffee-test";

/* injected enviroment definition*/
const env = {...}
/*Use Provided Test bacther to run test quickly*/


BeginExam ({
    dir : "test/live-test", //the directory based on the relative current working directory to run the tests
    files : [ "TestFile1"],  //??(Optional), name of tests to run excluding the `.test.ts` post-fix
    runAll : false,     //while workign with live testing you dont need to run all just the selected
                        //use this to override 'files' to force to run all tests in directory
    injectContext : env,
    //function to run before any tests or batches
    startTest: async ()=>{
        //runs before anything is started
    },
    endTest : async () => {
        //runs at end of testing
    },
    beforeExam : async () => {
        //runs before each 'exam'
    },
    afterExam : async () => {
        //runs after each 'exam'
    }
})
```
### (test/live-test/TestFile1.test.ts)
```typescript
import {exam, examIgnore, check, caller, array, timeout } from "coffee-test"

/* This is an example test template */
async function doApi() {
    //TODO:
}
function doCallback(callback : () => void) {
    //TODO:
}

exam("Name of test", async () => {
    const didCall = caller()  //Create a 'caller' matcher object

    const result = await doApi()
    check(result).isDefined() //check result is defined

    let resCall = false

    doCallback(()=> {
        resCall = true
        didCall.call()  //add call count to check if caller
    })

    await timeout(1000) //for callback functions you can await inline with timeout(millis)
    check(resCall).isTrue()  //check manual is callback is called. you can use caller() to create a call matcher
    didCall.isCalledTimes(1); //check is caller is called exactly 1 time

    const matchArray = array([]); //create an array matcher
})

exam("?Ignore Exam (Conditional)", async () => {
    /*
    putting a '?' at start of test name will ignore it
    This exam will be ignored only if the 'runAll' is not true 
    runAll forces all exams to run.
    */
})

examIgnore("Always ignore exam no expections", () => {

})





