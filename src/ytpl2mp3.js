const fs = require("fs");
const ytpl = require("ytpl");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { remote } = require("electron");
const $ = require("jquery");

// Toastr notifications
const toastr = require("toastr");
toastr.options = {
	debug: false,
	positionClass: "toast-bottom-left",
	onclick: null,
};

const cp = require("child_process");

const appDir = remote.app.getAppPath();
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
const settingFile = "userSetting.json";
let setting;
window.onload = () => {
	// Setting file
	fs.access(settingFile, fs.constants.F_OK, (err) => {
		if (err) {
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
						"Téléchargement de la playlist : " + playlist.title + "<br>";
					document.getElementById("text-out").innerHTML +=
						"Nombre de piste audio à télécharger : " +
						playlist.items.length +
						"<br><br>";
					if (!fs.existsSync(chemin + "/" + playlist.title))
						fs.mkdirSync(chemin + "/" + playlist.title);
					// dl_track_from_playlist(playlist, 0);
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
function download_track(link) {
	const video = ytdl(link);
	let title;
	ytdl.getInfo(link).then((info) => {
		console.log(info);
		// On récupère la dernière valeur du tableau des thumbnails, last étant la meilleure qualité/resolution existante.
		const thumbnail = info.videoDetails.thumbnails.last().url;
		title = info.videoDetails.title;
		const viewCount = info.videoDetails.viewCount;

		$(".video-thumbnail").css({ "background-image": `url("${thumbnail}")` });
		$(".video-title").text(title);
		// $(".viewCount").text(viewCount + " vues");
		$(".video-found").addClass("grid");
		video.pipe(fs.createWriteStream(`${chemin}/${title}.${format}`));
	});
	video.on("progress", (chunkLength, downloaded, total) => {
		const percent = downloaded / total;
		$(".checkmark__circle").css({
			"stroke-dashoffset": (percent * 166).toFixed(2) - 166,
		});
	});
	video.on("end", () => {
		$(".checkmark__check").fadeIn();
		$(".checkmark").addClass("fill");
		// $(".checkmark").fadeIn().delay(2500).fadeOut();
		// toastr.success(`${title} a été téléchargé`);
	});
}

function dl_track_from_playlist(playlist, element) {
	const videoItems = playlist.items;
	const videoLength = playlist.items.length;

	// myFunc();

	// async function getLinks() {
	// 	for (let i = 0; i < videoLength; i++) {
	// 		const videoUrl = videoItems;
	// 		return videoUrl;
	// 	}
	// }

	// async function myFunc() {
	// 	const links = await getLinks();
	// 	for (let link of links) {
	// 		let soundsUrl = link.shortUrl;
	// 		const stream = ytdl(soundsUrl, {
	// 			quality: "highestaudio",
	// 		});
	// 		stream.pipe(
	// 			fs.createWriteStream(
	// 				`${chemin}/${link.title.replace(/\//g, "-")}.${format}`
	// 			)
	// 		);

	// 		stream.on("finish", () => {
	// 			toastr.success(`Finished ${link.title}`, {
	// 				timeOut: 500,
	// 			});
	// 			console.log(`${link.title}`);
	// 		});
	// 	}
	// 	// for (const link of links) {
	// 	// 	// const stream = ytdl(link.url, { quality: "highestaudio" });
	// 	// 	// stream.pipe(
	// 	// 	// 	fs.createWriteStream(
	// 	// 	// 		`${chemin}/${link.title.replace(/\//g, "-")}.${format}`
	// 	// 	// 	)
	// 	// 	// );
	// 	// 	// stream.on("progress", () => {
	// 	// 	// 	toastr.info(`Downloading ${link.title}`, { timeOut: 150 });
	// 	// 	// 	console.log(`${link.title}`);
	// 	// 	// });
	// 	// 	// stream.on("finish", () => {
	// 	// 	// 	toastr.success(`Finished ${link.title}`, { timeOut: 500 });
	// 	// 	// 	console.log(`${link.title}`);
	// 	// 	// });
	// 	// }
	// }
	// async function myFunc() {
	// 	for (let i = 0; i < videoLength; i++) {
	// 		const videoUrl = videoItems[i].url;
	// 		const videoTitle = videoItems[i].title;
	// 		const item = i + 1;

	// 		const stream = ytdl(videoUrl, { quality: "highestaudio" }).pipe(
	// 			fs.createWriteStream(
	// 				`${chemin}/${videoTitle.replace(/\//g, "-")}.${format}`
	// 			)
	// 		);
	// 		await new Promise((resolve) => stream.on("finish", resolve));
	// 	}
	// }
	// myFunc();
	// async function myFunc() {
	// 	for (let i = 0; i < playlist.length; i++) {
	// 		const { videoUrl, title } = playlist[i];
	// 		const item = i + 1;

	// 		const stream = ytdl(videoUrl, {
	// 			format: "mp4",
	// 		}).pipe(fs.createWriteStream(`${title}.mp4`));

	// 		await new Promise((resolve) => stream.on("finish", resolve));

	// 		console.log(`${item}/${length} - ${title} downloaded successfully`);
	// 	}
	// }

	// videoItems.forEach(function (item) {
	// 	const video = ytdl(item.url, { quality: "highestaudio" });
	// 	video.on("progress", (lenght, downloaded, totalLength) => {
	// 		msgboxNoClose.show(`${item.title} has been downloaded`);
	// 	});
	// 	video.pipe(
	// 		fs.createWriteStream(
	// 			`${chemin}/${item.title.replace(/\//g, "-")}.${format}`
	// 		)
	// 	);
	// });

	// Promise.all(task).then((res) => {
	// 	console.log(res.length);
	// 	const stream = [];
	// 	for (let r in res) {
	// 		(stream = res[r].title), res[r].url;
	// 	}
	// 	console.log(stream);
	// });
	// video_url.map((audio) => {
	// 	console.log(audio.url, audio.title);
	// });
	// video_url.forEach(function (item, index) {
	// 	console.log(index, item.url, item.title);
	// });
	// Promise.all(task).then((res) => {
	// 	for (let r in res) {
	// 		ytdl(res[r].url, { quality: "highestaudio" })
	// 			.on("progress", (length, downloaded, totalLength) => {
	// 				const percent = ((downloaded / totalLength) * 100).toFixed(2);
	// 				// console.log(percent);
	// 				// console.log(downloaded);
	// 				// console.log(totalLength);
	// 				console.log(percent + "%");
	// 				// $("#dl_status").animate(
	// 				// 	{ width: (percent * 100).toFixed(2) + "%" },
	// 				// 	2000
	// 				// );
	// 			})
	// 			.pipe(
	// 				fs.createWriteStream(
	// 					`${chemin}/${res[r].title.replace(/\//g, "-")}.${format}`
	// 				)
	// 			)
	// 			.on("finish", () => {
	// 				// console.log(`${r} / ${playlist.items.length}`);
	// 			});
	// 	}
	// });
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
$("#saveParam").click(function () {
	toastr.success(`Sauvegardé`, {
		timeOut: 100,
	});
});
