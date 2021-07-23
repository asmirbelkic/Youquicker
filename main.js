const { autoUpdater } = require("electron-updater");
const electron = require("electron");
const globalShortcut = electron.globalShortcut;
const app = electron.app;
const log = require("electron-log");
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

autoUpdater.on("checking-for-update", () => {
	sendStatusToWindow("Checking for update...");
});
autoUpdater.on("update-available", (info) => {
	sendStatusToWindow("Update available.");
});
autoUpdater.on("update-not-available", (info) => {
	sendStatusToWindow("Update not available.");
});
autoUpdater.on("error", (err) => {
	sendStatusToWindow("Error in auto-updater. " + err);
});
autoUpdater.on("download-progress", (progressObj) => {
	let log_message = "Download speed: " + progressObj.bytesPerSecond;
	log_message = log_message + " - Downloaded " + progressObj.percent + "%";
	log_message =
		log_message +
		" (" +
		progressObj.transferred +
		"/" +
		progressObj.total +
		")";
	sendStatusToWindow(log_message);
});
autoUpdater.on("update-downloaded", (info) => {
	sendStatusToWindow("Update downloaded");
});

function createWindow() {
	// Création d'une fenetre en résolution 1133x720
	mainWindow = new BrowserWindow({
		width: 965,
		height: 660,
		frame: false,
		resizable: false,
		fullscreenable: false,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
		},
	});
	mainWindow.webContents.openDevTools();
	mainWindow.loadFile(`${__dirname}/src/index.html`);
	mainWindow.on("closed", function () {
		mainWindow = null;
	});

	globalShortcut.register("f5", function () {
		console.log("f5 is pressed");
		mainWindow.reload();
	});
	globalShortcut.register("CommandOrControl+R", function () {
		console.log("CommandOrControl+R is pressed");
		mainWindow.reload();
	});
}

app.on("ready", function () {
	autoUpdater.checkForUpdatesAndNotify();
	createWindow();
});

app.on("window-all-closed", function () {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", function () {
	if (mainWindow === null) {
		createWindow();
	}
});
