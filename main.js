const electron = require("electron");
const { app, BrowserWindow, ipcMain } = require("electron");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");
// const BrowserWindow = electron.BrowserWindow;

let win;
function createWindow() {
	// Création d'une fenetre en résolution 1133x720
	win = new BrowserWindow({
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
	win.webContents.openDevTools();
	win.loadFile(`${__dirname}/src/index.html`);
	win.on("closed", () => {
		win = null;
	});
	win.webContents.once("dom-ready", () => {
		autoUpdater.checkForUpdatesAndNotify();
	});
	return win;
}

function sendStatusToWindow(text) {
	log.info(text);
	win.webContents.send("message", text);
}

app.on("ready", () => {
	createWindow();
});

app.on("window-close-all", () => {
	app.quit();
});
app.on("window-all-closed", () => {
	app.quit();
});
ipcMain.on("app_version", (event) => {
	event.sender.send("app_version", { version: app.getVersion() });
});

// autoUpdater.on("checking-for-update", () => {
// 	sendStatusToWindow("Recherche de mise à jour...");
// });

autoUpdater.on("update-available", (info) => {
	sendStatusToWindow("Une mise à jour est disponible.");
});

autoUpdater.on("update-downloaded", (event, info) => {
	sendStatusToWindow(
		"Une mise à jour vient d'être téléchargé elle sera automatiquement installer au prochain lancement"
	);
	win.webContents.send("dlFinished", true);
});

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});
