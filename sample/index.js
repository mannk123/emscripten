var _consumer;
var _msgChannels = {};

const init = () => {
    _consumer = new Worker("main.js");

    _consumer.onmessage = (event) => {
        const data = event.data;
        if(data?.cmd === 'createMsgChannelPort') {
            let msgChn = data.msgChannelPort;
            _msgChannels[data.workerID] = msgChn;
            msgChn.onmessage = onMsgChannelMessage;            
        } else if(data?.cmd === 'deleteMsgChannelPort') {
            handleDeleteMsgChannelPort(data);
        } else if (data.source === "appthread") {
            switch (data.type) {
                case "asyncCall":
                    const userData = "Huge JSON object";
                    console.log("2. [Main UI Thread] Received message from Application Thread");
                    console.log(`3. [Main UI Thread] Sending back '${userData}' to Application Thread`);
                    _consumer.postMessage({
                        source: "mainthread",
                        eventType: "asyncCall",
                        userData: userData
                    });
                    break;
                default: {
                    if (_onMessageCallback) {
                        _onMessageCallback(JSON.stringify(data));
                    } else {
                        _msgCache.push(JSON.stringify(data));
                    }
                    break;
                }
            }
        }
    }
};

function onMsgChannelMessage(event) {
    const data = event.data;
    if(data?.cmd === 'PING') {
        console.log(`In the Main UI thread, got PING with payload from worker thread ${data.workerID}:"${data?.payload}"`);
        _msgChannels[data.workerID].postMessage({
            'cmd': 'PONG',
            'payload': 'Hello from the Main UI'
        });
    } else if(data?.cmd === 'deleteMsgChannelPort') {
        handleDeleteMsgChannelPort(data);
    }
};

function handleDeleteMsgChannelPort(data) {
    console.log(`Main UI: deleting msg channel for worker ${data.workerID}`)
    _msgChannels[data.workerID].close();
    delete _msgChannels[data.workerID];
}