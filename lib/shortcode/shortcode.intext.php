<?php

function zpStripQuotes($string)
{
    // Strip quotes and decode
    $string = str_replace("”", "", str_replace('"','', html_entity_decode( $string )));
    return $string;
}

function Zotpress_zotpressInText ($atts)
{
    /*
    *   GLOBAL VARIABLES
    *
    *   $GLOBALS['zp_shortcode_instances'] {instantiated in zotpress.php}
    *
    */

    extract(shortcode_atts(array(

        'item' => false,
        'items' => false,

        'pages' => false,
        'format' => "(%a%, %d%, %p%)",
		'brackets' => false,
        'etal' => false, // default (false), yes, no
        'separator' => false, // default (comma), semicolon
        'and' => false, // ampersand [default], and, comma, comma-amp, comma-and

        'userid' => false,
        'api_user_id' => false,
        'nickname' => false,
        'nick' => false

    ), $atts));


    // PREPARE ATTRIBUTES
    if ($items) {
        $items = zpStripQuotes( str_replace(" ", "", $items ));
    } elseif ($item) {
        $items = zpStripQuotes( str_replace(" ", "", $item ));
    }

    $pages =              zpStripQuotes( $pages );
    $format =             zpStripQuotes( $format );
    $brackets =           zpStripQuotes( $brackets );

    $etal =               zpStripQuotes( $etal );
    if ( $etal == "default" ) $etal = false;

    $separator =          zpStripQuotes( $separator );
    if ( $separator == "default" ) $separator = false;

    $and =                zpStripQuotes( $and );
    if ( $and == "default" ) $and = false;

    if ( $userid )        $api_user_id = zpStripQuotes( $userid );
    if ( $nickname )      $nickname = zpStripQuotes( $nickname );
    if ( $nick )          $nickname = zpStripQuotes( $nick );



    // GET ACCOUNTS

    global $wpdb;

    // Turn on/off minified versions if testing/live
    $minify = ''; if ( ZOTPRESS_LIVEMODE ) $minify = '.min';

	wp_enqueue_script( 'zotpress.shortcode.intext'.$minify.'.js' );

    $zp_account = false;

    if ($nickname !== false) {
        $zp_account = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."zotpress WHERE nickname='".$nickname."'", OBJECT);
        if ( $zp_account !== null )
            $api_user_id = $zp_account->api_user_id;
    } elseif ($api_user_id !== false) {
        $zp_account = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."zotpress WHERE api_user_id='".$api_user_id."'", OBJECT);
        if ( $zp_account !== null )
            $api_user_id = $zp_account->api_user_id;
    } elseif ($api_user_id === false && $nickname === false) {
        if ( get_option("Zotpress_DefaultAccount") !== false )
        {
            $api_user_id = get_option("Zotpress_DefaultAccount");
            $zp_account = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."zotpress WHERE api_user_id ='".$api_user_id."'", OBJECT);
        }
        else // When all else fails ...
        {
            $zp_account = $wpdb->get_row("SELECT * FROM ".$wpdb->prefix."zotpress LIMIT 1", OBJECT);
            $api_user_id = $zp_account->api_user_id;
        }
    }

    // Format in-text items:
    // Handle the possible formats of item/s for in-text
    //
    // IN-TEXT FORMATS:
    // [zotpressInText item="NCXAA92F"]
    // [zotpressInText item="{NCXAA92F}"]
    // [zotpressInText item="{NCXAA92F,10-15}"]
    // [zotpressInText items="{NCXAA92F,10-15},{55MKF89B,1578},{3ITTIXHP}"]
    // [zotpressInText items="{000001:NCXAA92F,10-15},{000003:3ITTIXHP}"]
    // So no multiples without curlies or non-curlies in multiples

    $all_page_instances = array();

    // // Add `ppp` in front of pages, so we can ignore pages later
	// $intextitem["items"] = preg_replace( "/((?=[^}]),(?=[^{]))+/", ",ppp", $intextitem["items"] );
    // REVIEW: Actually, let's just remove pages
    // $items = preg_replace( "/(((,))+([\w\d-]+(})+))++/", "}", $items );
    // REVIEW: Actually, we need them for now, remove later
    // $items = preg_replace( "/((?=[^}]),(?=[^{]))+/", ",ppp", $items );

    // Add api_user_id if not there
    // if ( strpos( $items, $api_user_id ) === false ) // WRONG: assumes default/global api_user_id rather than the one for this shortcode
    if ( strpos( $items, ":" ) === false )
    {
        if (strpos( $items, "{" ) !== false) {
            $items = str_replace( "{", "{".$api_user_id.":", $items );
        } elseif (strpos( $items, "," ) !== false) {
            $items = "{".$api_user_id.":" . str_replace( ",", "},{".$api_user_id.":", $items )."}";
        } else // assume unformatted and single, so place at front
        {
            $items = "{".$api_user_id.":".$items."}";
        }
    }

    // Determine page instances and where
    $temp_items = explode( "},{", $items );
    $all_np = true;

    foreach ( $temp_items as $id => $item )
    {
        // if ( strpos( $item, "," ) !== false ) // assume page/s
        // if ( preg_match( '/,(.)+\}/', $item, $match ) == 1 )
        if ( preg_match( '/,(.)+/', $item, $match ) == 1 )
        {
            // Remove curlies and commas
            $all_page_instances[$id] = str_replace( "}", "", str_replace( ",", "", $match[0] ) );
            $all_np = false;
        }
        else
        {
            $all_page_instances[$id] = "np";
        }
    }

    // REVIEW: Replace ndashes and mdashes with dashes (7.3)
    $items = str_replace("–", "-", str_replace("–", "-", $items));

    // Remove pages from item key/s
    $items = preg_replace( "/(((,))+([\w\d-]+(})+))++/", "}", $items );
    unset($temp_items);


    // Generate instance id for shortcode
    // REVIEW: Changed for new item format
    // e.g., zp-ID--66010-FKNL6ECC-_-66010-FZF9BN8L--wp406
    // $instance_id = "zp-ID-".$api_user_id."-" . str_replace( " ", "_", str_replace( "&", "_", str_replace( "+", "_", str_replace( "/", "_", str_replace( "{", "-", str_replace( "}", "-", str_replace( ",", "_", $items ) ) ) ) ) ) ) ."-".get_the_ID();
    $instance_id = "zp-InText-zp-ID-" . str_replace( " ", "_", str_replace( "&", "_", str_replace( "+", "_", str_replace( "/", "_", str_replace( "{", "-", str_replace( "}", "-", str_replace( ":", "-", str_replace( ",", "_", $items ) ) ) ) ) ) ) ) ."-wp".get_the_ID();

    // Set up array for this post, if it doesn't exist
	if ( ! isset( $GLOBALS['zp_shortcode_instances'][get_the_ID()] ) )
		$GLOBALS['zp_shortcode_instances'][get_the_ID()] = array();

    // Determine if all items are np
    if ( $all_np )
        $all_page_instances = array("np");

    // Then, add the instance to the array
    // REVIEW: Don't need api_user_id ... or maybe need multiple?
    // $GLOBALS['zp_shortcode_instances'][get_the_ID()][] = array( "instance_id" => $instance_id, "api_user_id" =>$api_user_id, "items" => $items );
    $GLOBALS['zp_shortcode_instances'][get_the_ID()][] = array(
        "instance_id" => $instance_id,
        "items" => $items,
        "page_instances" => $all_page_instances
    );

	// Show theme scripts
	$GLOBALS['zp_is_shortcode_displayed'] = true;

	// Output attributes and loading
    // REVIEW: Changed for new format
    // return '<span id="zp-InText-'.$instance_id."-".count($GLOBALS['zp_shortcode_instances'][get_the_ID()]).'"
	// 				class="zp-InText-Citation loading"
	// 				rel="{ \'api_user_id\': \''.$api_user_id.'\', \'pages\': \''.$pages.'\', \'items\': \''.$items.'\', \'format\': \''.$format.'\', \'brackets\': \''.$brackets.'\', \'etal\': \''.$etal.'\', \'separator\': \''.$separator.'\', \'and\': \''.$and.'\' }"></span>';
    $output = '<span class="'.$instance_id.' zp-InText-Citation loading" rel="{ \'pages\': \''.implode("--", $all_page_instances).'\', \'items\': \''.$items.'\', \'format\': \''.$format.'\', \'brackets\': \''.$brackets.'\', \'etal\': \''.$etal.'\', \'separator\': \''.$separator.'\', \'and\': \''.$and.'\' }"></span>';

    return $output;
}


?>
