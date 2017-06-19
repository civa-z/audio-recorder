(function() {
  function FlashAudioRecorder(onStatusUpdate){
        var Recorder = this;
        var RECORDED_AUDIO_TYPE = "audio/wav";
        var RECORDER_APP_ID = "recorderApp";
        Recorder.name = "audio";
        Recorder.filename = "audio.wav"
        var recorder = null;
        var recorderOriginalWidth = 24;
        var recorderOriginalHeight = 24;
        //uploadFormId: null,
        //uploadFieldName: null,
        var isReady = false;


        Recorder.initialize = initialize;
        Recorder.connect = connect;
        Recorder.playBack = playBack;
        Recorder.pausePlayBack = pausePlayBack;
        Recorder.playBackFrom = playBackFrom;
        Recorder.record = record;
        Recorder.stopRecording = stopRecording;
        Recorder.stopPlayBack = stopPlayBack;
        Recorder.observeLevel = observeLevel;
        Recorder.stopObservingLevel = stopObservingLevel;
        Recorder.observeSamples = observeSamples;
        Recorder.stopObservingSamples = stopObservingSamples;
        Recorder.resize = resize;
        Recorder.defaultSize = defaultSize;
        Recorder.show = show;
        Recorder.hide = hide;
        Recorder.duration = duration;
        Recorder.getBase64 = getBase64;
        Recorder.getBlob = getBlob;
        Recorder.getCurrentTime = getCurrentTime;
        Recorder.isMicrophoneAccessible = isMicrophoneAccessible;
        Recorder.updateForm = updateForm;
        Recorder.showPermissionWindow = showPermissionWindow;
        Recorder.configure = configure;
        Recorder.setUseEchoSuppression = setUseEchoSuppression;
        Recorder.setLoopBack = setLoopBack;
        Recorder.base64toBlob = base64toBlob;
        Recorder.get_wav_data = get_wav_data;
        Recorder.fwr_event_handler = fwr_event_handler;

        //Report interface
        Recorder.onStatusUpdate = onStatusUpdate;
        Recorder.start = record;
        Recorder.stop = stopRecording;
        Recorder.getWavData = get_wav_data;


        function initialize(){
              var $level = $('.level .progress');
              var flashvars = {'upload_image': 'static/images/mic.png'};
              var params = {};
              var attributes = {'id': RECORDER_APP_ID, 'name': RECORDER_APP_ID, "wmode": "transparent"};
              swfobject.embedSWF("static/swf/recorder.swf", "flashcontent", recorderOriginalWidth, recorderOriginalHeight, "11.0.0", "", flashvars, params, attributes);
              window.fwr_event_handler = fwr_event_handler;

        };

        function connect(name, attempts) {
          if(navigator.appName.indexOf("Microsoft") != -1) {
            Recorder.recorder = window[name];
          } else {
            Recorder.recorder = document[name];
          }

          if(attempts >= 40) {
            return;
          }

          // flash app needs time to load and initialize
          if(Recorder.recorder && Recorder.recorder.init) {
            Recorder.recorderOriginalWidth = Recorder.recorder.width;
            Recorder.recorderOriginalHeight = Recorder.recorder.height;
            /*if(Recorder.uploadFormId && $) {
              var frm = $(Recorder.uploadFormId);
              Recorder.recorder.init(frm.attr('action').toString(), Recorder.uploadFieldName, frm.serializeArray());
            }*/
            Recorder.recorder.show();
            Recorder.showPermissionWindow();
            Recorder.onStatusUpdate({status: "ready"})
            return;
          }

          setTimeout(function() {Recorder.connect(name, attempts+1);}, 100);
        }

        function playBack(name) {
          // TODO: Rename to `playback`
          Recorder.recorder.playBack(name);
        }

        function pausePlayBack(name) {
          // TODO: Rename to `pausePlayback`
          Recorder.recorder.pausePlayBack(name);
        }

        function playBackFrom(name, time) {
          // TODO: Rename to `playbackFrom`
          Recorder.recorder.playBackFrom(name, time);
        }

        function record(name, filename) {
          Recorder.recorder.record(Recorder.name, Recorder.filename);
        }

        function stopRecording() {
          Recorder.recorder.stopRecording();
        }

        function stopPlayBack() {
          // TODO: Rename to `stopPlayback`
          Recorder.recorder.stopPlayBack();
        }

        function observeLevel() {
          Recorder.recorder.observeLevel();
        }

        function stopObservingLevel() {
          Recorder.recorder.stopObservingLevel();
        }

        function observeSamples() {
          Recorder.recorder.observeSamples();
        }

        function stopObservingSamples() {
          Recorder.recorder.stopObservingSamples();
        }

        function resize(width, height) {
          Recorder.recorder.width = width + "px";
          Recorder.recorder.height = height + "px";
        }

        function defaultSize() {
          Recorder.resize(Recorder.recorderOriginalWidth, Recorder.recorderOriginalHeight);
        }

        function show() {
          Recorder.recorder.show();
        }

        function hide() {
          Recorder.recorder.hide();
        }

        function duration(name) {
          // TODO: rename to `getDuration`
          return Recorder.recorder.duration(name || Recorder.uploadFieldName);
        }

        function getBase64(name) {
          var data = Recorder.recorder.getBase64(name);
          return 'data:' + RECORDED_AUDIO_TYPE + ';base64,' + data;
        }

        function getBlob(name) {
          var base64Data = Recorder.getBase64(name).split(',')[1];
          return base64toBlob(base64Data, RECORDED_AUDIO_TYPE);
        }

        function getCurrentTime(name) {
            return Recorder.recorder.getCurrentTime(name);
        }

        function isMicrophoneAccessible() {
          return Recorder.recorder.isMicrophoneAccessible();
        }

        function updateForm() {
          /*var frm = $(Recorder.uploadFormId);
          Recorder.recorder.update(frm.serializeArray());*/
        }

        function showPermissionWindow (options) {
          Recorder.resize(240, 160);
          // need to wait until app is resized before displaying permissions screen
          var permissionCommand = function() {
            if (options && options.permanent) {
              Recorder.recorder.permitPermanently();
            } else {
              Recorder.recorder.permit();
            }
          };
          setTimeout(permissionCommand, 1);
        }

        function configure(rate, gain, silenceLevel, silenceTimeout) {
          rate = parseInt(rate || 22);
          gain = parseInt(gain || 100);
          silenceLevel = parseInt(silenceLevel || 0);
          silenceTimeout = parseInt(silenceTimeout || 4000);
          switch(rate) {
          case 44:
          case 22:
          case 11:
          case 8:
          case 5:
            break;
          default:
            throw("invalid rate " + rate);
          }

          if(gain < 0 || gain > 100) {
            throw("invalid gain " + gain);
          }

          if(silenceLevel < 0 || silenceLevel > 100) {
            throw("invalid silenceLevel " + silenceLevel);
          }

          if(silenceTimeout < -1) {
            throw("invalid silenceTimeout " + silenceTimeout);
          }

          Recorder.recorder.configure(rate, gain, silenceLevel, silenceTimeout);
        }

        function setUseEchoSuppression(val) {
          if(typeof(val) != 'boolean') {
            throw("invalid value for setting echo suppression, val: " + val);
          }

          Recorder.recorder.setUseEchoSuppression(val);
        }

        function setLoopBack(val) {
              if(typeof(val) != 'boolean') {
                throw("invalid value for setting loop back, val: " + val);
              }

              Recorder.recorder.setLoopBack(val);
            }


        function base64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
              var slice = byteCharacters.slice(offset, offset + sliceSize);

              var byteNumbers = new Array(slice.length);
              for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }

              var byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }

            return new Blob(byteArrays, {type: contentType});
        }

        function get_wav_data(){
            var b64Data = Recorder.recorder.getBase64(name);
            var sliceSize = 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
             }
             return byteArrays;
        }

        function fwr_event_handler() {
            var name, $controls;
            switch (arguments[0]) {
              case "ready":
                //FWRecorder.uploadFormId = "#uploadForm";
                //FWRecorder.uploadFieldName = "upload_file[filename]";
                Recorder.connect(RECORDER_APP_ID, 0);
                Recorder.recorderOriginalWidth = appWidth;
                Recorder.recorderOriginalHeight = appHeight;
                break;

              case "microphone_user_request":
                Recorder.showPermissionWindow();
                break;

              case "permission_panel_closed":
                Recorder.defaultSize();
                break;

              case "recording":
                Recorder.hide();
                Recorder.observeLevel();
                break;

              case "recording_stopped":
                Recorder.show();
                Recorder.stopObservingLevel();
                Recorder.onStatusUpdate({status: "record_finish"});
                //$level.css({height: 0});
                break;

              case "microphone_level":
                //$level.css({height: arguments[1] * 100 + '%'});
                break;

              case "save_pressed":
                Recorder.updateForm();
                break;

              case "saving":
                name = arguments[1];
                console.info('saving started', name);
                break;

              case "saved":
                name = arguments[1];
                var response = arguments[2];
                console.info('saving success', name, response);
                break;

              case "save_failed":
                name = arguments[1];
                var errorMessage = arguments[2];
                console.info('saving failed', name, errorMessage);
                break;

              case "save_progress":
                name = arguments[1];
                var bytesLoaded = arguments[2];
                var bytesTotal = arguments[3];
                console.info('saving progress', name, bytesLoaded, '/', bytesTotal);
                break;
            }
        }
        return Recorder;
    }
    window.FlashAudioRecorder = FlashAudioRecorder;
})();