import { assert, check, identity, toString as toJson } from "..";
import { CoffeeCheck } from "../contract";

export default class CheckMatch<T> implements CoffeeCheck<T> {
    private val : any
    private truth : boolean
    not! : CoffeeCheck<T>

    constructor(val : T, truth : boolean){
        this.val=val;
        this.truth = truth;
        if(truth)
            this.not = new CheckMatch(val, false);
    }
    is(another : any){
        assert(identity(this.val,another),this.truth, `actual:(${toJson(this.val)})\n<check.is>\nexpect:(${toJson(another)})`)
    }
    isType(val : T){
        this.is(val);
    }
    isTrue(){
        this.is(true);
    }
    isFalse(){
        this.is(false);
    }
    isNull(){
        this.is(null)
    }
    isUndefined(){
        this.is(undefined);
    }
    isDefined(){
        assert(this.val !== undefined, this.truth, `actual:(${toJson(this.val)})\n<check.isDefinied>`)
    }
    isTruthy(){
        let truthy = false;
        if(this.val)
            truthy = true;
        assert(truthy, this.truth, `actual:(${toJson(this.val)})\n<check.isTruthy>`)
    }
    isGreater(check : T){
        assert(this.val > check, this.truth, `actual:(${toJson(this.val)})<check.isGreater>:(${toJson(check)})`)
    }
    isGreaterOrEqual(check : T){
        assert(this.val >= check, this.truth, `actual:(${toJson(this.val)})<check.isGreaterOrEqual>:(${toJson(check)})`)
    }
    isLesser(check : T){
        assert(this.val < check, this.truth, `actual:(${toJson(this.val)})<check.isLesser>:(${toJson(check)})`)
    }
    isLesserOrEqual(check : T){
        assert(this.val <= check, this.truth, `actual:(${toJson(this.val)})<check.isLesserOrEqual>:(${toJson(check)})`)
    }
    isRange(lower : T, upper : T){
        assert(this.val >= lower && this.val <= upper, this.truth, `actual:(${toJson(this.val)})<check.isRange>:(${toJson(lower)} to ${toJson(upper)})`)
    }
    isRangeExclude(lower : T, upper : T){
        assert(this.val > lower && this.val < upper, this.truth, `actual:(${toJson(this.val)})<check.isRangeExclude>:(${toJson(lower)} to ${toJson(upper)})`)
    }
    isInstance(type : any){
        const instance = this.val instanceof type
        assert(instance, this.truth, `actual:(${toJson(this.val)})\n<check.isInstance>\ntype:(${type})`)
    }
    isNumber(){
        const atype = typeof this.val
        assert(atype === "number", this.truth, `actual:(${toJson(this.val)})\n<check.isNumber>`)
    }
    isBoolean(){
        const atype = typeof this.val
        assert(atype === "boolean", this.truth, `actual:(${toJson(this.val)})\n<check.isBoolean>`)
    }
    isString(){
        const atype = typeof this.val
        assert(atype === "string", this.truth, `actual:(${toJson(this.val)})\n<check.isString>`)
    }
    isObject(){
        const atype = typeof this.val
        assert(atype === "object", this.truth, `actual:(${toJson(this.val)})\n<check.isObject>`)
    }
    isFunction(){
        const atype = typeof this.val
        assert(atype === "function", this.truth, `actual:(${toJson(this.val)})\n<check.isFunction>`)
    }
    isBigInt(){
        const atype = typeof this.val
        assert(atype === "bigint", this.truth, `actual:(${toJson(this.val)})\n<check.isBigInt>`)
    }
    isMatch(regex : RegExp){
        assert(regex.test(this.val), this.truth, `actual:(${toJson(this.val)})\n<check.isMatch>\nregex:(${regex})`)
    }
    hasKey(key : string | number){
        const child = this.val[key];
        assert(child != undefined, this.truth, `actual:(${toJson(this.val)})\n<check.hasKey>\nkey:(${key})`)
    }
    hasKeySize(size : number){
        const keysize = Object.keys(this.val).length;
        assert(keysize === size, this.truth, `actual:(${toJson(this.val)})\n<check.hasKeySize>\nsize:(${size})`)
    }
    in(collection : any){
        let found = false;
        for(let key in collection){
            const ilocal = collection[key];
            if(identity(ilocal, this.val))
                found = true;
        }
        assert(found, this.truth, `actual:(${toJson(this.val)})\n<check.in>\ncollection:(${toJson(collection)})`);
    }
    throws(){
        let isThrown = false;
        const isFunc = (typeof this.val == "function");
        assert(isFunc, true, "<throws(isFunction)>")
        try{
            this.val()
        }catch(e){
            isThrown = true;
        }
        let toString = toJson(this.val);
        toString = toString.split("\r")[0];

        assert(isThrown, this.truth, `${toString} <check.throws>`)
    }

}