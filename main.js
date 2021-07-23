if (require("electron-squirrel-startup")) return;
const electron = require("electron");
const globalShortcut = electron.globalShortcut;
require("update-electron-app")({
	repo: "asmirbelkic/apptest",
});
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

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

app.on("ready", createWindow);

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
