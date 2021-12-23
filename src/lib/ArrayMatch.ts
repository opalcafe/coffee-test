import { assert, identity, toString as toJson, ListData } from "..";

export default class ArrayMatch<T>
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
    is(another: ListData<T>){
        assert(identity(this.first, another),this.truth, "<array.is>")
    }
    length(exp : number){
        assert(this.array.length == exp, this.truth, `actual-length:(${this.array.length})<array.length>expect-length:(${exp})`);
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
        assert(found, this.truth, `<array.contains>contain:(${toJson(value)})`);
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
                const ianother = another[i];
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