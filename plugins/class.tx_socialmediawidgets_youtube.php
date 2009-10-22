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
		$this->addJavascriptFile('youtube' . ($this->conf['general.']['debug'] ? '' : '.min') . '.js');
		$this->addJavascriptFile('ytblockui' . ($this->conf['general.']['debug'] ? '' : '.min') . '.js');
		$eIDLink = $this->cObj->getTypoLink_URL($GLOBALS['TSFE']->id, '&eID=tx_socialmediawidgets');


		$template = $this->cObj->fileResource($this->conf['templateFile']);
		$subpart = $this->cObj->getSubpart($template, '###SMW-YOUTUBE' . intval($this->conf['useItemTemplate']) . '###');
		$itemTemplate = $this->cObj->getSubpart($template, '###SMW-YOUTUBE-ITEM' . intval($this->conf['useItemTemplate']) . '###');

		if (strpos($this->conf['keyword'], ',') !== false) {
			$keyword = t3lib_div::trimExplode(',', $this->conf['keyword'], TRUE);
			$keyword = array_map('rawurlencode', $keyword);
			$keyword = implode('+', $keyword);
		} else {
			$keyword = rawurlencode($this->conf['keyword']);
		}

		if ($this->conf['linkType == 0']) {
			$width = intval($this->conf['player.']['width']) ? intval($this->conf['player.']['width']) : 450;
			$height = intval($this->conf['player.']['height']) ? intval($this->conf['player.']['height']) : 380;
		} else {
			$width = intval($this->conf['player.']['inlineWidth']) ? intval($this->conf['player.']['inlineWidth']) : 300;
			$height = intval($this->conf['player.']['inlineHeight']) ? intval($this->conf['player.']['inlineHeight']) : 200;
		}

		$item = trim(preg_replace("/[\f\n\r\t\v]+/", "", $itemTemplate));
		$GLOBALS['TSFE']->additionalHeaderData['youtube_inline-' . $this->cid] = '<script type="text/javascript">
		jQuery(document).ready(function($) {
			$("#smw-youtube-' . $this->cid . '").youtube({
				id: "youtubelist' . $this->cid . '",
				eID: "' . $eIDLink . '",
				type: "' . $this->conf['type'] . '",
				user: "' . rawurlencode($this->conf['user']) . '",
				keyword: "' . $keyword . '",
				max_results: ' . intval($this->conf['count']) . ',
				thumbWidth: ' . (intval($this->conf['imageWidth']) === 0 ? 'null' : intval($this->conf['imageWidth'])) . ',
				itemTemplate: \'' . $item . '\',
				standardFilter: "' . $this->conf['standardFilter'] . '",
				standardRegion: "' . $this->conf['standardRegion'] . '",
				standardTime: "' . $this->conf['standardTime'] . '",
				durationPrefix: "' . $this->pi_getLL('youtube.time') . '",
				categories: "' . $this->conf['category'] . '",
				ytPlayerWidth: ' . $width . ' ,
				ytPlayerHeight: ' . $height . ',
				linkType: ' . intval($this->conf['linkType']) . '
			});
		});
		</script>';


		$link1 = array_merge($this->conf['link1.'], array('parameter' => $this->conf['link1']));
		$link2 = array_merge($this->conf['link2.'], array('parameter' => $this->conf['link2']));

		$marker = array(
			'###ID###'        => $this->cid,
			'###LOGO###'      => $this->cObj->IMAGE($this->conf['logo.']),
			'###TITLE###'     => $this->conf['title'],
			'###LINK1###'     => $this->cObj->typolink($this->conf['link1'], $link1),
			'###LINK1_URL###' => $this->cObj->typoLink_URL($link1),
			'###LINK2###'     => $this->cObj->typolink($this->conf['link2'], $link2),
			'###LINK2_URL###' => $this->cObj->typoLink_URL($link2),
		);
		$content .= $this->cObj->substituteMarkerArrayCached($subpart, $marker, array());


		return $content;
	}

	protected function mergeConf($flexData) {
		$imageWidth = $this->pi_getFFvalue($flexData, 'youtubeImageWidth');
		$type = $this->pi_getFFvalue($flexData, 'youtubeType');
		$keyword = $this->pi_getFFvalue($flexData, 'youtubeKeyword');
		$user = $this->pi_getFFvalue($flexData, 'youtubeUser');
		$link1 = $this->pi_getFFvalue($flexData, 'youtubeLink1');
		$link2 = $this->pi_getFFvalue($flexData, 'youtubeLink2');
		$count = $this->pi_getFFvalue($flexData, 'youtubeCount');
		$useItemTemplate = $this->pi_getFFvalue($flexData, 'youtubeItemTemplate');
		$standardFilter = $this->pi_getFFvalue($flexData, 'youtubeStandardFilter');
		$standardRegion = $this->pi_getFFvalue($flexData, 'youtubeStandardRegion');
		$standardTime = $this->pi_getFFvalue($flexData, 'youtubeStandardTime');
		$title = $this->pi_getFFvalue($flexData, 'youtubeTitle');
		$category = $this->pi_getFFvalue($flexData, 'youtubeCategory');
		$template = $this->pi_getFFvalue($flexData, 'youtubeTemplate');
		$linkType = $this->pi_getFFvalue($flexData, 'youtubeLinkType');

		$this->conf['imageWidth'] = $imageWidth ? $imageWidth : $this->cObj->stdWrap($this->conf['imageWidth'], $this->conf['imageWidth.']);
		$this->conf['type'] = $type ? $type : $this->cObj->stdWrap($this->conf['type'], $this->conf['type.']);
		$this->conf['user'] = $user ? $user : $this->cObj->stdWrap($this->conf['user'], $this->conf['user.']);
		$this->conf['keyword'] = $keyword ? $keyword : $this->cObj->stdWrap($this->conf['keyword'], $this->conf['keyword.']);
		$this->conf['link1'] = $link1 ? $link1 : $this->cObj->stdWrap($this->conf['link1'], $this->conf['link1.']);
		$this->conf['link2'] = $link2 ? $link2 : $this->cObj->stdWrap($this->conf['link2'], $this->conf['link2.']);
		$this->conf['count'] = $count ? $count : $this->cObj->stdWrap($this->conf['count'], $this->conf['count.']);
		$this->conf['useItemTemplate'] = $useItemTemplate ? $useItemTemplate : $this->cObj->stdWrap($this->conf['useItemTemplate'], $this->conf['useItemTemplate.']);
		$this->conf['standardFilter'] = $standardFilter ? $standardFilter : $this->cObj->stdWrap($this->conf['standardFilter.']);
		$this->conf['standardRegion'] = $standardRegion ? $standardRegion : $this->cObj->stdWrap($this->conf['standardRegion'], $this->conf['standardRegion.']);
		$this->conf['standardTime'] = $standardTime ? $standardTime : $this->cObj->stdWrap($this->conf['standardTime'], $this->conf['standardTime.']);
		$this->conf['title'] = $title ? $title : $this->cObj->stdWrap($this->conf['title'], $this->conf['title.']);
		$this->conf['category'] = $category ? $category : $this->cObj->stdWrap($this->conf['category'], $this->conf['category.']);
		$this->conf['templateFile'] = $template ? $template : $this->cObj->stdWrap($this->conf['templateFile'], $this->conf['templateFile.']);
		$this->conf['linkType'] = $linkType ? $linkType : $this->cObj->stdWrap($this->conf['linkType'], $this->conf['linkType.']);

		if (!is_array($this->conf['link1.'])) $this->conf['link1.'] = array();
		if (!is_array($this->conf['link2.'])) $this->conf['link2.'] = array();
	}
}



if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/plugins/class.tx_socialmediawidgets_youtube.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/plugins/class.tx_socialmediawidgets_youtube.php']);
}

?>