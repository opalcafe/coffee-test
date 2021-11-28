
# Coffee Test

## Summary

CoffeeTest `(coffee-test)` is a lightweight typescript testing library/framework

### Inception & Purpose

This project started when I was looking for a JavaScript/Typescript framework to 
use to test my libraries and packages. I was using `jest/ts-jest` but
I had issues testing my async code and fail jest. The other problem I had one I am a fan of `ts-node-dev` to
run a live testing environment so I can write code and test at the same time. I wanted to create a framework that
would allow me to be more flexible with my testing a key part of `coffee-test` that makes this possible 
is the `selective testing` functions. When live testing you can selectively enable and disable files and individual functions on the fly.

Also jest was designed primarily with javascript in mind. `cloud-coffee` fully leverages the typing ability
of typescript to improve speed up test writing with inferred type assertions.

I also wanted to make the testing function syntax syntax as short as possible and easily to understand


# Usage
## Hoe to Write a Test
Sse the `exam` function `(index.js)` from the library to mark a function as a test. The signature is compatible with `jest`

```typescript
import { exam } from 'coffee-test'

exam("My Test Name", () => {
    //implement test with matchers
})
```

## Matchers
Similar to `jest` syntax `coffee-test` use the provided matchers to assert the state of data and code flow.

Taking advantage of the type system `coffee-test` provides 3 matchers to assert state & code flow

- [CheckMatch] - Can check a object value against an assertion
- [ArrayMatch] - Can assert state of arrays or `typed maps`
- [CallerMatch] - Asserts callbacks and code flow

Coffee test leverages the type system to write faster tests with type inference in the IDE
> Note: all matchers can be inverted using the `.not` property to flip the assertion

> eg: `check(2).not.is(3)`

> eg `caller().not.isCalled()`

> eg: `array(["name"]).not.contains("not inside")`

## CheckMatch

`Check` from `index.js` can assert a value against an expected value
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
Inferred typescript assertions are extremely useful when dealing with
`union types` as `.is()` is typed, the IDE can auto-complete
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

This is simmilar to `jest's expect(func).isCalled()`
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
This is the full definition of all the 3 types of Test Matchers

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
As stated earlier `coffee-test` does not provider a command line binary or executable to automatically run all tests, this is by design.

There default simple test batcher in the provided examples. The default export from `coffee-test` can run all `.test.ts` files in a specified directory



### Write a `test runner`
#### Folder Structure
```
.
├── test/
│   └── module/
│       ├── MyRunner.ts
│       └── SomeTest.test.ts
└── package.json
    
```

```typescript
/* MyRunner.ts */
import BeginExam from 'coffee-test'

//will run tets in './test/module' directory
BeginExam({
    dir : 'test/module' 

    /* SomeTest.test.ts will run here */
})
```
> Note: `BeginExam` from default export will run tests shallow / Only in the specified directory not anywhere else
    
    
> Also note the `dir` parameter in `BeginExam` is relative to the current working directory
In NPM this will be relative to the `package.json` file



## Ignore Exam (Temporary)
You can ignore an exam temporarily by putting a `'?'` mark in from of the test name. This is helpful when you are running in a life test environment and only want the tests you are working on displayed
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
## Print to console
It is recommend to use the `out` function in `index.js` to print a string to the console
this is because it is formatted in a different color to improve readability of the console

```typescript
import { out } from 'coffee-test'
exam("App", ()=>{
    out("Hello World");
})
```

## Promise Await
you can await inline for callback functions that dont use `Promise`
```typescript
import { timeout } from 'coffee-test'
exam("App", ()=>{
    await timeout(1000) // await 1000 millis
})
```
## Global Hooks
The `BeginExam` function has `global hooks` which can apple to all test batches

```typescript
import BeginExam from "coffee-test";

BeginExam ({
    /* Usuage of global hooks */

    startTest: async ()=>{
        //runs before anything is started
    },
    endTest : async () => {
        //runs at end of testing
    },
    beforeExam : async () => {
        //runs before each 'exam' all files and batches
    },
    afterExam : async () => {
        //runs after each 'exam' all files and batches
    }
})
```
> Note: The local hooks will run after the global hooks in the testing

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

/*Use Provided Test batcher to run test quickly*/
BeginExam ({
    dir : "test/live-test", //the directory based on the relative current working directory to run the tests
    files : [ "TestFile1"],  //??(Optional), name of tests to run excluding the `.test.ts` post-fix
    runAll : false,     //while working with live testing you don't need to run all just the selected
                        //use this to override 'files' to force to run all tests in directory

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
    check(resCall).isTrue()  //check manually is callback is called. you can use caller() to create a call matcher
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

examIgnore("Always ignore exam no expectations", () => {

})
