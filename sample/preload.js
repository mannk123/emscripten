let _onAsyncCallResolve;

const execAsyncCall = () => {
    return new Promise((resolve) => {
        _onAsyncCallResolve = resolve;
        postMessage({
            source: "appthread",
            type: "asyncCall"
        });
    });
}
const onAsyncCallComplete = (userData) => {
    _onAsyncCallResolve && _onAsyncCallResolve(userData);
}

function msgChannelOnMessage(event) {
    const data = event.data;
    if(data?.cmd === 'PONG') {
        console.log(`In worker thread ${Module.workerID} (ENVIRONMENT_IS_PTHREAD = ${ENVIRONMENT_IS_PTHREAD}), got PONG with payload:"${data?.payload}"`);        
    }
}

originalInstantiateWasm = Module?.instantiateWasm;
Module.instantiateWasm = function (imports, successCallback) {
    if(ENVIRONMENT_IS_PTHREAD)
    {
        Module.msgChannelPort.onmessage = msgChannelOnMessage;
        Module.msgChannelPort.postMessage({
            'cmd': 'PING',
            'payload': 'Hello from the worker thread!',
            'workerID': Module.workerID
        });

        // in worker thread, wasm module has already been successfully loaded (passed from main thread)
        return originalInstantiateWasm(imports, successCallback);
    }

    asyncCall();

    // browser supports instantiate Streaming
    if (typeof WebAssembly.instantiateStreaming == "function") {
        WebAssembly.instantiateStreaming(fetch("main.wasm"), imports)
        .then(obj => {
            successCallback(obj.instance, obj.module);
        })
        .catch(function (reason) {
            abort(reason);
        });
    }
}

const asyncCall = () => {
    addRunDependency("__asyncCall__");
    console.log(`1. [Application Thead] ENVIRONMENT_IS_PTHREAD = ${ENVIRONMENT_IS_PTHREAD}; Making async call; Posting message to Main UI thread;`);
    execAsyncCall().then((userData) => {
        console.log(`4. [Application Thead] ENVIRONMENT_IS_PTHREAD = ${ENVIRONMENT_IS_PTHREAD}; Received '${userData}' from Main UI thread; ==== LOOP SUCCESS`);
        removeRunDependency("__asyncCall__");
    });
}

original_onmessage = onmessage;
onmessage = (message) => {
    const data = message.data;

    switch (data.source) {
        case "mainthread": {
            if (data.eventType === "asyncCall") {
                onAsyncCallComplete(data.userData);
            }
            break;
        }
        default: {
            original_onmessage(message);
            break;
        }
    } 
}