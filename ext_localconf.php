<?php
if (!defined ('TYPO3_MODE')) {
 	die ('Access denied.');
}

t3lib_extMgm::addPItoST43($_EXTKEY, 'plugins/class.tx_socialmediawidgets_youtube.php', '_youtube', 'list_type', 1);
t3lib_extMgm::addPItoST43($_EXTKEY, 'plugins/class.tx_socialmediawidgets_twitter.php', '_twitter', 'list_type', 1);
t3lib_extMgm::addPItoST43($_EXTKEY, 'plugins/class.tx_socialmediawidgets_flickr.php', '_flickr', 'list_type', 1);
t3lib_extMgm::addPItoST43($_EXTKEY, 'plugins/class.tx_socialmediawidgets_facebook.php', '_facebook', 'list_type', 1);
t3lib_extMgm::addPItoST43($_EXTKEY, 'plugins/class.tx_socialmediawidgets_feeds.php', '_feeds', 'list_type', 1);

	// register eID script for install tool AJAX calls
$TYPO3_CONF_VARS['FE']['eID_include']['tx_socialmediawidgets'] = 'EXT:' . $_EXTKEY . '/lib/class.tx_socialmediawidgets_eid.php';
?>