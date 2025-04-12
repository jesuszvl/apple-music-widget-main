///////////////
// PARAMETRS //
///////////////

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const visibilityDuration = urlParams.get("duration") || 0;
const hideAlbumArt = urlParams.has("hideAlbumArt");

/////////////////
// GLOBAL VARS //
/////////////////

let animationSpeed = 0.5;
let widgetVisibility = true;

let lastTitle = "";
let lastArtworkUrl = "";

let visibilityTimeoutId = null;

//////////////////////////
// FETCH DE APPLE MUSIC //
//////////////////////////

function fetchNowPlaying() {
  fetch("http://localhost:3000/nowplaying")
    .then((res) => res.json())
    .then((data) => {
      if (!data.playing) {
        SetVisibility(false);
        return;
      }

      const currentTitle = data.title;
      const currentArtworkUrl = data.artwork;
      const songChanged =
        currentTitle !== lastTitle || currentArtworkUrl !== lastArtworkUrl;

      // Solo si cambió la canción/artwork, actualizamos el src
      if (songChanged) {
        const cacheBuster = `?t=${Date.now()}`;
        const artworkUrl = currentArtworkUrl + cacheBuster;

        UpdateSongInfo({
          name: data.title,
          artistName: data.artist,
          artwork: {
            url: artworkUrl,
            width: 300,
            height: 300,
          },
        });

        lastTitle = currentTitle;
        lastArtworkUrl = currentArtworkUrl;

        // Show the widget only when the song changes
        SetVisibility(true);

        // Clear any existing timeout before setting a new one
        // if (visibilityTimeoutId !== null) {
        //   clearTimeout(visibilityTimeoutId);
        // }

        // // Hide the widget after 15 seconds and store the timeout ID
        // visibilityTimeoutId = setTimeout(() => {
        //   SetVisibility(false);
        //   visibilityTimeoutId = null; // Reset the ID after execution
        // }, 15000);
      }

      UpdateProgressBar({
        currentPlaybackTime: data.currentTime,
        currentPlaybackDuration: data.totalTime,
        currentPlaybackTimeRemaining: data.totalTime - data.currentTime,
      });
    })
    .catch((err) => {
      console.error("Error al obtener nowplaying:", err);
      SetVisibility(false);
    });
}

setInterval(fetchNowPlaying, 1000);
fetchNowPlaying();

////////////////////////
// NOW PLAYING WIDGET //
////////////////////////

function UpdateSongInfo(data) {
  let albumArtUrl = data.artwork.url;
  albumArtUrl = albumArtUrl.replace("{w}", data.artwork.width);
  albumArtUrl = albumArtUrl.replace("{h}", data.artwork.height);

  UpdateAlbumArt(document.getElementById("albumArt"), albumArtUrl);
  UpdateAlbumArt(document.getElementById("backgroundImage"), albumArtUrl);

  setTimeout(() => {
    UpdateTextLabel(document.getElementById("songLabel"), data.name);
    UpdateTextLabel(document.getElementById("artistLabel"), data.artistName);
  }, animationSpeed * 500);

  setTimeout(() => {
    document.getElementById("albumArtBack").src = albumArtUrl;
    document.getElementById("backgroundImageBack").src = albumArtUrl;
  }, 2 * animationSpeed * 500);

  // if (visibilityDuration > 0) {
  //   setTimeout(() => {
  //     SetVisibility(false);
  //   }, visibilityDuration * 1000);
  // }
}

function UpdateTextLabel(div, text) {
  if (div.innerHTML != text) {
    div.setAttribute("class", "text-fade");
    setTimeout(() => {
      div.innerHTML = text;
      div.setAttribute("class", ".text-show");
    }, animationSpeed * 250);
  }
}

function UpdateAlbumArt(div, imgsrc) {
  if (div.src !== imgsrc) {
    div.setAttribute("class", "text-fade");
    setTimeout(() => {
      div.src = imgsrc;
      div.setAttribute("class", "text-show");
    }, animationSpeed * 500);
  }
}

function UpdateProgressBar(data) {
  const progress =
    (data.currentPlaybackTime / data.currentPlaybackDuration) * 100;
  const progressTime = ConvertSecondsToMinutes(data.currentPlaybackTime);
  const duration = ConvertSecondsToMinutes(data.currentPlaybackTimeRemaining);
  document.getElementById("progressBar").style.width = `${progress}%`;
  document.getElementById("progressTime").innerHTML = progressTime;
  document.getElementById("duration").innerHTML = `-${duration}`;
}

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

function ConvertSecondsToMinutes(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.trunc(time - minutes * 60);
  return `${minutes}:${("0" + seconds).slice(-2)}`;
}

function SetVisibility(isVisible) {
  widgetVisibility = isVisible;
  const mainContainer = document.getElementById("mainContainer");

  if (isVisible) {
    const tl = new TimelineMax();
    tl.to(
      mainContainer,
      animationSpeed,
      { bottom: "50%", ease: Power1.easeInOut },
      "label"
    ).to(
      mainContainer,
      animationSpeed,
      { opacity: 1, ease: Power1.easeInOut },
      "label"
    );
  } else {
    const tl = new TimelineMax();
    tl.to(
      mainContainer,
      animationSpeed,
      { bottom: "45%", ease: Power1.easeInOut },
      "label"
    ).to(
      mainContainer,
      animationSpeed,
      { opacity: 0, ease: Power1.easeInOut },
      "label"
    );
  }
}

///////////////////////////////////
// CONEXIÓN Y AJUSTES INICIALES //
///////////////////////////////////

document.getElementById("statusContainer").innerText = "Usando Apple Music";
document.getElementById("statusContainer").style.background = "#2FB774";
setTimeout(() => {
  document.getElementById("statusContainer").style.opacity = 0;
}, 3000);

if (hideAlbumArt) {
  document.getElementById("albumArtBox").style.display = "none";
  document.getElementById("songInfoBox").style.width = "calc(100% - 20px)";
}

///////////////////////
// ESCALADO RESPONSIVE
///////////////////////

let outer = document.getElementById("mainContainer"),
  maxWidth = outer.clientWidth + 50,
  maxHeight = outer.clientHeight;

window.addEventListener("resize", resize);
resize();

function resize() {
  const scale = window.innerWidth / maxWidth;
  outer.style.transform = "translate(-50%, 50%) scale(" + scale + ")";
}
