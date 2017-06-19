(function() {
    'use strict';
    var int16DataBuffer;
    var downSampleRate = 3;

    var clearBuffer = function() {
        int16DataBuffer = [];
    };

    var init = function(prefConfig) {
        clearBuffer();
        self.postMessage({
            cmd: 'init'
        });
    };

	var downSample = function(float32ArrayData, downSampleRate) {
		var output = new Float32Array(parseInt(float32ArrayData.length / downSampleRate));
		var i = 0, j = 0;
		while (j < output.length){
			output[j] = float32ArrayData[i];
			++j;
			i += downSampleRate;
		}
		return output;
	};

    var floatTo16BitPCM = function (float32ArrayData) {
        var output = new Int16Array(float32ArrayData.length);
        for (var i = 0; i < float32ArrayData.length; i++) {
            var s = Math.max( - 1, Math.min(1, float32ArrayData[i]));
            output[i] = (s < 0 ? s * 0x8000: s * 0x7FFF);
        }
        return output;
    };

	var appendToBuffer = function(int16ArrayData) {
		var len_data = int16ArrayData.length;
		for (var i = 0; i < len_data; ++i){
			int16DataBuffer.push(int16ArrayData[i]);
		}
	};

	var ondata = function(pcmData) {
	    var float32ArrayData = new Float32Array(pcmData);

	    if (downSampleRate > 1)
	        float32ArrayData = downSample(float32ArrayData, downSampleRate);

        var int16ArrayData = floatTo16BitPCM(float32ArrayData);
		appendToBuffer(int16ArrayData);
	};

	function memcpy(destination, offset, source, length){
		for (var i = 0; i < length; ++i){
			destination.setInt16(offset + i * 2, source[i], true);
		}
	};

	function writeString(view, offset, string){
      for (var i = 0; i < string.length; i++){
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

	var encodeWAV = function (int16DataBuffer, sampleRate){
        var buffer = new ArrayBuffer(44 + int16DataBuffer.length * 2);
        var view = new DataView(buffer);

        /* RIFF identifier */
        writeString(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 32 + int16DataBuffer.length * 2, true);
        /* RIFF type */
        writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sampleRate * 2, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, int16DataBuffer.length * 2, true);

        /* pcm data */
        var int16View = new Int16Array(buffer);
        var int16DataArray = new Int16Array(int16DataBuffer);
        int16View.set(int16DataArray, 44 / 2);

        return new Uint8Array(buffer);
    }

    var finish = function() {
		var wavdata = encodeWAV(int16DataBuffer, 48000 / downSampleRate);
        self.postMessage({
            cmd: 'end',
            data: wavdata
        });
        clearBuffer();
    };

    self.onmessage = function(e) {
        switch (e.data.cmd) {
        case 'init':
            init(e.data.config);
            break;
		case 'ondata': //Save PCM data
			ondata(e.data.buf);
			break;
        case 'finish':
            finish();
            break;
        }
    };

})();