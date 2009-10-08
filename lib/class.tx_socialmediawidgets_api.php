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


/**
 * API for the 'social_media_widgets' extension.
 *
 * @author	Steffen Kamper <info@sk-typo3.de>
 * @package	TYPO3
 * @subpackage	tx_socialmediawidgets
 */
class tx_SocialMediaWidgets_API extends tslib_pibase{

	public $jsScriptBase;
	/**
	 * The constructor
	 *
	 */
	public function init() {
		$this->jsScriptBase = substr(t3lib_extMgm::extRelPath('social_media_widgets') . 'js/', 3);
	}

	public function setJqueryInclude($add) {
		if ($add) {
			$GLOBALS['TSFE']->additionalHeaderData['smw-jquery'] = '<script src="' . $this->jsScriptBase . 'jquery-1.3.2.min.js" type="text/javascript"></script>';
		}
	}

	public function addJavascriptFile($file) {
		$GLOBALS['TSFE']->additionalHeaderData[$file] = '<script src="' . $this->jsScriptBase . $file . '" type="text/javascript"></script>';
	}
	/**
	 * (non-PHPdoc)
	 * @see typo3/sysext/cms/tslib/tslib_pibase#pi_loadLL()
	 */
	public function pi_loadLL()	{
		if (!$this->LOCAL_LANG_loaded)	{
			$basePath = 'EXT:' . $this->extKey . '/languages/plugins.xml';

				// Read the strings in the required charset (since TYPO3 4.2)
			$this->LOCAL_LANG = t3lib_div::readLLfile($basePath, $this->LLkey, $GLOBALS['TSFE']->renderCharset);
			if ($this->altLLkey)	{
				$tempLOCAL_LANG = t3lib_div::readLLfile($basePath, $this->altLLkey);
				$this->LOCAL_LANG = array_merge(is_array($this->LOCAL_LANG) ? $this->LOCAL_LANG : array(),$tempLOCAL_LANG);
			}

				// Overlaying labels from TypoScript (including fictitious language keys for non-system languages!):
			$confLL = $this->conf['_LOCAL_LANG.'];
			if (is_array($confLL)) {
				foreach ($confLL as $k => $lA) {
					if (is_array($lA))	{
						$k = substr($k,0,-1);
						foreach($lA as $llK => $llV)	{
							if (!is_array($llV))	{
								$this->LOCAL_LANG[$k][$llK] = $llV;
									// For labels coming from the TypoScript (database) the charset is assumed to be "forceCharset" and if that is not set, assumed to be that of the individual system languages
								$this->LOCAL_LANG_charset[$k][$llK] = $GLOBALS['TYPO3_CONF_VARS']['BE']['forceCharset'] ? $GLOBALS['TYPO3_CONF_VARS']['BE']['forceCharset'] : $GLOBALS['TSFE']->csConvObj->charSetArray[$k];
							}
						}
					}
				}
			}
		}
		$this->LOCAL_LANG_loaded = 1;
	}


}



if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/lib/class.tx_socialmediawidgets_api.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/social_media_widgets/lib/class.tx_socialmediawidgets_api.php']);
}

?>