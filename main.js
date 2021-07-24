const electron = require("electron");
const globalShortcut = electron.globalShortcut;
const { app, BrowserWindow, ipcMain } = require("electron");
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
	globalShortcut.register("f5", function () {
		console.log("f5 is pressed");
		win.reload();
	});
	globalShortcut.register("CommandOrControl+R", function () {
		console.log("CommandOrControl+R is pressed");
		win.reload();
	});
	return win;
}

function sendStatusToWindow(text) {
	log.info(text);
	win.webContents.send("message", text);
}

app.on("ready", () => {
	createWindow();
	autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
	app.quit();
});

ipcMain.on("app_version", (event) => {
	event.sender.send("app_version", { version: app.getVersion() });
});

autoUpdater.on("checking-for-update", () => {
	sendStatusToWindow("Checking for update...");
});

autoUpdater.on("update-available", (info) => {
	sendStatusToWindow("update_available");
});
autoUpdater.on("error", (err) => {
	sendStatusToWindow("Error in auto-updater. " + err);
});
autoUpdater.on("update-downloaded", (info) => {
	sendStatusToWindow("update_downloaded");
});

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});
