(function($) {
	
	$.fn.youtube = function(data) {
		var config = {
			id: 114,
			type : null, // allowed values: 'playlist', 'search','user',
							// 'channel'
			keyword : null, // A search query term. Searches for the specified
							// string in all video metadata, such as titles,
							// tags, and descriptions.
			url : null,
			users : null, // videos uploaded by a user
			alt : null, // The format of feed to return, such as atom (the
						// default), rss, or json.
			orderby : null, // The order in which to list entries, such as
							// relevance (the default for the videos feed) or
							// viewCount.
			start_index : null, // The 1-based index of the first result to be
								// retrieved (for paging).
			max_results : 10, // The maximum number of entries to return at
								// one time
			categories : null, // The categories and/or tags to use in
								// filtering the feed results.
			// For example, feedURL/-/fritz/laurie returns all entries
			// that are tagged with both of the user-defined tags fritz and
			// laurie.
			
			standardFilter: 'top_rated',
			standardRegion: null,
			standardTime: 'all_time',
			
			format : null, // A specific video format. For example, format=1
							// restricts search results to videos for mobile
							// devices.
			most_viewed : null,
			top_rated : null,
			recently_featured : null,
			top_favorites : null,
			most_discussed : null,
			most_linked : null,
			most_responded : null,
	
			playlist_id : null, // playlists feed contains a list of public
								// playlists defined by a user.
			div : this,
			itemTemplate: '<div class="yt-item"><h3>%%%TITLE%%%</h3><span class="yt-thumb">%%%LINK%%%</span><%%%DESRIPTION%%%/div>',
			durationPrefix: 'Time: ',
			
			crop: 25,
			cropText: ' ...',
			
			cleanReturn : 1, // do you want a full youtube return, or just an
								// image list
			linkType : 0, // 0 = blockUI, 1 = inline, 2 = extern
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
		};
		$.youtube.config = config;
		
		function getURL(config) {
			var url = '';
			this.config = config;
			config.type = config.type;
	
			if ((config.type == 'search') || (config.type == 'tag') || (config.type == 'title') || (config.type == 'description')) {
				config.type = 'search';
			}
	
			if (config.url)
				return config.url;
			if (!config.callback)
				config.callback = 'a';
	
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
				// url += 'api/users/' + config.user +
				// '/favorites?v=2&alt=json-in-script&callback=' +
				// config.callback;
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
		}
		
		
			/**
			 * @param url
			 * @return video id
			 */
		function getVideoId(url) {
			var arrayURL = url.split("=");
			if (arrayURL) {
				return arrayURL[1];
			}
		}
			
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
		
		function timetext(seconds) {
			var minutes = Math.floor(seconds/60);
			var sec = seconds % 60;
			if (sec < 10) sec = '0' + sec;
			return minutes + ':' + sec;
		}
		
		
		
		/*
		 * request the url in the head and get the jsondata @param url string
		 * @return null,
		 */
		return this.each(function(){
			/*
			 * var script = document.createElement('script'); script.type =
			 * 'text/javascript'; script.src = url;
			 * 
			 * document.documentElement.firstChild.appendChild(script); //add
			 * into <head>
			 */
			url = getURL(config);
			url = url.replace(/\&/g,':');
			url = config.eID + '&yt=' + url;
			
			$.getJSON(url, function(jsonData) {
				var thumb,title,link,description,content,duration,link_start,link_end;
				var linkType = config.linkType;
				var t =  config.itemTemplate;
				var thumbWidth = config.thumbWidth ? ' width="' + config.thumbWidth + '"' : '';
				var crop = config.crop;
				var cropText = config.cropText;
				var isChannel = (config.type == 'channel');
				var target = config.linkTarget;
				var dp = config.durationPrefix;
				
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
							duration = dp + timetext(item.media$group.yt$duration.seconds);
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
							description = trimtext(description, crop) + cropText;
						}
						
						thumbImg = thumb ? '<img src="' + thumb + '"  id="youtubethumb" alt="' + title + '"' + thumbWidth + '>' : '';
						if (linkType == 0) {
							var videoId = getVideoId(url);
							link_start = '<a href="javascript:$.youtube.playVideo(\'' + videoId + '\');">';
							link = '<a href="javascript:$.youtube.playVideo(\''
									+ videoId + '\');">' + thumbImg + '</a>';
						} else if (linkType == 1) {
							var videoId = getVideoId(url);
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
	
					$(config.div).html(html);
					// '<a
					// href="javascript:videoOverlay(\''+getVideoId(url)+'\');"><img
					// src="'+thumb+'" id="youtubethumb"
					// alt="'+entry.title.$t+'" onmouseout="clearTimeout(timer)"
					// onmouseover="mousOverImage(this,\''+getVideoId(url)+'\',2)"></a>';
					// var thumb =
					// entry['media$group']['media$thumbnail'][1].url;
				}
			});
	
		});
	};
})(jQuery);

$.youtube = {
		config : {},
		
		
		/**
		 * genereate the url 
		 * according to the configuration
		 *
		 *
		/**
		 * Play the video in bolockUI
		 * 
		 * @param id
		 *            videoid
		 */
		playVideo: function(id) {
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
		
		playVideoInline: function(id) {
			console.log(this.config);
			var divID = "#ID" + id.split('&')[0];
			var selA = divID + ' a';
			var selAimg = divID + ' a img';
			
			var width = this.config.ytPlayerWidth;
			var height = this.config.ytPlayerHeight;
			this.config.thumbHeight = $(selAimg).css('height');
			
			
			var html = '';
			html += '<div class="youtubecontent">';
			html += '<object >';
			html += '<param name="movie" value="http://www.youtube.com/v/' + id + '"></param>';
			html += '<param name="autoplay" value="1">';
			html += '<param name="allowfullscreen" value="true">';
			html += '<param name="wmode" value="transparent"></param>';
			html += '<embed width="'+width+'" height="'+height+'" src="http://www.youtube.com/v/' + id + '&autoplay=1" allowfullscreen="true" type="application/x-shockwave-flash" wmode="transparent" ></embed>';
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
			// $(divID).css({"background":"#000",
			// "z-index":"-1"}).empty().append(html);
		},
	
		/**
		 * unblock the UI
		 */
		stopVideo: function() {
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