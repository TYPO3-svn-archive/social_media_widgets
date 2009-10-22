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
 * Plugin 'SMW Flickr' for the 'social_media_widgets' extension.
 *
 * @author	Steffen Kamper <info@sk-typo3.de>
 * @package	TYPO3
 * @subpackage	tx_socialmediawidgets
 */
class tx_socialmediawidgets_flickr extends tx_SocialMediaWidgets_API {
	var $prefixId      = 'tx_socialmediawidgets_flickr';		// Same as class name
	var $scriptRelPath = 'plugins/class.tx_socialmediawidgets_flickr.php';	// Path to this script relative to the extension dir.
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
		$this->addJavascriptFile('jquery.flickrGallery-min.js');

		$GLOBALS['TSFE']->additionalHeaderData['flickr_inline-' . $this->cid] = '<script type="text/javascript">
		jQuery(document).ready(function($) {
			$("#smw-flickr-' . $this->cid . '").flickrGallery({
			api_key: "6682e529b68ecbad4ffe38eb06c2a7b2",
			photoset_ids: ' . json_encode($this->conf['sets']) . '
		});
		});
		</script>';

		$template = $this->cObj->fileResource($this->conf['templateFile']);

		$subpart = $this->cObj->getSubpart($template, '###SMW-FLICKR###');
		$marker = array(
			'###ID###' 		=> $this->cid,
			'###LOGO###'	=> $this->cObj->IMAGE($this->conf['logo.']),
			'###TITLE###'	=> $this->conf['title'],
		);
		$content .= $this->cObj->substituteMarkerArrayCached($subpart, $marker, array());


		return $content;
	}

	protected function mergeConf($flexData) {
		$title = $this->pi_getFFvalue($flexData, 'flickrTitle');
		$link1 = $this->pi_getFFvalue($flexData, 'flickrLink1');
		$link2 = $this->pi_getFFvalue($flexData, 'flickrLink2');
		$type = $this->pi_getFFvalue($flexData, 'flickrType');
		$sets = t3lib_div::trimExplode("\n", $this->pi_getFFvalue($flexData, 'flickrSets'), TRUE);

		$this->conf['title'] = $title ? $title : $this->cObj->stdWrap($this->conf['title'], $this->conf['title.']);
		$this->conf['link1'] = $link1 ? $link1 : $this->cObj->stdWrap($this->conf['link1'], $this->conf['link1.']);
		$this->conf['link2'] = $link2 ? $link2 : $this->cObj->stdWrap($this->conf['link2'], $this->conf['link2.']);
		$this->conf['type'] = $type ? $type : $this->cObj->stdWrap($this->conf['type'], $this->conf['type.']);
		$this->conf['sets'] = count($sets) ? $sets : t3lib_div::trimExplode(',', $this->cObj->stdWrap($this->conf['sets'], $this->conf['sets.']), TRUE);

		if (!is_array($this->conf['link1.'])) $this->conf['link1.'] = array();
		if (!is_array($this->conf['link2.'])) $this->conf['link2.'] = array();
	}
}



if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/plugins/class.tx_socialmediawidgets_flickr.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/plugins/class.tx_socialmediawidgets_flickr.php']);
}

?>