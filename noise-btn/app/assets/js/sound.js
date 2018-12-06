const Sound = (() => {

    let playing = null;

    function Sound(elBtn, elAudio, key) {
        const self = this;
        if (Util.isNull(elAudio)) return console.error(`Parameter el must not be null`);

        self.elBtn = elBtn;
        self.elAudio = elAudio;
        self.key = key;
        elAudio.loop = true;
        self.stop();
        self.isPlaying = false;
    }

    Sound.prototype.play = function () {
        const self = this;
        if(playing === self) return;
        if (!Util.isNull(playing)) playing.stop();

        self.elBtn.classList.add('btn_playing');
        self.elAudio.play();
        playing = self;
    };

    Sound.prototype.stop = function () {
        const self = this;
        self.elBtn.classList.remove('btn_playing');
        self.elAudio.pause();
        self.elAudio.currentTime = 0;

        playing = null;
    };

    Sound.Stop = function () {
        if (!Util.isNull(playing)) playing.stop();
    };

    Sound.StopByKey = function(key) {
        if(!Util.isNull(playing) && playing.key === key) playing.stop();
    };

    return Sound;
})();