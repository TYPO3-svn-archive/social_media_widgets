/*
 * jQuery Litebox - jQuery plug-in
 * Beta 2r2, Released 2007.03.14
 *
 * Copyright (c) 2007 Daniel MacDonald (www.projectatomic.com)
 * Dual licensed GPL http://www.gnu.org/licenses/gpl.html 
 * and MIT http://www.opensource.org/licenses/mit-license.php
 */
(function($){
$.fn.litebox = function(o){
    if (window.XMLHttpRequest && typeof document.doctype =='object'&& !window.opera){ //ie6+, mozilla1.0+, safari1.2+, konquerer, icab3.0+
        var s = {oc:'white',oy:0.7,oz:1000,sc:'black',sw:0.8,sh:0.9,ns:2,nc:'white',nz:'0.6em',nf:'sans-serif',lu:'loading.gif',lh:128,lw:128,ld:2000,a:false,loop:false,count:true,ad:5000,auto:'AUTO',stop:'STOP',restart:'RESTART',image:'IMAGE',of:'OF',close:'CLOSE',prev:'PREV',next:'NEXT',aa:'SPACEBAR',ac:'ESC',ap:'LEFT ARROW',an:'RIGHT ARROW', click:'CLICK TO SEE FULL IMAGE IN NEW WINDOW'};
        if(o){
            $.extend(s, o);
        }
        return this.each(function(){
            var g = $(this).find('a').click(function(){ 
                var i = $(g).index($(this)[0]);
                $.litebox.init(i, g, s);
                return false; 
            });
        });
    }
};
$.litebox = {
    i: 0,
    g: [],
    s: {},
    lt: 0,
    at: 0,
    init: function(i, g, s){
        this.i = i;
        this.g = g;
        this.s = s;
        $('body').append('<iframe id="ss_o" src="" scrolling="no" frameborder="0"></iframe><div id="ss_s"><img id="ss_l" /><img id="ss_i" /><a id="ss_a" href=""></a><a id="ss_x" href=""></a><div id="ss_c"><span></span><span></span><span></span><span></span></div><a id="ss_p" href=""></a><a id="ss_n" href=""></a></div>'); 
        $('#ss_o').css({position: 'fixed', zIndex: s.oz, opacity: 0, background: s.oc});
        $('#ss_s').css({position: 'fixed', zIndex: s.oz+1, opacity: 0, background: s.sc});
        $('#ss_l').attr('src', s.lu).css({position: 'absolute', zIndex: s.oz+2, height: s.lh, width: s.lw, display: 'none'});
        $('#ss_i').attr('alt', s.click).css({position: 'absolute', zIndex: s.oz+3, opacity: 0, border: 'none'}).bind('click', function(){
            var w = window.open($($.litebox.g[$.litebox.i]).attr('href'),'liteboxwin');
            return false;
        });
        $('#ss_c, #ss_s/a').css({position: 'absolute', display: 'block', color: s.nc, font: s.nz+'/1 '+s.nf, textDecoration: 'none', outline: 'none !impotant'});
        $('#ss_c').css({width: '50%', bottom: s.ns, left: '25%', textAlign: 'center'});
        if(s.count){
            $('#ss_c/span:eq(0)').html(s.image+'&nbsp;');
            $('#ss_c/span:eq(2)').html('&nbsp;'+s.of+'&nbsp;');
        }
        $('#ss_a').attr('title', s.aa).css({top: s.ns, left: s.ns*2}).bind('click', function(){
            $.litebox.toggle();
            return false;
        });
        if(s.a){
            $('#ss_a').html(s.stop);
        }else{
            $('#ss_a').html(s.auto);
        }
        $('#ss_x').attr('title', s.ac).html(s.close).css({top: s.ns, right: s.ns*2}).bind('click', function(){
            $.litebox.remove();
            return false;
        });
        $('#ss_p').attr('title', s.ap).html(s.prev).css({bottom: s.ns, left: s.ns*2}).bind('click', function(){
            $.litebox.moveprev();
            return false;
        });
        $('#ss_n').attr('title', s.an).html(s.next).css({bottom: s.ns, right: s.ns*2}).bind('click', function(){
            $.litebox.movenext();
            return false;
        });
        $(document).bind('keydown', function(e){
            var key = e.which || e.keyCode || e.charCode;
            switch (key){
                case 27: // [esc]
                    $.litebox.remove();
                    break;
                case 37: // [left arrow]
                    $.litebox.moveprev();
                    break;
                case 39: // [right arrow]
                    $.litebox.movenext();
                    break;
                case 32: // [spacebar]
                    $.litebox.auto();
                    break;
            }
            return false;
        });
        $.litebox.position();
        $('#ss_o').fadeTo('normal', s.oy, function(){
            $('#ss_s').fadeTo('normal', 1);
            $.litebox.load(i, g);
        });
    },
    load: function(i, g){
        var s = this.s;
        $('#ss_i').fadeTo('normal', 0, function(){
            $.litebox.lt = setTimeout($.litebox.loading, s.ld);
            $('#ss_i').bind('load', function(){
                clearTimeout($.litebox.lt);
                $('#ss_l').css('display', 'none');
                $.litebox.resize($(g[i]).attr('href'));
                if(s.count){
                    $('#ss_c/span:eq(1)').html(i+1);
                    $('#ss_c/span:eq(3)').html(g.length);
                }
                if (i > 0){
                    $('#ss_p').css('display', 'block');
                    $.litebox.preload($(g[i-1]).attr('href'));
                }else{ 
                    $('#ss_p').css('display', 'none');
                }
                if (i+1 < g.length){ 
                    $('#ss_n').css('display', 'block');
                    $.litebox.preload($(g[i+1]).attr('href'));
                }else{
                    $('#ss_n').css('display', 'none');
                }
                if (s.a == true){
                    $.litebox.auto();
                }
            });
            $('#ss_i').attr('src', $(g[i]).attr('href'))
        });
    },
    loading: function(){
        $('#ss_l').css('display', 'block');
    },
    position: function(e){
        var s = (e) ? e.data.s : this.s;
        var xh = parseInt($('#ss_x').height(), 10), ww = self.innerWidth || document.documentElement.clientWidth, wh = self.innerHeight || document.documentElement.clientHeight;
        $('#ss_o').css({height: wh, width: ww, top: 0, left: 0});
        $('#ss_s').css({height: wh*s.sh, width: ww*s.sw, top: wh/2-wh*s.sh/2, left: ww/2-ww*s.sw/2});
        $('#ss_l').css({top: wh*s.sh/2-s.lh/2, left: ww*s.sw/2-s.lw/2});
        if (typeof document.body.style.maxHeight == 'undefined'){ //ie6 only
            var sx = document.documentElement.scrollLeft, sy = document.documentElement.scrollTop;
            $('#ss_o').css({position: 'absolute', top: sy, left: sx});
            $('#ss_s').css({position: 'absolute', top: wh/2-wh*s.sh/2+sy, left: ww/2-ww*s.sw/2+sx});
            $(window).bind('scroll', {s: s}, $.litebox.position);
        }
        $.litebox.resize($('#ss_i').attr('src'));
        $(window).bind('resize', {s: s}, $.litebox.position);
    },
    preload: function(src){
        var img = document.createElement('img');
        img.src = src;
    },
    resize: function(src){
        if (typeof src != 'undefined'){
            var s = this.s;
            var img = new Image();
            img.src = src;
            var xh = parseInt($('#ss_x').height(), 10);
            var sw = parseInt($('#ss_s').width(), 10)-2*(xh+3*s.ns);
            var sh = parseInt($('#ss_s').height(), 10)-2*(xh+3*s.ns);
            var iw = img.width;
            var ih = img.height;
            if (iw > sw) { 
                ih = ih * (sw / iw); 
                iw = sw; 
                if (ih > sh) { 
                    iw = iw * (sh / ih); 
                    ih = sh; 
                }
            } else if (ih > sh) {
                iw = iw * (sh / ih); 
                ih = sh; 
                if (iw > sw) { 
                    ih = ih * (sw / iw); 
                    iw = sw;
                }
            }
            $('#ss_i').css({height: ih, width: iw, top: sh/2-ih/2+xh+2*s.ns, left: sw/2-iw/2+xh+3*s.ns}).fadeTo('normal', 1);
        }
    },
    toggle: function(){
        var s = $.litebox.s;
        if (s.a){
            clearTimeout($.litebox.at);
            $.litebox.s.a = false;
            $('#ss_a').html(s.auto);
        } else {
            $.litebox.s.a = true;
            $('#ss_a').html(s.stop);
            $.litebox.auto();
        }
    },
    auto: function(){
        var s = $.litebox.s;
        clearTimeout($.litebox.at);
        if (this.i+1 < this.g.length){
            $.litebox.at = setTimeout($.litebox.movenext, s.ad);
        }else if (s.loop){
            $.litebox.i = -1;
            $.litebox.at = setTimeout($.litebox.autoload, s.ad);
        }else{
            $('#ss_a').html(s.restart).one('click', function(){
                $('#ss_a').html(s.stop);
                $.litebox.s.a = true;
                $.litebox.i = 0;
                $.litebox.at = setTimeout($.litebox.autoload, s.ad);
            });
        }
    },
    autoload: function(){
        $.litebox.load($.litebox.i, $.litebox.g);
    },
    moveprev: function(){
        clearTimeout($.litebox.at);
        $.litebox.s.a = false;
        $('#ss_a').html($.litebox.s.auto);
        if ($.litebox.i > 0){
            $.litebox.i -= 1;
            $.litebox.load($.litebox.i, $.litebox.g);
        }
    }, 
    movenext: function(){
        if ($.litebox.i+1 < $.litebox.g.length){
            $.litebox.i += 1;
            $.litebox.load($.litebox.i, $.litebox.g);
        }
    },
    remove: function(){
        $(window).unbind('resize').unbind('scroll');
        $(document).unbind('keypress');
        $('#ss_l').remove();
        $('#ss_s').fadeTo('normal', 0, function(){
            $('#ss_s').remove();
            $('#ss_o').fadeTo('normal', 0, function(){
                $('#ss_o').remove();
            });
        });
    }
};
})(jQuery);