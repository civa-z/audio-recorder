(function (){
    var WavToFlac = function(){
        var flacWorker;
        var onFlacData;

        this.initialize = function(onFlacDataCallback){
            onFlacData = onFlacDataCallback;
            return true;
        };

        this.wav_to_flac = function(wavData){
            // flacWorker will be recreated as it doesn't work well for the second time in some browser
            var args = ["speech_16bit_pcm_16000hz.wav"];
            var outData = {"speech_16bit_pcm_16000hz.flac" : {"MIME" : "audio/flac"}};
            flacWorker = new Worker("static/js/wav-to-flac/EmsWorkerProxy.js");
            flacWorker.onmessage = onFlacWorkerMmessage;
            flacWorker.postMessage({ command: 'encode', args: args,
                outData: outData, fileData: {"speech_16bit_pcm_16000hz.wav" : wavData}});
        };

        function onFlacWorkerMmessage(e) {
            /*jshint forin:false */
            if ( !e.data ) {
                return;
            }
            switch ( e.data.reply ) {
                case 'progress':
                    break;
                case 'done':
					console.log("flacWorker.onFlacWorkerMmessage done");
					// As we only process one encode task, it will be done once we get the result.
                    for ( var fileName in e.data.values ) {
                        if ( !e.data.values.hasOwnProperty( fileName ) ) {
                            return;
                        }
                        onFlacData(e.data.values[fileName].flacdata);
                        flacWorker.terminate();
                        flacWorker = null;
                        break;
                    }
                    //flacWorker.terminate();
                    break;
                case 'log':
					console.log("flacWorker log: " +  e.data.values);
                    break;
                case 'err':
					console.log("flacWorker.onFlacWorkerMmessage err");
                    console.log( e.data.values[ 0 ] );
                    break;
            }
        }
    }
    window.WavToFlac = WavToFlac;

})();