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