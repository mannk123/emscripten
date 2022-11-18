__original_emscripten_thread_exit = __emscripten_thread_exit;
__emscripten_thread_exit = Module["__emscripten_thread_exit"] = 
    function __emscripten_thread_exit(...args) {
        console.log(`Exiting thread...`);
        // the cleanup here doesn't seem necessary - the threads get returned to the pool to be reused
        /* 
        Module['msgChannelPort'].postMessage({
            'cmd': "deleteMsgChannelPort",
            'workerID': Module['workerID']
        });

        Module['msgChannelPort'].close();
        */

        return __original_emscripten_thread_exit(...args);
    };