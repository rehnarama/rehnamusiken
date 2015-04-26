/* global AudioContext */
(function() {
'use strict';

    /**
     * Initializes the analysert
     * @param {MediaPlayer} mediaPlayer An instance of a mediaPlayer
     */
    function Analyser(mediaPlayer, width, height, resolution) {
        // If AudioContext isnt support then this object isn't needed
        if (!AudioContext) { return; }

        this.mediaPlayer = mediaPlayer;

        this.resolution = resolution;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'visualiser';
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvasContext = this.canvas.getContext('2d');
        this.canvasContext.fillStyle = 'rgba(221,94,0,0.9)';

        this.frequencyData = NaN;

        this.mediaPlayer.onLoad.add(this._onLoad, this);
        this.renderFrame();
    }

    window.Analyser = Analyser;
    Analyser.prototype.constructor = Analyser;

    Analyser.prototype._onLoad = function() {
        this.frequencyData = new Uint8Array(this.mediaPlayer.analyser.frequencyBinCount);

    };

    Analyser.prototype.renderFrame = function() {
        requestAnimationFrame(this.renderFrame.bind(this));

        if (!this.frequencyData) { return; }

        this.mediaPlayer.analyser.getByteFrequencyData(this.frequencyData);

        var ctx = this.canvasContext;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var middleX = ctx.canvas.width / 2;
        var middleY = ctx.canvas.height / 2;
        var height, x, y;

        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.height);

        var i;

        var oldHeight;
        for (i = this.frequencyData.length - 1; i >= 0; i -= (1 / this.resolution)) {
            height = (ctx.canvas.height / 255) * this.frequencyData[i];
            oldHeight = oldHeight || height;
            height = (height + oldHeight * 3) / 4;

            x = middleX - (ctx.canvas.width / this.frequencyData.length) * i * (1 / this.resolution) / 2;
            y = (ctx.canvas.height - height);

            ctx.lineTo(x, y);

            oldHeight = height;
        }

        for (i = 0; i < this.frequencyData.length; i += (1 / this.resolution)) {
            height = (ctx.canvas.height / 255) * this.frequencyData[i];
            oldHeight = oldHeight || height;
            height = (height + oldHeight * 3) / 4;

            x = middleX + (ctx.canvas.width / this.frequencyData.length) * i * (1 / this.resolution) / 2;
            y = (ctx.canvas.height - height);

            ctx.lineTo(x, y);

            oldHeight = height;
        }

        ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
        ctx.lineTo(0, ctx.canvas.height);
        ctx.closePath();

        ctx.fill();

    };

})();