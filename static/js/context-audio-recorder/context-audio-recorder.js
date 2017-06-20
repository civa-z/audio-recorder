(function (){
    window.ContextAudioRecorder = function(onStatusUpdate){
        // capture audio content (not work for IE)
        var Recorder = this;
        var config = {bitRate: 128};
        var context;
        var microphone;
        var processor;
        var wavSaveWorker;
        var wavData;
        Recorder.initialize = initialize;
        Recorder.onStatusUpdate = onStatusUpdate;
        Recorder.onWavSaveWorkerMessage = onWavSaveWorkerMessage;
        Recorder.start = start;
        Recorder.stop = stop;
        Recorder.getWavData = get_wav_data;
        return Recorder;

        function initialize(onStatusUpdate){

            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia;

            if (navigator.getUserMedia) {
                navigator.getUserMedia({audio: true}, getUserMedia_successCallback, getUserMedia_errorCallback);
                return true;
            } else {
                return false;
            }
        }

        function getUserMedia_successCallback(stream){
            usingContext = true;
            context = new AudioContext();
            microphone = context.createMediaStreamSource(stream);
            processor = context.createScriptProcessor(0, 1, 1);//bufferSize大小，输入channel数，输出channel数
            processor.onaudioprocess = function (event){
                var array = event.inputBuffer.getChannelData(0);
                wavSaveWorker.postMessage({ cmd: 'ondata', buf: array });
            };

            wavSaveWorker = new Worker('static/js/context-audio-recorder/worker-wavsaver.js');
            wavSaveWorker.onmessage = onWavSaveWorkerMessage;
            wavSaveWorker.postMessage({
                cmd: 'init', config: {sampleRate: context.sampleRate, bitRate: config.bitRate}
             });
        };

        function getUserMedia_errorCallback (error) {
            var msg;
            switch (error.code || error.name) {
                case 'PERMISSION_DENIED':
                case 'PermissionDeniedError':
                    msg = '用户拒绝访问麦客风';
                    break;
                case 'NOT_SUPPORTED_ERROR':
                case 'NotSupportedError':
                    msg = '浏览器不支持麦客风';
                    break;
                case 'MANDATORY_UNSATISFIED_ERROR':
                case 'MandatoryUnsatisfiedError':
                    msg = '找不到麦客风设备';
                    break;
                default:
                    msg = '无法打开麦克风，异常信息:' + (error.code || error.name);
                    break;
            }
            Recorder.onStatusUpdate({status:"error", message:error.code || error.name});
        };

        function onWavSaveWorkerMessage(e) {
            console.log(e.data.cmd);
            switch (e.data.cmd) {
                case 'init':
                    Recorder.onStatusUpdate({status:"ready", message: "onWavSaveWorkerMessage init"});
                    break;
                case 'end':
                    console.log("Record Finished");
                    wavData = e.data.data;
                    Recorder.onStatusUpdate({status:"record_finish", message: "onWavSaveWorkerMessage"});
                    break;
                case 'error':
                    Recorder.onStatusUpdate({status:"error", message: "onWavSaveWorkerMessage error"});
                    break;
                default:
                    console.log('Unknowed Message：', e.data);
            }
        };

        function start(){
           if (processor && microphone) {
                microphone.connect(processor);
                processor.connect(context.destination);
                log('Context 开始录音');
            }
        }

        function stop(){
            if (processor && microphone) {
                microphone.disconnect();
                processor.disconnect();
                wavSaveWorker.postMessage({ cmd: 'finish' });
                log('Context 录音结束');
            }
        }

        function get_wav_data(){
            wavData_ = wavData;
            wavData = null;
            return wavData_;
        }

       function log(str) {
            console.log(str);
        };
    };
})();