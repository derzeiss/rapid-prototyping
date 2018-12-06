const Soundboard = (() => {

    const btns = [
        {
            label: 'fire-truck',
            url: 'fire-truck_1.mp3',
            key: 'q',
            color: 'red'
        },
        {
            label: 'fire-truck 2',
            url: 'fire-truck_2.mp3',
            key: 'w',
            color: 'red'
        },
        {
            label: 'police',
            url: 'police_1.mp3',
            key: 'e',
            color: 'blue'
        },
        {
            label: 'air-horn',
            url: 'air-horn.mp3',
            key: 'a',
            color: 'lightblue'
        },
        {
            label: 'tornado',
            url: 'tornado.mp3',
            key: 's',
        }
    ];

    const nodes = {
        btns: document.querySelector('.btn-container'),
        audios: document.querySelector('.audio-container')
    };

    const keyListeners = {};
    document.addEventListener('keydown', (ev) => {
        if(ev.repeat) return;
        let sound = keyListeners[ev.key];
        if (sound) sound.play();
    });
    document.addEventListener('keyup', (ev) => Sound.StopByKey(ev.key));

    btns.forEach((btn) => {
        // add btn
        let elBtn = document.createElement('div');
        elBtn.innerHTML = btn.label;
        elBtn.classList.add('btn');
        if(btn.color) elBtn.classList.add('btn_' + btn.color);
        if (btn.key) elBtn.dataset.key = btn.key;
        nodes.btns.appendChild(elBtn);

        // add audio element
        let elAudio = document.createElement('audio');
        elAudio.src = 'assets/sound/' + btn.url;
        nodes.audios.appendChild(elAudio);

        // add listeners for audio
        let sound = new Sound(elBtn, elAudio, btn.key);
        elBtn.addEventListener('mousedown', () => sound.play());
        elBtn.addEventListener('mouseup', () => sound.stop());

        // add key listener
        if (btn.key) keyListeners[btn.key] = sound;
    });

})();