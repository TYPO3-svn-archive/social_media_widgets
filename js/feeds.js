(function($) {
	$.fn.feedreader = function(options) {
		var defaults = {
			items : 3,
			descLength : 15,
			more: "[mehr ...]",
			cropText: " ...",
			linkTarget: ' target="_blank"'
		}
		if (!options.targeturl)
			return false;
		var opts = $.extend(defaults, options);
		$(this).each(function() {
			var container = this;
			$.get(opts.targeturl, function(xml) {
				var posts = [];
				var i = 0;
				$("item", xml).each(function() {
					if (i > opts.items - 1)
						return;
					var post = {};
					$(this).find("link").each(function() {
						post.link = getNodeText(this);
					});
					$(this).find("title").each(function() {
						post.title = getNodeText(this);
					});
					$(this).find("pubDate").each(function() {
						post.date = getNodeText(this);
					});
					$(this).find("description").each(function() {
						var t = getNodeText(this);
						post.desc = trimtext(t, opts.descLength) + opts.cropText;
					});
					posts[i++] = post;
				});
				writeposts(container, posts, opts);

			})
		});

	};

	function trimtext(text, length) {
		var t = text.replace(/\s/g, ' ');
		var words = t.split(' ');
		if (words.length <= length)
			return text;
		var ret = '';
		for ( var i = 0; i < length; i++) {
			ret += words[i] + ' ';
		}
		return ret;
	}

	function writeposts(container, posts, opts) {
		$(container).empty();
		var html = '<dl>';
		for ( var k in posts) {
			html += format(posts[k], opts)
		}
		html += '</dl>';
		$(container).append(html);
	}

	function format(post, opts) {
		var html = '<dt> <a href="' + post.link + '">' + post.title
				+ '</a><br /><span class="date">' + post.date + '</span></dt>';
		html += '<dd>' + post.desc + '<a href="' + post.link
				+ '"' + opts.linkTarget + '>'+opts.more+'</a></dd>'
		return html;
	}

	function getNodeText(node) {
		var text = "";
		if (node.text)
			text = node.text;
		if (node.firstChild)
			text = node.firstChild.nodeValue;
		return text;
	}

})(jQuery);