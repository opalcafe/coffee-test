import { assert, identity, ListData, toJson } from "..";
import { CoffeeMatchArray } from "../contract";
//import { CoffeeMatchList } from "../contact";


export default class ListMatch<T> implements CoffeeMatchArray<T>
{
    private array : any
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
    values(data: ListData<T>){
        const another = data as any
        let equal = true;
        const ilength = Object.keys(this.array).length;
        const anotherLength = Object.keys(another).length;
        try{ 
            assert(ilength === anotherLength, true,`${ilength} <array.values(length)> ${anotherLength}`)
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
    private __count(val : T) : number {
        let found = 0;
        for(let key in this.array){
            const ilocal = this.array[key];
            if(identity(ilocal, val))
                ++found
        }
        return found;
    }

    appearsExactly(val  : T, times : number){
        assert(this.__count(val) === times, this.truth, "<array.appearsExactly>")
    }
    appearsGreater(val : T, times : number){
        assert(this.__count(val) > times, this.truth, "<array.appearsGreater>")
    }
    appearsGreaterOrEqual(val : T, times : number){
        assert(this.__count(val) >= times, this.truth, "<array.appearsGreaterOrEqual>")
    }
    appearsLesser(val : T, times : number){
        assert(this.__count(val) < times, this.truth, "<array.appearsLesser>")
    }
    appearsLesserOrEqual(val: T, times : number){
        assert(this.__count(val) <= times, this.truth, "<array.appearsLesserOrEqual>")
    }
   
    
}
