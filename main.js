const electron = require("electron");
const globalShortcut = electron.globalShortcut;
const { app, BrowserWindow, ipcMain } = require("electron");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");
// const BrowserWindow = electron.BrowserWindow;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

let mainWindow;
function createWindow() {
	// Création d'une fenetre en résolution 1133x720
	mainWindow = new BrowserWindow({
		maxWidth: 1000,
		maxHeight: 950,
		minWidth: 930,
		minHeight: 500,
		wdith: 900,
		height: 660,
		frame: false,
		resizable: true,
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
	mainWindow.once("ready-to-show", () => {
		autoUpdater.checkForUpdatesAndNotify();
		console.log("checking for updates");
		console.log(checkForUpdatesAndNotify());
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

app.on("ready", () => {
	createWindow();
});

app.on("window-all-closed", function () {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

function sendStatus(text) {
	log.info(text);
	if (win) {
		mainWindow.webContents.send("message", text);
	}
}

app.on("activate", function () {
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on("app_version", (event) => {
	event.sender.send("app_version", { version: app.getVersion() });
});
autoUpdater.on("checking-for-update", () => {
	sendStatus("Checking for update...");
});
autoUpdater.on("update-available", (ev, info) => {
	mainWindow.webContents.send("update_available");
	log.info("info", info);
	log.info("arguments", arguments);
});

autoUpdater.on("update-downloaded", () => {
	mainWindow.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});
