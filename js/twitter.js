(function($) {
	
	$.fn.tweet = function(o){
		var s = {
			username: [],
			avatar_size: null,
			count: 3,
			intro_text: null,
			outro_text: null,
			join_text:	null,
			auto_join_text_default: "",
			auto_join_text_ed: "",
			auto_join_text_ing: "",
			auto_join_text_reply: "",
			auto_join_text_url: "",
			loading_text: null,
			query: null,
			link_target: ' target="_blank"',
			list_wrap: ['<ul class="tweet-list">','</ul>'],
			item_tag: 'li',
			item_class_first: 'tweet-first',
			item_class_odd: 'tweet-odd',
			item_class_even: 'tweet-even',
			intro_wrap: ['<p class="tweet-intro">','</p>'],
			outro_wrap: ['<p class="tweet-outro">','</p>'],
			join_wrap: ['<p class="tweet-join">','</p>'],
			from_wrap: ['<span class="tweet-from">','</span>'],
			date_wrap: ['<span class="tweet-date">','</span>'],
			text_wrap: ['<p class="tweet-text">','</p>'],
			sourcePrefix: ' from ',
			publicTimeline: 0
		};

		$.fn.extend({
			linkUrl: function() {
				var returning = [];
				var regexp = /((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi;
				this.each(function() {
					returning.push(this.replace(regexp,"<a href=\"$1\">$1</a>"))
				});
				return $(returning);
			},
			linkUser: function() {
				var returning = [];
				var regexp = /[\@]+([A-Za-z0-9-_]+)/gi;
				this.each(function() {
					returning.push(this.replace(regexp,"<a href=\"http://twitter.com/$1\">@$1</a>"))
				});
				return $(returning);
			},
			linkHash: function() {
				var returning = [];
				var regexp = /[\#]+([A-Za-z0-9-_]+)/gi;
				this.each(function() {
					returning.push(this.replace(regexp, ' <a href="http://search.twitter.com/search?q=&tag=$1&lang=all&from='+s.username.join("%2BOR%2B")+'">#$1</a>'))
				});
				return $(returning);
			},
			capAwesome: function() {
				var returning = [];
				this.each(function() {
					returning.push(this.replace(/(a|A)wesome/gi, 'AWESOME'))
				});
				return $(returning);
			},
			capEpic: function() {
				var returning = [];
				this.each(function() {
					returning.push(this.replace(/(e|E)pic/gi, 'EPIC'))
				});
				return $(returning);
			},
			makeHeart: function() {
				var returning = [];
				this.each(function() {
					returning.push(this.replace(/[&lt;]+[3]/gi, "<tt class='heart'>&#x2665;</tt>"))
				});
				return $(returning);
			},
			decHTML: function() {
				var returning = [];
				this.each(function() {
					returning.push(this.replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/href/g,s.link_target+' href'))
				});
				return $(returning);
			}
		});

		function relative_time(time_value) {
			var parsed_date = Date.parse(time_value);
			var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
			var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
			if(delta < 60) {
			return 'less than a minute ago';
			} else if(delta < 120) {
			return 'about a minute ago';
			} else if(delta < (45*60)) {
			return (parseInt(delta / 60)).toString() + ' minutes ago';
			} else if(delta < (90*60)) {
			return 'about an hour ago';
			} else if(delta < (24*60*60)) {
			return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
			} else if(delta < (48*60*60)) {
			return '1 day ago';
			} else {
			return (parseInt(delta / 86400)).toString() + ' days ago';
			}
		}

		if(o) $.extend(s, o);
		return this.each(function(){
			var list = $(s.list_wrap[0]).appendTo(this);
			var intro = s.intro_wrap[0]+s.intro_text+s.intro_wrap[1];
			var outro = s.outro_wrap[0]+s.outro_text+s.outro_wrap[1];
			var loading = $('<p class="loading">'+s.loading_text+'</p>');
			if(typeof(s.username) == "string"){
				s.username = [s.username];
			}
			var query = '';
			if(s.query) {
				query += 'q='+s.query;
			}
			if(s.username.count) {
				query += '&q=from:'+s.username.join('%20OR%20from:');
			}
			if (s.publicTimeline) {
				var url = 'http://twitter.com/statuses/public_timeline.json?&rpp='+s.count+'&callback=?';
			} else {
				var url = 'http://search.twitter.com/search.json?&'+query+'&rpp='+s.count+'&callback=?';
			}
			//http://twitter.com/users/show.json?screen_name="
			
			if (s.loading_text) $(this).append(loading);
			$.getJSON(url, function(data){console.log(data.results);
				if (s.loading_text) loading.remove();
				if (s.intro_text) list.before(intro);
				$.each(data.results, function(i,item){
					// auto join text based on verb tense and content
					if (s.join_text == "auto") {
						if (item.text.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
							var join_text = s.auto_join_text_reply;
						} else if (item.text.match(/(^\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+) .*/i)) {
							var join_text = s.auto_join_text_url;
						} else if (item.text.match(/^((\w+ed)|just) .*/im)) {
							var join_text = s.auto_join_text_ed;
						} else if (item.text.match(/^(\w*ing) .*/i)) {
							var join_text = s.auto_join_text_ing;
						} else {
							var join_text = s.auto_join_text_default;
						}
					} else {
						var join_text = s.join_text;
					};

					var join_template = '<span class="tweet-join"> '+join_text+' </span>';
					var join = ((s.join_text) ? join_template : ' ')
					var avatar_template = '<a class="tweet-avatar" href="http://twitter.com/'+ item.from_user+'"'+s.link_target+'><img src="'+item.profile_image_url+'" height="'+s.avatar_size+'" width="'+s.avatar_size+'" alt="'+item.from_user+'\'s avatar" border="0"/></a>';
					var avatar = (s.avatar_size ? avatar_template : '')
					var date = s.date_wrap[0]+'<a href="http://twitter.com/'+item.from_user+'/statuses/'+item.id+'" title="view tweet on twitter"'+s.link_target+'>'+relative_time(item.created_at)+'</a>'+s.sourcePrefix+$([item.source]).decHTML()[0]+s.date_wrap[1];
					var from = s.from_wrap[0]+item.from_user+s.from_wrap[1];
					var text = s.text_wrap[0]+from+$([item.text]).linkUrl().linkUser().linkHash()[0]+date+s.text_wrap[1];
					
					// until we create a template option, arrange the items below to alter a tweet's display.
					list.append('<'+s.item_tag+'>' + avatar + text + '</'+s.item_tag+'>');

					list.children(s.item_tag+':first').addClass(s.item_class_first);
					list.children(s.item_tag+':odd').addClass(s.item_class_odd);
					list.children(s.item_tag+':even').addClass(s.item_class_even);
				});
				if (s.outro_text) list.after(outro);
			});

		});
	};
})(jQuery);