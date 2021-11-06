import { Assert, Identity, ToJson } from "..";
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
        Assert(Identity(this.val,another),this.truth, `actual: ${ToJson(this.val)}<check.is> expect:${ToJson(another)}`)
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
        Assert(this.val !== undefined, this.truth, `actual: ${ToJson(this.val)}<check.isDefinied>`)
    }
    isGreater(check : T){
        Assert(this.val > check, this.truth, `actual: ${ToJson(this.val)} <check.isGreater> actual: ${ToJson(check)}`)
    }
    isGreaterOrEqual(check : T){
        Assert(this.val >= check, this.truth, `actual: ${ToJson(this.val)} <check.isGreaterOrEqual> expect: ${ToJson(check)}`)
    }
    isRange(lower : T, upper : T){
        Assert(this.val >= lower && this.val <= upper, this.truth, `actual: ${ToJson(this.val)} <check.isRange>(${ToJson(lower)}:${ToJson(upper)})`)
    }
    isRangeExclude(lower : T, upper : T){
        Assert(this.val > lower && this.val < upper, this.truth, `actual: ${ToJson(this.val)} <check.isRangeExclude>(${ToJson(lower)}:${ToJson(upper)})`)
    }
    isInstance(type : any){
        const instance = this.val instanceof type
        Assert(instance, this.truth, `${ToJson(this.val)} <check.isInstance> of: ${type}`)

    }
    hasKey(key : string | number){
        const child = this.val[key];
        Assert(child != undefined, this.truth, `${ToJson(this.val)}<check.hasKey> :${key}`)
    }
    hasKeySize(size : number){
        const keysize = Object.keys(this.val).length;
        Assert(keysize === size, this.truth, `${ToJson(this.val)}<check.hasKeySize> :${size}`)
    }

    in(collection : any){
        let found = false;
        for(let key in collection){
            const ilocal = collection[key];
            if(Identity(ilocal, this.val))
                found = true;
        }
        Assert(found, this.truth, `${ToJson(this.val)} <check.in> ${ToJson(collection)}`);
    }
    throws(){
        let isThrown = false;
        try{
            this.val()
        }catch(e){
            isThrown = true;
        }
        Assert(isThrown, this.truth, `<check.throws>`)
    }

}