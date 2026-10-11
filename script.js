console.log("lets write javascript");
let currentsong = new Audio();
let songs;
let currfolder;

function secondstoms(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingseconds = Math.floor(seconds % 60);
  const formattedminutes = String(minutes).padStart(2, "0");
  const formattedseconds = String(remainingseconds).padStart(2, "0");
  return `${formattedminutes}:${formattedseconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith("mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }

  }
  let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML = songul.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
              <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
              </div>
              <img class="invert" src="img/play.svg" alt="">
     </li>`;
  }

  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    })
  })
  return songs

}

const playMusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track
  if (!pause) {
    currentsong.play();
    play.src = "img/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

//adding albums 
async function displayAlbums(params) {

  let a = await fetch(`http://127.0.0.1:5500/songs/`)
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchor)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && e.href !== "http://127.0.0.1:5500/songs") {
      let folder = e.href.split("/").slice(-1)[0]
      //getiing meta deta of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
      let response = await a.json();
      cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="playbtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <img class="rounded" src="http://127.0.0.1:5500/songs/${folder}/cover.jpg" alt="Img">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`


    }
  }
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])
    })
  })
}


async function main() {
  await getSongs("songs/acalm");
  playMusic(songs[0], true);

  displayAlbums()

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play.svg";
    }
  })

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondstoms(currentsong.currentTime)}/${secondstoms(currentsong.duration)}`
    document.querySelector(".seekcircle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
  })

  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".seekcircle").style.left = percent + "%";
    currentsong.currentTime = ((currentsong.duration) * percent) / 100;
  })

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-5px";
  })

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%"
  })

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }

  })
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
    }

  })

  volumebar.addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;

  })

  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentsong.volume = 0
      volumebar.value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg")
      currentsong.volume = .20
      volumebar.value = currentsong.volume * 100; // 20
    }
  })

}
main()