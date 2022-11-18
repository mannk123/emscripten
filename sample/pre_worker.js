self.onmessage = (e) => {
    if(e.data.cmd == 'initializeWorker') {
        importScripts(e.data.scriptPath);
        Module['msgChannelPort'] = e.data.msgChannelPort;
        Module['workerID'] = e.data.workerID;
    } else {
        console.log('Unexpected message in pre_worker!');
    }
};