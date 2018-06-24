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

var R = null;

function load(url) {
	req = new XMLHttpRequest();
	req.open('GET', url);
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

R = new Navigo(null, "!#", true);
R.on({ "*": function() { load("/pages/home.md"); }}).resolve();
