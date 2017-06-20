$(function(){
    var RecorderWrapper = function(){
        Recorder = this;
        Recorder.onStatusUpdate = on_status_update;
        Recorder.start = start;
        Recorder.stop = stop;
        Recorder.registerWavDataCallback = register_wav_data_callback;


        var recorderButton;
        Recorder.recorderInstance = ContextAudioRecorder(Recorder.onStatusUpdate);
        if (Recorder.recorderInstance && Recorder.recorderInstance.initialize()){
            recorderButton = document.getElementById("context-recorder");
        } else {
            Recorder.recorderInstance = FlashAudioRecorder(Recorder.onStatusUpdate);
            Recorder.recorderInstance.initialize();
            recorderButton = document.getElementById("flash-recorder");
        }
        recorderButton.onmousedown = Recorder.start;
        recorderButton.onmouseup = Recorder.stop;
        Recorder.registerWavDataCallback(on_wav_data);

        wavToFlac = new WavToFlac();
        wavToFlac.initialize(on_flac_data);

        function on_wav_data(){
            var wavData = Recorder.recorderInstance.getWavData();
            var wavData_downsample = CommmonWav.downsampleWav(wavData, 3);
            var wavData_Uint8Array = new Uint8Array(wavData_downsample);
            wavToFlac.wav_to_flac(wavData_Uint8Array);
            var wavBlob = new Blob([wavData_Uint8Array], {type: "audio/wav"});
            var wavUrl = window.URL.createObjectURL(wavBlob);
            document.getElementById("audio-wav").src = wavUrl;
        }

        function on_flac_data(result){
            var flacBlob = new Blob([result], {type: "audio/flac"});
            var flacUrl = window.URL.createObjectURL(flacBlob);
            document.getElementById("audio-flac").src = flacUrl;
        }
        // test data end

        function on_status_update(e){
            switch (e.status){
                case "ready":
                    console.log("Recorder on_status_update ready" );
                    break;
                case "record_finish":
                    console.log("Recorder on_status_update record_finish" );
                    Recorder.onWavData();
                    break;
                case "error":
                    console.log("Recorder on_status_update error: " + e.status);
                    break;
            }
        }

        function start(){
            console.log("Recorder start");
            Recorder.recorderInstance && Recorder.recorderInstance.start();
        }

        function stop(){
            console.log("Recorder stop");
            Recorder.recorderInstance && Recorder.recorderInstance.stop();
        }

        function register_wav_data_callback(onWavData){
            console.log("Recorder register_wav_data_callback");
            Recorder.onWavData = onWavData;
        }
    };
    window.RecorderWrapper = RecorderWrapper;
    window.RecorderWrapper();
});