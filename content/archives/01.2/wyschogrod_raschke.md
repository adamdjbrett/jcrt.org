---
title: "JUDUL TIDAK DITEMUKAN - PERLU EDIT MANUAL"
---

Line wrap

<html>

<head><script src\="[//archive.org/includes/athena.js](https://archive.org/includes/athena.js)" type\="text/javascript"></script>

<script type\="text/javascript">window.addEventListener('DOMContentLoaded',function(){var v=archive\_analytics.values;v.service='wb';v.server\_name='wwwb-app227.us.archive.org';v.server\_ms=163;archive\_analytics.send\_pageview({});});</script>

<script type\="text/javascript" src\="[https://web-static.archive.org/\_static/js/bundle-playback.js?v=Hk4-lkW3](https://web-static.archive.org/_static/js/bundle-playback.js?v=Hk4-lkW3)" charset\="utf-8"></script>

<script type\="text/javascript" src\="[https://web-static.archive.org/\_static/js/wombat.js?v=txqj7nKC](https://web-static.archive.org/_static/js/wombat.js?v=txqj7nKC)" charset\="utf-8"></script>

<script>window.RufflePlayer=window.RufflePlayer||{};window.RufflePlayer.config={"autoplay":"on","unmuteOverlay":"hidden","showSwfDownload":true};</script>

<script type\="text/javascript" src\="[https://web-static.archive.org/\_static/js/ruffle/ruffle.js](https://web-static.archive.org/_static/js/ruffle/ruffle.js)"></script>

<script type\="text/javascript">

\_\_wm.init("https://web.archive.org/web");

\_\_wm.wombat("http://www.jcrt.org:80/archives/01.2/index.html?page=wyschogrod\_raschke.shtml","20010503043257","https://web.archive.org/","web","https://web-static.archive.org/\_static/",

"988864377");

</script>

<link rel\="stylesheet" type\="text/css" href\="[https://web-static.archive.org/\_static/css/banner-styles.css?v=1utQkbB3](https://web-static.archive.org/_static/css/banner-styles.css?v=1utQkbB3)" />

<link rel\="stylesheet" type\="text/css" href\="[https://web-static.archive.org/\_static/css/iconochive.css?v=3PDvdIFv](https://web-static.archive.org/_static/css/iconochive.css?v=3PDvdIFv)" />

<!-- End Wayback Rewrite JS Include -->

  

<title>JCRT Issue 1.2 - Contents</title>

<meta name\="ROBOTS" content\="NOINDEX,NOFOLLOW">

  

<!--

Joust Outliner Version 2.4

(c) Copyright 1996-1999, Alchemy Computing Limited. All rights reserved.

This code may be freely copied and distributed provided that it is accompanied by this header.

  

Do not modify anything between here and the "End of Joust" marker other than the "Initialise" function

unless you know what you are doing. You can find the latest version of Joust and all associated files and

help at http://www.alchemy-computing.co.uk/joust/. If you have any questions/problems visit the

Joust User Forum at http://www.customforum.com/joust/

\-->

<script language\="JavaScript">

<!--

function getDHTMLObj(docName, objName) {return eval(docName + theBrowser.DHTMLRange + '.' + objName + theBrowser.DHTMLStyleObj);}

function getDHTMLObjTop(theObj) {return (theBrowser.code == "MSIE") ? theObj.pixelTop : theObj.top;}

function getDHTMLObjHeight(docName, objName) {return eval(docName + theBrowser.DHTMLRange + '.' + objName + theBrowser.DHTMLDivHeight);}

function getDHTMLImg(docName, objName, imgName) {

return (theBrowser.code == 'MSIE') ? eval(docName + '.all.' + imgName) : getDHTMLObj(docName, objName).document.images\[imgName\];

}

function simpleArray() {this.item = 0;}

function imgStoreItem(n, s, w, h) {

this.name = n;

this.src = s;

this.obj = null;

this.w = w;

this.h = h;

if ((theBrowser.canCache) && (s)) {

this.obj = new Image(w, h);

this.obj.src = s;

}

}

function imgStoreObject() {

this.count = -1;

this.img = new imgStoreItem;

this.find = imgStoreFind;

this.add = imgStoreAdd;

this.getSrc = imgStoreGetSrc;

this.getTag = imgStoreGetTag;

}

function imgStoreFind(theName) {

var foundItem = -1;

for (var i = 0; i <= this.count; i++) {if (this.img\[i\].name == theName) {foundItem = i;break;}}

return foundItem;

}

function imgStoreAdd(n, s, w, h) {

var i = this.find(n);

if (i == -1) {i = ++this.count;}

this.img\[i\] = new imgStoreItem(n, s, parseInt(w, 10), parseInt(h, 10));

}

function imgStoreGetSrc(theName) {

var i = this.find(theName);

return (i == -1) ? '' : this.img\[i\].obj.src;

}

function imgStoreGetTag(theName, iconID, altText) {

var i = this.find(theName);

if (i < 0) {return ''}

with (this.img\[i\]) {

if (src == '') {return ''}

var tag = '<img src="' + src + '" width="' + w + '" height="' + h + '" border="0" align="left" hspace="0" vspace="0"';

tag += (iconID != '') ? ' name="' + iconID + '"' : '';

tag += ' alt="' + ((altText)?altText:'') + '">';

}

return tag;

}

// The MenuItem object. This contains the data and functions for drawing each item.

function MenuItem (owner, id, type, text, url, status, nItem, pItem, parent) {

this.owner = owner;

this.id = id;

this.type = type;

this.text = text;

this.url = url;

this.status = status;

this.target = owner.defaultTarget;

this.nextItem = nItem;

this.prevItem = pItem;

this.FirstChild = -1;

this.parent = parent;

this.isopen = false;

this.isSelected = false;

this.draw = MIDraw;

this.PMIconName = MIGetPMIconName;

this.docIconName = MIGetDocIconName;

this.setImg = MISetImage;

this.setIsOpen = MISetIsOpen;

this.setSelected = MISetSelected;

this.mouseOver = MIMouseOver;

this.mouseOut = MIMouseOut;

var i = (this.owner.imgStore) ? this.owner.imgStore.find(type) : -2;

if (i == -1) {i = this.owner.imgStore.find('iconPlus');}

this.height = (i > -1) ? this.owner.imgStore.img\[i\].h : 0;

}

function MIDraw (indentStr) {

var o = this.owner;

var mRef = '="return ' + o.reverseRef + "." + o.name;

var tmp = mRef + '.entry\[' + this.id + '\].';

var MOver = ' onMouseOver' + tmp + 'mouseOver(\\''

var MOut = ' onMouseOut' + tmp + 'mouseOut(\\''

var iconTag = o.imgStore.getTag(this.PMIconName(), 'plusMinusIcon' + this.id, '');

var aLine = '<nobr>' + indentStr;

if (!this.noOutlineImg) {

if (this.FirstChild != -1) {

aLine += '<A HREF="#"'

\+ ' onClick' + mRef + '.toggle(' + this.id + ');"'

\+ MOver + 'plusMinusIcon\\',this);"'

\+ MOut + 'plusMinusIcon\\');">' + iconTag + '</A>';

} else {

aLine += iconTag;

}

}

var tip = eval('this.' + o.tipText);

var theEntry = o.imgStore.getTag(this.docIconName(), 'docIcon' + this.id, tip) + this.text;

var theImg = o.imgStore.getTag(this.docIconName(), 'docIcon' + this.id, tip);

var sTxt = '<SPAN CLASS="' + ((this.CSSClass) ? this.CSSClass : ((this.FirstChild != -1) ? 'node' : 'leaf')) + '">';

var lTxt = '<A NAME="joustEntry' + this.id + '"';

var theUrl = (((this.url == '') && theBrowser.canJSVoid && o.showAllAsLinks) || this.noOutlineImg || o.wizardInstalled) ? 'javascript:void(0);' : this.url;

if (theUrl != '') {

if (this.target == "\_top") {theUrl = "javascript:" + o.reverseRef + ".loadURLInTop('" + theUrl + "');";}

lTxt += ' HREF="' + theUrl + '"'

\+ ' TARGET="' + this.target + '"'

\+ ' onClick' + mRef + '.itemClicked(' + this.id + ');"'

\+ MOver + 'docIcon\\',this);"'

\+ MOut + 'docIcon\\');"';

}

lTxt += (tip) ? ' TITLE="' + tip + '">' : '>';

aLine += sTxt + lTxt + theImg;

if (this.multiLine) {

aLine += '</A></SPAN><TABLE BORDER="0" CELLPADDING="0" CELLSPACING="0"><TR><TD>'

\+ sTxt + lTxt + this.text + '</A></SPAN></TD></TR></TABLE>';

} else {

aLine += this.text + '</A></SPAN>';

}

aLine += '</nobr>';

return aLine

}

function MIGetPMIconName() {

var n = 'icon' + ((this.FirstChild != -1) ? ((this.isopen == true) ? 'Minus' : 'Plus') : 'Join');

n += (this.id == this.owner.firstEntry) ? ((this.nextItem == -1) ? 'Only' : 'Top') : ((this.nextItem == -1) ? 'Bottom' : '');

return n;

}

function MIGetDocIconName() {

var is = this.owner.imgStore; var n = this.type;

n += ((this.isopen) && (is.getSrc(n + 'Expanded') != '')) ? 'Expanded' : '';

n += ((this.isSelected) && (is.getSrc(n + 'Selected') != '')) ? 'Selected' : '';

return n;

}

function MISetImage(imgID, imgName) {

var o = this.owner; var imgSrc = o.imgStore.getSrc(imgName);

if ((imgSrc != '') && (theBrowser.canCache) && (!o.amBusy)) {

var img = (theBrowser.hasDHTML) ? getDHTMLImg(o.container + '.document', 'entryDIV' + this.id, imgID) : eval(o.container).document.images\[imgID\];

if (img) {img.src = imgSrc;}

}

}

function MISetIsOpen (isOpen) {

if ((this.isopen != isOpen) && (this.FirstChild != -1)) {

this.isopen = isOpen;

this.setImg('plusMinusIcon' + this.id, this.PMIconName());

this.setImg('docIcon' + this.id, this.docIconName(false));

return true;

} else {

return false;

}

}

function MISetSelected (isSelected) {

this.isSelected = isSelected;

this.setImg('docIcon' + this.id, this.docIconName(false));

if ((this.parent >= 0) && this.owner.selectParents) {this.owner.entry\[this.parent\].setSelected(isSelected);}

}

function MIMouseOver(imgName, theURL) {

eval(this.owner.container).status = ''; //Needed for setStatus to work on MSIE 3 - Go figure!?

var newImg = '';

var s = '';

if (imgName == 'plusMinusIcon') {

newImg = this.PMIconName();

s = 'Click to ' + ((this.isopen == true) ? 'collapse.' : 'expand.');

} else {

if (imgName == 'docIcon') {

newImg = this.docIconName();

s = (this.status != null) ? this.status : theURL;

}

}

setStatus(s);

if (theBrowser.canOnMouseOut) {this.setImg(imgName + this.id, newImg + 'MouseOver');}

if(this.onMouseOver) {var me=this;eval(me.onMouseOver);}

return true;

}

function MIMouseOut(imgName) {

clearStatus();

var newImg = '';

if (imgName == 'plusMinusIcon') {

newImg = this.PMIconName();

} else {

if (imgName == 'docIcon') {newImg = this.docIconName();}

}

this.setImg(imgName + this.id, newImg);

if(this.onMouseOut) {var me=this;eval(me.onMouseOut);}

return true;

}

// The Menu object. This is basically an array object although the data in it is a tree.

function Menu () {

this.count = -1;

this.version = '2.4 beta';

this.firstEntry = -1;

this.autoScrolling = false;

this.modalFolders = false;

this.linkOnExpand = false;

this.toggleOnLink = false;

this.showAllAsLinks = false;

this.savePage = true;

this.name = 'theMenu';

this.container = 'menu';

this.reverseRef = 'parent';

this.contentFrame = 'text';

this.defaultTarget = 'text';

this.tipText = 'none';

this.selectParents = false;

this.lastPMClicked = -1;

this.selectedEntry = -1;

this.wizardInstalled = false;

this.amBusy = true;

this.maxHeight = 0;

this.imgStore = new imgStoreObject;

this.entry = new MenuItem(this, 0, '', '', '', '', -1, -1, -1);

this.contentWin = MenuGetContentWin;

this.getEmptyEntry = MenuGetEmptyEntry;

this.addEntry = MenuAddEntry;

this.addMenu = MenuAddEntry;

this.addChild = MenuAddChild;

this.rmvEntry = MenuRmvEntry;

this.rmvChildren = MenuRmvChildren;

this.draw = MenuDraw;

this.drawALevel = MenuDrawALevel;

this.refresh = MenuRefresh;

this.reload = MenuReload;

this.refreshDHTML = MenuRefreshDHTML;

this.scrollTo = MenuScrollTo;

this.itemClicked = MenuItemClicked;

this.selectEntry = MenuSelectEntry;

this.setEntry = MenuSetEntry;

this.setEntryByURL = MenuSetEntryByURL;

this.setAllChildren = MenuSetAllChildren;

this.setAll = MenuSetAll;

this.openAll = MenuOpenAll;

this.closeAll = MenuCloseAll;

this.findEntry = MenuFindEntry;

this.toggle = MenuToggle;

}

function MenuGetContentWin() {

return eval(((myOpener != null) ? 'myOpener.' : 'self.') + this.contentFrame);

}

function MenuGetEmptyEntry() {

for (var i = 0; i <= this.count; i++) {if (this.entry\[i\] == null) {break;}}

if (i > this.count) {this.count = i};

return i

}

function MenuAddEntry (addTo, type, text, url, status, insert) {

if (!insert) {insert=false;}

var theNI = -1;var theP = -1;var thePI = -1;

if (addTo < 0) {

var i = addTo = this.firstEntry;

if (!insert) {while (i > -1) {addTo = i;i = this.entry\[i\].nextItem;}}

}

if (addTo >= 0) {

var e = this.entry\[addTo\];

if (!e) {return -1;}

thePI = (insert)?e.prevItem:addTo;

theNI = (insert)?addTo:e.nextItem;

theP = e.parent;

}

var eNum = this.getEmptyEntry();

if (thePI >= 0) {

this.entry\[thePI\].nextItem = eNum;

} else {

if (theP >= 0) {

this.entry\[theP\].FirstChild = eNum;

} else {

this.firstEntry = eNum;

}

}

if (theNI >= 0) {this.entry\[theNI\].prevItem = eNum;}

this.entry\[eNum\] = new MenuItem(this, eNum, type, text, url, status, theNI, thePI, theP);

return eNum;

}

function MenuAddChild (addTo, type, text, url, status, insert) {

if (!insert) {insert=false;}

var eNum = -1;

if ((this.count == -1) || (addTo < 0)) {

eNum = this.addEntry(-1, type, text, url, status, false);

} else {

var e = this.entry\[addTo\];

if (!e) {return -1;}

var cID = e.FirstChild;

if (cID < 0) {

e.FirstChild = eNum = this.getEmptyEntry();

this.entry\[eNum\] = new MenuItem(this, eNum, type, text, url, status, -1, -1, addTo);

} else {

while (!insert && (this.entry\[cID\].nextItem >= 0)) {cID = this.entry\[cID\].nextItem;}

eNum = this.addEntry(cID, type, text, url, status, insert);

}

}

return eNum;

}

function MenuRmvEntry (theEntry) {

var e = this.entry\[theEntry\];

if (e == null) {return;}

var p = e.prevItem;

var n = e.nextItem;

if (e.FirstChild > -1) {this.rmvChildren(theEntry);}

if (this.firstEntry == theEntry) {this.firstEntry = n}

if (this.selectedEntry == theEntry) {this.selectedEntry = n}

if (p > -1) {

this.entry\[p\].nextItem = n;

} else {

if (e.parent > -1) {

this.entry\[e.parent\].FirstChild = n;

} else {

if (this.firstEntry == theEntry) {this.firstEntry = n}

}

}

if (n > -1) {this.entry\[n\].prevItem = p;}

this.entry\[theEntry\] = null;

}

function MenuRmvChildren (theP) {

var eNum;var e;var tmp;

if (theP == -1) {

eNum = this.firstEntry;

this.firstEntry = -1;

} else {

eNum = this.entry\[theP\].FirstChild;

this.entry\[theP\].FirstChild = -1;

}

while (eNum > -1) {

e = this.entry\[eNum\];

if (e.FirstChild > -1) {this.rmvChildren(eNum);}

if (this.selectedEntry == eNum) {this.selectedEntry = e.parent;}

tmp = eNum;

eNum = e.nextItem;

this.entry\[tmp\] = null;

}

}

function MenuDraw() {

this.maxHeight = 0;

theDoc = eval(this.container + ".document");

eval(this.container).document.writeln(this.drawALevel(this.firstEntry, '', true, theDoc));

if (theBrowser.hasDHTML) {

for (var i = 0; i <= this.count; i++) {

if (this.entry\[i\]) {

this.maxHeight += getDHTMLObjHeight(this.container + '.document', 'entryDIV' + i);

}

}

} else {

if ((this.lastPMClicked > 0) && theBrowser.mustMoveAfterLoad && this.autoScrolling) {

this.scrollTo(this.lastPMClicked);

}

}

}

function MenuDrawALevel(firstItem, indentStr, isVisible, theDoc) {

var currEntry = firstItem;

var padImg = "";

var aLine = "";

var theLevel = "";

var e = null;

while (currEntry > -1) {

e = this.entry\[currEntry\];

aLine = e.draw(indentStr);

if (theBrowser.hasDHTML) {

aLine = '<DIV ID="entryDIV' + currEntry + '" CLASS="menuItem">' + aLine + '</DIV>';

} else {

aLine += '<BR CLEAR="ALL">';

}

theBrowser.lineByLine = true;

if (theBrowser.lineByLine) {theDoc.writeln(aLine);} else {theLevel += aLine;}

if ((e.FirstChild > -1) && ((theBrowser.hasDHTML || (e.isopen && isVisible)))) {

padImg = (e.noOutlineImg) ? '' : this.imgStore.getTag((e.nextItem == -1) ? 'iconBlank' : 'iconLine', '', '');

theLevel += this.drawALevel(e.FirstChild, indentStr + padImg, (e.isopen && isVisible), theDoc);

}

currEntry = e.nextItem;

}

return theLevel;

}

function MenuRefresh() {

if (theBrowser.hasDHTML) {

if (!this.amBusy) {

this.refreshDHTML();

if (this.autoScrolling) {this.scrollTo(this.lastPMClicked);}

}

} else {

this.reload();

}

}

function MenuReload() {

if (!this.amBusy) {

this.amBusy = true;

var l = eval(this.container).location;

var rm = theBrowser.reloadMethod;

var newLoc = fixPath(l.pathname);

if (theBrowser.code == 'OP') {var d = new Date(); newLoc += '?' + d.getTime();}

if (this.autoScrolling && (this.lastPMClicked > 0) && !theBrowser.mustMoveAfterLoad) {

newLoc += "#joustEntry" + this.lastPMClicked;

}

if (rm == 'replace') {

l.replace(newLoc);

} else {

if (rm == 'reload') {

l.reload();

} else {

if (rm == 'timeout') {

setTimeout(this.container + ".location.href ='" + newLoc + "';", 100);

} else {

l.href = newLoc;

}

}

}

}

}

function MenuRefreshDHTML() {

var nextItemArray = new simpleArray;

var currEntry = this.firstEntry;

var level = (currEntry == -1) ? 0 : 1;

var isVisible = true;

var lastVisibleLevel = 1;

var co = eval(this.container);

var yPos = co.menuStart;

var d = this.container + '.document';

var e = null;var s = null;

while (level > 0) {

e = this.entry\[currEntry\];

s = getDHTMLObj(d, 'entryDIV' + currEntry);

if (isVisible) {

s.top = yPos;

s.visibility = 'visible';

yPos += getDHTMLObjHeight(d, 'entryDIV' + currEntry);

lastVisibleLevel = level;

} else {

s.visibility = 'hidden';

}

if (e.FirstChild > -1) {

isVisible = (e.isopen == true) && isVisible;

nextItemArray\[level++\] = e.nextItem;

currEntry = e.FirstChild;

} else {

if (e.nextItem != -1) {

currEntry = e.nextItem;

} else {

while (level > 0) {

if (nextItemArray\[--level\] != -1) {

currEntry = nextItemArray\[level\];

isVisible = (lastVisibleLevel >= level);

break;

}

}

}

}

}

this.maxHeight = yPos;

co.setMenuHeight(yPos);

}

function MenuScrollTo(entryNo) {

if (theBrowser.hasDHTML) {

var e = this.entry\[entryNo\];

if (!e) {return;}

var co = eval(this.container);

var d = this.container + '.document';

var srTop = getDHTMLObjTop(getDHTMLObj(d, 'entryDIV' + entryNo));

var srBot = (e.nextItem > 0) ? getDHTMLObjTop(getDHTMLObj(d, 'entryDIV' + e.nextItem)) : this.maxHeight;

if (theBrowser.code == 'MSIE') {

var curTop = co.document.body.scrollTop;

var curBot = curTop + co.document.body.clientHeight;

} else {

var curTop = co.pageYOffset;

var curBot = curTop + co.innerHeight;

}

if ((srBot > curBot) || (srTop < curTop)) {

var scrBy = srBot - curBot;

if (srTop < (curTop + scrBy)) {scrBy = srTop - curTop;}

co.setTimeout('self.scrollBy(0, ' + scrBy + ');', 100);

}

} else {

var l = eval(this.container).location.pathname + '#joustEntry' + entryNo;

setTimeout(this.container + '.location.href = "' + l + '";', 100);

}

}

function MenuItemClicked(entryNo, fromToggle) {

var r = true;

var e = this.entry\[entryNo\];

var w = this.contentWin();

var b = theBrowser;

this.selectEntry(entryNo);

if (this.wizardInstalled) {w.menuItemClicked(entryNo);}

if(e.onClickFunc) {e.onClick = e.onClickFunc;}

if(e.onClick) {var me=e;if(eval(e.onClick) == false) {r = false;}}

if (r) {

if (((this.toggleOnLink) && (e.FirstChild != -1) && !(fromToggle)) || e.noOutlineImg) {

if (b.hasDHTML) {

this.toggle(entryNo, true);

} else {

setTimeout(this.name + '.toggle(' + entryNo + ', true);', 100);

}

}

}

return (r) ? r : (e.url != '');

}

function MenuSelectEntry(entryNo) {

var e = this.entry\[entryNo\];

if (e) {

var oe = this.entry\[this.selectedEntry\];

if (oe) {oe.setSelected(false);}

this.selectedEntry = entryNo;

e.setSelected(true);

}

}

function MenuSetEntry(entryNo, state) {

var cl = ',' + entryNo + ',';

var e = this.entry\[entryNo\];

this.lastPMClicked = entryNo;

var mc = e.setIsOpen(state);

var p = e.parent;

while (p >= 0) {

cl += p + ',';

e = this.entry\[p\];

mc |= (e.setIsOpen(true));

p = e.parent;

}

if (this.modalFolders) {

for (var i = 0; i <= this.count; i++) {

e = this.entry\[i\];

if ((cl.indexOf(',' + i + ',') < 0) && e) {mc |= e.setIsOpen(false);}

}

}

return mc;

}

function MenuSetEntryByURL(theURL, state) {

var i = this.findEntry(theURL, 'url', 'right', 0);

return (i != -1) ? this.setEntry(i, state) : false;

}

function MenuSetAllChildren(state, parentID) {

var hasChanged = false;

var currEntry = (parentID > -1) ? this.entry\[parentID\].FirstChild : this.firstEntry;

while (currEntry > -1) {

var e = this.entry\[currEntry\];

hasChanged |= e.setIsOpen(state);

if (e.FirstChild > -1) {hasChanged |= this.setAllChildren(state, currEntry);}

currEntry = e.nextItem;

}

return hasChanged;

}

function MenuSetAll(state, parentID) {

if (theBrowser.version >= 4) {

if (parentID == 'undefined') {parentID = -1;}

} else {

if (parentID == null) {parentID = -1;}

}

var hasChanged = false;

if (parentID > -1) {hasChanged |= this.entry\[parentID\].setIsOpen(state);}

hasChanged |= this.setAllChildren(state, parentID);

if (hasChanged) {

this.lastPMClicked = this.firstEntry;

this.refresh();

}

}

function MenuOpenAll() {this.setAll(true, -1);}

function MenuCloseAll() {this.setAll(false, -1)}

function MenuFindEntry(srchVal, srchProp, matchType, start) {

if (srchVal == "") {return -1;}

if (!srchProp) {srchProp = "url";}

if (!matchType) {matchType = "exact";}

if (!start) {start = 0;}

if (srchProp == "URL") {srchProp = "url";}

if (srchProp == "title") {srchProp = "text";}

if (typeof(srchVal) != "string") {matchType = "exact";}

if ((matchType != "left") && (matchType != "right")) {matchType = "exact";}

var lm = srchVal.length;

for (var i = start; i <= this.count; i++) {

var e = this.entry\[i\];

if (e) {

var currVal = eval("e." + srchProp);

if (currVal == srchVal) {return i;}

if ((typeof(currVal) == "string") && (currVal != "")) {

var lc = currVal.length;

var l = Math.min(lm,lc);

if (matchType == "left") {

if (currVal.substring(1, l) == srchVal.substring(1, l)) {return i;}

} else {

if (matchType == "right") {

if (currVal.substring(lc-l, lc) == srchVal.substring(lm-l, lm)) {return i;}

}

}

}

}

}

return -1;

}

function MenuToggle(entryNo, fromClicked) {

var r = true;

var e = this.entry\[entryNo\];

if (e.onToggle) {var me=e;if(eval(e.onToggle) == false) {r = false;}}

if (r) {

var chg = this.setEntry(entryNo, e.isopen ^ 1);

if (this.linkOnExpand && e.isopen) {

if (e.url != '') {this.contentWin().location = e.url;}

if (!fromClicked) {this.itemClicked(entryNo, true);}

}

if (chg) {this.refresh();}

}

return false;

}

// Other functions

function DrawMenu(m) {

m.draw();

}

function browserInfo() {

this.code = 'unknown';

this.version = 0;

this.platform = 'Win';

var ua = navigator.userAgent;

var i = ua.indexOf('WebTV');

if (i >= 0) {

this.code = 'WebTV';

i += 6;

} else {

i = ua.indexOf('MSIE');

if (i >= 0) {

this.code = 'MSIE';

i += 5;

} else {

i = ua.indexOf('Opera');

if (i >= 0) {

this.code = 'OP';

i = ua.indexOf(') ') + 2;

} else {

i = ua.indexOf('Mozilla/');

if (i >= 0) {

this.code = 'NS';

i += 8;

}

}

}

}

this.version = parseFloat(ua.substring(i, i+4));

if (ua.indexOf('Mac') >= 0) {this.platform = 'Mac';}

if (ua.indexOf('OS/2') >= 0) {this.platform = 'OS/2';}

if (ua.indexOf('X11') >= 0) {this.platform = 'UNIX';}

var v = this.version;

var p = this.platform;

var NS = (this.code == 'NS');

var IE = (this.code == 'MSIE');

var WTV = (this.code == 'WebTV');

var OP = (this.code == 'OP');

var OP32up = (OP && (v >= 3.2));

var IE4up = (IE && (v >= 4));

var NS3up = (NS && (v >= 3));

this.canCache = NS3up || IE4up || OP32up || WTV;

this.canOnMouseOut = this.canCache;

this.canOnError = NS3up || IE4up || OP32up;

this.canJSVoid = !((NS && !NS3up) || (IE && !IE4up) || (OP && (v < 3.5)));

this.lineByLine = (v < 4);

this.mustMoveAfterLoad = NS3up || (IE4up && (p != 'Mac')) || WTV;

if (NS3up || IE4up || WTV) {

this.reloadMethod = 'replace';

} else {

this.reloadMethod = (NS && (v == 2.01) && (p != 'Win')) ? 'timeout' : 'href';

}

this.canFloat = NS || (IE && !((p == 'Mac') && (v >= 4) && (v < 5)));

this.hasDHTML = ((NS || IE) && (v >= 4)) && !(IE && (p == 'Mac') && (v < 4.5));

this.needLM = NS || (IE && (p == 'Mac') && (v >= 4.5));

this.DHTMLRange = IE ? '.all' : '';

this.DHTMLStyleObj = IE ? '.style' : '';

this.DHTMLDivHeight = IE ? '.offsetHeight' : '.clip.height';

}

function getWindow() {return (floatingMode) ? myOpener : self;}

function setStatus(theText) {

var theWindow = getWindow();

if (theWindow) {

theWindow.status = theText;

if (!theBrowser.canOnMouseOut) {

clearTimeout(statusTimeout);

statusTimeout = setTimeout('clearStatus()', 5000);

}

}

return true;

}

function clearStatus() {

var theWindow = getWindow();

if (theWindow) {theWindow.status = '';}

}

function unloadFloating() {

if (myOpener) {

if (myOpener.JoustFrameset) {myOpener.setTimeout('menuClosed();', 100);}

}

}

function getMode() {

var theMode = getParm(document.cookie, 'mode', ';');

return ((theMode == "Floating") || (theMode == "NoFrames")) ? theMode : "Frames";

}

function smOnError (msg, url, lno) {

smCallerWin.onerror = oldErrorHandler;

if (confirm(smSecurityMsg)) {setTimeout('setMode("' + smNewMode + '");', 100);}

return true;

}

function smSetCookie(theMode) {

document.cookie = 'mode=' + theMode + '; path=/';

if (getMode() != theMode) {

alert(smCookieMsg);

return false;

} else {

return true;

}

}

function setMode(theMode, callerWin) {

smNewMode = theMode

smCallerWin = (theBrowser.code == 'NS') ? callerWin : self;

var okToGo = true;

var currentMode = getMode();

if (theMode != currentMode) {

if (currentMode == 'Floating') {

if (smSetCookie(theMode)) {self.close();}

} else {

var dest = '';

if (theBrowser.canFloat) {

if ((theMenu.savePage) && (callerWin)) {

if (theBrowser.canOnError) {

oldErrorHandler = smCallerWin.onerror;

smCallerWin.onerror = smOnError;

}

var p = theMenu.contentWin().location.pathname;

if (theBrowser.canOnError) {smCallerWin.onerror = oldErrorHandler;}

if (p) {

dest = fixPath(p);

} else {

if (!confirm(smSecurityMsg)) {okToGo = false;}

}

}

} else {

alert(smNoFloat);

okToGo = false;

}

if (okToGo && smSetCookie(theMode)) {

if (theMode == 'NoFrames') {

location.href = (index3 == '') ? ((dest == '') ? '/' : dest) : index3;

} else {

location.href = index2 + '?page=' + escape(dest);

}

}

}

}

}

function fixPath(p) {

return (p.substring(0,2) == '/:') ? p.substring(p.indexOf('/', 2), p.length) : p;

}

function getParm(theStr, parm, delim) {

// returns value of parm from string

if (theStr.length == 0) {return '';}

var sPos = theStr.indexOf(parm + "=");

if (sPos == -1) {return '';}

sPos = sPos + parm.length + 1;

var ePos = theStr.indexOf(delim, sPos);

if (ePos == -1) {ePos = theStr.length;}

return unescape(theStr.substring(sPos, ePos));

}

function pageFromSearch(def, m, selIt) {

var s = self.location.search;

if ((s == null) || (s.length <= 1)) {return def;}

var p = getParm(s, 'page', '&');

p = (p != '') ? fixPath(p) : fixPath(s.substring(1, s.length));

if (m != null) {

var e = m.findEntry(p, 'URL', 'exact');

if ((e != -1) && selIt) {

m.setEntry(e, true);

m.selectEntry(e);

}

}

return p;

}

function loadURLInTop(theURL) {

var theWindow = getWindow();

if (theWindow) {theWindow.top.location.href = theURL;}

}

function defOnError(msg, url, lno) {

if (jsErrorMsg == '') {

return false;

} else {

alert(jsErrorMsg + '.\\n\\nError: ' + msg + '\\nPage: ' + url + '\\nLine: ' + lno + '\\nBrowser: ' + navigator.userAgent);

return true;

}

}

function defaultResizeHandler() {

if ((theBrowser.code == "NS") && theBrowser.hasDHTML) {

if (!eval(theMenu.container + ".document.menuBottom")) {

theMenu.reload();

}

}

}

// Declare global variables

var theBrowser = new browserInfo;

  

var jsErrorMsg = 'A JavaScript error has occurred on this page! Please note down the ';

jsErrorMsg += 'following information and pass it on to the WebMaster.';

if (theBrowser.canOnError) {self.onerror = defOnError;}

  

var theMenu = new Menu;

var JoustFrameset = true;

var statusTimeout = 0;

var index1 = 'index.html';

var index2 = 'index2.html';

var index3 = 'index3.html';

var smCallerWin;

var smNewMode;

var oldErrorHandler;

var smNoFloat = 'Sorry, your browser does not support this feature!';

var smCookieMsg = 'You must have Cookies enabled to change the display mode!';

var smSecurityMsg = 'Due to security restrictions imposed by your browser, I cannot ';

smSecurityMsg += 'change modes while a page from another server is being displayed. ';

smSecurityMsg += 'The default home page for this site will be displayed instead.';

  

  

var floatingMode = (getMode() == 'Floating');

var myOpener = null;

if (floatingMode == true) {

if (self.opener) {

myOpener = self.opener;

if (myOpener.JoustFrameset) {myOpener.setTimeout('setGlobals();', 100);}

} else {

document.cookie = 'mode=Frames; path=/';

floatingMode = false;

}

} else {

if (getMode() != 'Frames') {document.cookie = 'mode=Frames; path=/';}

}

  

// ############################ End of Joust ############################

  

function initOutlineIcons(imgStore) {

var ip = '../../images/menu/';

ip += (theBrowser.platform == 'Mac') ? 'mac/' : ((theBrowser.platform == 'OS/2') ? 'os2/' : 'win/');

imgStore.add('iconPlusTop', ip + 'plustop.gif', 18, 16);

imgStore.add('iconPlus', ip + 'plus.gif', 18, 16);

imgStore.add('iconPlusBottom', ip + 'plusbottom.gif', 18, 16);

imgStore.add('iconPlusOnly', ip + 'plusonly.gif', 18, 16);

imgStore.add('iconMinusTop', ip + 'minustop.gif', 18, 16);

imgStore.add('iconMinus', ip + 'minus.gif', 18, 16);

imgStore.add('iconMinusBottom', ip + 'minusbottom.gif', 18, 16);

imgStore.add('iconMinusOnly', ip + 'minusonly.gif', 18, 16);

imgStore.add('iconLine', ip + 'line.gif', 18, 16);

imgStore.add('iconBlank', ip + 'blank.gif', 18, 16);

imgStore.add('iconJoinTop', ip + 'jointop.gif', 18, 16);

imgStore.add('iconJoin', ip + 'join.gif', 18, 16);

imgStore.add('iconJoinBottom', ip + 'joinbottom.gif', 18, 16);

  

//Add folder and document images to the imgStore.

imgStore.add('Folder', ip + 'folderclosed.gif', 18, 16);

var di = '../../images/menu/';

if ((theBrowser.code == 'NS') || (theBrowser.code == 'MSIE')) {

di += theBrowser.code.toLowerCase() + '\_doc';

imgStore.add('Document', di + '.gif', 18, 16);

imgStore.add('DocumentMouseOver', di + '\_mo.gif', 18, 16);

imgStore.add('DocumentSelected', di + '\_sel.gif', 18, 16);

} else {

imgStore.add('Document', di + 'doc.gif', 18, 16);

}

imgStore.add('form', '../../images/menu/form.gif', 18, 16);

imgStore.add('download', '../../images/menu/dwnld.gif', 18, 16);

imgStore.add('msword', '../../images/menu/msword.gif', 18, 16);

imgStore.add('telnet', '../../images/menu/telnet.gif', 18, 16);

imgStore.add('db', '../../images/menu/db.gif', 18, 16);

imgStore.add('TOC', '../../images/menu/toc.gif', 18, 16);

}

function initialise() {

// Tell joust where to find the various index files it needs

index1 = 'index.html';

index2 = 'index2.html';

index3 = 'index3.html';

  

// Set up parameters to control menu behaviour

theMenu.autoScrolling = true;

theMenu.modalFolders = false;

theMenu.linkOnExpand = false;

theMenu.toggleOnLink = false;

theMenu.showAllAsLinks = false;

theMenu.savePage = true;

theMenu.tipText = "status";

theMenu.selectParents = false;

theMenu.name = "theMenu";

theMenu.container = "self.menu";

theMenu.reverseRef = "parent";

theMenu.contentFrame = "text";

theMenu.defaultTarget = "text";

  

// Initialise all the icons

initOutlineIcons(theMenu.imgStore);

// Now set up the menu with a whole lot of addEntry and addChild function calls

var level1ID = -1;

var level2ID = -1;

var level3ID = -1;

level1ID = theMenu.addEntry (-1, "TOC", "Table of Contents", "home.html", "View the complete contents of this issue.");

theMenu.entry\[level1ID\].target = "text";

  

level1ID = theMenu.addEntry (level1ID, "Document", "The Division of Religion With Signs Following", "taylor.shtml", "Victor E. Taylor");

theMenu.entry\[level1ID\].target = "text";

theMenu.entry\[level1ID\].multiLine = true;

  

level1ID = theMenu.addEntry (level1ID, "Folder", "Talk", "", "");

level2ID = theMenu.addChild (level1ID, "Document", "Heterological History: A Conversation", "wyschogrod\_raschke.shtml", "Edith Wyschogrod and Carl Raschke");

theMenu.entry\[level2ID\].multiLine = true;

  

level1ID = theMenu.addEntry (level1ID, "Folder", "Articles", "", "");

level2ID = theMenu.addChild (level1ID, "Document", "Mircea Eliade and the Imagination of Matter", "long.shtml", "Charles H. Long");

theMenu.entry\[level2ID\].multiLine = true;

level2ID = theMenu.addEntry (level2ID, "Document", "Jesus Christ Holocaust: Fabulation of the Jews in Christian and Nazi History", "canning.shtml", "Peter Canning");

theMenu.entry\[level2ID\].multiLine = true;

level2ID = theMenu.addEntry (level2ID, "Document", "Xena Warrior Princess and the Texture of the Religious: Re-imagining the Role of Popular Culture in Academic Discourse", "adcock.shtml", "David A. Adcock");

theMenu.entry\[level2ID\].multiLine = true;

level2ID = theMenu.addEntry (level2ID, "Document", "Rebellious No", "nvahanian.shtml", "Noelle Vahanian");

theMenu.entry\[level2ID\].multiLine = true;

level1ID = theMenu.addEntry (level1ID, "Folder", "Essays", "", "");

level2ID = theMenu.addChild (level1ID, "Document", "The Ride of Passage: The Pursuit of Danger, Trance, and Failure in Mark Twain, Paul Bowles, and Us", "ruf.shtml", "Frederick J. Ruf");

theMenu.entry\[level2ID\].multiLine = true;

level1ID = theMenu.addEntry (level1ID, "Folder", "Reviews", "", "");

level2ID = theMenu.addChild (level1ID, "Document", "Difficult History", "smith.shtml", "Steven Smith");

theMenu.entry\[level2ID\].multiLine = true;

level2ID = theMenu.addEntry (level2ID, "Document", "Re-Constructing Theological Thought with Deleuze", "lorentzen.shtml", "Oz Lorentzen");

theMenu.entry\[level2ID\].multiLine = true;

  

level1ID = theMenu.addEntry (level1ID, "Folder", "Extras", "", "Extra Material");

  

level2ID = theMenu.addChild (level1ID, "download", "Download This Issue", "../zips/01.2.zip", "Download Full HTML");

level2ID = theMenu.addEntry (level2ID, "Document", "Making Citations", "https://web.archive.org/web/20010503043257/http://www.jcrt.org/citations.shtml", "Making citations of JCRT resources");

theMenu.entry\[level2ID\].target = "text";

level2ID = theMenu.addEntry (level2ID, "form", "JCRT Forum", "https://web.archive.org/web/20010503043257/http://www.jcrt.org/cgi-bin/ultraboard/UltraBoard.pl", "Post Your Comments");

theMenu.entry\[level2ID\].target = "text";

  

level2ID = theMenu.addChild (level1ID, "form", "Send Feedback", "../../contact.html", "Comments and Suggestions");

theMenu.entry\[level2ID\].target = "text";

level1ID = theMenu.addEntry (level1ID, "db", "About the Contributors", "https://web.archive.org/web/20010503043257/http://www.jcrt.org/cgi-bin/dbman/db.cgi?db=contrib&Issue=1.2&mh=15&sb=2&so=ascend&view\_records=Submit+Query", "Read about the Contributors to this issue");

theMenu.entry\[level1ID\].target = "text";

theMenu.entry\[level1ID\].multiLine = true;

}

  

self.defaultStatus = "";

  

//-->

</script>

  

</head>

<script language\="JavaScript">

<!--

if (self.name == 'menu') {

// Sometimes, Netscape will try to load this index inside the menu frame. I haven't

// worked out why but this will detect that situation and reset the location property.

self.location.href = "menu.html";

} else {

initialise();

var thePage = pageFromSearch('home.html', theMenu, true);

if (floatingMode) {

self.document.writeln('<frameset cols="100%" rows="44,\*,54" onUnload="unloadFloating();" onResize="defaultResizeHandler();" border=0 frameborder=0>');

self.document.writeln('<frame name="menuheader" src="../../menu/menuheader.html" scrolling="no" noresOize marginwidth="0" marginheight="0" APPLICATION="yes">');

self.document.writeln('<frame name="menu" src="menu.html" scrolling="auto" marginwidth="10" marginheight="10" APPLICATION="yes">');

self.document.writeln('<frame name="menuCntrl" src="menucntrl\_imgs.html" scrolling="no" marginwidth="10" marginheight="10" APPLICATION="yes">');

self.document.writeln('</frameset>');

} else {

self.document.writeln('<frameset cols="100%" rows="80,\*" onResize="defaultResizeHandler();" border=0 frameborder=0>');

self.document.writeln('<frame name="title" src="../../menu/title.html" scrolling="no" noresize marginwidth="10" marginheight="10" APPLICATION="yes">');

self.document.writeln('<frameset cols="220,\*" rows="100%">');

self.document.writeln('<frameset cols="100%" rows="\*,54">');

self.document.writeln('<frame name="menu" src="menu.html" scrolling="auto" marginwidth="10" marginheight="10" APPLICATION="yes">');

self.document.writeln('<frame name="menuCntrl" src="menucntrl\_imgs2.html" scrolling="no" marginwidth="10" marginheight="10" APPLICATION="yes">');

self.document.writeln('</frameset>');

self.document.writeln('<frame name="text" src="' + thePage +'" scrolling="auto" APPLICATION="yes">');

self.document.writeln('</frameset>');

self.document.writeln('</frameset>');

}

}

//-->

</script>

<noscript>

<body bgcolor="#FFFFFF"><!-- BEGIN WAYBACK TOOLBAR INSERT -->

<script>\_\_wm.rw(0);</script>

<div id="wm-ipp-base" lang="en" style="display:none;direction:ltr;" toolbar-mode="auto">

<div id="wm-ipp" style="position:fixed;left:0;top:0;right:0;">

<div id="donato" style="position:relative;width:100%;height:0;">

<div id="donato-base">

<iframe id="donato-if" src="https://archive.org/includes/donate.php?as\_page=1&amp;platform=wb&amp;referer=https%3A//web.archive.org/web/20010503043257/http%3A//www.jcrt.org/archives/01.2/index.html%3Fpage%3Dwyschogrod\_raschke.shtml"

scrolling="no" frameborder="0" style="width:100%; height:100%">

</iframe>

</div>

</div><div id="wm-ipp-inside">

<div id="wm-toolbar" style="position:relative;display:flex;flex-flow:row nowrap;justify-content:space-between;" nav="async">

<div id="wm-logo" style="/\*width:110px;\*/padding-top:12px;">

<a href="/web/" title="Wayback Machine home page"><img src="https://web-static.archive.org/\_static/images/toolbar/wayback-toolbar-logo-200.png" srcset="https://web-static.archive.org/\_static/images/toolbar/wayback-toolbar-logo-100.png, https://web-static.archive.org/\_static/images/toolbar/wayback-toolbar-logo-150.png 1.5x, https://web-static.archive.org/\_static/images/toolbar/wayback-toolbar-logo-200.png 2x" alt="Wayback Machine" style="width:100px" border="0" /></a>

</div>

<div class="c" style="display:flex;flex-flow:column nowrap;justify-content:space-between;flex:1;">

<form class="u" style="display:flex;flex-direction:row;flex-wrap:nowrap;" target="\_top" method="get" action="/web/submit" name="wmtb" id="wmtb"><input type="text" name="url" id="wmtbURL" value="http://www.jcrt.org/archives/01.2/index.html?page=wyschogrod\_raschke.shtml" onfocus="this.focus();this.select();" style="flex:1;"/><input type="hidden" name="type" value="replay" /><input type="hidden" name="date" value="20010503043257" /><input type="submit" value="Go" />

</form>

<div style="display:flex;flex-flow:row nowrap;align-items:flex-end;">

<div class="s" id="wm-nav-captures" style="flex:1;">

<a class="t" href="/web/20010503043257\*/http://www.jcrt.org/archives/01.2/index.html?page=wyschogrod\_raschke.shtml" title="See a list of every capture for this URL">8 captures</a>

<div class="r" title="Timespan for captures of this URL">03 May 2001 - 15 Jun 2004</div>

</div>

<div class="k">

<a href="" id="wm-graph-anchor">

<div id="wm-ipp-sparkline" title="Explore captures for this URL" style="position: relative">

<canvas id="wm-sparkline-canvas" width="750" height="27" border="0"></canvas>

</div>

</a>

</div>

</div>

</div>

<div class="n">

<table>

<tbody>

<!-- NEXT/PREV MONTH NAV AND MONTH INDICATOR -->

<tr class="m">

<td class="b" nowrap="nowrap">Apr</td>

<td class="c" id="displayMonthEl" title="You are here: 04:32:57 May 03, 2001">MAY</td>

<td class="f" nowrap="nowrap">Jun</td>

</tr>

<!-- NEXT/PREV CAPTURE NAV AND DAY OF MONTH INDICATOR -->

<tr class="d">

<td class="b" nowrap="nowrap"><span class="ta"></span></td>

<td class="c" id="displayDayEl" style="width:34px;font-size:22px;white-space:nowrap;" title="You are here: 04:32:57 May 03, 2001">03</td>

<td class="f" nowrap="nowrap"><span class="ta"></span></td>

</tr>

<!-- NEXT/PREV YEAR NAV AND YEAR INDICATOR -->

<tr class="y">

<td class="b" nowrap="nowrap">2000</td>

<td class="c" id="displayYearEl" title="You are here: 04:32:57 May 03, 2001">2001</td>

<td class="f" nowrap="nowrap">2002</td>

</tr>

</tbody>

</table>

</div>

<div class="r" style="display:flex;flex-flow:column nowrap;align-items:flex-end;justify-content:space-between;">

<div id="wm-btns" style="text-align:right;height:23px;">

<span class="xxs">

<div id="wm-save-snapshot-success">success</div>

<div id="wm-save-snapshot-fail">fail</div>

<a id="wm-save-snapshot-open" href="#" title="Share via My Web Archive" >

<span class="iconochive-web"></span>

</a>

<a href="https://archive.org/account/login.php" title="Sign In" id="wm-sign-in">

<span class="iconochive-person"></span>

</a>

<span id="wm-save-snapshot-in-progress" class="iconochive-web"></span>

</span>

<a class="xxs" href="https://help.archive.org/help/category/the-wayback-machine/" title="Get some help using the Wayback Machine" style="top:-6px;"><span class="iconochive-question" style="color:rgb(87,186,244);font-size:160%;"></span></a>

<a id="wm-tb-close" href="#close" style="top:-2px;" title="Close the toolbar"><span class="iconochive-remove-circle" style="color:#888888;font-size:240%;"></span></a>

</div>

<div id="wm-share" class="xxs">

<a href="/web/20010503043257/http://web.archive.org/screenshot/http://www.jcrt.org/archives/01.2/index.html?page=wyschogrod\_raschke.shtml"

id="wm-screenshot"

title="screenshot">

<span class="wm-icon-screen-shot"></span>

</a>

<a href="#" id="wm-video" title="video">

<span class="iconochive-movies"></span>

</a>

<a id="wm-share-facebook" href="#" data-url="https://web.archive.org/web/20010503043257/http://www.jcrt.org:80/archives/01.2/index.html?page=wyschogrod\_raschke.shtml" title="Share on Facebook" style="margin-right:5px;" target="\_blank"><span class="iconochive-facebook" style="color:#3b5998;font-size:160%;"></span></a>

<a id="wm-share-twitter" href="#" data-url="https://web.archive.org/web/20010503043257/http://www.jcrt.org:80/archives/01.2/index.html?page=wyschogrod\_raschke.shtml" title="Share on Twitter" style="margin-right:5px;" target="\_blank"><span class="iconochive-twitter" style="color:#1dcaff;font-size:160%;"></span></a>

</div>

<div style="padding-right:2px;text-align:right;white-space:nowrap;">

<a id="wm-expand" class="wm-btn wm-closed" href="#expand"><span id="wm-expand-icon" class="iconochive-down-solid"></span> <span class="xxs" style="font-size:80%;">About this capture</span></a>

</div>

</div>

</div>

<div id="wm-capinfo" style="border-top:1px solid #777;display:none; overflow: hidden">

<div id="wm-capinfo-notice" source="api"></div>

<div id="wm-capinfo-collected-by">

<div style="background-color:#666;color:#fff;font-weight:bold;text-align:center;padding:2px 0;">COLLECTED BY</div>

<div style="padding:3px;position:relative" id="wm-collected-by-content">

<div style="display:inline-block;vertical-align:top;width:50%;">

<span class="c-logo" style="background-image:url(https://archive.org/services/img/alexacrawls);"></span>

Organization: <a style="color:#33f;" href="https://archive.org/details/alexacrawls" target="\_new"><span class="wm-title">Alexa Crawls</span></a>

<div style="max-height:75px;overflow:hidden;position:relative;">

<div style="position:absolute;top:0;left:0;width:100%;height:75px;background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 90%,rgba(255,255,255,255) 100%);"></div>

Starting in 1996, <a href="http://www.alexa.com/">Alexa Internet</a> has been donating their crawl data to the Internet Archive. Flowing in every day, these data are added to the <a href="http://web.archive.org/">Wayback Machine</a> after an embargo period.

</div>

</div>

<div style="display:inline-block;vertical-align:top;width:49%;">

<span class="c-logo" style="background-image:url(https://archive.org/services/img/alexa\_de)"></span>

<div>Collection: <a style="color:#33f;" href="https://archive.org/details/alexa\_de" target="\_new"><span class="wm-title">Alexa Crawls DE</span></a></div>

<div style="max-height:75px;overflow:hidden;position:relative;">

<div style="position:absolute;top:0;left:0;width:100%;height:75px;background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 90%,rgba(255,255,255,255) 100%);"></div>

Crawl data donated by Alexa Internet. This data is currently not publicly accessible

</div>

</div>

</div>

</div>

<div id="wm-capinfo-timestamps">

<div style="background-color:#666;color:#fff;font-weight:bold;text-align:center;padding:2px 0;" title="Timestamps for the elements of this page">TIMESTAMPS</div>

<div>

<div id="wm-capresources" style="margin:0 5px 5px 5px;max-height:250px;overflow-y:scroll !important"></div>

<div id="wm-capresources-loading" style="text-align:left;margin:0 20px 5px 5px;display:none"><img src="https://web-static.archive.org/\_static/images/loading.gif" alt="loading" /></div>

</div>

</div>

</div></div></div></div><div id="wm-ipp-print">The Wayback Machine - https://web.archive.org/web/20010503043257/http://www.jcrt.org:80/archives/01.2/index.html?page=wyschogrod\_raschke.shtml</div>

<script type="text/javascript">//<!\[CDATA\[

\_\_wm.bt(750,27,25,2,"web","http://www.jcrt.org/archives/01.2/index.html?page=wyschogrod\_raschke.shtml","20010503043257",1996,"https://web-static.archive.org/\_static/",\["https://web-static.archive.org/\_static/css/banner-styles.css?v=1utQkbB3","https://web-static.archive.org/\_static/css/iconochive.css?v=3PDvdIFv"\], false);

\_\_wm.rw(1);

//\]\]></script>

<!-- END WAYBACK TOOLBAR INSERT -->

<h1>Joust Outliner</h1>

Your browser does not support JavaScript (if you are using Netscape 3 or higher or Microsoft Internet

Explorer 4 or higher you may have JavaScript turned off in your preferences), so this page,

does not include site navigation features. If you use

a JavaScript-capable browser, such as Microsoft <a href="https://web.archive.org/web/20010503043257/http://microsoft.com/ie/ie.html">Internet

Explorer version 3.0</a> or <a href="https://web.archive.org/web/20010503043257/http://www.netscape.com/comprod/mirror/">Netscape Navigator

version 2.0</a>, you'll have a much more pleasant experience navigating around this site.</p>

  

<p><i><b>Opera Users:</b> Although Opera 3.0 supports JavaScript, there is a bug in their implementation

which prevents the menu system on this site from working. Opera 3.2 fixes the problem.</i></p>

  

<p><i><b>Note:</b> There is a know bug in Netscape Navigator version 4.0.x which will cause you to see this message

if you have the local cache turned off.</i></p>

  

<p>If you have any problems with this site, please contact the Webmaster.</p>

  

<p>Click <a href="index3.html">here</a> to see the non-JavaScript version of this site.</p>

  

<a href="robots.html"></a>

</body>

</noscript>

  

</html>

<!--

FILE ARCHIVED ON 04:32:57 May 03, 2001 AND RETRIEVED FROM THE

INTERNET ARCHIVE ON 23:26:10 Nov 13, 2025.

JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

  

ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.

SECTION 108(a)(3)).

\-->

<!--

playback timings (ms):

captures\_list: 0.605

exclusion.robots: 0.054

exclusion.robots.policy: 0.036

esindex: 0.012

cdx.remote: 5.666

LoadShardBlock: 32.757 (3)

PetaboxLoader3.datanode: 74.374 (4)

load\_resource: 96.313

PetaboxLoader3.resolve: 45.694

nav: 0.232 (6)

\-->