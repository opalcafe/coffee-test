import { array, Assert, Identity } from "..";
import { CoffeeMatchArray } from "../contact";

export default class ArrayMatch<T> implements CoffeeMatchArray<T>
{
    private array : T[]
    private truth : boolean

    not! : ArrayMatch<T>

    constructor(array : T[], truth : boolean){
        this.array = array;
        this.truth = truth;
        if(truth)
            this.not = new ArrayMatch(array, false);
    }
    is(another: T[]){
        Assert(Identity(this.first, another),this.truth, "<array.is>")
    }
    length(exp : number){
        Assert(this.array.length == exp, this.truth, `actual : ${this.array.length} <array.length> expect: ${exp}`);
    }
    contains(value : T){
        const doesContain = this.array.find((val, index, object)=>Identity(val, value));
        Assert(doesContain != undefined, this.truth, "<array.contains>");
    }
    index(index : number, val : T){
        Assert(Identity(this.array[index],val),this.truth, "<array.index>")
    }
    values(another: T[]){
        this.length(another.length);
        for(let i=0; i < another.length; i++)
            this.index(i, another[i]);
    }
    first(expect : T){
        this.index(0, expect);
    }
    last(expect : T){
        this.index(this.array.length-1, expect);
    }
   
    
}