import store from '@/store';
import { isPrincipalString } from '@/utils/functions';

class SearchHistory {
    pid: string = '';
    currentRecord: any = {};

    constructor() { }

    get history() {
        return this.currentRecord;
    }

    setLocal() {
        localStorage.setItem('searchHistory', JSON.stringify(this.currentRecord));
    }

    setPid(pid) {
        this.pid = pid;
    }

    clearLocal() {
        this.currentRecord[this.pid] = [];
        localStorage.removeItem('searchHistory');
    }

    removeLocal(val) {
        let arr = this.currentRecord[this.pid];
        arr.map((item, index) => {
            if (item === val) {
                arr.splice(index, 1);
            }
        });
        this.setLocal();
    }

    getLocal() {
        let data = localStorage.getItem('searchHistory');
        if (!data) {
            return false;
        }
        let nData = JSON.parse(data);
        this.currentRecord = nData;
        if (nData[this.pid]) {
            return nData[this.pid];
        }
    }

    record(keyword) {
        if (!isPrincipalString(this.pid)) {
            return;
        }
        if (!this.pid && !store.state?.user_data?.pid) {
            return;
        }
        if (!this.pid && store.state?.user_data?.pid) {
            this.setPid(store.state?.user_data?.pid);
            this.getLocal();
        }
        if (!Object.keys(this.currentRecord).length || !this.currentRecord[this.pid]) {
            this.currentRecord[this.pid] = [keyword];
            this.setLocal();
        } else {
            let set = new Set([keyword, ...this.currentRecord[this.pid]]);
            let arr = Array.from(set);
            if (arr.length > 10) {
                arr = arr.splice(0, 10);
            }
            this.currentRecord[this.pid] = arr;
            this.setLocal();
        }
    }

    init(pid) {
        this.pid = pid;
        this.getLocal();
    }
}

export default SearchHistory;
