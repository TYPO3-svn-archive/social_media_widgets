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
#<script type="text/javascript">FB.init("3af3940fb6dcdb4823c7db5d1f4ccfd9");</script>
#<fb:fan profile_id="30674257397" stream="1" connections="10" width="312"></fb:fan>
require_once(PATH_tslib.'class.tslib_pibase.php');
require_once(t3lib_extMgm::extPath('social_media_widgets')  .'lib/class.tx_socialmediawidgets_api.php');

/**
 * Plugin 'SMW Facebook' for the 'social_media_widgets' extension.
 *
 * @author	Steffen Kamper <info@sk-typo3.de>
 * @package	TYPO3
 * @subpackage	tx_socialmediawidgets
 */
class tx_socialmediawidgets_facebook extends tx_SocialMediaWidgets_API {
	var $prefixId      = 'tx_socialmediawidgets_facebook';		// Same as class name
	var $scriptRelPath = 'pi4/class.tx_socialmediawidgets_facebook.php';	// Path to this script relative to the extension dir.
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
		$this->checkConnect();

		$template = $this->cObj->fileResource($this->conf['templateFile']);

		$this->setJqueryInclude($this->conf['general.']['includeJquery']);
		$this->addJavascriptFile('http://static.ak.connect.facebook.com/js/api_lib/v0.4/FeatureLoader.js.php', FALSE);
		$eIDLink = $this->cObj->getTypoLink_URL($GLOBALS['TSFE']->id, '&eID=tx_socialmediawidgets&feed=' . $this->conf['url']);

		$GLOBALS['TSFE']->additionalHeaderData['facebook-init'] = '<script type="text/javascript">
		jQuery(document).ready(function($) {
			FB.init("' . $this->conf['identifier'] . '");
		});
		</script>';

		if ($this->conf['type'] == 'custom') {
			$fb = $this->conf['customCode'];
		} else {
			$fb = $this->cObj->getSubpart($template, '###' . strtoupper($this->conf['type']) . '###');
		}



		$subpart = $this->cObj->getSubpart($template, '###SMW-FACEBOOK###');
		$subpart = str_replace('###FACEBOOKAPP###', $fb, $subpart);
		$marker = array(
			'###ID###' 		=> $this->cid,
			'###LOGO###'	=> $this->cObj->IMAGE($this->conf['logo.']),
			'###TITLE###'	=> $this->conf['title'],
			'###USERID###'	=> $this->conf['key'],
			'###LINK1###'     => $this->cObj->typolink($this->conf['link1'], $link1),
			'###LINK1_URL###' => $this->cObj->typoLink_URL($link1),
			'###LINK2###'     => $this->cObj->typolink($this->conf['link2'], $link2),
			'###LINK2_URL###' => $this->cObj->typoLink_URL($link2),
		);
		$content .= $this->cObj->substituteMarkerArrayCached($subpart, $marker, array());


		return $content;
	}

	protected function mergeConf($flexData) {
		$title = $this->pi_getFFvalue($flexData, 'facebookTitle');
		$type = $this->pi_getFFvalue($flexData, 'facebookType');
		$identifier = $this->pi_getFFvalue($flexData, 'facebookIdentifier');
		$key = $this->pi_getFFvalue($flexData, 'facebookKey');
		$customCode = $this->pi_getFFvalue($flexData, 'facebookCustomCode');
		$link1 = $this->pi_getFFvalue($flexData, 'facebookLink1');
		$link2 = $this->pi_getFFvalue($flexData, 'facebookLink2');


		$this->conf['title'] = $title ? $title : $this->conf['title'];
		$this->conf['type'] = $type ? $type : $this->conf['type'];
		$this->conf['identifier'] = $identifier ? $identifier : $this->conf['apiKey'];
		$this->conf['key'] = $key ? $key : $this->conf['key'];
		$this->conf['customCode'] = $customCode ? $customCode : $this->conf['customCode'];
		$this->conf['link1'] = $link1 ? $link1 : $this->conf['link1'];
		$this->conf['link2'] = $link2 ? $link2 : $this->conf['link2'];
	}

	protected function checkConnect() {
		if (file_exists(PATH_site . 'xd_receiver.htm')) {
			return;
		}
		$fbConnect = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>xd</title></head><body><script src="http://static.ak.facebook.com/js/api_lib/v0.4/XdCommReceiver.js" type="text/javascript"></script></body></html>';
		file_put_contents(PATH_site . 'xd_receiver.htm', $fbConnect);
	}
}



if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/plugins/class.tx_socialmediawidgets_facebook.php']) {
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/plugins/class.tx_socialmediawidgets_facebook.php']);
}

?>