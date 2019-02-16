let app = new Vue({
	el: "#main",
	data: {
		imageQueue: [],
		projects: [],
		logged: false,
		uploading: false,
		progress: 0
	}
});

// Load projects
firebase.database().ref("projects").on('child_added', function(snp) {
	let proj = snp.val();
	proj.id = snp.key;
	app.projects.push(proj);
});
firebase.database().ref("projects").on('child_removed', function(snp) {
	app.projects = app.projects.filter(function(p) {
		return p.id != snp.key;
	});
});
//

function app_login() {
	let password = document.getElementById("tx_password");
	if (password.getAttribute("hidden") !== null) {
		password.removeAttribute("hidden");
	} else {
		let pass = password.value;
		firebase.auth().signInWithEmailAndPassword("diego95lopes@gmail.com", pass)
			.then(function() {
				app.logged = true;
				password.toggleAttribute("hidden");
			})
			.catch(function(e) {
				alert(e.message);
				app.logged = false;
			});
	}
}

function UUID(){
	let dt = new Date().getTime();
	let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		let r = (dt + Math.random()*16)%16 | 0;
		dt = Math.floor(dt/16);
		return (c=='x' ? r :(r&0x3|0x8)).toString(16);
	});
	return uuid;
}

function add_img() {
	app.imageQueue.push({ file: "", id: UUID(), uploading: "" });
}

function register_project() {
	let title = document.getElementById("tx_title").value;
	let url = document.getElementById("tx_url").value;
	let description = document.getElementById("tx_desc").value;

	if (title.length === 0) {
		alert("Please provide a TITLE.");
		return;
	}
	if (url.length === 0) {
		alert("Please provide a URL.");
		return;
	}
	if (description.length === 0) {
		alert("Please provide a DESCRIPTION.");
		return;
	}

	function saveProject(images) {
		// Upload project
		let project = {
			title: title,
			url: url,
			desc: description,
			images: images
		};
		console.log(project);
		let db = firebase.database().ref("projects");
		db.push(project)
			.then(function(snp) {
				console.log(snp);
				document.getElementById("tx_title").value = "";
				document.getElementById("tx_url").value = "";
				document.getElementById("tx_desc").value = "";
				app.imageQueue = [];
				alert("Success!");
			})
			.catch(function(err) {
				alert(err.message);
			});
	}

	// Upload images
	let images = [];
	for (let i = 0; i < app.imageQueue.length; i++) {
		let img = app.imageQueue[i];
		img.uploading = "Uploading...";

		let im = document.getElementById("fi_" + img.id).files[0];
		let ref = firebase.storage().ref("img/" + im.name);
		ref.put(im)
			.then(function() {
				ref.getDownloadURL().then(function(url) {
					img.uploading = "Done.";
					images.push(url);
					if (images.length >= app.imageQueue.length) {
						saveProject(images);
					}
				});
			});
	}
}

function delete_img(id) {
	console.log(id);
	let idx = 0;
	for (let img of app.imageQueue) {
		if (img.id === id) break;
		idx++;
	}
	app.imageQueue.splice(idx, 1);
}

function delete_project(id) {
	console.log(id);
	let ref = firebase.database().ref("projects/" + id);
	ref.remove();
}