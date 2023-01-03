jQuery(document).ready(function()
{
	//////////////////////////
	//						//
	//   ZOTPRESS IN-TEXT   //
	//						//
	//////////////////////////

	if ( jQuery(".zp-Zotpress-InTextBib").length > 0 )
	{
		// Create global array for citations per post
		window.zpIntextCitations = {};
		window.zpIntextCitationCount = {};

		jQuery(".zp-Zotpress-InTextBib").each( function( index, instance )
		{
			var $instance = jQuery(instance);
      		var zp_params = {};
			window.zpIntextCitations["post-"+jQuery(".ZP_POSTID", $instance).text()] = {};

			zp_params.zpItemkey = false; if ( jQuery(".ZP_ITEM_KEY", $instance).text().trim().length > 0 ) zp_params.zpItemkey = jQuery(".ZP_ITEM_KEY", $instance).text();

			zp_params.zpStyle = false; if ( jQuery(".ZP_STYLE", $instance).text().trim().length > 0 ) zp_params.zpStyle = jQuery(".ZP_STYLE", $instance).text();
			zp_params.zpTitle = false; if ( jQuery(".ZP_TITLE", $instance).text().trim().length > 0 ) zp_params. zpTitle = jQuery(".ZP_TITLE", $instance).text();

			zp_params.zpShowImages = false; if ( jQuery(".ZP_SHOWIMAGE", $instance).text().trim().length > 0 ) zp_params.zpShowImages = jQuery(".ZP_SHOWIMAGE", $instance).text().trim();
			zp_params.zpShowTags = false; if ( jQuery(".ZP_SHOWTAGS", $instance).text().trim().length > 0 ) zp_params.zpShowTags = true;
			zp_params.zpDownloadable = false; if ( jQuery(".ZP_DOWNLOADABLE", $instance).text().trim().length > 0 ) zp_params.zpDownloadable = true;
			zp_params.zpShowNotes = false; if ( jQuery(".ZP_NOTES", $instance).text().trim().length > 0 ) zp_params.zpShowNotes = true;
			zp_params.zpShowAbstracts = false; if ( jQuery(".ZP_ABSTRACT", $instance).text().trim().length > 0 ) zp_params.zpShowAbstracts = true;
			zp_params.zpCiteable = false; if ( jQuery(".ZP_CITEABLE", $instance).text().trim().length > 0 ) zp_params.zpCiteable = true;
			zp_params.zpTarget = false; if ( jQuery(".ZP_TARGET", $instance).text().trim().length > 0 ) zp_params.zpTarget = true;
			zp_params.zpURLWrap = false; if ( jQuery(".ZP_URLWRAP", $instance).text().trim().length > 0 ) zp_params.zpURLWrap = jQuery(".ZP_URLWRAP", $instance).text();
			zp_params.zpHighlight = false; if ( jQuery(".ZP_HIGHLIGHT", $instance).text().trim().length > 0 ) zp_params.zpHighlight = jQuery(".ZP_HIGHLIGHT", $instance).text();

			zp_params.zpSortBy = false; if ( jQuery(".ZP_SORTBY", $instance).text().trim().length > 0 ) zp_params.zpSortBy = jQuery(".ZP_SORTBY", $instance).text();
			zp_params.zpOrder = false; if ( jQuery(".ZP_ORDER", $instance).text().trim().length > 0 ) zp_params.zpOrder = jQuery(".ZP_ORDER", $instance).text();

			zp_get_items ( 0, 0, $instance, zp_params, false ); // Get cached items first
		});

	} // Zotpress In-Text

	// Get list items
	function zp_get_items ( request_start, request_last, $instance, params, update )
	{
		if ( typeof(request_start) === "undefined" || request_start == "false" || request_start == "" )
			request_start = 0;

		if ( typeof(request_last) === "undefined" || request_last == "false" || request_last == "" )
			request_last = 0;

		jQuery.ajax(
		{
			url: zpShortcodeAJAX.ajaxurl,
			ifModified: true,
			data: {
				'action': 'zpRetrieveViaShortcode',
				'instance_id': $instance.attr("id"),
				// 'api_user_id': jQuery(".ZP_API_USER_ID", $instance).text(),
				'type': "intext",

				'item_key': params.zpItemkey,

				'style': params.zpStyle,
				'title': params.zpTitle,

				'showimage': params.zpShowImages,
				'showtags': params.zpShowTags,
				'downloadable': params.zpDownloadable,
				'shownotes': params.zpShowNotes,
				'showabstracts': params.zpShowAbstracts,
				'citeable': params.zpCiteable,

				'target': params.zpTarget,
				'urlwrap': params.zpURLWrap,
				'highlight': params.zpHighlight,

				'sortby': params.zpSortBy,
				'order': params.zpOrder,

				// 'sortby': jQuery(".ZP_SORTBY", $instance).text(),
				// 'order': jQuery(".ZP_ORDER", $instance).text(),

				'update': update,
				'request_start': request_start,
				'request_last': request_last,
				'zpShortcode_nonce': zpShortcodeAJAX.zpShortcode_nonce
			},
			xhrFields: {
				withCredentials: true
			},
			success: function(data)
			{
				var zp_items = jQuery.parseJSON( data );

				// Account for Zotero errors
				if ( zp_items.status == 'error' )
				{
					console.log( 'Zotpress Error: ' + zp_items.data );

					// Hide errors if something shown
					var hideErrMsg = '';
					if ( jQuery( "#"+zp_items.instance+" .zp-List .zp-Entry" ).length > 0 )
						hideErrMsg = ' class="hide"';

					// Remove the loader
					jQuery( "#"+zp_items.instance+" .zp-List" )
						.removeClass( 'loading' )
						.append( '<p'+hideErrMsg+'>Zotpress Error: '+zp_items.data+'</p>' );
				}

				// Process as items
				else
				{
					// First, display the items from this request, if any
					if ( typeof zp_items != 'undefined'
							&& zp_items != null && parseInt(zp_items) != 0
							&& zp_items.data.length > 0 )
					{
						// var tempItems = "";
						if ( params.zpShowNotes == true ) var tempNotes = "";
						if ( params.zpTitle == true ) var tempTitle = "";
						var $postRef = jQuery($instance).parent();


						// Indicate whether cache has been used
						if ( update === false )
						{
							jQuery("#"+zp_items.instance+" .zp-List").addClass("used_cache");
						}
						else if ( update === true )
						{
							// Remove existing notes temporarily
							if ( ! jQuery("#"+zp_items.instance+" .zp-List").hasClass("updating")
									&& jQuery("#"+zp_items.instance+" .zp-Citation-Notes").length > 0 )
								jQuery("#"+zp_items.instance+" .zp-Citation-Notes").remove();

							if ( ! jQuery("#"+zp_items.instance+" .zp-List").hasClass("updating") )
								jQuery("#"+zp_items.instance+" .zp-List").addClass("updating");
						}


						// Format in-text citations
						zp_format_intext_citations( $instance, params.zpItemkey, zp_items.data, params, update );

						// Format in-text bibliography
						// tempItems = zp_format_intextbib ( $instance, zp_items, params.zpItemkey, params, update );
						zp_format_intextbib ( $instance, zp_items, params.zpItemkey, params, update );

						// Add cached OR initial request items (first 50) to list
						if ( update === false )
						 		// && tempItems.length > 0 )
						{
							// First, remove any PHP SEO container
							// jQuery("#"+zp_items.instance+" .zp-SEO-Content").remove();
							jQuery("#"+zp_items.instance+" .zp-SEO-Content .zp-Entry").unwrap();

							// Then add the items
							// jQuery("#"+zp_items.instance+" .zp-List").append( tempItems );
						}

						// Append notes to container
						if ( params.zpShowNotes == true && tempNotes.length > 0 )
						{
							tempNotes = "<div class='zp-Citation-Notes'>\n<h4>Notes</h4>\n<ol>\n" + tempNotes;
							tempNotes = tempNotes + "</ol>\n</div><!-- .zp-Citation-Notes -->\n\n";

							jQuery("#"+zp_items.instance).append( tempNotes );
						}


						// Then, continue with other requests, if they exist
						if ( zp_items.meta.request_next != false && zp_items.meta.request_next != "false" )
						{
							zp_get_items ( zp_items.meta.request_next, zp_items.meta.request_last, $instance, params, update );
						}
						else // Otherwise, finish up and/or check for updates
						{
							// Remove loading
							jQuery("#"+zp_items.instance+" .zp-List").removeClass("loading");

							// Check for updates
							if ( ! jQuery("#"+zp_items.instance+" .zp-List").hasClass("updating") )
							{
								zp_get_items ( 0, 0, $instance, params, true );
							}
							else // Or finish up
							{
								var sortby = params.zpSortBy;
								var orderby = params.zpOrder;

								// Re-sort if not numbered and sorting by author or date
								if ( ['author', 'date'].indexOf(sortby) !== -1
										&& jQuery("#"+zp_items.instance+" .zp-List .csl-left-margin").length == 0 )
								{
									var sortOrder = "zp-author-date";
									if ( sortby == "date") sortOrder = "zp-date-author";

									jQuery("#"+zp_items.instance+" .zp-List div.zp-Entry").sort( function(a,b)
									{
										var an = jQuery(a).data(sortOrder).toLowerCase(),
											bn = jQuery(b).data(sortOrder).toLowerCase();

										if (an > bn)
											if ( orderby == "asc" )
												return 1;
											else
												return -1;
										else if (an < bn)
											if ( orderby == "asc" )
												return -1;
											else
												return 1;										// if (an > bn)
										// if (an > bn)
										// 	if ( orderby == "asc" )
										// 		return sortby == "date" ? -1 : 1;
										// 	else
										// 		return sortby == "date" ? 1 : -1;
										// else if (an < bn)
										// 	if ( orderby == "asc" )
										// 		return sortby == "date" ? 1 : -1;
										// 	else
										// 		return sortby == "date" ? -1 : 1;										// if (an > bn)
										else
											return 0;

									}).detach().appendTo("#"+zp_items.instance+" .zp-List");
								}
								else // Re-sort numbering
								{
									// REVIEW: Not necessary?
									// console.log("IT: NUM: numbering resort? if no csl-left-margin");
								}
							}
						}
					}

					// Message that there's no items
					else
					{
						var tempPost = $instance.attr("class");
						tempPost = tempPost.replace("zp-Zotpress zp-Zotpress-InTextBib zp-Post-", "");

						// Removes loading icon and in-text data; accounts for post-ID and non-standard themes
						if ( jQuery("#post-"+tempPost).length > 0 )
							jQuery("#post-"+tempPost+" .zp-InText-Citation").removeClass("loading").remove();
						else
							jQuery("#"+$instance.attr("id")).parent().find(".zp-InText-Citation").removeClass("loading").remove();

						jQuery("#"+$instance.attr("id")+" .zp-List").removeClass("loading");
						jQuery("#"+$instance.attr("id")+" .zp-List").append("<p>There are no citations to display.</p>\n");
					}
				}
			},
			error: function(errorThrown)
			{
				console.log( 'Zotpress Error:' + errorThrown );
			}
		});

	} // function zp_get_items

	function zp_format_intext_citations ( $instance, item_keys, item_data, params, update )
	{
		// Tested formats:
		// KEY
		// {KEY}
		// {KEY,3-9}
		// KEY,{KEY,8}

		var intext_citations = [];

		// Create array for multiple in-text citations -- semicolon
		if ( item_keys.indexOf(";") != -1 ) intext_citations = item_keys.split( ";" );
		else intext_citations.push( item_keys );


		// Re-structure item_data
		var tempItem_data = {};
		jQuery.each( item_data, function (index, value )
		{
			if ( ! tempItem_data.hasOwnProperty(value.key) )
				tempItem_data[value.key] = value;
		});
		item_data = tempItem_data;


		// REVIEW: Account for repeat citations
		var intextGroupTracker = {};

		jQuery.each( intext_citations, function (index, intext_citation)
		{
			var intext_citation_output = "";
			var $postRef = jQuery($instance).parent();

			// REVIEW: Is this the right reformatting for the ID?
			// var tempId = intext_citation.replace( /{/g, "-" ).replace( /}/g, "-" ).replace( /,/g, "_" ).replace( /\//g, "_" ).replace( /\+/g, "_" ).replace( /&/g, "_" ).replace( / /g, "_" ).replace( /:/g, "--" );
			var tempId = intext_citation.replace( /{/g, "-" ).replace( /}/g, "-" ).replace( /,/g, "_" ).replace( /:/g, "-" );
			// REVIEW: No longer counting by post
			// var intext_citation_id = "zp-InText-zp-ID-"+jQuery(".ZP_API_USER_ID", $instance).text()+"-"+tempId+"-"+jQuery(".ZP_POSTID", $instance).text()+"-"+(index+1);
			var intext_citation_id = "zp-InText-zp-ID-"+tempId+"-wp"+jQuery(".ZP_POSTID", $instance).text();

			// REVIEW: Account for repeat citation groups
			var intext_group_index = 0;

			// Make a tracker for multiples, if one doesn't exist
			if ( jQuery("."+intext_citation_id, $postRef ).length > 1 )
				if ( ! intextGroupTracker.hasOwnProperty(intext_citation_id) )
					intextGroupTracker[intext_citation_id] = 0;
				else // Set index
					intext_group_index = intextGroupTracker[intext_citation_id];

			var intext_citation_params = JSON.parse( jQuery("."+intext_citation_id+":eq("+intext_group_index+")", $postRef ).attr("rel").replace( /'/g, '"') );

			// REVIEW: New way based on new format
			// Expects: {api:key}, with pages in intext_citation_params

			// Divide up multiple items (if exist): always produc an array
			intext_citation_split = intext_citation.split( "},{" );

			// Prepare it as an array
			intext_citation = new Array();

			jQuery.each ( intext_citation_split, function ( id, item )
			{
				item_parts = item.split( ":" );

				// Deal with pages
				item_pages = false;
				if ( intext_citation_params.pages != "np" )
				{
					item_pages = intext_citation_params.pages.split( "--" );

					if ( item_pages[id] == "np" )
						item_pages[id] = false;

					item_pages = item_pages[id];
				}

				intext_citation[id] =
				{
					"api_user_id": item_parts[0].replace( "{", "" ),
					"key": item_parts[1].replace( "}", "" ),
					"post_id": jQuery(".ZP_POSTID", $instance).text(),
					"pages": item_pages,
					// "bib": "",
					// "citation_ids": ""
				};
			});


			// // Create array from item keys
			// if ( intext_citation.indexOf("{") != -1 ) // bracket
			// {
			// 	if ( intext_citation.indexOf("},") != -1 ) // multiple items
			// 	{
			// 		intext_citation = intext_citation.split( "}," );
			//
			// 		// Get rid of brackets, format pages
			// 		jQuery.each ( intext_citation, function ( id, item )
			// 		{
			// 			// Check for pages
			// 			if ( item.indexOf( "," ) != -1 )
			// 			{
			// 				item = item.split( "," );
			// 				intext_citation[id] = { "key": item[0].replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": item[1].replace( "}", "" ), "bib": "", "citation_ids": "" };
			// 			}
			// 			else // No pages
			// 			{
			// 				intext_citation[id] = { "key": item.replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "bib": "", "citation_ids": "" };
			// 			}
			// 		});
			// 	}
			// 	else // single bracket
			// 	{
			// 		if ( intext_citation.indexOf( "," ) != -1 ) // Pages
			// 		{
			// 			var item = intext_citation.split( "," );
			// 			intext_citation = [{ "key": item[0].replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": item[1].replace( "}", "" ), "bib": "", "citation_ids": "" }];
			// 		}
			// 		else // no pages
			// 		{
			// 			intext_citation = [{ "key": intext_citation.replace( "}", "" ).replace( "{", "" ), "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "bib": "", "citation_ids": "" }];
			// 		}
			// 	}
			// }
			// else // no bracket, no pages
			// {
			// 	intext_citation = [{ "key": intext_citation, "api_user_id": jQuery(".ZP_API_USER_ID", $instance).text(), "post_id": jQuery(".ZP_POSTID", $instance).text(), "pages": false, "bib": "", "citation_ids": "" }];
			// }
			// Now we have an array in intext_citation
			// e.g.  [{ key="3NNACKP2",  pages=false,  citation=""}, { key="S74KCIJR",  pages=false,  citation=""}]

			// Go through each item in the citation; can be one or more items
			var group_authors = [];

			jQuery.each( intext_citation, function( cindex, item )
			{
				var item_citation = "";
				var item_authors = "";
				var item_year ="";

				// Add to global array, if not already there
				if ( ! window.zpIntextCitations["post-"+item.post_id].hasOwnProperty(item.key) )
				{
					window.zpIntextCitations["post-"+item.post_id][item.key] = item;

					// Make sure count for this post exists:
					if ( typeof window.zpIntextCitationCount["post-"+item.post_id] === 'undefined')
						window.zpIntextCitationCount["post-"+item.post_id] = 0;

					window.zpIntextCitationCount["post-"+item.post_id]++;
					window.zpIntextCitations["post-"+item.post_id][item.key]["num"] = window.zpIntextCitationCount["post-"+item.post_id];
				}
				//else // If already there, add to item keys -- does this make sense? Just repeats the html id ...
				//{
				//	window.zpIntextCitations["post-"+item.post_id][item.key]["citation_ids"] += intext_citation_id + " ";
				//}

				// Deal with authors and etal
				////jQuery.each( item_data, function ( kindex, response_item )
				////{
				//	if ( response_item.data.key != item.key ) return true;

				if ( item_data.hasOwnProperty(item.key) )
				{
					// Deal with authors
					if ( item_data[item.key].data.hasOwnProperty("creators") )
					{
						var tempAuthorCount = 0;
						var tempAuthorTypeExists = false;

						// First, check if there are any Author types
						jQuery.each( item_data[item.key].data.creators, function( ai, author )
						{
							if ( author.creatorType == "author" ) {
								tempAuthorTypeExists = true;
								return false;
							}
						});

						// Continue, only including non-Author types if no Author types
						jQuery.each( item_data[item.key].data.creators, function( ai, author )
						{
							if ( tempAuthorTypeExists
									&& author.creatorType != "author" )
								return true;

							tempAuthorCount++;

							if ( ai != 0 && tempAuthorCount > 1 ) item_authors += ", ";
							if ( author.hasOwnProperty("name") ) item_authors += author.name;
							else if ( author.hasOwnProperty("lastName") ) item_authors += author.lastName;
						});

						// Deal with duplicates in the group
						if ( group_authors.indexOf(item_authors) == -1 )
							group_authors[group_authors.length] = item_authors;
						else
							item_authors = "";

						// Create authors array (easier to deal with)
						item_authors = item_authors.split(", ");

						// Deal with et al for more than two authors
						if ( jQuery.isArray(item_authors)
								&& item_authors.length > 2 )
						{
							if ( intext_citation_params.etal == ""
									|| intext_citation_params.etal == "default" )
							{
								// if ( update == false
								// 		&& window.zpIntextCitations["post-"+item.post_id][item.key]["citation_ids"].length > 1 )
								// 	item_authors = item_authors[0] + " <em>et al.</em>";
							}
							else if ( intext_citation_params.etal == "yes" )
							{
								item_authors = item_authors[0] + " <em>et al.</em>";
							}
						}

						// Deal with "and" for multiples that are not using "etal"
						// NOTE: ampersand [default], and, comma, comma-amp, comma-and
						if ( jQuery.isArray(item_authors)
								&& item_authors.length > 1
								&& item_authors.indexOf("et al") == -1 )
						{
							var temp_and = " &amp; ";

							if ( intext_citation_params.and == "and" )
								temp_and = " and ";
							else if ( intext_citation_params.and == "comma-and" )
								temp_and = ", and ";
							else if ( intext_citation_params.and == "comma-amp" )
								temp_and = ", &amp; ";
							else if ( intext_citation_params.and == "comma" )
								temp_and = ", ";
							else
								temp_and = " &amp; ";

							var temp = item_authors.join().replace( /,/g, ", " );
							item_authors = temp.substring( 0, temp.lastIndexOf(", ") ) + temp_and +  item_authors[item_authors.length-1];
						}
					}
					else // Use title if no author
					{
						item_authors += item_data[item.key].data.title;
					}

					// Get year or n.d.
					if ( item_data[item.key].meta.hasOwnProperty("parsedDate") )
						item_year = item_data[item.key].meta.parsedDate.substring(0, 4);
					else
						item_year = "n.d.";

					// Format anchor title attribute
					// Apostrophe fix by Chris Wentzloff
					window.zpIntextCitations["post-"+item.post_id][item.key]["intexttitle"] = "title='"+JSON.stringify(item_authors).replace( "<em>et al.</em>", "et al." ).replace( /\"/g, "" ).replace( "[", "" ).replace( "]", "" ).replace(/’/g,'&#39;').replace(/'/g,'&#39;') + " (" + item_year + "). " + item_data[item.key].data.title + ".' ";

				} // if item_data.hasOwnProperty(item.key)
				//}); // each request data item

				// Display with numbers
				if ( intext_citation_params.format.indexOf("%num%") != -1 )
				{
					var default_format = intext_citation_params.format;

					//item_citation = Object.keys(window.zpIntextCitations["post-"+item.post_id]).indexOf( item.key) + 1;
					var item_citation_num = window.zpIntextCitations["post-"+item.post_id][item.key]["num"];

					// If using parenthesis format:
					// if ( intext_citation_params.format == "(%num%)" )
					// 	item_citation = "("+item_citation+")";
					item_citation = intext_citation_params.format.replace( "%num%" , item_citation_num );
					// if ( intext_citation_params.format == "(%num%)" )
					// 	item_citation = "("+item_citation+")";

					// Deal with pages
					if ( item.pages != false )
					{
						var multip = "p. ";
						if ( item.pages.indexOf("-") != -1 )
							multip = "pp. ";

						item_citation = item_citation.replace( "%p%" , multip+item.pages );
					}
					// Get rid of %p% placeholder, if not used
					else
					{
						item_citation = item_citation.replace( ", %p%" , "" );
					}

					// If more than one item in group, remove ), (
					if ( intext_citation.length > 1 )
					{
						if ( cindex != intext_citation.length - 1 )
							item_citation = item_citation.replace( ")", "" );

						if ( cindex != 0 )
							if ( item_authors == "" )
								item_citation = item_citation.replace( "(, ", "" );
							else
								item_citation = item_citation.replace( "(", "" );
					}

					// Deal with brackets
					if ( intext_citation_params.brackets )
					{
						item_citation = item_citation.replace( "(", "" );
						item_citation = item_citation.replace( ")", "" );
					}
				}

				// Display regularly, e.g., author and year and pages
				else
				{
					var default_format = intext_citation_params.format;

					// Add in author
					item_citation = intext_citation_params.format.replace( "%a%" , item_authors );

					// Add in year
					item_citation = item_citation.replace( "%d%" , item_year );

					// Deal with pages
					if ( item.pages == false )
					{
						item_citation = item_citation.replace( ", %p%" , "" );
						item_citation = item_citation.replace( "%p%" , "" );
					}
					else // pages exist
					{
						item_citation = item_citation.replace( "%p%" , item.pages );
					}

					// If more than one item in group, remove ), (
					if ( default_format == "(%a%, %d%, %p%)" && intext_citation.length > 1 )
					{
						if ( cindex != intext_citation.length - 1 )
							item_citation = item_citation.replace( ")", "" );

						if ( cindex != 0 )
							if ( item_authors == "" )
								item_citation = item_citation.replace( "(, ", "" );
							else
								item_citation = item_citation.replace( "(", "" );
					}

				} // non-numerical display

				// Add anchor title and anchors
				if ( ! window.zpIntextCitations["post-"+item.post_id][item.key].hasOwnProperty("intexttitle"))
					window.zpIntextCitations["post-"+item.post_id][item.key]["intexttitle"] = "";

				item_citation = "<a "+window.zpIntextCitations["post-"+item.post_id][item.key]["intexttitle"]+"class='zp-ZotpressInText' href='#zp-ID-"+item.post_id+"-"+item.api_user_id+"-"+item.key+"'>" + item_citation + "</a>";

				// Deal with <sup>
				if ( intext_citation_params.format.indexOf("sup") != "-1" )
					item_citation = "<sup>"+item_citation+"</sup>";

				// Add to intext_citation array
				intext_citation[cindex]["intext"] = item_citation;

			}); // format each item



			// Format citation group
			var intext_citation_pre = ""; if ( intext_citation_params.brackets ) intext_citation_pre = "["; // &#91;
			var intext_citation_post = ""; if ( intext_citation_params.brackets ) intext_citation_post = "]"; // &#93;

			intext_citation_output = intext_citation_pre;

			jQuery.each( intext_citation, function(cindex, item)
			{
				// Determine separator
				if ( cindex != 0 )
				{
					if ( intext_citation_params.separator == "comma" )
						intext_citation_output += ", ";
					else
						intext_citation_output += "; ";
				}
				intext_citation_output += item.intext;

			}); // display each item

			intext_citation_output += intext_citation_post;

			// Add to placeholder
			// REVIEW: Updated ref to class instead of ID
			// jQuery("#"+intext_citation_id).removeClass("loading").html( intext_citation_output );
			jQuery("."+intext_citation_id+":eq("+intext_group_index+")", $postRef ).removeClass("loading").html( intext_citation_output );

			// REVIEW: Increase group tracker, if needed
			if ( intextGroupTracker.hasOwnProperty(intext_citation_id) )
				intextGroupTracker[intext_citation_id]++;

		}); // each intext_citation

	} // zp_format_intext_citations




	function zp_format_intextbib ( $instance, zp_items, zp_itemkeys, params, update )
	{
    	// var tempItemsArr = {}; // Format: ["itemkey", "data"]
		var tempHasNum = false;
		var zpPostID = jQuery(".ZP_POSTID", $instance).text();
		var itemNumOrderArr = []; // NOTE: 0 index always empty

		// Disambiguation by Chris Wentzloff
		var authDateArray = [];
		var alphaArray = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

		jQuery.each( zp_items.data, function( index, item )
		{
			var tempItem = "";

			// Determine item reference
			// e.g., zp-ID-406-1573921-VPACLPQ8
			var $item_ref = jQuery("#"+zp_items.instance+" .zp-List #zp-ID-"+zpPostID+"-"+item.library.id+"-"+item.key);

			// Skip duplicates
			// REVIEW: Blocking the rest of formatting, but what about dupes?
			// if ( $item_ref.length > 0 )
			// 	return true;

			// Year
			// REVIEW: Now we're using the whole date
			var tempItemYear = "0000";
			var tempItemDate = "0000";
			if ( item.meta.hasOwnProperty('parsedDate') )
				tempItemYear = item.meta.parsedDate.substring(0, 4);
			if ( item.data.hasOwnProperty('date') )
				tempItemDate = item.data.date;

			// Author
			var tempAuthor = item.data.title;
			if ( item.meta.hasOwnProperty('creatorSummary') )
				tempAuthor = item.meta.creatorSummary.replace( / /g, "-" );

			// Title
			if ( params.zpTitle == true
					&& tempTitle != tempItemYear )
			{
				tempTitle = tempItemYear;
				tempItem += "<h3>"+tempTitle+"</h3>\n";
			}

			// Disambiguation by Chris Wentzloff
			//Store some temp variables to search, count, and then replace
			var authDateStr = tempAuthor+'-'+tempItemDate;
			var originalTempItemDate = tempItemDate;
			//Add the value to the array so it can be counted
			authDateArray.push(authDateStr);
			// console.log(authDateArray);
			//Find out how many are there
			var authDateInstances = authDateArray.filter((v) => (v === authDateStr)).length;
			// console.log(authDateInstances);
			//If there's more than one, add a letter to subsequent author-year combinations that match
			if ( authDateInstances > 1 )
			   tempItemDate = tempItemDate + alphaArray[authDateInstances-1];
			// console.log(tempItemDate);

			tempItem += "<div id='zp-ID-"+jQuery(".ZP_POSTID", $instance).text()+"-"+item.library.id+"-"+item.key+"'";
			tempItem += " data-zp-author-date='"+tempAuthor+"-"+tempItemDate+"'";
			tempItem += " data-zp-date-author='"+tempItemDate+"-"+tempAuthor+"'";
			tempItem += " class='zp-Entry zpSearchResultsItem zp-Num-"+window.zpIntextCitations["post-"+zpPostID][item.key]["num"];

			// Disambiguation by Chris Wentzloff
			// Be sure to get the first one if it's the second one
			if ( authDateInstances == 2 )
			{
				//Need to replace the year with the new year-letter string
				var newTempItemDate = originalTempItemDate + alphaArray[authDateInstances-2];

				zp_items.data[index-1].bib = zp_items.data[index-1].bib.replace( originalTempItemDate, newTempItemDate );

				var $tempEntry = jQuery("#"+zp_items.instance+" .zp-List .zp-Entry[data-zp-author-date='"+tempAuthor+"-"+originalTempItemDate.replace(" ","-")+"']");

				$tempEntry
					.attr("data-zp-author-date", tempAuthor+"-"+newTempItemDate.replace(" ","-"))
					.attr("data-zp-date-author", tempItemDate + alphaArray[authDateInstances-2] + "-" + tempAuthor);

				jQuery(".csl-entry", $tempEntry).html(
					jQuery(".csl-entry", $tempEntry).html().replace( originalTempItemDate, newTempItemDate )
				);

				//Find all instances of the in-text citation, and update the year
				jQuery('a[href="#zp-ID-'+jQuery(".ZP_POSTID", $instance).text()+'-'+zp_items.data[index-1].library.id+'-'+zp_items.data[index-1].key+'"]').each(function(){
				   this.text = this.text.replace( originalTempItemDate, newTempItemDate );
				});
			}
			//Need to replace the year with the new year-letter string
			item.bib = item.bib.replace( originalTempItemDate, tempItemDate );
			//Find all instances of the in-text citation, and update the year
			jQuery('a[href="#zp-ID-'+jQuery(".ZP_POSTID", $instance).text()+'-'+item.library.id+'-'+item.key+'"]').each(function(){
			   this.text = this.text.replace( originalTempItemDate, tempItemDate );
			});

			// Add update class to item
			if ( update === true ) tempItem += " zp_updated";

			// Image
			if ( jQuery("#"+zp_items.instance+" .ZP_SHOWIMAGE").text().trim().length > 0
					&& item.hasOwnProperty('image') )
			{
				tempItem += " zp-HasImage'>\n";
				tempItem += "<div id='zp-Citation-"+item.key+"' class='zp-Entry-Image hasImage' rel='"+item.key+"'>\n";

				// URL wrap image if applicable
				if ( params.zpURLWrap == "image" && item.data.url != "" )
				{
					tempItem += "<a href='"+item.data.url+"'";
					if ( params.zpTarget ) tempItem += " target='_blank'";
					tempItem += ">";
				}
				tempItem += "<img class='thumb' src='"+item.image[0]+"' alt='image' />\n";
				if ( params.zpURLWrap == "image" && item.data.url != "" ) tempItem += "</a>";
				tempItem += "</div><!-- .zp-Entry-Image -->\n";
			}
			else
			{
				tempItem += "'>\n";
			}

			// Make sure forcenumbers is applied, if needed
			// NOTE: item may change
			var temp = zp_forcenumbers( zp_items.instance, item, zpPostID );

			item = temp.item;
			itemNumOrderArr[temp.itemNumOrder.order] = temp.itemNumOrder.key;

			if ( /csl-left-margin/i.test(item.bib) )
				tempHasNum = true;

			// Then add the (modified) bib
			tempItem += item.bib;

			// Add abstracts, if any
			if ( params.zpShowAbstracts == true &&
					( item.data.hasOwnProperty('abstractNote') && item.data.abstractNote.length > 0 ) )
				tempItem +="<p class='zp-Abstract'><span class='zp-Abstract-Title'>Abstract:</span> " +item.data.abstractNote+ "</p>\n";

			// Add tags, if any
			if ( params.zpShowTags == true &&
					( item.data.hasOwnProperty('tags') && item.data.tags.length > 0 ) )
			{
				tempItem += "<p class='zp-Zotpress-ShowTags'><span class='title'>Tags:</span> ";

				jQuery.each(item.data.tags, function ( tindex, tag )
				{
					tempItem += "<span class='tag'>" + tag.tag + "</span>";
					if ( tindex != (item.data.tags.length-1) ) tempItem += "<span class='separator'>,</span> ";
				});
				tempItem += "</p>\n";
			}

			tempItem += "</div>\n";

			// Add notes, if any
			if ( params.zpShowNotes == true
					&& item.hasOwnProperty('notes') )
				tempNotes += item.notes;

			// Add this item to the list; replace or skip duplicates
			if ( $item_ref.length > 0
					&& update === true )
			{
				$item_ref.replaceWith( jQuery( tempItem ) );
			}
			else // When not updating ...
			{
				// Add new items, freshly retrieved
				if ( $item_ref.length == 0 )
				{
					jQuery("#"+zp_items.instance+" .zp-List").append( tempItem );
				}
				else // Or replace existing
				{
					$item_ref.replaceWith( jQuery( tempItem ) );
				}
			}

		}); // each item


		// var tempItemsOrdered = '';

		// If in-text formatted as number (i.e. %num%), re-order
		if ( tempHasNum
				&& update === false )
		{
			// If first request (first 50)
			if ( jQuery("#"+zp_items.instance+" .zp-List .zp-Entry").length == 0 )
			{
				// REVIEW: Not necessary?
				// console.log("IT: NUM: no entries, not updating");
			}
			else // Subsequent requests for this bib
			{
				for ( var num = 1; num < itemNumOrderArr.length; num++ )
				{
					// Get item info
					var item = window.zpIntextCitations["post-"+zpPostID][itemNumOrderArr[num]];
					var $item = jQuery("#" + "zp-ID-"+zpPostID + "-" + window.zpIntextCitations["post-"+zpPostID][itemNumOrderArr[num]].api_user_id + "-" + itemNumOrderArr[num]);

					// Insert into proper place
					jQuery("#"+zp_items.instance+" .zp-List").append( $item );
				}
			}
		}
		else
		{
			// REVIEW: Not necessary?
			// console.log("IT: not hasnum or updating");
		}

	} // function zp_format_intextbib




	function zp_forcenumbers( zp_instance, zp_item, zpPostID )
	{
		var itemNumOrder = { 'order' : 0, 'item_key' : '' };

		// Only forcenumbers if desired, and needed
		if ( /csl-left-margin/i.test(zp_item.bib) )
		{
			var $item_content = jQuery.parseHTML(zp_item.bib);
			var item_num_content = jQuery(".csl-left-margin", $item_content).text();
			item_num_content = item_num_content.replace( item_num_content.match(/\d+/)[0], window.zpIntextCitations["post-"+zpPostID][zp_item.key]["num"] );

			jQuery(".csl-left-margin", $item_content).text(item_num_content);

			// Update the HTML output
			zp_item.bib = jQuery('<div>').append( $item_content ).html();

			// Add to the order array
			itemNumOrder.order = window.zpIntextCitations["post-"+zpPostID][zp_item.key]["num"];
			itemNumOrder.key = zp_item.key;
		}
		else // no left margin = no numbers yet
		{
			// But only number if asked for
			if ( jQuery("#"+zp_instance+" .ZP_FORCENUM").text().length > 0
					&& jQuery("#"+zp_instance+" .ZP_FORCENUM").text() == "1" )
			{
				var $item_content = jQuery.parseHTML(zp_item.bib);

				jQuery('.csl-entry', $item_content).prepend( '<div class="csl-left-margin" style="display: inline;">'+window.zpIntextCitations["post-"+zpPostID][zp_item.key]['num']+'. </div>' );

				// Update the HTML output
				zp_item.bib = jQuery('<div>').append( $item_content ).html();

				// Add to the order array
				itemNumOrder.order = window.zpIntextCitations["post-"+zpPostID][zp_item.key]['num'];
				itemNumOrder.key = zp_item.key;
			}
		}

		return { 'itemNumOrder' : itemNumOrder, 'item' : zp_item };

	} // function zp_forcenumbers


});
