window.CommmonWav = {
    writeString: function(view, offset, string){
      for (var i = 0; i < string.length; i++){
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    },
    downsampleWav : function(wavData, sampleRateRatio=1){
        if (1 == sampleRateRatio) {
            return wavData;
        }
        if (1 > sampleRateRatio) {
            throw "downsampling rate show be smaller than original sample rate";
        }

        var srcView = new DataView(wavData);

        var srcSampleRate = srcView.getUint32(24, true);
        var srcDataChunkLength = srcView.getUint32(40, true);
        var srcDataChunkInt6View = new Int16Array(wavData, 44);

        var desSampleRate = Math.round(srcSampleRate / sampleRateRatio);
        var desDataLength = Math.round(srcDataChunkLength / sampleRateRatio / 2);
        var desBuffer = new ArrayBuffer(44 + desDataLength * 2);
        var desView = new DataView(desBuffer);
        var desInt16View = new Int16Array(desBuffer);


        /* ChunkID: RIFF identifier */
        CommmonWav.writeString(desView, 0, 'RIFF');
        /* CHunckSize: file length */
        desView.setUint32(4, 32 + desDataLength * 2, true);
        /* Format: RIFF type */
        CommmonWav.writeString(desView, 8, 'WAVE');
        /* Subchunk1 ID: format chunk identifier */
        CommmonWav.writeString(desView, 12, 'fmt ');
        /* SubChunk1 Size: format chunk length */
        desView.setUint32(16, 16, true);
        /* Audio format: sample format (raw) */
        desView.setUint16(20, 1, true);
        /* NumChannels: channel count */
        desView.setUint16(22, 1, true);
        /* sample rate */
        desView.setUint32(24, desSampleRate, true);
        /* byte rate (sample rate * block align) */
        desView.setUint32(28, desSampleRate * 2, true);
        /* block align (channel count * bytes per sample) */
        desView.setUint16(32, 2, true);
        /* bits per sample */
        desView.setUint16(34, 16, true);
        /* Subchunk2 ID: data chunk identifier */
        CommmonWav.writeString(desView, 36, 'data');
        /* Subchunk2 Size: data chunk length */
        desView.setUint32(40, desDataLength * 2, true);

        /* Data pcm data */
        var desDataChunkInt6View = srcDataChunkInt6View.filter(
            function(element, index){
             return (0 == (index % sampleRateRatio))
             });
        desInt16View.set(desDataChunkInt6View, 44 / 2);

        return desBuffer;
    }
};

