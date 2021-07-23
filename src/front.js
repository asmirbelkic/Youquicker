document.getElementById("min-button").addEventListener("click", function () {
	remote.getCurrentWindow().minimize();
});

document.getElementById("close-button").addEventListener("click", function () {
	remote.getCurrentWindow().close();
});

function showPop() {
	document.getElementById("notifOne").classList.add("active");
	setTimeout(() => {
		document.getElementById("notifOne").classList.remove("active");
	}, 4000);
}

function showErr() {
	document.getElementById("notifErr").classList.add("active");
	setTimeout(() => {
		document.getElementById("notifErr").classList.remove("active");
	}, 4000);
}

var checkBox = document.getElementById("checkDebug");
checkBox.addEventListener("click", function () {
	if (checkBox.checked == true) {
		$("#debug-window").fadeIn("fast");
	} else {
		$("#debug-window").fadeOut("fast");
	}
});

// Get all modals with class modal
var modals = document.getElementsByClassName("modal");

// Get the button that opens the modal
var btns = document.getElementsByClassName("open-card");

// List all btns then on click remove all "visible" class and toggle them properly
for (let i = 0; i < btns.length; i++) {
	btns[i].onclick = function () {
		for (var d = 0; d < modals.length; d++) {
			modals[d].classList.remove("visible");
		}
		for (let x = 0; x < btns.length; x++) {
			btns[x].classList.remove("active");
		}
		modals[i].classList.toggle("visible");
		btns[i].classList.toggle("active");
	};
}

/* 
TODO Back-End
.card-close class
[spans] & [modals] - [btns]
*/

var spans = document.getElementsByClassName("card-close");
for (let i = 0; i < spans.length; i++) {
	document.addEventListener("keydown", function (event) {
		const key = event.key; // Or const {key} = event; in ES6+
		if (key === "Escape") {
			// Do things
			modals[i].classList.remove("visible");
			btns[i].classList.remove("active");
		}
	});
	spans[i].onclick = function () {
		modals[i].classList.remove("visible");
		btns[i].classList.remove("active");
	};
}

function toggle(source) {
	checkboxes = document.getElementsByName("tableItems");
	for (var i = 0, n = checkboxes.length; i < n; i++) {
		checkboxes[i].checked = source.checked;
	}
}

function toggleAll(source) {
	checkboxes = document.getElementsByName("videoNames");
	for (var i = 0, n = checkboxes.length; i < n; i++) {
		checkboxes[i].checked = source.checked;
	}
}
// let element = document.getElementById('logInNow');

// function toggle () {
//   // Attempt to reference the element in the document, not the template content
//   var imported = document.querySelector(".imported");

//    // Check for the element, not the template content
//    if (document.body.contains(imported)) {
//      // Element exists, call removeChild on its parent
//      document.body.style.overflow = 'auto';
//      imported.parentNode.removeChild(imported);
//      document.element.style.pointerEvents = 'auto';
//     } else {
//       // Use .importNode to bring template content in:
//      document.body.appendChild(document.importNode(element.content, true));
//    }
// }

// document.getElementById('logIn').addEventListener('click', toggle);

function initTabNav() {
	const tabMenu = document.querySelectorAll(".sidebar-app .nav-item");
	const tabContent = document.querySelectorAll(".content section");
	// var newTitle = document.querySelector("body > div.container > aside > div > a.nav-item.active").dataset.title
	// document.getElementById('page-title').innerText = newTitle
	if (tabMenu.length && tabContent.length) {
		tabMenu[0].classList.add("active");
		tabContent[0].classList.add("active");

		function activeTab(index) {
			tabContent.forEach(function (section) {
				section.classList.remove("active");
			});
			tabContent[index].classList.add("active");

			tabMenu.forEach(function (menu) {
				menu.classList.remove("active");
			});
			tabMenu[index].classList.add("active");
		}

		tabMenu.forEach(function (itemMenu, index) {
			itemMenu.addEventListener("click", function () {
				activeTab(index);
				// var newTitle = itemMenu.dataset.title
				// document.getElementById('page-title').innerText = newTitle
			});
		});
	}
}

initTabNav();

document.getElementById("cgu-see").addEventListener("click", function (e) {
	$("#cgu-more").fadeToggle("fast");
});

var dropdown = document.getElementsByClassName("dropdown-btn");

for (var i = 0; i < dropdown.length; i++) {
	dropdown[i].addEventListener("click", function () {
		this.classList.toggle("active");
		var dropdownContent = this.nextElementSibling;
		if (dropdownContent.style.display === "block") {
			dropdownContent.style.display = "none";
		} else {
			dropdownContent.style.display = "block";
		}
	});
}
