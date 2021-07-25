const fs = require("fs");
const ytpl = require("ytpl");
const path = require("path");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const shell = require("electron").shell;
const $ = require("jquery");
const { remote } = require("electron");
const { ipcRenderer } = require("electron");
const app = require("electron").remote.app;

// Updating ----------------------------------------------------------------
const version = $("#appVer");
const notification = $("#updateModal");
const message = $("#message");
const restartButton = $("#restart-button");

ipcRenderer.on("message", function (event, text) {
	notification.fadeIn().removeClass("hidden");
	message.text(text);
	ipcRenderer.on("dlFinished", (event, arg) => {
		if (arg === true) restartButton.show().removeClass("hidden");
	});
});

ipcRenderer.send("app_version");
ipcRenderer.on("app_version", (event, arg) => {
	ipcRenderer.removeAllListeners("app_version");
	version.text("Version " + arg.version);
});

console.log("Version : " + app.getVersion());

function restartApp() {
	ipcRenderer.send("restart_app");
}

function closeNotification() {
	notification.fadeOut("fast");
}

//----------------------------------------------------------------

// Toastr notifications ----------------------------------------------------------------
const toastr = require("toastr");

toastr.options = {
	debug: false,
	positionClass: "toast-bottom-left",
	onclick: null,
	newestOnTop: false,
};

//----------------------------------------------------------------
const appDir = app.getPath("userData");
let dlDir = app.getPath("downloads");

var pathToFfmpeg = require("ffmpeg-static").replace(
	"app.asar",
	"app.asar.unpacked"
);

ffmpeg.setFfmpegPath(pathToFfmpeg);

var chemin;
var format;
var debug;
var messageBox;
const settingFile = appDir + "/userSetting.json";
let output;
let setting;
window.onload = () => {
	// Setting file
	fs.access(settingFile, fs.constants.F_OK, (err) => {
		if (err) {
			if (!$("#path_text").val()) {
				$("#path_text").val(dlDir);
				$("#mp4").prop("checked", true);
			}
			$("#messageBoxAlert").fadeIn();
			$("#accepte-rule").on("click", function () {
				$("#messageBoxAlert").fadeOut();
				$("#messageBox").prop("checked", true);
				save_param();
				console.log("Settings file : Created");
			});
			chemin = dlDir;
		} else {
			setting = JSON.parse(fs.readFileSync(appDir + "/userSetting.json"));
			chemin = setting.path || process.env.HOME || process.env.USERPROFILE;
			messageBox = setting.messageBox;
			debug = setting.debug;
			format = setting.format;
			document.getElementById("path_text").value = chemin;
			if (debug) {
				document.getElementById("checkDebug").checked = true;
				$("#debug-window").fadeIn();
			} else document.getElementById("checkDebug").checked = false;

			if (messageBox === true) {
				document.getElementById("messageBox").checked = true;
				$("#messageBoxAlert").show();
				$("#accepte-rule").on("click", function () {
					$("#messageBoxAlert").fadeOut("fast");
					$("#messageBox").prop("checked", true);
					save_param();
				});
			} else {
				$("#messageBoxAlert").hide();
				document.getElementById("messageBox").checked = false;
			}
			document.getElementById(setting.format).checked = true;
		}
	});
};

/**
 * link = youtube link
 *
 */
$(".input-main").on("keypress", function (e) {
	if (e.which == 13) {
		download();
	}
});
function opendl_Folder() {
	shell.openPath(chemin);
}
function download() {
	startTime = Date.now();
	let link = $("#playlist-id").val();
	ytpl
		.getPlaylistID(link)
		.then((playlistID) => {
			ytpl(playlistID, {
				limit: Infinity,
			})
				.then((playlist) => {
					document.getElementById("text-out").innerHTML =
						"Nom playlist : " + playlist.title + "<br>";
					document.getElementById("text-out").innerHTML +=
						"Nombre piste : " + playlist.items.length;
					// if (!fs.existsSync(chemin + "/" + playlist.title))
					// 	fs.mkdirSync(chemin + "/" + playlist.title);
					dl_track_from_playlist(playlist, 0);
				})
				.catch((err) => {
					return afficher_err(err.name, err.message);
				});
		})
		.catch((err) => {
			try {
				if (ytdl.getVideoID(link)) return download_track(link);
			} catch (error) {
				toastr["info"]("Veuillez entrer un lien valide.", "", {
					timeOut: 1500,
				});
			}
		});
}

// Cette fonction récupère le dernier element d'un tableau .last()
if (!Array.prototype.last) {
	Array.prototype.last = function () {
		return this[this.length - 1];
	};
}

/**
 *
 *
 * @param {*} link
 */

let VideoParent = document.querySelector(".video-found");
let createVideoParent = document.createElement("div");
createVideoParent.classList.add("video-inner");

let createVideoThumbnail = document.createElement("div");
createVideoThumbnail.classList.add("video-thumbnail");

let createVideoArtist = document.createElement("div");
createVideoArtist.classList.add("artist-info");

let createVideoArtistTitle = document.createElement("div");
createVideoArtistTitle.classList.add("video-title");
createVideoArtist.appendChild(createVideoArtistTitle);

let createVideoProgressParent = document.createElement("div");
createVideoProgressParent.classList.add("progress-bar");
let createVideoProgress = document.createElement("span");
createVideoProgress.classList.add("progress-bar-fill");
createVideoProgressParent.appendChild(createVideoProgress);

function download_track(link) {
	ytdl.getInfo(link).then((info) => {
		// On attache les enfants aux parents avec appendChild
		VideoParent.appendChild(VideoParent);
		VideoParent.appendChild(createVideoParent);

		createVideoParent.appendChild(createVideoThumbnail);
		createVideoParent.appendChild(createVideoArtist);
		createVideoParent.appendChild(createVideoProgressParent);

		// On récupère la dernière valeur du tableau des thumbnails, last étant la meilleure qualité/resolution existante.
		const thumbnail = info.videoDetails.thumbnails.last().url;
		const title = info.videoDetails.title;
		const viewCount = info.videoDetails.viewCount;

		// On affiche les details de la video
		createVideoThumbnail.style.cssText = `background-image: url("${thumbnail}")`;
		createVideoArtistTitle.innerHTML = title;
		// $(".viewCount").text(viewCount + " vues");

		let stream;

		if (format === "mp3") {
			output = `${chemin}/${title.replace(/[^\w\s]/gi, "-")}.mp3`;
			stream = ytdl(link, {
				quality: "highestaudio",
			});
			ffmpeg(stream)
				.audioBitrate(128)
				.save(output)
				.on("progress", function (p) {
					console.log("en cours");
				})
				.on("end", () => {});
		} else {
			output = `${chemin}/${title.replace(/[^\w\s]/gi, "-")}.mp4`;
			stream = ytdl(link);
			stream.pipe(fs.createWriteStream(output));
		}
		stream.on("progress", (chunkLength, downloaded, total) => {
			const percent = downloaded / total;
			$(createVideoProgress).css({
				width: (percent * 100).toFixed(2) + "%",
			});
			if (percent === 1) {
				toastr["success"](`${title}`, "Terminé", {
					timeOut: 4000,
				});
			}
		});
	});
}

/**
 *
 *
 * @param {*} playlist
 * @param {*} element
 */
function dl_track_from_playlist(playlist, element) {
	const videoItems = playlist.items;
	const videoLength = playlist.items.length;
	toastr.info(
		"Le téléchargement de playlist est en cours de modification et peux ne pas fonctionner."
	);
	let createVideoProgress;
	videoItems.forEach((element) => {
		let VideoParent = document.querySelector(".video-found");
		let createVideoParent = document.createElement("div");
		createVideoParent.classList.add("video-inner");
		let createVideoThumbnail = document.createElement("div");
		createVideoThumbnail.classList.add("video-thumbnail");

		let createVideoArtist = document.createElement("div");
		createVideoArtist.classList.add("artist-info");

		let createVideoArtistTitle = document.createElement("div");
		createVideoArtistTitle.classList.add("video-title");
		createVideoArtist.appendChild(createVideoArtistTitle);

		let createVideoProgressParent = document.createElement("div");
		createVideoProgressParent.classList.add("progress-bar");
		let createVideoProgress = document.createElement("span");
		createVideoProgress.classList.add("progress-bar-fill");
		createVideoProgressParent.appendChild(createVideoProgress);

		const elementThumbnail = element.bestThumbnail.url;
		const elementTitle = element.title;
		const elementIndex = element.index;
		createVideoParent.setAttribute("data-id", elementIndex);

		VideoParent.appendChild(createVideoParent);
		createVideoParent.appendChild(createVideoThumbnail);
		createVideoParent.appendChild(createVideoArtist);
		createVideoParent.appendChild(createVideoProgressParent);

		createVideoThumbnail.style.cssText = `background-image: url("${elementThumbnail}")`;
		createVideoArtistTitle.innerHTML = elementTitle;
	});

	if (format === "mp3") {
		async function dlPlaylistMp3() {
			for (let i = 0; i < videoLength; i++) {
				const videoIndex = videoItems[i].index;
				const videoUrl = videoItems[i].url;
				const videoTitle = videoItems[i].title;
				output = `${chemin}/${videoTitle.replace(/[^\w\s]/gi, "-")}.mp3`;
				const stream = ytdl(videoUrl, {
					quality: "highestaudio",
				});
				stream.on("progress", (chunkLength, downloaded, total) => {
					const percent = downloaded / total;
					$(`div[data-id="${videoIndex}"]`)
						.children(".progress-bar")
						.children(".progress-bar-fill")
						.css({
							width: (percent * 100).toFixed(2) + "%",
						});
					if (percent === 1) {
						toastr["success"](`${videoTitle}`, "Terminé", {
							timeOut: 4000,
						});
					}
				});
				ffmpeg(stream)
					.audioBitrate(128)
					.save(output)
					.on("progress", function () {
						console.log("en cours");
					})
					.on("end", () => {
						console.log("end");
					});
				await new Promise((resolve) => stream.on("finish", resolve));
			}
		}
		dlPlaylistMp3();
	} else {
		async function dlPlaylistMp4() {
			for (let i = 0; i < videoLength; i++) {
				const videoIndex = videoItems[i].index;
				const videoUrl = videoItems[i].url;
				const videoTitle = videoItems[i].title;
				const stream = ytdl(videoUrl);
				output = `${chemin}/${videoTitle.replace(/[^\w\s]/gi, "-")}.mp4`;
				stream.pipe(fs.createWriteStream(output));
				stream.on("progress", (chunkLength, downloaded, total) => {
					const percent = downloaded / total;
					$(`div[data-id="${videoIndex}"]`)
						.children(".progress-bar")
						.children(".progress-bar-fill")
						.css({
							width: (percent * 100).toFixed(2) + "%",
						});
					if (percent === 1) {
						toastr["success"](`${videoTitle}`, "Terminé", {
							timeOut: 4000,
						});
					}
				});
				await new Promise((resolve) => stream.on("finish", resolve));
			}
		}
		dlPlaylistMp4();
	}
}

function choose_path() {
	var windows = remote.getCurrentWindow();
	var data = remote.dialog.showOpenDialogSync(windows, {
		properties: ["openDirectory"],
	});
	if (data != undefined) chemin = data;
	document.getElementById("path_text").value = chemin;
	save_param();
}

function afficher_err(text, err) {
	document.getElementById("errp").textContent = text;
	document.getElementById("errs").textContent = err;
}

function save_param() {
	let setting = {
		format: document.querySelector('input[name="radio"]:checked').id,
		path: document.getElementById("path_text").value,
		debug: document.getElementById("checkDebug").checked,
		messageBox: document.getElementById("messageBox").checked,
	};
	fs.writeFileSync(appDir + "/userSetting.json", JSON.stringify(setting));
}

$(document).on("click", 'a[href^="http"]', function (event) {
	event.preventDefault();
	shell.openExternal(this.href);
});

$("#stPage input").on("change", function () {
	save_param();
	toastr["success"]("Sauvegardé", "", {
		timeOut: 800,
	});
});

("use strict");

const Menu = remote.Menu;

const InputMenu = Menu.buildFromTemplate([
	{
		label: "Cut",
		role: "cut",
	},
	{
		label: "Copy",
		role: "copy",
	},
	{
		label: "Paste",
		role: "paste",
	},
]);

document.body.addEventListener("contextmenu", (e) => {
	e.preventDefault();
	e.stopPropagation();

	let node = e.target;

	while (node) {
		if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
			InputMenu.popup(remote.getCurrentWindow());
			break;
		}
		node = node.parentNode;
	}
});
