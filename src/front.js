document.getElementById("min-button").addEventListener("click", function () {
	remote.getCurrentWindow().minimize();
});

document.getElementById("close-button").addEventListener("click", function () {
	remote.getCurrentWindow().close();
	app.quit();
});
var checkBox = document.getElementById("checkDebug");
checkBox.addEventListener("click", function () {
	if (checkBox.checked == true) {
		$("#debug-window").fadeIn("fast");
	} else {
		$("#debug-window").fadeOut("fast");
	}
});

function toggleAll(source) {
	checkboxes = document.getElementsByName("videoNames");
	for (var i = 0, n = checkboxes.length; i < n; i++) {
		checkboxes[i].checked = source.checked;
	}
}

$(".sidebar-menu a").on("click", function () {
	var tab_id = $(this).attr("data-name");

	$(".sidebar-menu a").removeClass("active");
	$(".tab-pannel").removeClass("active");

	$(this).addClass("active");
	$("#" + tab_id).addClass("active");
});

$("#cgu-see").on("click", function () {
	$("#cgu-more").fadeToggle("fast");
});
