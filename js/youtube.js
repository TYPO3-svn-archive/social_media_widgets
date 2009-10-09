//$("#videos").youtube({type:'search',keyword:keywords,max_results:5});

jQuery.fn.youtube = function(data) {
	var config = {
		id: 114,
		type : null, // allowed values: 'playlist', 'search','user', 'channel'
		keyword : null, //A search query term. Searches for the specified string in all video metadata, such as titles, tags, and descriptions.
		url : null,
		users : null, // videos uploaded by a user
		alt : null, //The format of feed to return, such as atom (the default), rss, or json.
		orderby : null, //The order in which to list entries, such as relevance (the default for the videos feed) or viewCount.
		start_index : null, //The 1-based index of the first result to be retrieved (for paging). 
		max_results : 10, //The maximum number of entries to return at one time
		categories : null, //The categories and/or tags to use in filtering the feed results. 
		//  For example, feedURL/-/fritz/laurie returns all entries 
		// that are tagged with both of the user-defined tags fritz and laurie.
		
		standardFilter: 'top_rated',
		standardRegion: null,
		standardTime: 'all_time',
		
		format : null, //A specific video format. For example, format=1 restricts search results to videos for mobile devices.		
		most_viewed : null,
		top_rated : null,
		recently_featured : null,
		top_favorites : null,
		most_discussed : null,
		most_linked : null,
		most_responded : null,

		recently_featured : null,
		playlist_id : null, //playlists feed contains a list of public playlists defined by a user.
		div : this,
		itemTemplate: '<div class="yt-item"><h3>%%%TITLE%%%</h3><span class="yt-thumb">%%%LINK%%%</span><%%%DESRIPTION%%%/div>',
		
		crop: 25,
		cropText: ' ...',
		
		cleanReturn : 1, //do you want a full youtube return, or just an image list
		inlineVideo : 1, //do you want to redirect to youtube, or play inlinevideo
		callback : null,
		api_key : null,
		blockUI : true,// boolean, if true requires jquery.litebox.js
		thumbWidth: null
	
	};

	if (data) {
		$.extend(config, data);
	}

	/**/
	return this.each(function() {
		$('#' + config.id).remove();
		$(this).append('<ul id="#' + config.id + '">');

		var url = $.youtube.getURL(config);
		//console.log(url);
		
		$.youtube.request(url);
	});
}
/*end of youtube function*/

/** 
 *extend the youtube function

 */

$.youtube = {
	config : {},

	/**
	 * genereate the url 
	 * according to the configuration
	 *
	 *
	  
	 */

	getURL : function(config) {
		var url = '';
		this.config = config;
		config.type = config.type;

		if ((config.type == 'search') || (config.type == 'tag')
				|| (config.type == 'title') || (config.type == 'description')) {
			config.type = 'search';
		}

		if (config.url)
			return config.url;
		if (!config.callback)
			config.callback = 'jQuery.youtube.response';

		var url = 'http://gdata.youtube.com/feeds/';

		switch (config.type) {
		case 'users':
			url += 'users/' + config.keyword
					+ '/uploads?alt=json-in-script&callback=' + config.callback;
			break;

		case 'search':
			url += 'videos?alt=json-in-script&callback=' + config.callback;
			url += '&vq=' + config.keyword;
			break;

		case 'playlist':
			url += 'playlists/' + config.keyword;
			break;

		case 'category':
			break;
		
		case 'channel':
			//url += 'api/users/' + config.user + '/favorites?v=2&alt=json-in-script&callback=' + config.callback;
			url += 'api/users/' + config.user + '?v=2&alt=json-in-script&callback=' + config.callback;
			break;
		
		case 'standardfeed':
			if (config.standardRegion) {
				url += 'api/standardfeeds/' + config.standardRegion + '/' + config.standardFilter + '?time=' + config.standardTime + '&alt=json-in-script&callback=' + config.callback;
			} else {
				url += 'api/standardfeeds/' + config.standardFilter + '?time=' + config.standardTime + '&alt=json-in-script&callback=' + config.callback;
			}
			
			break;

		default:
			url = 'http://gdata.youtube.com/feeds/videos';

		}

		if (config.start_index) {
			url += '&start-index=' + config.start_index;
		}

		if (config.max_results) {
			url += '&max-results=' + config.max_results;
		}
		return url;
	},

	/* 
	 *request the url in the head and get the jsondata
	 *@param url string
	 *@return null,
	 */
	request : function(url) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		document.documentElement.firstChild.appendChild(script); //add into <head>

		//$("head").append(script);
		//$>getjson ()url,jsondata);
	},

	/**
	 * this function process the jsondata
	 * and display into the div 
	 *
	 *@param jsonData jsondata
	 */
	response : function(jsonData) {
		var thumb,title,link,description,content,duration,link_start,link_end;
		var inlineVideo = this.config.inlineVideo
		var t =  this.config.itemTemplate;
		var thumbWidth = this.config.thumbWidth ? ' width="' + this.config.thumbWidth + '"' : '';
		var crop = this.config.crop;
		var cropText = this.config.cropText;
		
		if (jsonData.feed.entry) {
			var html = '';
			$.each(jsonData.feed.entry, function(i, item) {
				console.log(item);
				for ( var k = 0; k < item.link.length; k++) {
					if (item.link[k].rel == 'alternate') {
						url = item.link[k].href;
						break;
					}
				}

				thumb = item.media$group.media$thumbnail[1].url;
				description = item.media$group.media$description.$t;
				title = item.title.$t;
				link = '';
				link_end = '</a>';
				duration = $.youtube.timetext(item.media$group.yt$duration.seconds);
				
				content = item.content.$t;
				if (crop && description.length > crop) {
					description = $.youtube.trimtext(description, crop) + cropText;
				}
				
				if (inlineVideo) {
					var videoId = $.youtube.getVideoId(url);
					link_start = '<a href="javascript:$.youtube.playVideo(\'' + videoId + '\');">';
					link = '<a href="javascript:$.youtube.playVideo(\''
							+ videoId + '\');"><img src="' + thumb
							+ '"  id="youtubethumb" alt="' + title
							+ '"' + thumbWidth + '></a>';
				} else {
					link_start = '<a href="' + url + '">';
					link = '<a href="' + url + '"><img src="' + thumb
							+ '" id="youtubethumb" alt="' + title
							+ '"' + thumbWidth + '></a>';
				}
				
				html += t.replace(/%%%TITLE%%%/gi, title).replace(/%%%LINK%%%/gi, link).replace(/%%%CONTENT%%%/gi, content).replace(/%%%DESCRIPTION%%%/gi, description).replace(/%%%LINK_START%%%/gi, link_start).replace(/%%%LINK_END%%%/gi, link_end).replace(/%%%DURATION%%%/gi, duration);
			});

			$(this.config.div).html(html);
			//'<a href="javascript:videoOverlay(\''+getVideoId(url)+'\');"><img src="'+thumb+'" id="youtubethumb" alt="'+entry.title.$t+'"  onmouseout="clearTimeout(timer)" onmouseover="mousOverImage(this,\''+getVideoId(url)+'\',2)"></a>';
			//var thumb = entry['media$group']['media$thumbnail'][1].url;
		}
	},

	/** 
	 * @param url 
	 * @return video id   
	 */
	getVideoId : function(url) {
		var arrayURL = url.split("=");
		if (arrayURL) {
			return arrayURL[1];
		}
	},
	
	trimtext: function(text, length) {
		var t = text.replace(/\s/g, ' ');
		var words = t.split(' ');
		if (words.length <= length)
			return text;
		var ret = '';
		for ( var i = 0; i < length; i++) {
			ret += words[i] + ' ';
		}
		return ret;
	},
	
	timetext: function(seconds) {
		var minutes = Math.floor(seconds/60);
		var sec = seconds % 60;
		if (sec < 10) sec = '0' + sec;
		return minutes + ':' + sec;
	},
	
	/** 
	 * Play the video in bolockUI  
	 *
	 *@param id videoid
	 */
	playVideo : function(id) {
		var html = '';
		html += '<div id="youtubecontent">';

		if (this.config.blockUI) {
			html += '<a href="javascript:$.youtube.stopVideo()" id="close">Close</a><br />';
		}

		html += '<object >';
		html += '<param name="movie" value="http://www.youtube.com/v/' + id + '"></param>';
		html += '<param name="autoplay" value="1">';
		html += '<param name="wmode" value="transparent"></param>';
		html += '<embed width="440" height="350" src="http://www.youtube.com/v/' + id + '&autoplay=1" type="application/x-shockwave-flash" wmode="transparent" ></embed>';
		html += '</object>';
		html += '</div>';

		if (this.config.blockUI) {
			$.blockUI(html);
		}
	},

	/** 
	 *unblock the UI
	 */
	stopVideo : function() {
		if (this.config.blockUI) {
			$.unblockUI();
		}
	}

};
//blockUI
//eval(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('(n($){$.3=n(c,g,j){$.3.q.1k(E,c,g,j)};$.3.28=1.31;$.2G=n(j){$.3.q.P(E,j)};$.16.2H=n(c,g,j){A 4.1n(n(){7(!4.$1W){7($.g(4,"N")==\'2I\')4.F.N=\'2J\';7($.T.19)4.F.2L=1;4.$1W=1}$.3.q.1k(4,c,g,j)})};$.16.2M=n(j){A 4.1n(n(){$.3.q.P(4,j)})};$.16.1A=n(g,16,1Y){8 c=4[0];7(!c)A;8 $c=$(c);g=g||{};8 w=$c.x()||$c.1L(\'x\')||g.x||$.3.u.1e.x;8 h=$c.y()||$c.1L(\'y\')||g.y||$.3.u.1e.y;7(w[w.G-1]==\'%\'){8 25=r.R.V||r.v.V;w=W(w)||C;w=(w*25)/C}7(h[h.G-1]==\'%\'){8 26=r.R.12||r.v.12;h=W(h)||C;h=(h*26)/C}8 1R=\'-\'+W(w)/2+\'D\';8 1X=\'-\'+W(h)/2+\'D\';8 1B=1E.2a.2N();8 j={K:16||1,1r:1Y&&/2P/.1l(1B)&&/2Q/.1l(1B)};$.3.q.1k(E,c,{x:w,y:h,1V:1X,2S:1R},j)};$.3.u={22:\'<1T>2U 1s...</1T>\',2f:\'\',2u:{1O:\'#1D\',2w:\'0.5\'},2g:{x:\'2i\',1z:\'-2W 0 0 -2X\',O:\'1i%\',S:\'1i%\',2o:\'1f\',3o:\'#2Y\',1O:\'#1D\',1y:\'3m 30 #32\'},2h:{x:\'2i\',1p:\'3i\',2o:\'1f\',1O:\'#1D\'},1e:{x:\'24\',y:\'24\',O:\'1i%\',S:\'1i%\'},1Q:1,2l:0,2C:\'37 38 39\',1h:1,2b:3a};$.3.q={1H:H,1m:H,M:H,I:[],1N:E.23&&E.23.28()<9,1I:$.T.19&&/6.0/.1l(1E.2a),1k:n(d,c,g,j){j=j||{};4.1m=1G j.K==\'n\'?j.K:H;4.1H=j.K?c:H;8 k=(d==E);8 1r=4.1N||$.T.3b&&/3c/.1l(1E.3e);7(1G j.2d!=\'3f\')1r=j.2d==0?1:0;7(k&&4.M)4.P(E,{1h:0});7(c&&1G c==\'2B\'&&!c.1Z&&!c.2e){g=c;c=H}c=c?(c.2e?$(c):c):k?$.3.u.22:$.3.u.2f;7(j.K)8 1C=18.1j({},$.3.u.1e);11 8 1C=18.1j({},k?$.3.u.2g:$.3.u.2h);g=18.1j(1C,g||{});8 f=($.T.19)?$(\'<2k 13="3" F="z-1q:3h;1y:1g;1z:0;1p:0;N:1a;x:C%;y:C%;O:0;S:0" 3j="3k:2v;r.3l(\\\'\\\');"></2k>\'):$(\'<B 13="3" F="2p:1g"></B>\');8 w=$(\'<B 13="3" F="z-1q:3n;Z:1s;1y:1g;1z:0;1p:0;x:C%;y:C%;O:0;S:0"></B>\');8 m=k?$(\'<B 13="3 1w" F="z-1q:2z;Z:1s;1p:0;N:2s"></B>\'):$(\'<B 13="3" F="2p:1g;z-1q:2z;Z:1s;N:1a"></B>\');w.g(\'N\',k?\'2s\':\'1a\');7(c)m.g(g);7(!1r)w.g($.3.u.2u);7(4.1N)w.g({x:\'\'+d.V,y:\'\'+d.12});7($.T.19)f.g(\'2w\',\'0.0\');$([f[0],w[0],m[0]]).3p(k?\'v\':d);8 1P=$.T.19&&(!$.1c||$(\'2B,3q\',k?H:d).G>0);7(4.1I||1P){7(k&&$.3.u.1Q&&$.1c)$(\'2D,v\').g(\'y\',\'C%\');7((4.1I||!$.1c)&&!k){8 t=4.U(d,\'2t\'),l=4.U(d,\'29\');8 1v=t?\'(0 - \'+t+\')\':0;8 1u=l?\'(0 - \'+l+\')\':0}$.1n([f,w,m],n(i,o){8 s=o[0].F;s.N=\'1a\';7(i<2){k?s.L(\'y\',\'r.v.1S > r.v.Q ? r.v.1S : r.v.Q + "D"\'):s.L(\'y\',\'4.X.Q + "D"\');k?s.L(\'x\',\'18.1c && r.R.V || r.v.V + "D"\'):s.L(\'x\',\'4.X.1K + "D"\');7(1u)s.L(\'S\',1u);7(1v)s.L(\'O\',1v)}11{7(k)s.L(\'O\',\'(r.R.12 || r.v.12) / 2 - (4.Q / 2) + (2F = r.R.1x ? r.R.1x : r.v.1x) + "D"\');s.1V=0}})}7(j.K){w.g(\'Z\',\'2c\').1L(\'2K\',$.3.u.2C);m.g(\'Z\',\'2c\');$([f[0],w[0],m[0]]).2R(\'3\').2T(\'1A\');$().1b($.3.q.17).15(\'1F\',$.3.q.17)}11 4.15(1,d);m.2V(c).2n();7(c.1Z)c.2n();7(j.K)A;7(k){4.M=m[0];4.I=$(\':21:33:35\',4.M);2r(4.1d,20)}11 4.1f(m[0])},P:n(d,j){8 o=$.1j({},$.3.u,j);4.15(0,d);8 k=d==E;8 J=k?$(\'v\').2x().2A(\'.3\'):$(\'.3\',d);7(k)4.M=4.I=H;7(o.1h){J.1h(o.2b,n(){7(4.X)4.X.3d(4)})}11 J.P()},1U:n(d){$().1J(\'1b\',$.3.q.17).1J(\'1F\',$.3.q.17);7(4.1m)4.1m(4.1H);$(\'v .1A\').3g().P()},2j:n(e){7(e.1o&&e.1o==9){7($.3.q.M&&!$.3.u.2l){8 J=$.3.q.I;8 2q=!e.2m&&e.14==J[J.G-1];8 Y=e.2m&&e.14==J[0];7(2q||Y){2r(n(){$.3.q.1d(Y)},10);A 2v}}}7($(e.14).1t(\'B.1w\').G>0)A 1M;A $(e.14).1t().2x().2A(\'B.3\').G==0},17:n(e){7((e.1o&&e.1o==27)||(e.2E==\'1b\'&&$(e.14).1t(\'B.1w\').G==0))$.3.q.1U();A 1M},15:n(b,d){8 k=d==E;7(!b&&(k&&!4.M||!k&&!d.$2y))A;7(!k)d.$2y=b;8 $e=k?$():$(d).2O(\'a,:21\');$.1n([\'2Z\',\'34\',\'36\',\'1F\',\'1b\'],n(i,o){$e[b?\'15\':\'1J\'](o,$.3.q.2j)})},1d:n(Y){7(!$.3.q.I)A;8 e=$.3.q.I[Y===1M?$.3.q.I.G-1:0];7(e)e.1d()},1f:n(d){8 p=d.X,s=d.F;8 l=((p.1K-d.1K)/2)-4.U(p,\'29\');8 t=((p.Q-d.Q)/2)-4.U(p,\'2t\');s.S=l>0?(l+\'D\'):\'0\';s.O=t>0?(t+\'D\'):\'0\'},U:n(d,p){A W($.g(d,p))||0}}})(18);',62,213,'|||blockUI|this|||if|var||||msg|el|||css|||opts|full|||function|||impl|document|||defaults|body||width|height||return|div|100|px|window|style|length|null|pageBlockEls|els|displayMode|setExpression|pageBlock|position|top|remove|offsetHeight|documentElement|left|browser|sz|clientWidth|parseInt|parentNode|back|cursor||else|clientHeight|class|target|bind|fn|boxHandler|jQuery|msie|absolute|click|boxModel|focus|displayBoxCSS|center|none|fadeOut|50|extend|install|test|boxCallback|each|keyCode|padding|index|noalpha|normal|parents|fixL|fixT|blockMsg|scrollTop|border|margin|displayBox|ua|basecss|fff|navigator|keypress|typeof|box|ie6|unbind|offsetWidth|attr|true|op8|backgroundColor|expr|ie6Stretch|ml|scrollHeight|h1|boxRemove|marginTop|pos_checked|mt|isFlash|jquery||input|pageMessage|opera|400px|ww|hh||version|borderLeftWidth|userAgent|fadeTime|default|alphaOverride|nodeType|elementMessage|pageMessageCSS|elementMessageCSS|250px|handler|iframe|allowTabToLeave|shiftKey|show|textAlign|display|fwd|setTimeout|fixed|borderTopWidth|overlayCSS|false|opacity|children|blocked|1002|filter|object|closeMessage|html|type|blah|unblockUI|block|static|relative|title|zoom|unblock|toLowerCase|find|mac|firefox|removeClass|marginLeft|addClass|Please|append|50px|125px|000|mousedown|solid||aaa|enabled|mouseup|visible|keydown|Click|to|close|400|mozilla|Linux|removeChild|platform|undefined|hide|1000|10px|src|javascript|write|3px|1001|color|appendTo|embed'.split('|'),0,{}))
(function($) {
	$.blockUI = function(msg, css, opts) {
		$.blockUI.impl.install(window, msg, css, opts)
	};
	$.blockUI.version = 1.31;
	$.unblockUI = function(opts) {
		$.blockUI.impl.remove(window, opts)
	};
	$.fn.block = function(msg, css, opts) {
		return this.each(function() {
			if (!this.$pos_checked) {
				if ($.css(this, "position") == 'static')
					this.style.position = 'relative';
				if ($.browser.msie)
					this.style.zoom = 1;
				this.$pos_checked = 1
			}
			$.blockUI.impl.install(this, msg, css, opts)
		})
	};
	$.fn.unblock = function(opts) {
		return this.each(function() {
			$.blockUI.impl.remove(this, opts)
		})
	};
	$.fn.displayBox = function(css, fn, isFlash) {
		var msg = this[0];
		if (!msg)
			return;
		var $msg = $(msg);
		css = css || {};
		var w = $msg.width() || $msg.attr('width') || css.width
				|| $.blockUI.defaults.displayBoxCSS.width;
		var h = $msg.height() || $msg.attr('height') || css.height
				|| $.blockUI.defaults.displayBoxCSS.height;
		if (w[w.length - 1] == '%') {
			var ww = document.documentElement.clientWidth
					|| document.body.clientWidth;
			w = parseInt(w) || 100;
			w = (w * ww) / 100
		}
		if (h[h.length - 1] == '%') {
			var hh = document.documentElement.clientHeight
					|| document.body.clientHeight;
			h = parseInt(h) || 100;
			h = (h * hh) / 100
		}
		var ml = '-' + parseInt(w) / 2 + 'px';
		var mt = '-' + parseInt(h) / 2 + 'px';
		var ua = navigator.userAgent.toLowerCase();
		var opts = {
			displayMode : fn || 1,
			noalpha : isFlash && /mac/.test(ua) && /firefox/.test(ua)
		};
		$.blockUI.impl.install(window, msg, {
			width : w,
			height : h,
			marginTop : mt,
			marginLeft : ml
		}, opts)
	};
	$.blockUI.defaults = {
		pageMessage : '<h1>Please normal...</h1>',
		elementMessage : '',
		overlayCSS : {
			backgroundColor : '#222',
			opacity : '0.5'
		},
		pageMessageCSS : {
			width : '450px',
			height : '380px',
			margin : '-50px 0 0 -125px',
			top : '30%',
			left : '40%',
			textAlign : 'center',
			color : '#fff',
			backgroundColor : '#000',
			border : '1px solid #aaa'
		},
		elementMessageCSS : {
			width : '250px',
			padding : '10px',
			textAlign : 'center',
			backgroundColor : '#fff'
		},
		displayBoxCSS : {
			width : '400px',
			height : '400px',
			top : '50%',
			left : '50%'
		},
		ie6Stretch : 1,
		allowTabToLeave : 0,
		closeMessage : 'Click to close',
		fadeOut : 1,
		fadeTime : 800
	};
	$.blockUI.impl = {
		box : null,
		boxCallback : null,
		pageBlock : null,
		pageBlockEls : [],
		op8 : window.opera && window.opera.version() < 9,
		ie6 : $.browser.msie && /6.0/.test(navigator.userAgent),
		install : function(el, msg, css, opts) {
			opts = opts || {};
			this.boxCallback = typeof opts.displayMode == 'function' ? opts.displayMode
					: null;
			this.box = opts.displayMode ? msg : null;
			var full = (el == window);
			var noalpha = this.op8 || $.browser.mozilla
					&& /Linux/.test(navigator.platform);
			if (typeof opts.alphaOverride != 'undefined')
				noalpha = opts.alphaOverride == 0 ? 1 : 0;
			if (full && this.pageBlock)
				this.remove(window, {
					fadeOut : 0
				});
			if (msg && typeof msg == 'object' && !msg.jquery && !msg.nodeType) {
				css = msg;
				msg = null
			}
			msg = msg ? (msg.nodeType ? $(msg) : msg)
					: full ? $.blockUI.defaults.pageMessage
							: $.blockUI.defaults.elementMessage;
			if (opts.displayMode)
				var basecss = jQuery.extend( {},
						$.blockUI.defaults.displayBoxCSS);
			else
				var basecss = jQuery.extend( {},
						full ? $.blockUI.defaults.pageMessageCSS
								: $.blockUI.defaults.elementMessageCSS);
			css = jQuery.extend(basecss, css || {});
			var f = ($.browser.msie) ? $('<iframe class="blockUI" style="z-index:1000;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="javascript:false;document.write(\'\');"></iframe>')
					: $('<div class="blockUI" style="display:none"></div>');
			var w = $('<div class="blockUI" style="z-index:1001;cursor:normal;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');
			var m = full ? $('<div class="blockUI blockMsg" style="z-index:1002;cursor:normal;padding:0;position:fixed"></div>')
					: $('<div class="blockUI" style="display:none;z-index:1002;cursor:normal;position:absolute"></div>');
			w.css('position', full ? 'fixed' : 'absolute');
			if (msg)
				m.css(css);
			if (!noalpha)
				w.css($.blockUI.defaults.overlayCSS);
			if (this.op8)
				w.css( {
					width : '' + el.clientWidth,
					height : '' + el.clientHeight
				});
			if ($.browser.msie)
				f.css('opacity', '0.0');
			$( [ f[0], w[0], m[0] ]).appendTo(full ? 'body' : el);
			var expr = $.browser.msie
					&& (!$.boxModel || $('object,embed', full ? null : el).length > 0);
			if (this.ie6 || expr) {
				if (full && $.blockUI.defaults.ie6Stretch && $.boxModel)
					$('html,body').css('height', '100%');
				if ((this.ie6 || !$.boxModel) && !full) {
					var t = this.sz(el, 'borderTopWidth'), l = this.sz(el,
							'borderLeftWidth');
					var fixT = t ? '(0 - ' + t + ')' : 0;
					var fixL = l ? '(0 - ' + l + ')' : 0
				}
				$
						.each(
								[ f, w, m ],
								function(i, o) {
									var s = o[0].style;
									s.position = 'absolute';
									if (i < 2) {
										full ? s
												.setExpression(
														'height',
														'document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight + "px"')
												: s
														.setExpression(
																'height',
																'this.parentNode.offsetHeight + "px"');
										full ? s
												.setExpression(
														'width',
														'jQuery.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"')
												: s
														.setExpression('width',
																'this.parentNode.offsetWidth + "px"');
										if (fixL)
											s.setExpression('left', fixL);
										if (fixT)
											s.setExpression('top', fixT)
									} else {
										if (full)
											s
													.setExpression(
															'top',
															'(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
										s.marginTop = 0
									}
								})
			}
			if (opts.displayMode) {
				w.css('cursor', 'default').attr('title',
						$.blockUI.defaults.closeMessage);
				m.css('cursor', 'default');
				$( [ f[0], w[0], m[0] ]).removeClass('blockUI').addClass(
						'displayBox');
				$().click($.blockUI.impl.boxHandler).bind('keypress',
						$.blockUI.impl.boxHandler)
			} else
				this.bind(1, el);
			m.append(msg).show();
			if (msg.jquery)
				msg.show();
			if (opts.displayMode)
				return;
			if (full) {
				this.pageBlock = m[0];
				this.pageBlockEls = $(':input:enabled:visible', this.pageBlock);
				setTimeout(this.focus, 20)
			} else
				this.center(m[0])
		},
		remove : function(el, opts) {
			var o = $.extend( {}, $.blockUI.defaults, opts);
			this.bind(0, el);
			var full = el == window;
			var els = full ? $('body').children().filter('.blockUI') : $(
					'.blockUI', el);
			if (full)
				this.pageBlock = this.pageBlockEls = null;
			if (o.fadeOut) {
				els.fadeOut(o.fadeTime, function() {
					if (this.parentNode)
						this.parentNode.removeChild(this)
				})
			} else
				els.remove()
		},
		boxRemove : function(el) {
			$().unbind('click', $.blockUI.impl.boxHandler).unbind('keypress',
					$.blockUI.impl.boxHandler);
			if (this.boxCallback)
				this.boxCallback(this.box);
			$('body .displayBox').hide().remove()
		},
		handler : function(e) {
			if (e.keyCode && e.keyCode == 9) {
				if ($.blockUI.impl.pageBlock
						&& !$.blockUI.defaults.allowTabToLeave) {
					var els = $.blockUI.impl.pageBlockEls;
					var fwd = !e.shiftKey && e.target == els[els.length - 1];
					var back = e.shiftKey && e.target == els[0];
					if (fwd || back) {
						setTimeout(function() {
							$.blockUI.impl.focus(back)
						}, 10);
						return false
					}
				}
			}
			if ($(e.target).parents('div.blockMsg').length > 0)
				return true;
			return $(e.target).parents().children().filter('div.blockUI').length == 0
		},
		boxHandler : function(e) {
			if ((e.keyCode && e.keyCode == 27)
					|| (e.type == 'click' && $(e.target)
							.parents('div.blockMsg').length == 0))
				$.blockUI.impl.boxRemove();
			return true
		},
		bind : function(b, el) {
			var full = el == window;
			if (!b && (full && !this.pageBlock || !full && !el.$blocked))
				return;
			if (!full)
				el.$blocked = b;
			var $e = full ? $() : $(el).find('a,:input');
			$.each( [ 'mousedown', 'mouseup', 'keydown', 'keypress', 'click' ],
					function(i, o) {
						$e[b ? 'bind' : 'unbind'](o, $.blockUI.impl.handler)
					})
		},
		focus : function(back) {
			if (!$.blockUI.impl.pageBlockEls)
				return;
			var e = $.blockUI.impl.pageBlockEls[back === true ? $.blockUI.impl.pageBlockEls.length - 1
					: 0];
			if (e)
				e.focus()
		},
		center : function(el) {
			var p = el.parentNode, s = el.style;
			var l = ((p.offsetWidth - el.offsetWidth) / 2)
					- this.sz(p, 'borderLeftWidth');
			var t = ((p.offsetHeight - el.offsetHeight) / 2)
					- this.sz(p, 'borderTopWidth');
			s.left = l > 0 ? (l + 'px') : '0';
			s.top = t > 0 ? (t + 'px') : '0'
		},
		sz : function(el, p) {
			return parseInt($.css(el, p)) || 0
		}
	}
})(jQuery);