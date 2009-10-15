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
 * Plugin 'SMW Twitter' for the 'social_media_widgets' extension.
 *
 * @author	Steffen Kamper <info@sk-typo3.de>
 * @package	TYPO3
 * @subpackage	tx_socialmediawidgets
 */
class tx_socialmediawidgets_twitter extends tx_SocialMediaWidgets_API {
	var $prefixId      = 'tx_socialmediawidgets_twitter';		// Same as class name
	var $scriptRelPath = 'pplugins/class.tx_socialmediawidgets_twitter.php';	// Path to this script relative to the extension dir.
	var $extKey        = 'social_media_widgets';	// The extension key.
	var $pi_checkCHash = true;

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
		$this->addJavascriptFile('twitter.js');


		$GLOBALS['TSFE']->additionalHeaderData['twitter_inline-' . $this->cid] = '<script type="text/javascript">
		jQuery(document).ready(function($) {
			$("#smw-twitter-' . $this->cid. '").tweet({
				join_text: "auto",
				username: "' . $this->conf['username'] . '",
				avatar_size: ' . intval($this->conf['imageWidth']) . ',
				count: ' . intval($this->conf['count']) . ',
				auto_join_text_default: "",
				auto_join_text_ed: "",
				auto_join_text_ing: "",
				auto_join_text_reply: "",
				auto_join_text_url: "",
				loading_text: "lade Tweets...",
				query: "' . rawurlencode($this->conf['keyword']) . '",
				publicTimeline: ' . ($this->conf['type'] == 0 ? 1 : 0) . '
			});
		});
		</script>';

		$template = $this->cObj->fileResource($this->conf['templateFile']);

		$subpart = $this->cObj->getSubpart($template, '###SMW-TWITTER###');
		
		$link1 = array_merge((array) $this->conf['link1.'], array('parameter' => $this->conf['link1']));
		$link2 = array_merge((array) $this->conf['link2.'], array('parameter' => $this->conf['link2']));
		
		$marker = array(
			'###ID###' 		=> $this->cid,
			'###LOGO###'	=> $this->cObj->IMAGE($this->conf['logo.']),
			'###LINK1###'     => $this->cObj->typolink($this->conf['link1'], $link1),
			'###LINK1_URL###' => $this->cObj->typoLink_URL($link1),
			'###LINK2###'     => $this->cObj->typolink($this->conf['link2'], $link2),
			'###LINK2_URL###' => $this->cObj->typoLink_URL($link2),
		);
		$content .= $this->cObj->substituteMarkerArrayCached($subpart, $marker, array());


		return $content;
	}

	protected function mergeConf($flexData) {
		$imageWidth = $this->pi_getFFvalue($flexData, 'twitterImageWidth');
		$interval = $this->pi_getFFvalue($flexData, 'twitterInterval');
		$type = $this->pi_getFFvalue($flexData, 'twitterType');
		$keyword = $this->pi_getFFvalue($flexData, 'twitterKeyword');
		$link1 = $this->pi_getFFvalue($flexData, 'twitterLink1');
		$link2 = $this->pi_getFFvalue($flexData, 'twitterLink2');
		$count = $this->pi_getFFvalue($flexData, 'twitterCount');

		$this->conf['imageWidth'] = $imageWidth ? $imageWidth : $this->conf['imageWidth'];
		$this->conf['interval'] = $interval ? $interval : $this->conf['interval'];
		$this->conf['type'] = $type ? $type : $this->conf['type'];
		$this->conf['keyword'] = $keyword ? $keyword : $this->conf['keyword'];
		$this->conf['link1'] = $link1 ? $link1 : $this->conf['link1'];
		$this->conf['link2'] = $link2 ? $link2 : $this->conf['link2'];
		$this->conf['count'] = $count ? $count : $this->conf['count'];
	}
}



if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/pi2/class.tx_socialmediawidgets_pi2.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/pi2/class.tx_socialmediawidgets_pi2.php']);
}

?>