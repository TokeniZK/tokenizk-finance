
import { Level } from "level";

export class IndexDB {
    private readonly indexDB: Level<string, string>
    constructor(dbPath: string) {
        this.indexDB = new Level<string, string>(dbPath, { valueEncoding: 'buffer' });
    }

    async get(key: string) {
        return await this.indexDB.get(key).catch(() => {/* */ });
    }

    async put(key: string, value: string) {
        await this.indexDB.put(key, value);
    }

    async batchQuery(keys: string[]) {
        return this.indexDB.getMany(keys);
    }

    async batchInsert(entities: { key: string, value: string }[]) {
        const ops = [...(entities.map(e => {
            return { type: 'put', key: e.key, value: e.value }
        }))]
        this.indexDB.batch(ops as any)
    }

    async close() {
        this.indexDB.close();
    }

}
