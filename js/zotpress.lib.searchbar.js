jQuery(document).ready(function()
{

    /****************************************************************************************
     *
     *     ZOTPRESS LIB SEARCHBAR
     *
     ****************************************************************************************/

	// TODO: notes, abstract, target
	// TODO: Always updates rather than checking the cache ... don't see an easy way around this ...

	if ( jQuery(".zp-Zotpress-SearchBox").length > 0 )
	{
		var zpItemsFlag = true;
		var zpItemNum = 1;
		var zpLastTerm = "";
		var zpSearchBarParams = "";
		var zpSearchBarSource = zpShortcodeAJAX.ajaxurl + "?action=zpRetrieveViaShortcode&zpShortcode_nonce="+zpShortcodeAJAX.zpShortcode_nonce;
		var zpShowTags = false; if ( jQuery(".ZP_SHOWTAGS").length > 0 && parseInt( jQuery(".ZP_SHOWTAGS").text() ) == "1" ) zpShowTags = true;
		var zpShowImages = false; if ( jQuery(".ZOTPRESS_AC_IMAGES").length > 0 ) zpShowImages = true;



		function zp_set_lib_searchbar_params( filter, start, last )
		{
			// Set parameter defaults
			if ( typeof(filter) === "undefined" || filter == "false" || filter == "" )
				filter = false;
			if ( typeof(start) === "undefined" || start == "false" || start == "" )
				start = false;
			if ( typeof(last) === "undefined" || last == "false" || last == "" )
				last = false;

			zpSearchBarParams = "";

			// Get param basics
			zpSearchBarParams += "&api_user_id="+jQuery(".ZOTPRESS_USER").val();
			zpSearchBarParams += "&item_type=items";
			zpSearchBarParams += "&downloadable="+jQuery(".ZOTPRESS_AC_DOWNLOAD").val();
			zpSearchBarParams += "&style="+jQuery(".ZP_STYLE").text();
			zpSearchBarParams += "&sortby="+jQuery(".ZP_SORTBY").text();
			zpSearchBarParams += "&order="+jQuery(".ZP_ORDER").text();
			zpSearchBarParams += "&citeable="+jQuery(".ZOTPRESS_AC_CITE").val();

			// Deal with possible max results
			if ( jQuery(".ZOTPRESS_AC_MAXRESULTS").val().length > 0 )
				zpSearchBarParams += "&maxresults=" + jQuery(".ZOTPRESS_AC_MAXRESULTS").val();

			// Deal with possible showtags
			if ( zpShowTags ) zpSearchBarParams += "&showtags=true";

			// Deal with possible showimage
			if ( zpShowImages ) zpSearchBarParams += "&showimage=true";

			// Deal with next and last
			if ( start ) zpSearchBarParams += "&request_start="+start;
			if ( last ) zpSearchBarParams += "&request_last="+last;

			// Deal with update:
			// Always checks for new rather than cached ... is there an uncomplicated way around this?
			zpSearchBarParams += "&update=true";

			// Deal with possible filters
			if ( filter )
				zpSearchBarParams += "&filter="+filter;
			else if ( jQuery("input[name=zpSearchFilters]").length > 0 )
				zpSearchBarParams += "&filter="+jQuery("input[name=zpSearchFilters]:checked").val();
		}
		zp_set_lib_searchbar_params( false, false, false );


		// Deal with change in filters
		jQuery("input[name='zpSearchFilters']").click(function()
		{
			// Update filter param
			if ( jQuery("input[name=zpSearchFilters]").length > 0 )
				zp_set_lib_searchbar_params ( jQuery(this).val(), false, false );

			// Update autocomplete URL
			jQuery("input.zp-Zotpress-SearchBox-Input").autocomplete( "option", "source", zpSearchBarSource+zpSearchBarParams );

			// If there's already text, search again
			if ( jQuery("input.zp-Zotpress-SearchBox-Input").val().length > 0
					&& jQuery("input.zp-Zotpress-SearchBox-Input").val() != zpShortcodeAJAX.txt_typetosearch )
				jQuery("input.zp-Zotpress-SearchBox-Input").autocomplete("search");
		});


		// Set up autocomplete
		jQuery("input.zp-Zotpress-SearchBox-Input")
			.bind( "keydown", function( event )
			{
				// Don't navigate away from the input on tab when selecting an item
				if ( event.keyCode === jQuery.ui.keyCode.TAB &&
						jQuery( this ).data( "autocomplete" ).menu.active ) {
					event.preventDefault();
				}
				// Don't submit the form when pressing enter
				if ( event.keyCode === 13 ) {
					event.preventDefault();
				}
			})
			.bind( "focus", function( event )
			{
				// Remove help text on focus
				if (jQuery(this).val() == zpShortcodeAJAX.txt_typetosearch) {
					jQuery(this).val("");
					jQuery(this).removeClass("help");
				}
			})
			.bind( "blur", function( event )
			{
				// Add help text on blur, if nothing there
				if (jQuery.trim(jQuery(this).val()) == "") {
					jQuery(this).val(zpShortcodeAJAX.txt_typetosearch);
					jQuery(this).addClass("help");
				}
			})
			.autocomplete({
				source: zpSearchBarSource+zpSearchBarParams,
				minLength: jQuery(".ZOTPRESS_AC_MINLENGTH").val(),
				focus: function() {
					// prevent value inserted on focus
					return false;
				},
				search: function( event, ui )
				{
					var tempCurrentTerm = false; if ( event.hasOwnProperty('currentTarget') ) tempCurrentTerm = event.currentTarget.value;

					// Reset item numbering
					zpItemNum = 1;

					if ( zpItemsFlag == true
						|| ( tempCurrentTerm && tempCurrentTerm != zpLastTerm ) )
					{
						// Show loading icon
						jQuery(".zp-List .zpSearchLoading").addClass("show");

						// Empty and hide pagination
						if ( jQuery(".zpSearchResultsPaging").length > 0 ) {
							jQuery(".zpSearchResultsPaging").empty();
							jQuery(".zpSearchResultsPagingContainer").hide();
						}

						// Remove old results
						jQuery(".zpSearchResultsContainer").empty();

						// Reset the query
						zp_set_lib_searchbar_params( false, 0, false );
						jQuery("input.zp-Zotpress-SearchBox-Input").autocomplete( "option", "source", zpSearchBarSource+zpSearchBarParams );

						// Reset the current pagination
						window.zpPage = 1;

						if ( zpItemsFlag == true && tempCurrentTerm )
							zpLastTerm = tempCurrentTerm;
					}
				},
				response: function( event, ui )
				{
					// Remove loading icon
					jQuery(".zp-List .zpSearchLoading").removeClass("show");

					// First, deal with any errors or blank results
					if ( ui.content == "0"
				 			|| ui.content[0].label == "empty" )
					{
						if ( jQuery(".zpSearchResultsPaging").length > 0 ) {
							jQuery(".zpSearchResultsPaging").empty();
							jQuery(".zpSearchResultsPagingContainer").hide();
						}
						jQuery(".zpSearchResultsContainer").append("<p>No items found.</p>\n");
					}
					else // Display list of search results
					{
						jQuery.each(ui.content[3], function( index, item )
						{
							var tempItem = "<div id='zp-Entry-"+item.key+"' class='zp-Entry zpSearchResultsItem hidden'>\n";

							if ( zpShowImages
									&& item.hasOwnProperty('image') )
							{
								tempItem += "<div id='zp-Citation-"+item.key+"' class='zp-Entry-Image hasImage' rel='"+item.key+"'>\n";
								tempItem += "<img class='thumb' src='"+item.image[0]+"' alt='image' />\n";
								tempItem += "</div><!-- .zp-Entry-Image -->\n";
							}

							// Replace num due to style
							if ( item.bib.indexOf("[1]") != -1 )
							{
								item.bib = item.bib.replace("[1]", "["+zpItemNum+"]");
								zpItemNum++;
							}

							// Bibliography entry
							tempItem += item.bib;

							if ( ( zpShowTags
									|| jQuery("input.tag[name=zpSearchFilters]:checked").length > 0 )
									&& item.data.tags.length > 0 )
							{
								tempItem += "<span class='item_key'>Tag(s): ";
								// console.log(item);

								jQuery.each( item.data.tags, function ( tindex, tagval )
								{
									if ( tindex != 0 ) tempItem += ", ";
									tempItem += tagval.tag;
								});
							}

							jQuery(".zpSearchResultsContainer").append(tempItem+"</div><!-- .zp-Entry -->\n");

							jQuery(".zpSearchResultsPagingContainer").show();
						});


						// Then, continue with other requests, if they exist
						if ( ui.content[2].request_next != false
								&& ui.content[2].request_next != "false" )
						{
							if ( zpItemsFlag == true )
								// window.zpACPagination(zpItemsFlag, false);
								window.zpBrowseList[0].paginate(zpItemsFlag, false);
							else
								// window.zpACPagination(zpItemsFlag, true);
								window.zpBrowseList[0].paginate(zpItemsFlag, true);
							zpItemsFlag = false;

							zp_set_lib_searchbar_params( false, ui.content[2].request_next, ui.content[2].request_last );

							jQuery("input.zp-Zotpress-SearchBox-Input").autocomplete( "option", "source", zpSearchBarSource+zpSearchBarParams );
							jQuery("input.zp-Zotpress-SearchBox-Input").autocomplete("search");
						}
						else
						{
							// window.zpACPagination(zpItemsFlag, true);
							window.zpBrowseList[0].paginate(zpItemsFlag, true);
							zpItemsFlag = false;
						}
					}
				},
				open: function ()
				{
					// Don't show the dropdown
					jQuery(".ui-autocomplete").hide();
				}
			});

	} // Zotpress SearchBar Library

});
