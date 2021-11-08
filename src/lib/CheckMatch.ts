import { assert, check, identity, toJson } from "..";
import { CoffeeCheck } from "../contact";

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
        assert(identity(this.val,another),this.truth, `actual: ${toJson(this.val)}<check.is> expect:${toJson(another)}`)
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
        assert(this.val !== undefined, this.truth, `actual: ${toJson(this.val)}<check.isDefinied>`)
    }
    isTruthy(){
        let truthy = false;
        if(this.val)
            truthy = true;
        assert(truthy, this.truth, `actual: ${toJson(this.val)}<check.isTruthy>`)
    }
    isGreater(check : T){
        assert(this.val > check, this.truth, `actual: ${toJson(this.val)} <check.isGreater> actual: ${toJson(check)}`)
    }
    isGreaterOrEqual(check : T){
        assert(this.val >= check, this.truth, `actual: ${toJson(this.val)} <check.isGreaterOrEqual> expect: ${toJson(check)}`)
    }
    isLesser(check : T){
        assert(this.val < check, this.truth, `actual: ${toJson(this.val)} <check.isLesser> actual: ${toJson(check)}`)
    }
    isLesserOrEqual(check : T){
        assert(this.val <= check, this.truth, `actual: ${toJson(this.val)} <check.isLesserOrEqual> actual: ${toJson(check)}`)
    }
    isRange(lower : T, upper : T){
        assert(this.val >= lower && this.val <= upper, this.truth, `actual: ${toJson(this.val)} <check.isRange>(${toJson(lower)}:${toJson(upper)})`)
    }
    isRangeExclude(lower : T, upper : T){
        assert(this.val > lower && this.val < upper, this.truth, `actual: ${toJson(this.val)} <check.isRangeExclude>(${toJson(lower)}:${toJson(upper)})`)
    }
    isInstance(type : any){
        const instance = this.val instanceof type
        assert(instance, this.truth, `${toJson(this.val)} <check.isInstance> ${type}`)
    }
    isNumber(){
        const atype = typeof this.val
        assert(atype === "number", this.truth, `${this.val} <check.isNumber>`)
    }
    isBoolean(){
        const atype = typeof this.val
        assert(atype === "boolean", this.truth, `${this.val} <check.isBoolean>`)
    }
    isString(){
        const atype = typeof this.val
        assert(atype === "string", this.truth, `${this.val} <check.isString>`)
    }
    isObject(){
        const atype = typeof this.val
        assert(atype === "object", this.truth, `${this.val} <check.isObject>`)
    }
    isFunction(){
        const atype = typeof this.val
        assert(atype === "function", this.truth, `${this.val} <check.isFunction>`)
    }
    isBigInt(){
        const atype = typeof this.val
        assert(atype === "bigint", this.truth, `${this.val} <check.isBigInt>`)
    }
    isMatch(regex : RegExp){
        assert(regex.test(this.val), this.truth, `actual: ${this.val}<check.isMatch> regex: ${regex}`)
    }
    hasKey(key : string | number){
        const child = this.val[key];
        assert(child != undefined, this.truth, `${toJson(this.val)}<check.hasKey> :${key}`)
    }
    hasKeySize(size : number){
        const keysize = Object.keys(this.val).length;
        assert(keysize === size, this.truth, `${toJson(this.val)}<check.hasKeySize> :${size}`)
    }

    in(collection : any){
        let found = false;
        for(let key in collection){
            const ilocal = collection[key];
            if(identity(ilocal, this.val))
                found = true;
        }
        assert(found, this.truth, `${toJson(this.val)} <check.in> ${toJson(collection)}`);
    }
    throws(){
        let isThrown = false;
        try{
            this.val()
        }catch(e){
            isThrown = true;
        }
        assert(isThrown, this.truth, `<check.throws>`)
    }

}