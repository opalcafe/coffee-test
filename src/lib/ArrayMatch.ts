import { assert, identity, toJson } from "..";
import { CoffeeMatchList} from "../contact";

export default class ArrayMatch<T> implements CoffeeMatchList<T>
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
        assert(identity(this.first, another),this.truth, "<array.is>")
    }
    length(exp : number){
        assert(this.array.length == exp, this.truth, `actual : ${this.array.length} <array.length> expect: ${exp}`);
    }
    empty(){
        this.length(0);
    }
    contains(value : T){
        const doesContain = this.array.find((val, index, object)=>identity(val, value));
        assert(doesContain != undefined, this.truth, "<array.contains>");
    }
    index(index : number, val : T){
        assert(identity(this.array[index],val),this.truth, "<array.index>")
    }
    values(another: T[]){
        let equal = true;
        try{ 
            assert(another.length === this.array.length, true,`${another.length} <array.values(length)> ${this.array.length}`)
            for(let i=0; i < another.length; i++){
                const ilocal = this.array[i]
                const ianother = this.array[i];
                assert(identity(ilocal, ianother), true, `${toJson(ilocal)} <array.values(index: ${i})> ${toJson(ianother)}`)
            }
        }catch(e){
            equal = false;
        }
        assert(equal, this.truth, "<array.values>")
    }
    first(expect : T){
        this.index(0, expect);
    }
    last(expect : T){
        this.index(this.array.length-1, expect);
    }
   
    
}