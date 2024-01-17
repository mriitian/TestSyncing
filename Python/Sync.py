import uuid
import random
from datetime import datetime

# Define constants
DATA_KEYS = ["a", "b", "c"]

# Device class
class Device:
    def __init__(self, id):
        self._id = id
        self.records = []
        self.sent = []

    def obtainData(self):
        if random.random() < 0.4:
            return {}
        record = {
            "type": "record",
            "timestamp": datetime.now().isoformat(),
            "dev_id": self._id,
            "data": {key: str(uuid.uuid4()) for key in DATA_KEYS}
        }
        self.sent.append(record)
        return record

    def probe(self):
        if random.random() < 0.5:
            return {}
        return {
            "type": "probe",
            "dev_id": self._id,
            "from": len(self.records)
        }

    def onMessage(self, data):
        print(f"Device ID: {self._id}, Message Received:", data)
        if not data or random.random() < 0.6:
            # Check if data is empty or randomly skip processing
            return
        if data["type"] == "update":
            print("Handling update message:", data)
            from_index = data["from"]
            if from_index > len(self.records):
                return
            self.records = self.records[:from_index] + data["data"]

# SyncService class
class SyncService:
    def __init__(self):
        self.serverRecords = []

    def onMessage(self, data):
        if data["type"] == "probe":
            from_index = data["from"]
            updateData = {
                "type": "update",
                "from": from_index,
                "data": self.serverRecords[from_index:]
            }
            return updateData
        # No return value required for handling 'record' type

# Test function
def testSyncing():
    print("Starting testSyncing")
    devices = [Device(f"dev_{i}") for i in range(10)]
    syn = SyncService()
    N = 1000
    for i in range(N):
        print(f"Iteration: {i + 1}")
        for dev in devices:
            print(f"Device ID: {dev._id}")
            syn.onMessage(dev.obtainData())
            dev.onMessage(syn.onMessage(dev.probe()))
    done = False
    while not done:
        for dev in devices:
            dev.onMessage(syn.onMessage(dev.probe()))
        num_recs = len(devices[0].records)
        done = all(dev.records.length == num_recs for dev in devices)
    ver_start = [0] * len(devices)
    for i in range(len(devices[0].records)):
        rec = devices[0].records[i]
        devIdx = int(rec["dev_id"].split("_").pop())
        assertEquivalent(rec, devices[devIdx].sent[ver_start[devIdx]])
        for _dev in devices[1:]:
            assertEquivalent(rec, _dev.records[i])
        ver_start[devIdx] += 1

def assertEquivalent(d1, d2):
    if d1["dev_id"] != d2["dev_id"] or d1["timestamp"] != d2["timestamp"]:
        raise Exception("Assertion failed: Records are not equivalent")
    for key in DATA_KEYS:
        if d1["data"][key] != d2["data"][key]:
            raise Exception("Assertion failed: Records are not equivalent")

# Execute the test
testSyncing()


