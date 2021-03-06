(function() {
'use strict';

var mediaPlayer = new MediaPlayer();
var analyser = new Analyser(mediaPlayer, 500, 500, 0.5, 75);
window.analyser = analyser;

var $ = document.querySelector.bind(document);

var bg = $('.bg');
var artist = $('.artist');
var title = $('.title');
var diskContainer = $('.diskContainer');

var albumArtCache = {};
var currentAlbumArt = 'images/bg.jpg';

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

	document.title = (idTag.title || 'Unkown Track') + ' - ' +(idTag.artist || 'Unkown Artist');

	if (idTag.album && albumArtCache[idTag.album]) {
		setAlbumArt(albumArtCache[idTag.album]);
	} else if (idTag.picture) {
		var albumArt = getAlbumArt(idTag.picture);

		if (idTag.album) {
			albumArtCache[idTag.album] = albumArt;
		}

		setAlbumArt(albumArt);

	} else if (idTag) {
		qwest
			.get('https://api.spotify.com/v1/search?q=' + [idTag.album, idTag.artist].join(' ') + '&type=album')
			.then(function(res) {
				if (res.albums.items.length > 0) {
					albumArtCache[idTag.album] = res.albums.items[0].images[0].url;
					setAlbumArt(res.albums.items[0].images[0].url);
				} else {
					loadAlbumArt(getAlbumArt());
				}
			});
	} else {
		loadAlbumArt(getAlbumArt());
	}

}

function getAlbumArt(image) {
	var dataUrl = 'images/bg.jpg';
	
	if (image) {
		var base64String = "";
		for (var i = 0; i < image.data.length; i++) {
		    base64String += String.fromCharCode(image.data[i]);
		}
		dataUrl = "data:" + image.format + ";base64," + window.btoa(base64String);
	}

	return dataUrl;
}

function setAlbumArt(url) {
	if (url === currentAlbumArt) {
		return;
	}

	currentAlbumArt = url;

	diskContainer.style['background-image'] = 'url(\"' + url + '\")';
	bg.style['background-image'] = 'url(\"' + url + '\")';


	var link = document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'shortcut icon';
	link.href = url;
	document.getElementsByTagName('head')[0].appendChild(link);
}

function play(file) {
	mediaPlayer.load(file);
}

var input = document.createElement('input');
input.type = 'file';
input.addEventListener('change', function(event) {
	var file = event.target.files[0];


	// Remove the click on title
	title.removeEventListener('click', titleClick);
	title.className = title.className.replace('pickfile', '');

	play(file);
});
function browseFile() {
	input.value = '';
	input.click();
}

function onAction() {
	if (mediaPlayer.isLoaded) {
		var result = mediaPlayer.togglePause();
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

function onScrubChange(props) {
	mediaPlayer.audio.currentTime = mediaPlayer.audio.duration * props.value;
	renderApp();
}

function renderApp() {
	var time = new Date(mediaPlayer.audio.currentTime * 1000);
	var duration = new Date(mediaPlayer.audio.duration * 1000);
	var icon = !mediaPlayer.currentFile || mediaPlayer.audio.ended ? undefined : mediaPlayer.audio.paused;

	React.render((
		<div>
			<DiscComponent onAction={onAction} onMute={onMute} onBrowse={onBrowse} icon={icon} muted={mediaPlayer.muted || mediaPlayer.volume === 0}/>
			<ScrubContainer time={time} duration={duration} onChange={onScrubChange} />
		</div>
	), document.getElementById('playerControls'));
}

function renderFrame() {
	requestAnimationFrame(renderFrame);

	mediaPlayer.analyser.getByteFrequencyData()
}

function setBodyClass() {
	if (mediaPlayer.audio.paused) {
		document.body.className = document.body.className.replace('playing', '');
	} else {
		document.body.className = 'playing';
	}

}

mediaPlayer.onLoad.add(onLoad);
mediaPlayer.audio.addEventListener('volumechange', renderApp);
mediaPlayer.audio.addEventListener('timeupdate', renderApp);
mediaPlayer.audio.addEventListener('pause', renderApp);
mediaPlayer.audio.addEventListener('playing', renderApp);

mediaPlayer.audio.addEventListener('pause', setBodyClass);
mediaPlayer.audio.addEventListener('playing', setBodyClass);
mediaPlayer.audio.addEventListener('ended', setBodyClass);


document.body.addEventListener('dragover', onDragOver, false);
document.body.addEventListener('drop', onFileDrop, false);

renderApp();

diskContainer.insertBefore(analyser.canvas, document.getElementById('playerControls'));

function titleClick(event) {
	browseFile();
}

title.addEventListener('click', titleClick);

})();
