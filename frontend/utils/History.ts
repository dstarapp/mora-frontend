import { isPrincipalString } from '@/utils/functions';

class History {
    browserPlanetID: string = '';
    pid: string = '';
    currentRecord: any = {};

    constructor() { }

    get history() {
        return this.currentRecord;
    }

    setLocal() {
        localStorage.setItem('history', JSON.stringify(this.currentRecord));
    }

    clearLocal() {
        this.currentRecord = [];
        localStorage.removeItem('history');
    }

    removeLocal({ id }) {
        let arr = this.currentRecord[this.pid];
        arr.map((item, index) => {
            if (item === id) {
                arr.splice(index, 1);
            }
        });
        this.setLocal();
    }

    getLocal() {
        let data = localStorage.getItem('history');
        if (!data) {
            this.currentRecord = {};
            return false;
        }
        let nData = JSON.parse(data);
        this.currentRecord = nData;
        if (nData[this.pid]) {
            return nData[this.pid];
        }
    }

    record() {
        if (!this.browserPlanetID || !isPrincipalString(this.browserPlanetID)) {
            return;
        }
        if (!Object.keys(this.currentRecord).length || !this.currentRecord[this.pid]) {
            this.currentRecord[this.pid] = [this.browserPlanetID];
            this.setLocal();
        } else {
            let set = new Set([this.browserPlanetID, ...this.currentRecord[this.pid]]);
            let arr = Array.from(set);
            if (arr.length > 10) {
                arr = arr.splice(0, 10);
            }
            this.currentRecord[this.pid] = arr;
            this.setLocal();
        }
    }

    init(pid, browserPlanetID = '') {
        this.pid = pid;
        this.browserPlanetID = browserPlanetID;
        this.getLocal();
        if (browserPlanetID) {
            this.record();
        }
    }
}

export default History;
