(function($) {
	$.fn.smwSearch = function(options) {
		var defaults = {
			type : 0,
			descLength : 15,
			more: "[mehr ...]",
			cropText: " ...",
			linkTarget: ' target="_blank"'
		}
		if (!options.targeturl)
			return false;
		
		
		$.fn.extend({
			doSiteSearch: function(searchUrl) {
				$.ajax({ 
					method: "get",
					url: searchUrl,
					success: function(html){  
						$(".siteheader").html('Site results:');
						$("#sitesearch").html(html);
						$("a.tx-indexedsearch-pointerLink").click(function(e){
							doSiteSearch($(this).attr("href") + '&type=33');
							e.preventDefault();
						});
		 
					}
				});
			}
		});
		var opts = $.extend(defaults, options);
		return this.each(function(){
			
		});

	};

	

})(jQuery);

/*


$(document).ready(function() {
	$("#googleads").hide();
	
	$("#search").blur(function () {
		if($(this).val() == ""){
			$(this).val("Suchen...");
			$("#resultbox").css("display", "none"); 
		}
	});
	
	$("#search").focus(function () {
		if ($(this).val() == "Suchen...") {
			$(this).val("");
		}
	});
	
	$("#search").keyup(function () {
		$("#resultbox").css("display", ""); 
		$("#footer").css("display", "none");
		$(".siteheader").html('<img src="fileadmin/scripts/images/loading.gif" width="16" height="16" style="margin-right:8px; vertical-align:-15%;" />Loading Results from Site...');
		$(".googleheader").html('<img src="fileadmin/scripts/images/loading.gif" width="16" height="16" style="margin-right:8px; vertical-align:-15%;" />Loading Results from Google...');
		
		// === Site Search === 
		doSiteSearch("index.php?id=60&type=33&tx_indexedsearch[sword]=" + $(this).val());
		
		// === Google Search === 
		var sc = new GSearchControl();
	    
		sc.addSearcher(new GwebSearch());
		sc.addSearcher(new GvideoSearch());
		sc.addSearcher(new GblogSearch());
		sc.addSearcher(new GnewsSearch());

		var drawOptions = new GdrawOptions();
		drawOptions.setDrawMode(GSearchControl.DRAW_MODE_TABBED);
		
		var foo;
		sc.setSearchCompleteCallback(foo, function(){
			$(".googleheader").html('Results from Google:');
		});
		sc.setNoResultsString(GSearchControl.NO_RESULTS_DEFAULT_STRING);

	    	sc.draw(document.getElementById("googlesearch"), drawOptions);
		sc.execute(document.getElementById("search").value);
		// === End Search === 
		
		if($(this).val() == ""){
			$("#resultbox").slideUp(700, function(){
				$("#footer").css("display", "");
			});
		}
	});
	
});
*/