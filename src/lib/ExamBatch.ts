import { ExamFile, Func, newFile } from "../index";

export default class ExamBatch {
    private examBatch : ExamFile[] = []
    private current : ExamFile

    constructor(){
        this.current = newFile("default");
    }

    addExam(name : string, test : Func) {
        this.current.result.exams.push({
            name,
            test
        })
    }

    push(name : string) : void {
        this.current.file = name;
        this.examBatch.push(this.current);
        this.current = newFile("default");
    }

    startLocal(func : Func) {
        this.current.hooks.startLocal = func;
    }
    endLocal(func : Func) {
        this.current.hooks.endLocal = func;
    }
    beforeExam(func : Func) {
        this.current.hooks.beforeExam = func;
    }
    afterExam(func : Func) {
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