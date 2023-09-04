/* eslint-disable no-unused-vars */

import { getLogger } from '../lib/logUtils';

let logger = getLogger('proof-gen');

export { TaskStack };

class TaskStack<T> extends Array<T> {
    private filterStep: (xs: T[], n: number) => T[];
    private reducerStep: (xs: T[], n: number) => Promise<T[]>;

    result: T[] | undefined;

    private isIdle = false;

    constructor(
        f: (xs: T[]) => T[],
        r: (xs: T[]) => Promise<T[]>,
        isIdle = false
    ) {
        super();
        this.filterStep = f;
        this.reducerStep = r;
        this.isIdle = isIdle;
        this.result = undefined;
    }

    prepare(...items: T[]) {
        this.idle();
        this.push(...items);
    }

    private async filterAndReduce() {
        if (!this.isIdle) {
            let n = this.length;
            let ys = this.filterStep(this, n).slice();
            if (ys != undefined) {
                for (let y of ys) {
                    let i = this.indexOf(y);
                    if (i != -1) {
                        this.splice(i, 1);
                    }
                }
                let newTasks = await this.reducerStep(ys, n);
                if (ys.length < newTasks.length)
                    throw Error('Adding more tasks than reducing');
                if (super.push(...newTasks) > 1) {
                    await this.filterAndReduce();
                }
                if (this.length <= 1) this.result = this;
            }
        }
    }

    idle() {
        this.isIdle = true;
    }

    async work(): Promise<T> {
        this.isIdle = false;
        await this.filterAndReduce();
        return this.result![0];
    }
}
