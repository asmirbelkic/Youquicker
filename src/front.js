document.getElementById("min-button").addEventListener("click", function () {
	remote.getCurrentWindow().minimize();
});

document.getElementById("close-button").addEventListener("click", function () {
	remote.getCurrentWindow().close();
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

// function initTabNav() {
// 	const tabMenu = document.querySelectorAll(".sidebar-app .nav-item");
// 	const tabContent = document.querySelectorAll(".content section");
// 	// var newTitle = document.querySelector("body > div.container > aside > div > a.nav-item.active").dataset.title
// 	// document.getElementById('page-title').innerText = newTitle
// 	if (tabMenu.length && tabContent.length) {
// 		tabMenu[0].classList.add("active");
// 		tabContent[0].classList.add("active");

// 		function activeTab(index) {
// 			tabContent.forEach(function (section) {
// 				section.classList.remove("active");
// 			});
// 			tabContent[index].classList.add("active");

// 			tabMenu.forEach(function (menu) {
// 				menu.classList.remove("active");
// 			});
// 			tabMenu[index].classList.add("active");
// 		}

// 		tabMenu.forEach(function (itemMenu, index) {
// 			itemMenu.addEventListener("click", function () {
// 				activeTab(index);
// 				// var newTitle = itemMenu.dataset.title
// 				// document.getElementById('page-title').innerText = newTitle
// 			});
// 		});
// 	}
// }
// initTabNav();
$(".content .tab-pannel").first().show();
function openTab(evt, tabName) {
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
	$(evt.currentTarget).addClass("active");
}

$(".nav-item").click(function () {
	openTab(event, $(this).data("name"));
});

$("#cgu-see").click(function () {
	$("#cgu-more").fadeToggle("fast");
});
