import { assert, identity, ListData, toJson } from "..";
import { CoffeeMatchList } from "../contact";

export default class ListMatch<T> implements CoffeeMatchList<T>
{
    private array : ListData<T>
    private truth : boolean

    not! : ListMatch<T>

    constructor(array : ListData<T>, truth : boolean){
        this.array = array;
        this.truth = truth;
        if(truth)
            this.not = new ListMatch(array, false);
    }
    is(another: any){
        assert(identity(this.first, another),this.truth, "<array.is>")
    }
    length(exp : number){
        const length = Object.keys(this.array).length;
        assert(length == exp, this.truth, `actual : ${length} <array.length> expect: ${exp}`);
    }
    empty(){
        this.length(0);
    }
    contains(value : T){
        let found = false;
        for(let key in this.array){
            const ilocal = this.array[key];
            if(identity(ilocal, value))
                found = true;
        }
        assert(found, this.truth, "<array.contains>");
    }
    index(index : number, val : T){
        assert(identity(this.array[index],val),this.truth, "<array.index>")
    }
    values(another: ListData<T>){
        let equal = true;
        try{ 
            assert(another.length === this.array.length, true,`${another.length} <array.values(length)> ${this.array.length}`)
            for(let key in this.array){
                const ilocal = this.array[key]
                const ianother = another[key];
                assert(identity(ilocal, ianother), true, `${toJson(ilocal)} <array.values(index: ${key})> ${toJson(ianother)}`)
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
        const length = Object.keys(this.array).length;
        this.index(length-1, expect);
    }
   
    
}