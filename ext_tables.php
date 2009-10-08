<?php
if (!defined ('TYPO3_MODE')) {
	die ('Access denied.');
}

t3lib_div::loadTCA('tt_content');
$TCA['tt_content']['types']['list']['subtypes_excludelist'][$_EXTKEY.'_youtube']='layout,select_key';
$TCA['tt_content']['types']['list']['subtypes_addlist'][$_EXTKEY.'_youtube']='pi_flexform';
t3lib_extMgm::addPiFlexFormValue($_EXTKEY.'_youtube', 'FILE:EXT:'.$_EXTKEY.'/flexforms/youtube.xml');

t3lib_extMgm::addPlugin(array(
	'LLL:EXT:social_media_widgets/languages/general.xml:tt_content.list_type_youtube',
	$_EXTKEY . '_youtube',
	t3lib_extMgm::extRelPath($_EXTKEY) . 'ext_icon.gif'
),'list_type');



$TCA['tt_content']['types']['list']['subtypes_excludelist'][$_EXTKEY.'_twitter']='layout,select_key';
$TCA['tt_content']['types']['list']['subtypes_addlist'][$_EXTKEY.'_twitter']='pi_flexform';
t3lib_extMgm::addPiFlexFormValue($_EXTKEY.'_twitter', 'FILE:EXT:'.$_EXTKEY.'/flexforms/twitter.xml');

t3lib_extMgm::addPlugin(array(
	'LLL:EXT:social_media_widgets/languages/general.xml:tt_content.list_type_twitter',
	$_EXTKEY . '_twitter',
	t3lib_extMgm::extRelPath($_EXTKEY) . 'ext_icon.gif'
),'list_type');


$TCA['tt_content']['types']['list']['subtypes_excludelist'][$_EXTKEY.'_flickr']='layout,select_key';
$TCA['tt_content']['types']['list']['subtypes_addlist'][$_EXTKEY.'_flickr']='pi_flexform';
t3lib_extMgm::addPiFlexFormValue($_EXTKEY.'_flickr', 'FILE:EXT:'.$_EXTKEY.'/flexforms/flickr.xml');

t3lib_extMgm::addPlugin(array(
	'LLL:EXT:social_media_widgets/languages/general.xml:tt_content.list_type_flickr',
	$_EXTKEY . '_flickr',
	t3lib_extMgm::extRelPath($_EXTKEY) . 'ext_icon.gif'
),'list_type');


$TCA['tt_content']['types']['list']['subtypes_excludelist'][$_EXTKEY.'_facebook']='layout,select_key';
$TCA['tt_content']['types']['list']['subtypes_addlist'][$_EXTKEY.'_facebook']='pi_flexform';
t3lib_extMgm::addPiFlexFormValue($_EXTKEY.'_facebook', 'FILE:EXT:'.$_EXTKEY.'/flexforms/facebook.xml');

t3lib_extMgm::addPlugin(array(
	'LLL:EXT:social_media_widgets/languages/general.xml:tt_content.list_type_facebook',
	$_EXTKEY . '_facebook',
	t3lib_extMgm::extRelPath($_EXTKEY) . 'ext_icon.gif'
),'list_type');


$TCA['tt_content']['types']['list']['subtypes_excludelist'][$_EXTKEY.'_feeds']='layout,select_key';
$TCA['tt_content']['types']['list']['subtypes_addlist'][$_EXTKEY.'_feeds']='pi_flexform';
t3lib_extMgm::addPiFlexFormValue($_EXTKEY.'_feeds', 'FILE:EXT:'.$_EXTKEY.'/flexforms/feeds.xml');

t3lib_extMgm::addPlugin(array(
	'LLL:EXT:social_media_widgets/languages/general.xml:tt_content.list_type_feeds',
	$_EXTKEY . '_feeds',
	t3lib_extMgm::extRelPath($_EXTKEY) . 'ext_icon.gif'
),'list_type');

// Add static files
t3lib_extMgm::addStaticFile($_EXTKEY,'static/social_media_widgets/', 'Social Media Widgets');
?>