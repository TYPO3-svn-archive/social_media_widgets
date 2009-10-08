<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2009 Steffen Kamper <info@sk-typo3.de>
*  All rights reserved
*
*  This script is part of the TYPO3 project. The TYPO3 project is
*  free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  The GNU General Public License can be found at
*  http://www.gnu.org/copyleft/gpl.html.
*
*  This script is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  This copyright notice MUST APPEAR in all copies of the script!
***************************************************************/
/**
 * [CLASS/FUNCTION INDEX of SCRIPT]
 *
 * Hint: use extdeveval to insert/update function index above.
 */

require_once(PATH_tslib.'class.tslib_pibase.php');
require_once(t3lib_extMgm::extPath('social_media_widgets')  .'lib/class.tx_socialmediawidgets_api.php');


/**
 * Plugin 'SMW Youtube' for the 'social_media_widgets' extension.
 *
 * @author	Steffen Kamper <info@sk-typo3.de>
 * @package	TYPO3
 * @subpackage	tx_socialmediawidgets
 */
class tx_socialmediawidgets_youtube extends tx_SocialMediaWidgets_API {
	var $prefixId      = 'tx_socialmediawidgets_youtube';		// Same as class name
	var $scriptRelPath = 'plugins/class.tx_socialmediawidgets_youtube.php';	// Path to this script relative to the extension dir.
	var $extKey        = 'social_media_widgets';	// The extension key.
	var $pi_checkCHash = true;
	var $devKey = 'AI39si6MhlmtrlaV7UDT_L100m2bkOn_f-MbO4O87OBHSZXOY-PK9sJO8IZ2T8ZH947417fS2YuX7NubeMk5TPEmbB4IaSvwvw';

	/**
	 * The main method of the PlugIn
	 *
	 * @param	string		$content: The PlugIn content
	 * @param	array		$conf: The PlugIn configuration
	 * @return	The content that is displayed on the website
	 */
	function main($content, $conf) {
		$this->conf = $conf;
		$this->pi_setPiVarDefaults();
		$this->pi_loadLL();

		$this->pi_initPIflexForm();
		$this->mergeConf($this->cObj->data['pi_flexform']);

		$this->cid = $this->cObj->data['uid'];
		$this->init();

		$this->setJqueryInclude($this->conf['general.']['includeJquery']);
		#$this->addJavascriptFile('jqueryBlockUI.js');
		$this->addJavascriptFile('youtube.js');
		#$eIDLink = $this->cObj->getTypoLink_URL($GLOBALS['TSFE']->id, '&eID=tx_socialmediawidgets&feed=' . $this->conf['url']);

		$template = $this->cObj->fileResource($this->conf['templateFile']);
		$subpart = $this->cObj->getSubpart($template, '###SMW-YOUTUBE###');
		$itemTemplate = $this->cObj->getSubpart($template, '###SMW-YOUTUBE-ITEM###');

		$item = trim(str_replace("\n", '', $itemTemplate));
		$GLOBALS['TSFE']->additionalHeaderData['youtube_inline-' . $this->cid] = '<script type="text/javascript">
		jQuery(document).ready(function($) {
			$("#smw-youtube-' . $this->cid . '").youtube({
				id: "youtubelist' . $this->cid . '",
				type: "channel",
				user: "WWFDeutschland",
				keyword: "WWFDeutschland",
				max_results: 3,
				itemTemplate: \'' . $item . '\'
			});
		});
		</script>';



		$marker = array(
			'###ID###' 		=> $this->cid,
			'###LOGO###'	=> $this->cObj->IMAGE($this->conf['logo.']),
			'###TITLE###'	=> $this->conf['title'],
		);
		$content .= $this->cObj->substituteMarkerArrayCached($subpart, $marker, array());


		return $content;
	}

	protected function mergeConf($flexData) {
		$title = $this->pi_getFFvalue($flexData, 'feedsTitle');
		$interval = $this->pi_getFFvalue($flexData, 'feedsInterval');
		$url = $this->pi_getFFvalue($flexData, 'feedsUrl');
		$link1 = $this->pi_getFFvalue($flexData, 'feedsLink1');
		$link2 = $this->pi_getFFvalue($flexData, 'feedsLink2');
		$count = $this->pi_getFFvalue($flexData, 'feedsCount');
		$crop = $this->pi_getFFvalue($flexData, 'feedsCrop');
		$croptext = $this->pi_getFFvalue($flexData, 'feedsCropText');
		$moretext = $this->pi_getFFvalue($flexData, 'feedsMoreText');

		$this->conf['title'] = $title ? $title : $this->conf['title'];
		$this->conf['interval'] = $interval ? $interval : $this->conf['interval'];
		$this->conf['url'] = $url ? $url : $this->conf['url'];
		$this->conf['link1'] = $link1 ? $link1 : $this->conf['link1'];
		$this->conf['link2'] = $link2 ? $link2 : $this->conf['link2'];
		$this->conf['count'] = $count ? $count : $this->conf['count'];
		$this->conf['crop'] = $crop ? $crop : $this->conf['crop'];
		$this->conf['cropText'] = $croptext ? $croptext : $this->conf['cropText'];
		$this->conf['moreText'] = $moretext ? $moretext : $this->conf['moreText'];
	}
}



if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/plugins/class.tx_socialmediawidgets_youtube.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/plugins/class.tx_socialmediawidgets_youtube.php']);
}

?>