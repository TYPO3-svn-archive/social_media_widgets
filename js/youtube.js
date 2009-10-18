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

		playlist_id : null, //playlists feed contains a list of public playlists defined by a user.
		div : this,
		itemTemplate: '<div class="yt-item"><h3>%%%TITLE%%%</h3><span class="yt-thumb">%%%LINK%%%</span><%%%DESRIPTION%%%/div>',
		durationPrefix: 'Time: ',
		
		crop: 25,
		cropText: ' ...',
		
		cleanReturn : 1, //do you want a full youtube return, or just an image list
		linkType : 0, //0 = blockUI, 1 = inline, 2 = extern
		callback : null,
		api_key : null,
		blockUI : true,// boolean, if true requires jquery.litebox.js
		thumbWidth: null,
		thumbHeight: null,
		linkTarget: 'target="_blank"',
		
		ytPlayerWidth: 450,
		ytPlayerHeight: 380
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
};
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

		if ((config.type == 'search') || (config.type == 'tag') || (config.type == 'title') || (config.type == 'description')) {
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
			url += 'playlists/' + config.keyword + '/?alt=json-in-script&callback=' + config.callback;
			break;

		case 'category':
			break;
		
		case 'channel':
			//url += 'api/users/' + config.user + '/favorites?v=2&alt=json-in-script&callback=' + config.callback;
			url += 'api/channels?q=' + config.keyword + '&v=2&alt=json-in-script&callback=' + config.callback;
			break;
		
		case 'standardfeed':
			var filter = config.categories ? config.standardFilter + '_' + config.categories : config.standardFilter;
			if (config.standardRegion) {
				url += 'api/standardfeeds/' + config.standardRegion + '/' + filter + '?time=' + config.standardTime + '&alt=json-in-script&callback=' + config.callback;
			} else {
				url += 'api/standardfeeds/' + filter + '?time=' + config.standardTime + '&alt=json-in-script&callback=' + config.callback;
			}
			
			break;
		case 'favorites':
			url += 'api/users/' + config.keyword + '/favorites?v=2&alt=json-in-script&callback=' + config.callback;
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
		var linkType = this.config.linkType;
		var t =  this.config.itemTemplate;
		var thumbWidth = this.config.thumbWidth ? ' width="' + this.config.thumbWidth + '"' : '';
		var crop = this.config.crop;
		var cropText = this.config.cropText;
		var isChannel = (this.config.type == 'channel');
		var target = this.config.linkTarget;
		var dp = this.config.durationPrefix;
		
		if (jsonData.feed.entry) {
			var html = '';
			$.each(jsonData.feed.entry, function(i, item) {
				
				for ( var k = 0; k < item.link.length; k++) {
					if (item.link[k].rel == 'alternate') {
						url = item.link[k].href;
						break;
					}
				}
				if(!isChannel) {
					thumb = item.media$group.media$thumbnail[1].url;
					description = item.media$group.media$description.$t;
					duration = dp + $.youtube.timetext(item.media$group.yt$duration.seconds);
					content = item.content ? item.content.$t : '';
					title = item.title.$t;
				} else {
					thumb = '';
					description = item.summary.$t;
					duration = '';
					linkType = 0;
					for (i=0;i<item.link.length;i++) {
						if (item.link[i].type == 'text/html') {
							curl = item.link[i].href;
							break;
						}
					}
					title = item.title.$t;
					title = '<a href="' + curl + '" title="' + title + '"' + target + '>' + title + '</a>';
				}
				
				link = '';
				link_end = '</a>';
				
				
				
				if (crop && description.length > crop) {
					description = $.youtube.trimtext(description, crop) + cropText;
				}
				
				thumbImg = thumb ? '<img src="' + thumb + '"  id="youtubethumb" alt="' + title + '"' + thumbWidth + '>' : '';
				if (linkType == 0) {
					var videoId = $.youtube.getVideoId(url);
					link_start = '<a href="javascript:$.youtube.playVideo(\'' + videoId + '\');">';
					link = '<a href="javascript:$.youtube.playVideo(\''
							+ videoId + '\');">' + thumbImg + '</a>';
				} else if (linkType == 1) {
					var videoId = $.youtube.getVideoId(url);
					var divID = "ID" + videoId.split('&')[0];
					link_start = '<a href="javascript:$.youtube.playVideoInline(\'' + videoId + '\');">';
					link = '<div id="'+divID+'"><a href="javascript:$.youtube.playVideoInline(\''
							+ videoId + '\');">' + thumbImg + '</a></div>';
				} else {
					link_start = '<a href="' + url + '" title="' + title + '"' + target + '>';
					link = '<a href="' + url + '">' + thumbImg + '</a>';
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
		var width = this.config.ytPlayerWidth - 10;
		var height = this.config.ytPlayerHeight - 30;
		var html = '';
		html += '<div id="youtubecontent">';

		if (this.config.blockUI) {
			html += '<a href="javascript:$.youtube.stopVideo()" id="close">Close</a><br />';
		}
		
		html += '<object >';
		html += '<param name="movie" value="http://www.youtube.com/v/' + id + '"></param>';
		html += '<param name="autoplay" value="1">';
		html += '<param name="wmode" value="transparent"></param>';
		html += '<embed width="'+width+'" height="'+height+'" src="http://www.youtube.com/v/' + id + '&autoplay=1" type="application/x-shockwave-flash" wmode="transparent" ></embed>';
		html += '</object>';
		html += '</div>';

		if (this.config.blockUI) {
			$.blockUI(html,{width:this.config.ytPlayerWidth+'px',height:this.config.ytPlayerHeight+'px'});
		}
	},
	playVideoInline : function(id) {
		var divID = "#ID" + id.split('&')[0];
		var selA = divID + ' a';
		var selAimg = divID + ' a img';
		
		var width = this.config.ytPlayerWidth;
		var height = this.config.ytPlayerHeight;
		this.config.thumbHeight = $(selAimg).css('height');
		
		var html = '';
		html += '<div class="youtubecontent">';
		/*
		if (this.config.blockUI) {
			html += '<a href="javascript:$.youtube.stopVideo()" id="close">Close</a><br />';
		}
		*/
		html += '<object >';
		html += '<param name="movie" value="http://www.youtube.com/v/' + id + '"></param>';
		html += '<param name="autoplay" value="1">';
		html += '<param name="wmode" value="transparent"></param>';
		html += '<embed width="'+width+'" height="'+height+'" src="http://www.youtube.com/v/' + id + '&autoplay=1" type="application/x-shockwave-flash" wmode="transparent" ></embed>';
		html += '</object>';
		html += '<div><a href="javascript:$.youtube.stopVideoInline(\'' + divID + '\');" class="inlineClose">close</a></div>';
		html += '</div>';
		
		
		$(selAimg).animate({
			"width"  : this.config.ytPlayerWidth,
			"height" : this.config.ytPlayerHeight
		},1500)
		.queue(function() {
			$(selA).hide();
			$(divID).append(html);
			$(this).dequeue();
		})
		;
		//$(divID).css({"background":"#000", "z-index":"-1"}).empty().append(html);
	},

	/** 
	 *unblock the UI
	 */
	stopVideo : function() {
		if (this.config.blockUI) {
			$.unblockUI();
		}
	},
	
	stopVideoInline: function(divID) {
		var selA = divID + ' a';
		var selAimg = divID + ' a img';
		var p = divID + ' .youtubecontent';
		$(p).remove();
		$(selAimg)
		.queue(function() {
			$(selA).show();
			$(selAimg).show();
			
			$(this).dequeue();
		})
		.animate({
			"width"  : this.config.thumbWidth,
			"height" : this.config.thumbHeight
		},1500)
		
		;
	}

};
//blockUI
(function($) {
	$.blockUI = function(msg, css, opts) {
		$.blockUI.impl.install(window, msg, css, opts);
	};
	$.blockUI.version = 1.31;
	$.unblockUI = function(opts) {
		$.blockUI.impl.remove(window, opts);
	};
	$.fn.block = function(msg, css, opts) {
		return this.each(function() {
			if (!this.$pos_checked) {
				if ($.css(this, "position") == 'static')
					this.style.position = 'relative';
				if ($.browser.msie)
					this.style.zoom = 1;
				this.$pos_checked = 1;
			}
			$.blockUI.impl.install(this, msg, css, opts);
		});
	};
	$.fn.unblock = function(opts) {
		return this.each(function() {
			$.blockUI.impl.remove(this, opts);
		});
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
			w = (w * ww) / 100;
		}
		if (h[h.length - 1] == '%') {
			var hh = document.documentElement.clientHeight
					|| document.body.clientHeight;
			h = parseInt(h) || 100;
			h = (h * hh) / 100;
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
		}, opts);
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
			margin : '0',
			top : '150px',
			left : '20%',
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
				msg = null;
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
					var fixL = l ? '(0 - ' + l + ')' : 0;
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
											s.setExpression('top', fixT);
									} else {
										if (full)
											s
													.setExpression(
															'top',
															'(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
										s.marginTop = 0;
									}
								});
			}
			if (opts.displayMode) {
				w.css('cursor', 'default').attr('title',
						$.blockUI.defaults.closeMessage);
				m.css('cursor', 'default');
				$( [ f[0], w[0], m[0] ]).removeClass('blockUI').addClass(
						'displayBox');
				$().click($.blockUI.impl.boxHandler).bind('keypress',
						$.blockUI.impl.boxHandler);
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
				setTimeout(this.focus, 20);
			} else
				this.center(m[0]);
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
						this.parentNode.removeChild(this);
				});
			} else
				els.remove();
		},
		boxRemove : function(el) {
			$().unbind('click', $.blockUI.impl.boxHandler).unbind('keypress',
					$.blockUI.impl.boxHandler);
			if (this.boxCallback)
				this.boxCallback(this.box);
			$('body .displayBox').hide().remove();
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
							$.blockUI.impl.focus(back);
						}, 10);
						return false;
					}
				}
			}
			if ($(e.target).parents('div.blockMsg').length > 0)
				return true;
			return $(e.target).parents().children().filter('div.blockUI').length == 0;
		},
		boxHandler : function(e) {
			if ((e.keyCode && e.keyCode == 27)
					|| (e.type == 'click' && $(e.target)
							.parents('div.blockMsg').length == 0))
				$.blockUI.impl.boxRemove();
			return true;
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
						$e[b ? 'bind' : 'unbind'](o, $.blockUI.impl.handler);
					});
		},
		focus : function(back) {
			if (!$.blockUI.impl.pageBlockEls)
				return;
			var e = $.blockUI.impl.pageBlockEls[back === true ? $.blockUI.impl.pageBlockEls.length - 1
					: 0];
			if (e)
				e.focus();
		},
		center : function(el) {
			var p = el.parentNode, s = el.style;
			var l = ((p.offsetWidth - el.offsetWidth) / 2)
					- this.sz(p, 'borderLeftWidth');
			var t = ((p.offsetHeight - el.offsetHeight) / 2)
					- this.sz(p, 'borderTopWidth');
			s.left = l > 0 ? (l + 'px') : '0';
			s.top = t > 0 ? (t + 'px') : '0';
		},
		sz : function(el, p) {
			return parseInt($.css(el, p)) || 0;
		}
	};
})(jQuery);