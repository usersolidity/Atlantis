//import {audius} from "../scenes/login.js";
import { gameScene } from "../scenes/login.js";

const headers = {
    'Accept':'application/json'
  };

// var audius;

var playlist = [];
var playlistLoaded = [];
var playlistData;
var playlistIndex = 0;
var audius;

var musicDoc;
var trackImg;
var trackName;
var trackArtist;
var trackGenre;
var playBtn;
var pauseBtn;
var nextBtn;
var prevBtn;

function setElements() {
    musicDoc = audius.parent.ownerDocument;
    trackImg = musicDoc.getElementById("trackImg");
    trackName = musicDoc.getElementById("trackName");
    trackArtist = musicDoc.getElementById("trackArtist");
    trackGenre = musicDoc.getElementById("trackGenre");
    playBtn = musicDoc.getElementById("playBtn");
    pauseBtn = musicDoc.getElementById("pauseBtn");
    nextBtn = musicDoc.getElementById("nextBtn");
    prevBtn = musicDoc.getElementById("prevBtn");

    playBtn.onclick = function(event) {
        console.log("play clicked");
        // playBtn.classList.toggle("hidden");
        // pauseBtn.classList.toggle("hidden");
        playTrack(playlistIndex);
    };

    pauseBtn.onclick = function(event) {
        console.log("pause clicked");
        // pauseBtn.classList.toggle("hidden");
        // playBtn.classList.toggle("hidden");
        playlist[playlistIndex].track.pause();
    };

    nextBtn.onclick = function(event) {
        playNextTrack();
    };

    prevBtn.onclick = function(event) {
        console.log("prev clicked");
        playPrevTrack();
    };
}

export function getAudius() {    
    setElements();
    
    fetch('https://discoveryprovider3.audius.co/v1/playlists/DOPRl/tracks',
    {
      method: 'GET',
      headers: headers
    })
    .then(function(res) {
        return res.json();
    }).then(function(body) {
        console.log("Audius Response: ");
        console.log(body);
        playlistData = body;   
    }).then(() => makePlaylist());
}

export function setAudius(newAudius) {
    audius = newAudius;
    setElements();
}

function makePlaylist() {
    for(let i = 0; i < playlistData.data.length; i++) {
        var Track = new Audio(`https://creatornode2.audius.co/tracks/stream/${playlistData.data[i].id}`);

        var newObj = {
            track : Track,
            info : {
                image: playlistData.data[i].artwork["150x150"],
                title: playlistData.data[i].title,
                artist: playlistData.data[i].user.name,
                genre: playlistData.data[i].genre,
            }

        }
                // .catch(e => {console.log("error is: " + e)});
            playlist[i] = newObj;
            playlist[i].track.volume = 0.3;
            // playlist[i].track.muted = true;
            // playlist[i].track.muted = false;
            playlist[i].track.setAttribute("muted", "true");
            playlist[i].track.addEventListener("ended", () => {
                console.log("playing next song");
                playNextTrack();
            }) 
            playlist[i].track.onerror = (e) => {
                console.log("removing track " + i);
                playlist.splice(i, 1);
                // playlistData.data.splice(i,1);
                console.log(playlist);
            }
            // playlist[i].track.oncanplaythrough = () => {
            //     playlistLoaded[playlistLoaded.length] = playlist[i];
            // }
    }
    //playTrack(playlistIndex);
}

export function musicUpdate() {
    if(trackImg && playlistData) {
        trackImg.setAttribute("src", `${playlist[playlistIndex].info.image}`)
        trackGenre.innerHTML = playlist[playlistIndex].info.genre;
        trackName.innerHTML = playlist[playlistIndex].info.title;
        trackArtist.innerHTML = playlist[playlistIndex].info.artist;
        playlistIndex < 0? playlistIndex = 0: playlistIndex = playlistIndex;
        playlistIndex > playlist.length? playlistIndex = playlist.length: playlistIndex = playlistIndex;

        //console.log(playlistIndex);
    }

}

// function findTrack(id) {
//     for(let i =0; i< playlistData)
// }

export function playNextTrack() {
    stopTrack();
    console.log(playlist.length);
    console.log(playlist);
    var nextIndex = playlistIndex + 1;
    nextIndex > playlist.length? nextIndex = playlist.length : nextIndex = nextIndex;
    playTrack(nextIndex);
}

export function playPrevTrack() {
    stopTrack();
    console.log(playlist.length);
    console.log(playlist);
    var prevIndex = playlistIndex - 1;
    prevIndex < 0 ? prevIndex = 0 : prevIndex = prevIndex;
    playTrack(prevIndex);
}

function stopTrack() {
    console.log("stopping track " + playlistIndex);
    playlist[playlistIndex].track.pause();
    playlist[playlistIndex].track.currentTime = 0;
}

function playTrack(id) {
    console.log("playing track: " + id);
    playlistIndex = id;
    
    //playlist[playlistIndex].muted = true;
    playlist[playlistIndex].track.play();
}
  
  