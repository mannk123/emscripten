// override allocateUnusedWorker to set up the msg channels
LibraryManager.library.$PThread.allocateUnusedWorker = function() {
    let msgChn = new MessageChannel();
    let pthreadMainJs = locateFile('{{{ PTHREAD_WORKER_FILE }}}');

    let preWorkerJs = locateFile('pre_worker.js');
    let worker = new Worker(preWorkerJs);
    PThread.unusedWorkers.push(worker);

    let workerID = PThread.nextWorkerID;
    PThread.nextWorkerID++;

    worker.postMessage({
        'cmd': 'initializeWorker',
        'msgChannelPort': msgChn.port2,
        'scriptPath': pthreadMainJs,
        'workerID': workerID
    }, [msgChn.port2]);

    postMessage({
        'cmd': 'createMsgChannelPort',
        'msgChannelPort': msgChn.port1,
        'workerID': workerID
    }, [msgChn.port1]);

    worker.workerID = workerID;
};

LibraryManager.library.$PThread.nextWorkerID = 1;

LibraryManager.library.$originalKillThread = LibraryManager.library.$killThread;
LibraryManager.library.$killThread__deps.push('$originalKillThread');
LibraryManager.library.$killThread = function(pthread_ptr) {
    let worker = PThread.pthreads[pthread_ptr];
    postMessage({
        'cmd': "deleteMsgChannelPort",
        'workerID': worker.workerID
    });

    return originalKillThread(pthread_ptr);
};
