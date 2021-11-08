import { ListData } from ".";

export interface CoffeeCheck<T> {
    not : CoffeeCheck<T>

    is(val : any) : void
    isType(val : T) : void
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

export interface CoffeeMatchList<T> {
    not : CoffeeMatchList<T>

    is(another : T[]) : void
    length(size : number) : void
    empty():void
    contains(val : T) : void
    index(index : number, val : T) : void
    values(another : ListData<T>) : void
    first(expect : T)  : void
    last(expect : T) : void
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