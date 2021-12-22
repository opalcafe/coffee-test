import { CoffeeCaller } from "../contract";
import { ExamFile, Func, newFile, Recess } from "../index";

export default class ExamBatch {
    private examBatch : ExamFile[] = []
    private current : ExamFile

    constructor(){
        this.current = newFile("default");
    }

    addExam<T>(name : string, test : Func<T>) {
        this.current.result.exams.push({
            name,
            test
        })
    }
    addOngoing<T>(millis : number, callback : (env : T) => void, caller : CoffeeCaller){
        this.current.result.ongoing.push({
            millis,
            callback,
            caller
        })
    }
    addRecess<T>(callback : Recess<T>) {
        this.current.hooks.recess = callback
    }

    push(name : string) : void {
        this.current.file = name;
        this.examBatch.push(this.current);
        this.current = newFile("default");
    }

    startLocal<T>(func : Func<T>) {
        this.current.hooks.startLocal = func;
    }
    endLocal<T>(func : Func<T>) {
        this.current.hooks.endLocal = func;
    }
    beforeExam<T>(func : Func<T>) {
        this.current.hooks.beforeExam = func;
    }
    afterExam<T>(func : Func<T>) {
        this.current.hooks.afterExam = func;
    }

    done(name : string = "end-test") : ExamFile[]{
        this.push(name);
        const ret = this.examBatch
        this.examBatch = []
        this.current = newFile("default");
        return ret;
    }
    currentFile() : ExamFile {
        return this.current
    }
    sizeCurrentBatchExam() : number {
        return this.current.result.exams.length
    }
    sizeBatch() : number {
        return this.examBatch.length;
    }
    
}