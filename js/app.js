showdown.setFlavor('github');

var ROOT = document.getElementById("__ROOT__");
var MD = new showdown.Converter({
	parseImgDimensions: true,
	simplifiedAutoLink: true,
	excludeTrailingPunctuationFromURLs: true,
	strikethrough: true,
	tables: true,
	ghCodeBlocks: true,
	tasklists: true,
	simpleLineBreaks: true,
	emoji: true
});
var PAGES = {};
var R = null;

function load(url) {
	req = new XMLHttpRequest();
	req.open('GET', window.location.href+url);
	req.responseType = "document";
	req.onload = () => {
		var html = MD.makeHtml(req.responseText);

		// Replace %% with <section></section>
		var reg = /%%([\S\s]*?)%%/gm;
		var result;
		while((result = reg.exec(html)) !== null) {
			var fnl = "<section>"+result[1]+"</section>";
			html = html.substr(0, result.index) +
				   fnl.trim() +
				   html.substr(result.index+result[0].length);
		}

		ROOT.innerHTML = html;
		$('pre code').each(function(i, block) {
			hljs.highlightBlock(block);
		});

		$('img').each(function(i, img) {
			$(img).addClass("w3-image imgcard");
		});
	};
	req.send();
}

function merge(obj1, obj2){
	var obj3 = {};
	for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	return obj3;
}

$.get(window.location.href+'pages', (data) => {
	var pgs = data.match(/href="([\w]+)/g) // pull out the hrefs
				  .map((x) => x.replace('href="', '')); // clean up
	for (var k in pgs) {
		var page = pgs[k];
		PAGES["/"+page] = function() { load("pages/"+page+".md"); };
	}
	R = new Navigo(null, "!#", true);
	var ROUTER = merge({ "*": function() { load("pages/home.md"); } }, PAGES);
	R.on(ROUTER).resolve();
});
