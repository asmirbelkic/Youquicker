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

/* 
TODO Back-End
.card-close class
[spans] & [modals] - [btns]
*/

function toggleAll(source) {
	checkboxes = document.getElementsByName("videoNames");
	for (var i = 0, n = checkboxes.length; i < n; i++) {
		checkboxes[i].checked = source.checked;
	}
}

$(".content .tab-pannel").first().show();
function openTab(event, tabName) {
	// Declare all variables
	var i, tabcontent, tablinks;

	// Get all elements with class="tabcontent" and hide them
	tabcontent = $(".tab-pannel");
	for (i = 0; i < tabcontent.length; i++) {
		$(tabcontent[i]).hide();
	}

	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = $(".nav-item");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace("active", "");
	}
	// Show the current tab, and add an "active" class to the button that opened the tab
	$("#" + tabName).fadeIn(120);
	$(event.currentTarget).addClass("active");
}

$(".nav-item").click(function () {
	openTab(event, $(this).data("name"));
});

$("#cgu-see").click(function () {
	$("#cgu-more").fadeToggle("fast");
});
