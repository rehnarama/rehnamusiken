(function() {
'use strict';

var mediaPlayer = new MediaPlayer();
mediaPlayer.onLoad.add(onLoad);
mediaPlayer.onEnded.add(function() {
	setPausePlayIcon();
});

var $ = document.querySelector.bind(document);

var pauseBtn = $('.pausePlay');
var browseFileBtn = $('.browseFile');
var muteBtn = $('.muteUnmute');
var pausePlayIcon = $('.pausePlayIcon');
var bg = $('.bg');

var artist = $('.artist');
var title = $('.title');
var disk = $('.disk');
var diskContainer = $('.diskContainer');

function onFileDrop(event) {
	event.stopPropagation();
	event.preventDefault();

	var file = event.dataTransfer.files[0];

	play(file);
}

function onDragOver(event) {
	event.stopPropagation();
	event.preventDefault();	

	event.dataTransfer.dropEffect = 'copy';
}

function onLoad(idTag) {
	artist.innerHTML = idTag.artist || 'Unkown Artist';
	title.innerHTML = idTag.title || 'Unkown Track';

	loadAlbumArt(idTag.picture);
}

function loadAlbumArt(image) {
	var dataUrl = 'images/bg.jpg';
	
	if (image) {
		var base64String = "";
		for (var i = 0; i < image.data.length; i++) {
		    base64String += String.fromCharCode(image.data[i]);
		}
		dataUrl = "data:" + image.format + ";base64," + window.btoa(base64String);
	}

	diskContainer.style['background-image'] = 'url(\"' + dataUrl + '\")';
	bg.style['background-image'] = 'url(\"' + dataUrl + '\")';

}

function play(file) {
	mediaPlayer.load(file);
	setPausePlayIcon(false);
}

function setPausePlayIcon(status) {
	var className = pausePlayIcon.className;
	var newIcon = 'fa-folder-open';

	if (status !== undefined) {
		newIcon = status ? 'fa-play' : 'fa-pause';
	} 
	className = className.replace(/fa-pause|fa-play|fa-folder-open/g, newIcon);

	pausePlayIcon.className = className;
}

function browseFile() {
	var input = document.createElement('input');
	input.type = 'file';

	input.addEventListener('change', function(event) {
		var file = event.target.files[0];

		play(file);
	});

	input.click();
}

document.body.addEventListener('dragover', onDragOver, false);
document.body.addEventListener('drop', onFileDrop, false);

function onAction() {
	if (mediaPlayer.isLoaded) {
		var result = mediaPlayer.togglePause();
		setPausePlayIcon(result);
	} else {
		browseFile();
	}
}

function onMute() {
	mediaPlayer.muted = !mediaPlayer.muted;
}

function onBrowse() {
	browseFile();
}

function renderApp() {
	var time = new Date(mediaPlayer.audio.currentTime * 1000);
	var duration = new Date(mediaPlayer.audio.duration * 1000);
	var icon = !mediaPlayer.currentFile || mediaPlayer.audio.ended ? undefined : mediaPlayer.audio.paused;

	React.render((
		<div>
			<DiscComponent onAction={onAction} onMute={onMute} onBrowse={onBrowse} icon={icon} muted={mediaPlayer.muted || mediaPlayer.volume === 0}/>
			<ScrubContainer time={time} duration={duration} />
		</div>
	), document.getElementById('diskContainer'));
}

renderApp();

mediaPlayer.audio.addEventListener('volumechange', renderApp);
mediaPlayer.audio.addEventListener('timeupdate', renderApp);
mediaPlayer.audio.addEventListener('pause', renderApp);
mediaPlayer.audio.addEventListener('playing', renderApp);

})();