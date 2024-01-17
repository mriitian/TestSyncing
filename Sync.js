const uuid = require('uuid');

// Define constants
const DATA_KEYS = ["a", "b", "c"];

// Device class
class Device {
    constructor(id) {
        this._id = id;
        this.records = [];
        this.sent = [];
    }

    obtainData() {
        if (Math.random() < 0.4) {
            return {};
        }

        const record = {
            type: 'record',
            timestamp: new Date().toISOString(),
            dev_id: this._id,
            data: DATA_KEYS.reduce((acc, key) => {
                acc[key] = uuid.v4();
                return acc;
            }, {})
        };
        this.sent.push(record);
        return record;
    }

    probe() {
        if (Math.random() < 0.5) {
            return {};
        }

        return {
            type: 'probe',
            dev_id: this._id,
            from: this.records.length
        };
    }

    onMessage(data) {
        console.log(`Device ID: ${this._id}, Message Received:`, data);
        if (!data || Math.random() < 0.6) {
            // Check if data is undefined or randomly skip processing
            return;
        }
    
        if (data.type === 'update') {
            console.log('Handling update message:', data);
            const from = data.from;
            if (from > this.records.length) {
                return;
            }
            this.records = this.records.slice(0, from).concat(data.data);
        }
    }
    
}

// SyncService class
class SyncService {
    constructor() {
        this.serverRecords = [];
    }

    onMessage(data) {
        if (data.type === 'probe') {
            const from = data.from;
            const updateData = {
                type: 'update',
                from: from,
                data: this.serverRecords.slice(from)
            };
            return updateData;
        }
        // No return value required for handling 'record' type
    }
}

// Test function
function testSyncing() {
    console.log("Starting testSyncing");
    const devices = Array.from({ length: 10 }, (_, i) => new Device(`dev_${i}`));
    const syn = new SyncService();

    const N = 1000;
    for (let i = 0; i < N; i++) {
        console.log(`Iteration: ${i + 1}`);
        for (const dev of devices) {
            console.log(`Device ID: ${dev._id}`);
            syn.onMessage(dev.obtainData());
            dev.onMessage(syn.onMessage(dev.probe()));
        }
    }

    let done = false;
    while (!done) {
        for (const dev of devices) dev.onMessage(syn.onMessage(dev.probe()));
        const num_recs = devices[0].records.length;
        done = devices.every((_dev) => _dev.records.length === num_recs);
    }

    const ver_start = Array(devices.length).fill(0);
    for (let i = 0; i < devices[0].records.length; i++) {
        const rec = devices[0].records[i];
        const devIdx = parseInt(rec.dev_id.split("_").pop());
        assertEquivalent(rec, devices[devIdx].sent[ver_start[devIdx]]);
        for (const _dev of devices.slice(1)) {
            assertEquivalent(rec, _dev.records[i]);
        }
        ver_start[devIdx] += 1;
    }
}

function assertEquivalent(d1, d2) {
    if (d1.dev_id !== d2.dev_id || d1.timestamp !== d2.timestamp) {
        throw new Error("Assertion failed: Records are not equivalent");
    }

    for (const key of DATA_KEYS) {
        if (d1.data[key] !== d2.data[key]) {
            throw new Error("Assertion failed: Records are not equivalent");
        }
    }
}

// Execute the test
testSyncing();
