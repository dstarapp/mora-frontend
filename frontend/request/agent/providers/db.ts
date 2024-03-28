import { IdbKeyVal } from '@dfinity/auth-client';
export const DB_VERSION = 1;
const AUTH_DB_NAME = 'nfid-auth-client-db';
export const OBJECT_STORE_NAME = 'nfid-keyval';

export class NfIdDbStorage {
    // Initializes a KeyVal on first request
    private initializedDb: IdbKeyVal | undefined;
    get _db(): Promise<IdbKeyVal> {
        return new Promise((resolve) => {
            if (this.initializedDb) {
                resolve(this.initializedDb);
                return;
            }
            IdbKeyVal.create({
                dbName: AUTH_DB_NAME,
                version: DB_VERSION,
                storeName: OBJECT_STORE_NAME,
            }).then((db) => {
                this.initializedDb = db;
                resolve(db);
            });
        });
    }

    public async get(key: string): Promise<string | null> {
        const db = await this._db;
        return await db.get<string>(key);
        // return (await db.get<string>(key)) ?? null;
    }

    public async set(key: string, value: string): Promise<void> {
        const db = await this._db;
        await db.set(key, value);
    }

    public async remove(key: string): Promise<void> {
        const db = await this._db;
        await db.remove(key);
    }
}
