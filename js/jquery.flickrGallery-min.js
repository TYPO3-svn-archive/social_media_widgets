/***********************************************************************
 * jQuery.flickrGallery v. 0.1
 * 
 * Copyright (c) 2007 Paul Tavares (http://www.purtuga.com)
 * 
 * Dual licensed under the MIT (MIT-LICENSE.txt)and
 * GPL (GPL-LICENSE.txt) licenses.
 * 
 **********************************************************************/
jQuery.fn.flickrGallery=function(uOpt){var opt={api_key:null,user_id:null,photoset_ids:[],loading_msg:'Loading ...',thumb_click_hide:false};if(uOpt)$.extend(opt,uOpt);return this.each(function(){var self=jQuery.flickrGallery;var uId=self.getNextUid();var hId=this.id||'flickrGallery-'+uId;if($('#'+hId+' .flickrGalleryCntr').length)return;self.opt[uId]=jQuery.flickrGallery.gallery(opt);self.opt[uId].htmlId=hId;self.opt[uId].uId=uId;self.opt[uId].galId=uId;$(this).append('<div class="flickrGalleryCntr">'+'<div class="flickrGalleryAllAlbums"></div>'+'<div style="clear: both;"></div>'+'<div class="flickrGalleryImages" style="display: none;">'+'<div class="flickrGalleryImageMenu" style="position: absolute; z-index: 10;">'+'<div class="flickrGalleryImageMenuButtons">'+'<table width="100%"><tr>'+'<td width="" align="left" nowrap>'+'<a href="" class="flickrGalleryImageMenuButtonsGallery">Back</a>'+'<a href="" class="flickrGalleryImageMenuButtonsThumbs">Images</a>'+'</td>'+'<td width="" align="center" nowrap>'+'<div class="flickrGalleryImageMenuImgCount"></div>'+'</td>'+'<td width="" align="center" nowrap>'+'<a href="" class="flickrGalleryImageMenuButtonsPrev">Prev</a> '+' <a href="" class="flickrGalleryImageMenuButtonsNext">Next</a>'+'</td>'+'</tr></table>'+'</div>'+'<div class="flickrGalleryImageThumbs" style="display: none;">Other images</div>'+'</div>'+'<div class="flickrGalleryImageView"><div class="flickrGalleryLoading">Loading. . .</div></div>'+'</div>'+'</div>');$('.flickrGalleryImageMenu',this).unbind().hover(function(){$(this).addClass('flickrGalleryImageMenuHover')},function(){$(this).removeClass('flickrGalleryImageMenuHover');jQuery.flickrGallery.opt[uId].hideThumbs()});self.init(uId);return this})};jQuery.flickrGallery={};jQuery.flickrGallery.next_uid=1;jQuery.flickrGallery.opt={};jQuery.flickrGallery.gallery=function(o){o.albums={};o.uId=null;o.galId=null;o.htmlId=null;o.galleryLoaded=false;o.imgThumbsOn=false;o.next_uid=0;o.clearImgArea=jQuery.flickrGallery.clearImgArea;o.isAlbumPicInfoLoaded=jQuery.flickrGallery.isAlbumPicInfoLoaded;o.showGallery=jQuery.flickrGallery.showGallery;o.showAlbum=jQuery.flickrGallery.showAlbum;o.buildAlbum=jQuery.flickrGallery.buildAlbum;o.showThumbs=jQuery.flickrGallery.showThumbs;o.hideThumbs=jQuery.flickrGallery.hideThumbs;o.getNextUid=jQuery.flickrGallery.getNextUid;o.insertLoadingMsg=function(){jQuery.flickrGallery.insertLoadingMsg(this.uId,'g')};o.clearLoadingMsg=function(){jQuery.flickrGallery.clearLoadingMsg(this.uId,'g')};return o};jQuery.flickrGallery.showGallery=function(){var gal=this;$('#'+gal.htmlId+' .flickrGalleryImages').fadeOut('fast');$('#'+gal.htmlId+' .flickrGalleryAllAlbums').fadeIn('normal');return void(0)};jQuery.flickrGallery.getNextUid=function(pre){if(!pre){pre='g'};var retVal=pre+this.next_uid;this.next_uid+=1;return retVal};jQuery.flickrGallery.init=function(uId){if(!uId)return;var self=jQuery.flickrGallery;var opt=self.opt[uId];if(opt.galleryLoaded)return;var url='http://api.flickr.com/services/rest/?format=json&jsoncallback='+'jQuery.flickrGallery.opt.'+uId+'.buildAlbum&api_key='+opt.api_key+'&method=flickr.photosets.getInfo';if(opt.photoset_ids.length){for(var i=0;i<opt.photoset_ids.length;i++){var tUrl=url+'&photoset_id='+opt.photoset_ids[i];var script=document.createElement('script');script.type='text/javascript';script.id=uId+opt.htmlId+opt.photoset_ids[i]+'_albumInfo';script.src=tUrl;$('head').append(script)}}opt.galleryLoaded=true;return};jQuery.flickrGallery.buildAlbum=function(json){var gal=this;if(json.stat!="ok"){$('#'+gal.htmlId+' .flickrGalleryAllAlbums').append(jQuery.flickrGallery.getFlickrApiError(json));return}else{var albumId=gal.getNextUid('a');gal.albums[albumId]=json.photoset;var p=gal.albums[albumId];if(!p.photos){$('#'+gal.htmlId+' .flickrGalleryAllAlbums').append('<div class="flickrGalleryAlbum">'+'<h3>'+p.title._content+'</h3>'+'<div>No pictures in this album.</div>'+'<span>'+p.description._content+'</span></div>');}else{p.getImgUrl=function(s){if(!s){s='s'};return jQuery.flickrGallery.getImgUrl(this.farm,this.server,this.primary,this.secret,s)};p.buildImgList=jQuery.flickrGallery.buildImgList;p.showImg=jQuery.flickrGallery.showImg;p.displayPics=jQuery.flickrGallery.displayPics;p.uId=albumId;p.galId=gal.uId;p.htmlId=gal.htmlId;p.imgListLoaded=false;$('#'+gal.htmlId+' .flickrGalleryAllAlbums').append('<div class="flickrGalleryAlbum">'+'<h3>'+p.title._content+'</h3><a href="javascript: '+'jQuery.flickrGallery.opt.'+gal.uId+'.showAlbum(\''+albumId+'\');'+'"><img align="top" src="'+p.getImgUrl('s')+'" alt="" /></a>'+'<span>'+p.description._content+'</span></div>')}};$('#'+gal.uId+gal.htmlId+p.id+'_albumInfo').remove();return true};jQuery.flickrGallery.getFlickrApiError=function(json){var err='<div class="flickrGalleryAlbum"><p>Unable to retrieve album.</p>'+'<p>ERROR: '+json.code+': '+json.message+' </p><br></div>';return err};jQuery.flickrGallery.insertLoadingMsg=function(g,w){var gal=jQuery.flickrGallery.opt[g];var h='<div class="flickrGalleryLoading">Loading...</div>';w=w.toLowerCase();if(w=='i'){}else if(w=='t'){}else if(w=='g'){$('#'+gal.htmlId+' .flickrGalleryAllAlbums').prepend(h)};return};jQuery.flickrGallery.clearLoadingMsg=function(g,w){var gal=jQuery.flickrGallery.opt[g];w=w.toLowerCase();if(w=='i'){}else if(w=='t'){}else if(w=='g'){$('#'+gal.htmlId+' .flickrGalleryAllAlbums .flickrGalleryLoading').remove()};return};jQuery.flickrGallery.getImgUrl=function(f,m,i,h,s){if(s){s='_'+s}else{s=''};var url='http://farm'+f+'.static.flickr.com/'+m+'/'+i+'_'+h+s+'.jpg';return url};jQuery.flickrGallery.showAlbum=function(id){var gal=this;$('#'+gal.htmlId+' .flickrGalleryAllAlbums').hide(0);gal.clearImgArea();$('#'+gal.htmlId+' .flickrGalleryImages').fadeIn();if(gal.albums[id]&&gal.albums[id].imgListLoaded){gal.albums[id].displayPics();return};var sURL='http://api.flickr.com/services/rest/?format=json&jsoncallback='+'jQuery.flickrGallery.opt.'+gal.uId+'.albums.'+id+'.buildImgList'+'&api_key='+gal.api_key+'&method=flickr.photosets.getPhotos'+'&photoset_id='+gal.albums[id].id+'&thisUID='+new Date().valueOf();var imgViewCntr=$('#'+gal.htmlId+' .flickrGalleryImageView');var scriptId=gal.uId+gal.htmlId+id+'_photosetImgInfo';var script=document.createElement('SCRIPT');script.type='text/javascript';script.id=scriptId;script.src=sURL;$('head').append(script);return void(0)};jQuery.flickrGallery.clearImgArea=function(){var gal=this;var h=$('#'+gal.htmlId);$('.flickrGalleryImageView',h).empty().append('<div class="flickrGalleryLoading">'+gal.loading_msg+'</div>');$('.flickrGalleryImageThumbs',h).hide(0).empty();$('.flickrGalleryImageMenuButtonsPrev',h).attr('href','javascript: void();');$('.flickrGalleryImageMenuButtonsNext',h).attr('href','javascript: void();');$('.flickrGalleryImageMenuButtonsThumbs',h).attr('href','javascript: void();')};jQuery.flickrGallery.displayPics=function(){var alb=this;var img=alb.images;$('#'+alb.htmlId+' .flickrGalleryImageMenuButtonsPrev').attr('href','javascript: jQuery.flickrGallery.opt.'+alb.galId+'.albums.'+alb.uId+'.images.nextImg("p");');$('#'+alb.htmlId+' .flickrGalleryImageMenuButtonsNext').attr('href','javascript: jQuery.flickrGallery.opt.'+alb.galId+'.albums.'+alb.uId+'.images.nextImg("n");');$('#'+alb.htmlId+' .flickrGalleryImageMenuButtonsGallery').attr('href','javascript: jQuery.flickrGallery.opt.'+img.galId+'.showGallery();');$('#'+alb.htmlId+' .flickrGalleryImageMenuButtonsThumbs').attr('href','javascript: jQuery.flickrGallery.opt.'+alb.galId+'.showThumbs();');img.nextImg();img.buildThumbs();return};jQuery.flickrGallery.buildThumbs=function(){var img=this;var t=$('#'+img.htmlId+' .flickrGalleryImageThumbs');var clickHide='';var thumbs='<ul>';t.empty();if(jQuery.flickrGallery.opt[img.galId].thumb_click_hide){clickHide='jQuery.flickrGallery.opt.'+img.galId+'.hideThumbs();'}for(var i=0;i<img.photo.length;i++){thumbs+='<li>'+'<a href="javascript: jQuery.flickrGallery.opt.'+img.galId+'.albums.'+img.albumId+'.images.nextImg('+i+');'+clickHide+'">'+'<img alt="'+img.photo[i].title+'" src="'+img.getImgUrl('s',i)+'">'+'</a></li>'};thumbs+='</ul><div style="clear: both;"></div>';t.append(thumbs);return};jQuery.flickrGallery.isAlbumPicInfoLoaded=function(f,retRef){var gal=this;if(!f||!gal.albums)return false;for(var y in gal.albums){if(gal.albums[y].id==f){if(retRef){return gal.albums[y]}else{return true}}};return false};jQuery.flickrGallery.buildImgList=function(json){var alb=this;if(json.stat!="ok"){$('#'+alb.htmlId+' .flickrGalleryAllAlbums').append(jQuery.flickrGallery.getFlickrApiError(json))}else{alb.images=json.photoset;var img=alb.images;img.getImgUrl=function(s,i){if(!s){s=''};var albImg=this;return jQuery.flickrGallery.getImgUrl(albImg.photo[i].farm,albImg.photo[i].server,albImg.photo[i].id,albImg.photo[i].secret,s)};img.nextImg=jQuery.flickrGallery.showImg;img.buildThumbs=jQuery.flickrGallery.buildThumbs;img.albumId=alb.uId;img.galId=alb.galId;img.htmlId=alb.htmlId;img.imgCurrent=0;alb.imgListLoaded=true;alb.displayPics()}$('#'+alb.galId+alb.htmlId+alb.uId+'_photosetImgInfo').remove();return true};jQuery.flickrGallery.showImg=function(n){var albImg=this;var gal=jQuery.flickrGallery.opt[albImg.galId];var t=albImg.photo.length;var hideThumbs=false;if(!n&&n!=0){n=0}else if(n=='p'){n=albImg.imgCurrent-1;if(n<0)n=0;hideThumbs=true}else if(n=='n'){n=albImg.imgCurrent+1;if(n>t-1)n=t-1;hideThumbs=true};var newImg=new Image();var imgUrl=albImg.getImgUrl('',n);var imgCntr=$('#'+albImg.htmlId+' .flickrGalleryImageView');if(hideThumbs){jQuery.flickrGallery.opt[albImg.galId].hideThumbs()};$('img',imgCntr).fadeOut('slow');imgCntr.empty().append('<div class="flickrGalleryLoading">'+gal.loading_msg+'</div>');$(newImg).hide(0).load(function(){$('#'+albImg.htmlId+' .flickrGalleryImageView .flickrGalleryLoading').fadeOut('slow').remove();$(this).fadeIn('normal');return true});newImg.alt="";newImg.src=imgUrl;imgCntr.append(newImg);albImg.imgCurrent=n;$('#'+albImg.htmlId+' .flickrGalleryImageMenuImgCount').empty().append((n+1)+' of '+t);return void(0)};jQuery.flickrGallery.showThumbs=function(){var gal=this;if(gal.imgThumbsOn){gal.hideThumbs();return};$('#'+gal.htmlId+' .flickrGalleryImageThumbs').slideDown('slow');gal.imgThumbsOn=true};jQuery.flickrGallery.hideThumbs=function(){var gal=this;if(!gal.imgThumbsOn)return;$('#'+gal.htmlId+' .flickrGalleryImageThumbs').slideUp('slow');gal.imgThumbsOn=false};