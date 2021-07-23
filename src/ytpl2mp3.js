const fs = require("fs");
const ytpl = require("ytpl");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { remote } = require("electron");
const path = require("path");
const itunesAPI = require("node-itunes-search");

var pathToFfmpeg = require("ffmpeg-static").replace(
	"app.asar",
	"app.asar.unpacked"
);

ffmpeg.setFfmpegPath(pathToFfmpeg);

var taille;
var chemin;
var format;

window.onload = () => {
	let setting = JSON.parse(fs.readFileSync(__dirname + "/userSetting.json"));

	chemin = setting.path || process.env.HOME || process.env.USERPROFILE;
	document.getElementById("path_text").value = chemin;
	if (setting.debug) {
		document.getElementById("checkDebug").checked = true;
		$("#debug-window").fadeIn();
	} else document.getElementById("checkDebug").checked = false;

	if (setting.messageBox || setting.messageBox === true) {
		document.getElementById("messageBox").checked = true;
		$("#messageBoxAlert").fadeIn();
		$("#accepte-rule").on("click", function () {
			$("#messageBoxAlert").fadeOut();
			$("#messageBox").prop("checked", true);
			save_param();
		});
	} else {
		$("#messageBoxAlert").fadeOut();
		document.getElementById("messageBox").checked = false;
	}

	document.getElementById(setting.format).checked = true;
};

function download() {
	startTime = Date.now();
	let link = document.getElementById("playlist-id").value;
	format = document.querySelector('input[name="radio"]:checked').id;

	ytpl
		.getPlaylistID(link)
		.then((playlistID) => {
			ytpl(playlistID, { limit: Infinity })
				.then((playlist) => {
					document.getElementById("text-out").innerHTML =
						"Téléchargement de la playlist : " + playlist.title + "<br>";
					document.getElementById("text-out").innerHTML +=
						"Nombre de piste audio à télécharger : " +
						playlist.items.length +
						"<br><br>";
					if (!fs.existsSync(chemin + "/" + playlist.title))
						fs.mkdirSync(chemin + "/" + playlist.title);
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
				return afficher_err(
					"Wrong link",
					"Aucun fichier disponible au téléchargement"
				);
			}
		});
}

function download_track(link) {
	let stream = ytdl(link, { quality: "highestaudio" });
	stream.on("progress", onProgress);
	stream.on("info", (info) => {
		//document.getElementById('progressBar').classList.add('visible')
		document.getElementById("text-out").innerHTML +=
			"Téléchargement de : " + info.videoDetails.title;
		let start = Date.now();

		const searchOptions = {
			term: `${info.videoDetails.title}`,
			limit: 1,
		};

		itunesAPI.searchItunes(searchOptions).then((result) => {
			var metadata;
			if (result.resultCount == 0) {
				metadata = [
					`-metadata`,
					`title=${info.videoDetails.title}  `,
					`-metadata`,
					`artist=${info.videoDetails.author.name}  `,
				];
			} else {
				metadata = [
					`-metadata`,
					`title=${result.results[0].trackName}  `,
					`-metadata`,
					`artist=${result.results[0].artistName}  `,
					`-metadata`,
					`album=${result.results[0].collectionName}  `,
					`-metadata`,
					`date=${result.results[0].releaseDate}  `,
					`-metadata`,
					`genre=${result.results[0].kind}  `,
				];
			}

			var fichier_out = `${chemin}/${info.videoDetails.title.replace(
				/\//g,
				"-"
			)}.${format}`;
			if (process.platform == "win32")
				fichier_out = `${chemin}/${info.videoDetails.title
					.replace(/\//g, "-")
					.replace(/[\<\>\:\«\|\?\*\.]*/g, "")}.${format}`;

			ffmpeg(stream)
				.audioBitrate(128)
				.outputOptions(metadata)
				.save(fichier_out)
				.on("error", function (err, stdout, stderr) {
					afficher_err(info.videoDetails.title, err);
				})
				.on("end", () => {
					afficher_notif(info.videoDetails.title, taille + "MB");
				});
		});
	});
}
// $("#dl-button").trigger("click");

function dl_track_from_playlist(playlist, element) {
	const videoItems = playlist.items;
	const videoLength = playlist.items.length;

	myFunc();

	async function getLinks() {
		for (let i = 0; i < videoLength; i++) {
			const videoUrl = videoItems;
			return videoUrl;
		}
	}

	async function myFunc() {
		const links = await getLinks();
		for (let link of links) {
			let soundsUrl = link.shortUrl;
			const stream = ytdl(soundsUrl, { quality: "highestaudio" });
			stream.pipe(
				fs.createWriteStream(
					`${chemin}/${link.title.replace(/\//g, "-")}.${format}`
				)
			);

			stream.on("finish", () => {
				toastr.success(`Finished ${link.title}`, { timeOut: 500 });
				console.log(`${link.title}`);
			});
		}
		// for (const link of links) {
		// 	// const stream = ytdl(link.url, { quality: "highestaudio" });
		// 	// stream.pipe(
		// 	// 	fs.createWriteStream(
		// 	// 		`${chemin}/${link.title.replace(/\//g, "-")}.${format}`
		// 	// 	)
		// 	// );
		// 	// stream.on("progress", () => {
		// 	// 	toastr.info(`Downloading ${link.title}`, { timeOut: 150 });
		// 	// 	console.log(`${link.title}`);
		// 	// });
		// 	// stream.on("finish", () => {
		// 	// 	toastr.success(`Finished ${link.title}`, { timeOut: 500 });
		// 	// 	console.log(`${link.title}`);
		// 	// });
		// }
	}
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

	fs.writeFileSync(__dirname + "/userSetting.json", JSON.stringify(setting));
}
