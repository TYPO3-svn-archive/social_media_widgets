/***********************************************************************
 * v. 0.1
 * 
 * FILE: jquery.flickrGallery.js
 * 		
 * 		flickrGallery is a jQuery plugin for embedding flickr photos
 * 		into a webpage. Plugin considers a Gallery to be a list of
 * 		Albums (similar to Flickr's Collections). Albums are 
 * 		considered to be photosets.
 * 
 * 
 * AUTHOR:
 * 
 * 		*Paul T.*
 * 
 * 		- <http://www.purtuga.com>
 * 		- <http://ptflickrgallery.sourceforge.net/>
 * 
 * 
 * DEPENDECIES:
 * 		
 * 		To be completed.
 * 
 * 		-	jQuery.js
 * 			<http://docs.jquery.com/Downloading_jQuery>
 * 
 * LICENSE:
 * 
 * 		Copyright (c) 2007 Paul T. (purtuga.com)
 *		Dual licensed under the:
 *
 * 		-	MIT
 * 			<http://www.opensource.org/licenses/mit-license.php>
 * 
 * 		-	GPL
 * 			<http://www.opensource.org/licenses/gpl-license.php>
 * 
 * INSTALLATION:
 * 
 * 		In the head element of your html document, include this
 * 		plugin file following your jQuery library.
 * 
 * 
 * USAGE:
 * 
 * 		Call the flickrGallery() method on the elements that
 * 		you want to create the gallery on.
 * 
 * 
 * 
 * LAST UPDATED:
 * 
 * 		- $Date: 2007/07/03 20:23:38 $
 * 		- $Author: paulinho4u $
 * 		- $Revision: 1.1 $
 * 
 * 
 **********************************************************************/


// tested with set of: http://www.flickr.com/photos/joeletrembleur/sets/

/**
 * TITLE: EXTERNAL METHOD(s)
 * 		The following methods have been design for direct usage and
 * 		access.
 * 
 */

/**
 * METHOD: $(ele).flickrGallery(uOpt)
 * 		Public method used to initiate the gallery on the page.
 * 
 * PARAMS:
 * 
 * 		uOpt	-	{OBJECT} Options for the call. See below
 * 					for a list of options along with their
 * 					descriptions.
 * 
 * 	The following options can be defined:
 * 
 * 	api_key			-	REQUIRED. The api key generated by flickr.
 * 						Please obtain your own api key. Go to the
 * 						following url for more information on
 * 						obtaining a key
 * 						<http://www.flickr.com/services/api/keys/>
 * 
 *  photoset_ids	-	REQUIRED. An array of flickr photosets.
 * 
 * 	loading_msg		-	Optional. Code or text to be included inside
 * 						the loading div.flickrGalleryLoading container.
 * 						Default is	'Loading ...'. This value can be
 * 						set to an img html markup if wanting to
 * 						include an image (ex. <img src="load.gif">
 * 		
 * 	thumb_click_hide	-	Optional. Boolean. True or False indicating
 * 							whether the thumb menu/list should be hiden
 * 							as soon as a user clicks the thumbnail.
 * 							Default is False (don't hide).
 * 
 * RETURN:
 * 
 * 	none
 * 
 */
jQuery.fn.flickrGallery = function (uOpt) {
	//default options
	var opt = {
			api_key: null,
			user_id: null,
			photoset_ids: [],
			loading_msg: 'Loading ...',
			thumb_click_hide: false
		};
	
	//if options were passed in by caller, then extend defaults
	if (uOpt) $.extend(opt, uOpt);
	
	// Loop through all areas that need to have a flickr gallery
	// and initiate them.
	return this.each(
		function(){
			var self = jQuery.flickrGallery;
			var uId = self.getNextUid();
			var hId = this.id || 'flickrGallery-'+uId;
			
			if ($('#'+hId+' .flickrGalleryCntr').length) return;
			
			// Define the gallery object variables
			self.opt[uId]			= jQuery.flickrGallery.gallery(opt);
			self.opt[uId].htmlId	= hId;
			self.opt[uId].uId		= uId;
			self.opt[uId].galId		= uId;
			
			// Append the Gallery container. All html editing/inserting
			// is done inside this container.
	        $(this).append(
					'<div class="flickrGalleryCntr">'
				+	'<div class="flickrGalleryAllAlbums"></div>'
				+	'<div style="clear: both;"></div>'
				+	'<div class="flickrGalleryImages" style="display: none;">'
				+	'<div class="flickrGalleryImageMenu" style="position: absolute; z-index: 10;">'
				+	'<div class="flickrGalleryImageMenuButtons">'
				+	'<table width="100%"><tr>'
				+	'<td width="" align="left" nowrap>'
				+	'<a href="" class="flickrGalleryImageMenuButtonsGallery">Back</a>'
				+	'<a href="" class="flickrGalleryImageMenuButtonsThumbs">Images</a>'
				+	'</td>'
				+	'<td width="" align="center" nowrap>'
				+	'<div class="flickrGalleryImageMenuImgCount"></div>'
				+	'</td>'
				+	'<td width="" align="center" nowrap>'
				+	'<a href="" class="flickrGalleryImageMenuButtonsPrev">Prev</a> '
				+	' <a href="" class="flickrGalleryImageMenuButtonsNext">Next</a>'
				+	'</td>'
				+	'</tr></table>'
				+	'</div>'
				+	'<div class="flickrGalleryImageThumbs" style="display: none;">Other images</div>'
				+	'</div>'
				+	'<div class="flickrGalleryImageView"><div class="flickrGalleryLoading">Loading. . .</div></div>'
				+	'</div>'
				+	'</div>'
			);
			
			// Insert loading message.
//			self.opt[uId].insertLoadingMsg();
			
			// Set the hoverOver/Out actions on the menu container
			$('.flickrGalleryImageMenu', this).unbind().hover(
					function () {
						$(this).addClass('flickrGalleryImageMenuHover'); },
					function () {
						$(this).removeClass('flickrGalleryImageMenuHover');
						jQuery.flickrGallery.opt[uId].hideThumbs(); }
			);
			
			// Initialize all albums in this gallery
			self.init(uId);
//			self.opt[uId].clearLoadingMsg();
			return this;
    	});
	
};/* end flickrGallery() */

/**
 * TITLE: INTERNAL METHODS
 * 		The methods that follow are all used internally by
 * 		this plugin. The source all contains documentation.
 * 		Change at your own risk.
 * 
 */

/**
 * PROPERTY: jQuery.flickrGallery
 * 		Object that contains all code associated with
 * 		flickrGallery plugin.
 * 
 */
jQuery.flickrGallery = {};

/**
 * PROPERTY: jQuery.flickrGallery.next_uid
 * 		Variable that a count of the gallery items created on the
 * 		page. This value is used to store the options in the
 * 		<jQuery.flickrGallery.opt> variable.
 * 
 */
jQuery.flickrGallery.next_uid = 1;

/**
 * PROPERTY: jQuery.flickrGallery.opt
 * 		Variable that keeps track of the options for all flickr
 * 		gallery areas on the page. Format of the variable is
 * 		<uniqueId>: {options OBJECT}
 * 
 */
jQuery.flickrGallery.opt = {};

/**
 * METHOD: gallery(o)
 * 	Constructor for a gallery object.
 * 
 * PARAMS:
 * 
 * 	o	- Options to be set for this album
 * 
 * 
 */
jQuery.flickrGallery.gallery = function (o) {
	o.albums				= {};
	o.uId					= null;
	o.galId					= null;
	o.htmlId 				= null;
	o.galleryLoaded 		= false;
	o.imgThumbsOn 			= false;
	o.next_uid 				= 0;
	o.clearImgArea 			= jQuery.flickrGallery.clearImgArea;
	o.isAlbumPicInfoLoaded	= jQuery.flickrGallery.isAlbumPicInfoLoaded;
	o.showGallery			= jQuery.flickrGallery.showGallery;
	o.showAlbum				= jQuery.flickrGallery.showAlbum;
	o.buildAlbum			= jQuery.flickrGallery.buildAlbum;
	o.showThumbs			= jQuery.flickrGallery.showThumbs;
	o.hideThumbs			= jQuery.flickrGallery.hideThumbs;
	o.getNextUid			= jQuery.flickrGallery.getNextUid;
	
	//Define custom function for inserting loading the message.
	o.insertLoadingMsg		= function () {
			jQuery.flickrGallery.insertLoadingMsg(this.uId, 'g');
	};
	// Define customFunction for removing loading message
	o.clearLoadingMsg		= function () {
			jQuery.flickrGallery.clearLoadingMsg(this.uId, 'g');
	};
	return o;
};/* end gallery() */


/**
 * METHOD: showGallery()
 * 	Shows the list of albums if they are hidden. Extends the gallery
 * 	object ( jQuery.flickrGallery.opt[idHere] ). Method is designed
 * 	to be placed inside the a.href atribute for calling.
 * 
 * PARAMS:
 * 
 * 
 */
jQuery.flickrGallery.showGallery = function () {
	var gal = this;
	$('#'+gal.htmlId+' .flickrGalleryImages').fadeOut('fast');
	$('#'+gal.htmlId+' .flickrGalleryAllAlbums').fadeIn('normal');
	return void(0);
}; /* showGallery() */

/**
 * METHOD: getNextUid()
 * 		Returns the next Unique Id that should be used when
 * 		storing the information pertaining to a call.
 * 
 * PARAMS:
 * 
 * 	pre	-	Prefix for return value... Default is g
 * 
 */
jQuery.flickrGallery.getNextUid = function (pre) {
	if (!pre) {pre='g'};
	var retVal = pre + this.next_uid;
	this.next_uid += 1;
	return retVal;
};/* end getNextUid() */


/**
 * METHOD: init()
 * 	Initializes all the albums (if photosets were defined) for
 * 	the gallery. This method is meant to be called when creating
 * 	a new gallery area.
 * 
 * PARAMS:
 * 
 * 	uId	-	The id of the gallery. Value is used to find it in the
 * 			jQuery.flickrGallery.opt[] object.
 * 
 */
jQuery.flickrGallery.init = function (uId) {
	if (!uId) return;
	var self = jQuery.flickrGallery;
	var opt = self.opt[uId];
	
	// if gallery was already loaded, then exit now.
	if (opt.galleryLoaded) return;
	
	// Build the url
	var url =	'http://api.flickr.com/services/rest/?format=json&jsoncallback='
			+	'jQuery.flickrGallery.opt.'+uId+'.buildAlbum&api_key='+opt.api_key
			+	'&method=flickr.photosets.getInfo';
	
	//If photoset_ids were defined, then loop through them.
	if (opt.photoset_ids.length) {
		for (var i=0; i<opt.photoset_ids.length; i++) {
			var tUrl = url + '&photoset_id=' + opt.photoset_ids[i];
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.id = uId + opt.htmlId + opt.photoset_ids[i] + '_albumInfo';
			script.src = tUrl;
			$('head').append(script);
		}//end for
	}//end if
	
	// Set this gallery's loaded variable to true, indicating that
	// all album information has been retrieved from flickr
	opt.galleryLoaded = true;
	return;
};/* end init() */

/**
 * METHOD: buildAlbum(json)
 * 	Called when the json from flickr is returned. Adds album to page.
 * 	Extend the Gallery object ( jQuery.flickrGallery.opt[GalIdHere] )
 * 
 * PARAMS:
 * 
 * 	json	-	Object returned by flickr api. See below for examples
 * 				on the structure of this object.
 * 
 * 	The following are examples of the object structure returned by
 * 	the flicker api.
 * 
 * 		*Photosets*
 * 
 * 	|		{	"photoset": {
 * 	|					"id":		"PhotoSetId",
 * 	|					"owner":	"flickrOwnerId",
 * 	|					"primary":	"525510301",
 * 	|					"secret":	"b51148beba",
 * 	|					"server":	"254",
 * 	|					"farm":		1,
 * 	|					"photos":	"# of photos",
 * 	|					"title": {
 * 	|							"_content": "Title here"
 * 	|					},
 * 	|					"description": {
 * 	|							"_content": "Description here"
 * 	|					}
 * 	|			},
 * 	|			"stat": "ok" 
 * 	|		}
 * 
 * 
 * 
 */
jQuery.flickrGallery.buildAlbum = function (json) {
	var gal = this;
	if (json.stat != "ok") {
		$('#'+gal.htmlId+' .flickrGalleryAllAlbums')
				.append(jQuery.flickrGallery.getFlickrApiError(json));
		return;
		
	} else {
		var albumId = gal.getNextUid('a');
		
		// Store this album in this gallery's array of albums
		// Create local variable to reference this photoset
		gal.albums[albumId] = json.photoset;
		var p = gal.albums[albumId];
		
		// if this album has no pictures, then build message
		if (!p.photos) {
			$('#'+gal.htmlId+' .flickrGalleryAllAlbums').append(
					'<div class="flickrGalleryAlbum">'
				+	'<h3>'+p.title._content+'</h3>'
				+	'<div>No pictures in this album.</div>'
				+	'<span>'+p.description._content +'</span></div>'
			);
		
		// Else, this album has photos... Display it.
		} else {
		
			p.getImgUrl = function (s) {
				if (!s) {s = 's';};
				return jQuery.flickrGallery.getImgUrl(
						this.farm, this.server, this.primary, this.secret, s);
			};
			
			// Create the getImgList() method reference
			p.buildImgList = jQuery.flickrGallery.buildImgList;
			
			// create the nextImg() method reference
			p.showImg = jQuery.flickrGallery.showImg;
	
			// create the displayPics() method reference
			p.displayPics = jQuery.flickrGallery.displayPics;
			
			// Store the copies of the albumId, Gallery ID and HTML
			// block id in the albums object.
			p.uId = albumId;
			p.galId = gal.uId;
			p.htmlId = gal.htmlId;
			p.imgListLoaded = false;
			
			// Insert the album into the page, under this gallery html element.
			$('#'+gal.htmlId+' .flickrGalleryAllAlbums').append(
					'<div class="flickrGalleryAlbum">'
				+	'<h3>'+p.title._content
				+	'</h3><a href="javascript: '
				+	'jQuery.flickrGallery.opt.'+gal.uId+'.showAlbum(\''+albumId+'\');'
				+	'"><img align="top" src="'+p.getImgUrl('s')+'" alt="" /></a>'
				+	'<span>'+p.description._content +'</span></div>'
			);
		};
	};
	//Clean up the head element
	$('#'+gal.uId + gal.htmlId + p.id + '_albumInfo').remove();
	return true;
};/* end buildAlbum(json) */

/**
 * METHOD: getFlickrApiError(json)
 * 	Returns html table with the error encountered with the
 * 	api call to flickr.
 * 
 * PARAMS:
 * 
 * 	json	-	Json object returned from flickr
 * 
 * 
 */
jQuery.flickrGallery.getFlickrApiError = function (json) {
	var err = '<div class="flickrGalleryAlbum"><p>Unable to retrieve album.</p>'
			+	'<p>ERROR: '+json.code+': '+json.message+' </p><br></div>';
	return err;
};/* end getFlickrApiError */


/**
 * METHOD: insertLoadingMsg(g,w)
 * 	Inserts a loading message into different areas of the gallery
 * 	container. The loading message is placed into the page inside of
 * 	a div.flickrGalleryLoading element.
 * 
 * PARAMS:
 * 
 * 	g	-	string. Gallery id as stored in js object (.opt[])
 * 	w	-	string. Static value of where the loding image should be
 * 			placed. Valid values are
 * 			i=Image container, 
 * 			t=thumb	container,
 * 			g=gallery container
 * 
 */
jQuery.flickrGallery.insertLoadingMsg = function (g, w) {
	var gal = jQuery.flickrGallery.opt[g];
	var h = '<div class="flickrGalleryLoading">Loading...</div>';
	w = w.toLowerCase();
	
	// insert in image container if w=i
	if (w == 'i') {
		
		
	// insert in thumbs container if w=t
	} else if (w == 't') {
		
		
	// insert in gallery container if w=g
	} else if (w == 'g') {
		$('#'+gal.htmlId+' .flickrGalleryAllAlbums').prepend(h);
	};
	return;
};/* insertLoadingMsg() */


/**
 * METHOD: clearLoadingMsg(g,w)
 * 	Removes a loading message from the area indicated by the
 * 	input param. Searches for a div.flickrGalleryLoading element
 * 	and deletes it (.remove)
 * 
 * PARAMS:
 * 
 * 	w	-	string. Static value indicating what region should have
 * 			its loading message removed. see <insertLoadingMsg()>
 * 			for a list of valid values.
 * 
 */
jQuery.flickrGallery.clearLoadingMsg = function (g, w) {
	var gal = jQuery.flickrGallery.opt[g];
	w = w.toLowerCase();
	
	// insert in image container if w=i
	if (w == 'i') {
		
		
	// insert in thumbs container if w=t
	} else if (w == 't') {
		
		
	// insert in gallery container if w=g
	} else if (w == 'g') {
		$('#'+gal.htmlId+' .flickrGalleryAllAlbums .flickrGalleryLoading').remove();
	};
	return;
	
	
};/* clearLoadingMsg() */

/**
 * METHOD: getImgUrl(f,m,i,h,s)
 * 	Generic method that returns the url to a flickr image.
 * 
 * PARAMS:
 * 	f	- STRING Server farm as return by the flickr api.
 * 	m	- STRING Server id as return by the flickr api.
 * 	i	- STRING Image id as return by the flickr api.
 * 	h	- STRING Secret as return by the flickr api.
 * 	s	- STRING Size of the image. Valid values are listed below.
 * 
 * 	*Valid Image Sizes*
 * 
 * 		s		-	small square 75x75
 * 		t		-	thumbnail, 100 on longest side
 * 		m		-	small, 240 on longest side
 * 		(blank)	-	medium, 500 on longest side
 * 		b		-	large, 1024 on longest side (only exists for 
 * 					very large original images)
 * 		o		-	original image, either a jpg, gif or png,
 * 					depending on source format
 * 
 * 	The remaineder of the url values are obtained from the albums
 * 	key (which is a ference to the returned json from flickr.
 * 
 */
jQuery.flickrGallery.getImgUrl = function (f,m,i,h,s) {
	if (s) {s = '_'+s;} else {s='';};
	var url = 'http://farm'+f+'.static.flickr.com/'
				+ m +'/' + i + '_' + h + s + '.jpg';
	return url;
};/* end imgUrl() */


/**
 * METHOD: showAlbum(id)
 * 		Displays an album on the page. This method is meant o extend
 * 		a gallery object (jQuery.flickrGallery.opt[idHere]).
 * 
 * PARAMS:
 * 
 * 		id	-	Album id as it is stored in the local object.
 * 
 */
jQuery.flickrGallery.showAlbum = function (id) {
	var gal = this;
	$('#'+gal.htmlId+ ' .flickrGalleryAllAlbums').hide(0);
	gal.clearImgArea();
	$('#'+gal.htmlId+ ' .flickrGalleryImages').fadeIn();
	// Is this album image information already loaded? if so, then
	// call the nextImg() methos of it and exit here.
	if (gal.albums[id] && gal.albums[id].imgListLoaded ) {
		gal.albums[id].displayPics();
		return;
	};
	// Retrieve the list of images in this photoset from
	// flickr and call buildImgList when it returns.
	var sURL =	'http://api.flickr.com/services/rest/?format=json&jsoncallback='
			+	'jQuery.flickrGallery.opt.'+gal.uId+'.albums.'+id+'.buildImgList'
			+	'&api_key='+gal.api_key+'&method=flickr.photosets.getPhotos'
			+	'&photoset_id='+gal.albums[id].id+'&thisUID='+ new Date().valueOf();
	
	var imgViewCntr = $('#'+gal.htmlId+' .flickrGalleryImageView');
	var scriptId = gal.uId + gal.htmlId + id + '_photosetImgInfo';
	var script = document.createElement('SCRIPT');
	script.type = 'text/javascript';
	script.id = scriptId;
	script.src = sURL;
	$('head').append(script);
	return void(0);
};/* end showAlbum() */

/**
 * METHOD: clearImgArea()
 * 	Clears the area where the images are displayed
 * 	(class = .flickrGalleryImages) by removing all information
 * 	about the previously viewed album. This involves clearing the
 * 	navigation links, images, thumbnails, etc.
 * 	This method extends the gallery object 
 * 	(jQuery.flickrGallery.opt[idHere]).
 * 
 * PARAMS:
 * 
 * 	none
 * 
 */
jQuery.flickrGallery.clearImgArea = function () {
	var gal = this;
	var h = $('#'+gal.htmlId);
	
	// Clear the existing image
	$('.flickrGalleryImageView', h).empty().append(
		'<div class="flickrGalleryLoading">'+gal.loading_msg+'</div>');
	
	// Clear the thumbs and insure they are hidden
	$('.flickrGalleryImageThumbs', h).hide(0).empty();
	
	// Reset the next, prev and thumbs buttons
	$('.flickrGalleryImageMenuButtonsPrev', h)
			.attr('href', 'javascript: void();');
	$('.flickrGalleryImageMenuButtonsNext', h)
			.attr('href', 'javascript: void();');
	$('.flickrGalleryImageMenuButtonsThumbs', h)
			.attr('href', 'javascript: void();');
};/* clearImgArea */

/**
 * METHOD: displayPics()
 * 	Displays the images on the page, after their information has
 * 	been loaded from flickr. This method extends the album object
 * 	(jQuery.flickrGallery.opt[idHere].ablums[AlbumId]).
 * 
 * PARAMS:
 * 
 * 	none.
 * 
 */
jQuery.flickrGallery.displayPics = function () {
	var alb = this;
	var img = alb.images;
	
	// Update the previous link
	$('#'+alb.htmlId+' .flickrGalleryImageMenuButtonsPrev').attr(
			'href',
			'javascript: jQuery.flickrGallery.opt.'
			+	alb.galId+'.albums.' + alb.uId + '.images.nextImg("p");' );

	// Update the Next/Album links onClick events
	$('#'+alb.htmlId+' .flickrGalleryImageMenuButtonsNext').attr(
			'href',
			'javascript: jQuery.flickrGallery.opt.'
			+	alb.galId + '.albums.' + alb.uId + '.images.nextImg("n");' );
	
	// Update the Gallery link
	$('#'+alb.htmlId+' .flickrGalleryImageMenuButtonsGallery').attr(
			'href',
			'javascript: jQuery.flickrGallery.opt.'+img.galId+'.showGallery();' );
	
	// update the album link
	$('#'+alb.htmlId+' .flickrGalleryImageMenuButtonsThumbs').attr(
			'href',
			'javascript: jQuery.flickrGallery.opt.'
			+	alb.galId + '.showThumbs();' );
	
	// Display the first image in the page.
	img.nextImg();
		
	// Load the navigation menu
	img.buildThumbs();
	return;
	
};/* end displayPics() */

/**
 * METHOD: buildThumbs()
 * 	Builds the thumbs into the the area that holds them. This method
 * 	extends the albums image object
 * 	(jQuery.flickrGallery.opt[idHere].ablums[AlbumId].images)
 * 	
 * PARAMS:
 * 
 * 	none.
 * 
 */
jQuery.flickrGallery.buildThumbs = function () {
	var img = this;
	var t = $('#'+img.htmlId+' .flickrGalleryImageThumbs');
	var clickHide = '';
	var thumbs = '<ul>';
	t.empty();
	
	// if the thumbnail auto hide is true, then create the
	// function that hides the image once the user clicks on it.
	if (jQuery.flickrGallery.opt[img.galId].thumb_click_hide) {
		clickHide = 'jQuery.flickrGallery.opt.'+img.galId+'.hideThumbs();'
	}
	
	// Loop through all images
	for (var i=0; i<img.photo.length; i++) {
		thumbs	+=	'<li>'
				+	'<a href="javascript: jQuery.flickrGallery.opt.'
				+	img.galId + '.albums.' + img.albumId
				+	'.images.nextImg(' + i + ');'+clickHide+'">'
				+	'<img alt="'+img.photo[i].title+'" src="'
				+	img.getImgUrl('s', i) + '">'
				+	'</a></li>';
	};
	thumbs += '</ul><div style="clear: both;"></div>';
	t.append(thumbs);
	
	return;
};/* buildThumbs */


/**
 * METHOD: isAlbumPicInfoLoaded(f)
 * 	Given a flickr photoset id, this method returns true or false
 * 	indicating whether its photo information has already been
 * 	loaded.
 * 	Method is meant to extend the Gallery object
 * 	(jQuery.flickrGallery.opt[idHere]).
 *  
 * PARAMS:
 * 
 * 	f		-	The flicker album/photoset id
 * 	retRef	-	Boolean. True or false indicating whether a reference
 * 				to the album object should be returned.
 * 
 * RETURNS:
 * 
 * 	boolean	-	True/False indicating if album picture information
 * 				has alredy been loaded (true) or false, indicating
 * 				not yet.
 * 
 */
jQuery.flickrGallery.isAlbumPicInfoLoaded = function (f, retRef) {
	var gal = this;
	if (!f || !gal.albums) return false;
	for (var y in gal.albums) {
		if (gal.albums[y].id == f) {
			if (retRef) {
				return gal.albums[y];
			} else {
				return true;
			};
		}
	};
	return false;
};/* isAlbumPicInfoLoaded() */


/**
 * METHOD: buildImgList(json)
 * 		Processes a flickr.photosets.getPhotos json object returned
 * 		by the flickr api. This method is meant o extend an album in
 * 		a given gallery object
 * 		(jQuery.flickrGallery.opt[idHere].ablums[AlbumId]).
 * 
 * PARAMS:
 * 
 * 	json	-	json object returned by flickr
 * 
 */
jQuery.flickrGallery.buildImgList = function (json) {
	var alb = this;
	
	if (json.stat != "ok") {
		$('#'+alb.htmlId+' .flickrGalleryAllAlbums').append(
			jQuery.flickrGallery.getFlickrApiError(json));
	
	} else {
		
		alb.images = json.photoset;
		
		var img = alb.images;
		
		// s = size, i=image array index number
		img.getImgUrl = function (s, i) {
				if (!s) {s = '';};
				var albImg = this;
				return jQuery.flickrGallery.getImgUrl(
						albImg.photo[i].farm, albImg.photo[i].server,
						albImg.photo[i].id, albImg.photo[i].secret, s );
		};/* end images.getImgUrl() */
		
		// Reference the next image method
		img.nextImg = jQuery.flickrGallery.showImg;
		
		// Reference the buildThumbs method
		img.buildThumbs = jQuery.flickrGallery.buildThumbs;
		
		// Store local copies of the local GalleryID, AlbumID
		// and htmlID on this object as well.
		img.albumId = alb.uId;
		img.galId = alb.galId;
		img.htmlId = alb.htmlId;
		img.imgCurrent = 0;
		alb.imgListLoaded = true;
		
		// Display the pictures for this album on the page.
		alb.displayPics();
		
	}//end if
	
	// Delete the script object from the header.
	$('#'+alb.galId + alb.htmlId + alb.uId + '_photosetImgInfo').remove();
	return true;
};/* end buildImgList() */


/**
 * METHOD: showImg(n)
 * Given an image number (int) or the letter p (previous) or n (next)
 * this method display the full size image on the page.
 * Method extends the object that holds the list of images for an
 * album ( jQuery.flickrGallery.opt[idHere].ablums[AlbumId].images )
 * 
 * 
 * PARAMS:
 * 
 * 	n	-	What image to show next. Value can be an interger defining
 * 			exactly what image number to show or the letter 'p' for 
 * 			the previous image to the currently shown one or 'n' for
 * 			the image that comes after the one currently shown.
 * 	
 */
jQuery.flickrGallery.showImg = function (n) {
	var albImg = this;
	var gal = jQuery.flickrGallery.opt[albImg.galId];
	var t = albImg.photo.length;
	var hideThumbs = false;
	
	// Determine what picture to show based on the value of n
	if (!n && n != 0) {
		n = 0;
	} else if (n == 'p') {
		n = albImg.imgCurrent - 1;
		if (n < 0) n = 0;
		hideThumbs = true;
	} else if (n == 'n') {
		n = albImg.imgCurrent + 1;
		if (n > t - 1) n = t - 1;
		hideThumbs = true;
	};
	
	var newImg = new Image();
	var imgUrl = albImg.getImgUrl('', n);
	var imgCntr = $('#'+albImg.htmlId+ ' .flickrGalleryImageView');
	
	// Hide the thumbs if applicable
	if (hideThumbs) {
		jQuery.flickrGallery.opt[albImg.galId].hideThumbs();
	};
	
	// Fade out the existing image and empty the image container
	$('img', imgCntr).fadeOut('slow');
	imgCntr.empty().append(
		'<div class="flickrGalleryLoading">'+gal.loading_msg+'</div>');
	
	// Prepare the new image to be inserted into the page
	// Add the onload even to 1) hide the loading message
	// and 2) show the image
	$(newImg).hide(0).load(
			function () {
				$('#'+albImg.htmlId+' .flickrGalleryImageView .flickrGalleryLoading')
					.fadeOut('slow').remove();
				$(this).fadeIn('normal');
				return true; }
	);
	newImg.alt = "";
	newImg.src = imgUrl;
	imgCntr.append(newImg);
	//$('img', imgCntr).wrap('<span></span>');
	
	// Update the tracking variable in the images object and
	// update the dom with the current picture being shown.
	albImg.imgCurrent = n;
	$('#'+albImg.htmlId+' .flickrGalleryImageMenuImgCount')
			.empty().append((n + 1)+' of '+t);
	
	return void(0);
};/* end showImg() */

/**
 * METHOD: showThumbs()
 * 	Shows the thumbsnails to the user. This method extends the 
 * 	gallery object. (jQuery.flickrGallery.opt[idHere]
 * 
 * PARAMS: 
 * 
 * 	none.
 * 
 */
jQuery.flickrGallery.showThumbs = function () {
	var gal = this;
	// If user click on this button and the tumbs are already
	// visible, then hide them
	if (gal.imgThumbsOn) {
		gal.hideThumbs();
		return;
	};
	$('#'+gal.htmlId+' .flickrGalleryImageThumbs').slideDown('slow');
	gal.imgThumbsOn = true;
};/* showThumbs() */

/**
 * METHOD: hideThumbs()
 * 	Hides the thumbsnails to the user. This method extends the 
 * 	gallery object. (jQuery.flickrGallery.opt[idHere])
 * 
 * PARAMS: 
 * 
 * 	none.
 * 
 */
jQuery.flickrGallery.hideThumbs = function () {
	var gal = this;
	if (!gal.imgThumbsOn) return;
	$('#'+gal.htmlId+' .flickrGalleryImageThumbs').slideUp('slow');
	gal.imgThumbsOn = false;
};/* hideThumbs() */
