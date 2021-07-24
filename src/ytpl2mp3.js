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

// Updating
const version = $("#appVer");
const notification = $("#updateModal");
const message = $("#message");
const restartButton = $("#restart-button");

ipcRenderer.on("message", function (event, text) {
	notification.fadeIn().removeClass("hidden");
	message.text(text);
	ipcRenderer.on("dlFinished", (event, arg) => {
		if (arg) restartButton.fadeIn().removeClass("hidden");
	});
});

ipcRenderer.send("app_version");
ipcRenderer.on("app_version", (event, arg) => {
	ipcRenderer.removeAllListeners("app_version");
	version.text("Version " + arg.version);
});

console.log("Version :" + app.getVersion());

// function restartApp() {
// 	ipcRenderer.send("restart_app");
// }
function closeNotification() {
	notification.fadeOut("fast");
}

// Toastr notifications
const toastr = require("toastr");

toastr.options = {
	debug: false,
	positionClass: "toast-bottom-left",
	onclick: null,
};

const appDir = app.getPath("userData");
let dlDir = app.getPath("downloads");

var pathToFfmpeg = require("ffmpeg-static").replace(
	"app.asar",
	"app.asar.unpacked"
);

ffmpeg.setFfmpegPath(pathToFfmpeg);
var taille;
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
			}
			$("#messageBoxAlert").fadeIn();
			$("#accepte-rule").on("click", function () {
				$("#messageBoxAlert").fadeOut();
				$("#messageBox").prop("checked", true);
				save_param();
				console.log("Settings file : Created");
			});
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
				$("#messageBoxAlert").fadeIn();
				$("#accepte-rule").on("click", function () {
					$("#messageBoxAlert").fadeOut();
					$("#messageBox").prop("checked", true);
					save_param();
				});
			} else {
				$("#messageBoxAlert").hide();
				document.getElementById("messageBox").checked = false;
			}
			document.getElementById(setting.format).checked = true;
			console.log(
				"Settings file : Readed " + chemin,
				setting.format,
				debug,
				messageBox
			);
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
	require("child_process").exec(`start "" ${chemin}`);
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
				console.error(error);
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
function download_track(link) {
	ytdl.getInfo(link).then((info) => {
		// On récupère la dernière valeur du tableau des thumbnails, last étant la meilleure qualité/resolution existante.
		const thumbnail = info.videoDetails.thumbnails.last().url;
		const title = info.videoDetails.title;
		const viewCount = info.videoDetails.viewCount;

		// On affiche les details de la video
		$(".video-thumbnail").css({ "background-image": `url("${thumbnail}")` });
		$(".video-title").text(title);
		// $(".viewCount").text(viewCount + " vues");
		$(".video-found").addClass("grid");

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
					console.log("en cours" + p);
				})
				.on("end", () => {});
		} else {
			output = `${chemin}/${title.replace(/[^\w\s]/gi, "-")}.mp4`;
			stream = ytdl(link);
			stream.pipe(fs.createWriteStream(output));
		}
		stream.on("progress", (chunkLength, downloaded, total) => {
			const percent = downloaded / total;
			$(".loader-fill").css({
				width: (percent * 100).toFixed(2) + "%",
			});
			$(".loader-text").text((percent * 100).toFixed(2) + "%");
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

	if (format === "mp3") {
		async function dlPlaylistMp3() {
			for (let i = 0; i < videoLength; i++) {
				const videoUrl = videoItems[i].url;
				const videoTitle = videoItems[i].title;
				output = `${chemin}/${videoTitle.replace(/[^\w\s]/gi, "-")}.mp3`;
				const stream = ytdl(videoUrl, {
					quality: "highestaudio",
				});
				ffmpeg(stream)
					.audioBitrate(128)
					.save(output)
					.on("progress", function (p) {
						console.log("en cours" + p);
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
				const videoUrl = videoItems[i].url;
				const videoTitle = videoItems[i].title;
				const stream = ytdl(videoUrl);
				output = `${chemin}/${videoTitle.replace(/[^\w\s]/gi, "-")}.mp4`;
				console.log(videoTitle, videoUrl);
				// stream.pipe(
				// 	fs.createWriteStream(output)
				// );
				// stream.on("progress", () => {
				// 	console.log("Downloading" + videoTitle);
				// });
				// await new Promise((resolve) => stream.on("finish", resolve));
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
$("#saveParam").on("click", function () {
	toastr.success(`Sauvegardé`, {
		timeOut: 100,
	});
});

$(document).on("click", 'a[href^="http"]', function (event) {
	event.preventDefault();
	shell.openExternal(this.href);
});
