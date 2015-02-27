function Array2D(x, y)
{
    var array2D = new Array(x);

    for(var i = 0; i < array2D.length; i++)
    {
        array2D[i] = new Array(y);
    }

    return array2D;
}

function CPoint(x,y){this.x=x; this.y=y;}
function CRect(x,y,w,h){this.x=x; this.y=y; this.w=w; this.h=h;}

function CFinger(row, col, hand, number){
    this.row = row;
    this.col = col;
    this.hand = hand;
    this.number = number;
	//
	this.THUMB = 4; // 0..3 other fingers
}

CFinger.LEFTHAND = 1;
CFinger.RIGHTHAND = 2;


function CKeyboard(keymap){
    // pixel distance in meters
    this.keyWidth = 18;
    this.keyHeight = 22;
    this.DISTANCE_XPIXEL = 0.018 / this.keyWidth;
    this.DISTANCE_YPIXEL = 0.018 / this.keyHeight;

    this.UPPERCASE = 1;
   	this.LOWERCASE = 0;
   	this.HOMEROW = 2;
   	this.ROWS = 5;
   	this.COLUMNS = 15;

    this.defaultKeyboard =
   		[	// lowercase, uppercase
   		"`1234567890-=\\",   "~!@#$%^&*()_+|" ,
   		" qwertyuiop[]"  ,   " QWERTYUIOP{}"  ,
   		" asdfghjkl;'\n" ,   " ASDFGHJKL:\"\n",
   		"  zxcvbnm,./"   ,   "  ZXCVBNM<>?"   ,
   		      "  "       ,         ""
   		];

    this.defaultFingering =
   		[ // left: 0123 right: 4567 thumb: 8
   		"00123344567777" ,
   		" 012334456777"  ,
   		" 012334456777"  ,
   		"  0123444567"   ,
   		      " 8"
   		];

    this.charToIndex = {};
    this.keyArea = Array2D(this.ROWS, this.COLUMNS);// area of image
    this.keyFinger = Array2D(this.ROWS, this.COLUMNS);
    this.Finger = [];

    if(keymap == null || keymap == undefined)
        this.setDefaultKeys();
    else
        this.setKeys(keymap);
    this.setupKeyAreas();
    this.setupFingers();
}

// lookup the finger used for a key
CKeyboard.prototype.closestFinger = function (row, col) {
		return this.keyFinger[row][col];
	};

// locate the key index (Point(col,row)) of a character
CKeyboard.prototype.locate = function(value) {
		return this.charToIndex[value];
	};


// distance in meters between two keys
CKeyboard.prototype.distanceKeys = function(row, col, srow, scol) {
    if(row == srow && col == scol)
        return 0;

    var keyArea = this.keyArea;
    // distance between upper left corners.. replace with center
    //   if typing keys are not regular
    var dx = keyArea[srow][scol].x - keyArea[row][col].x;
    var dy = keyArea[srow][scol].y - keyArea[row][col].y;
    var fx = dx * this.DISTANCE_XPIXEL;
    var fy = dy * this.DISTANCE_YPIXEL;
    var d = Math.sqrt((fx * fx) + (fy * fy));
    return d;
};


// distance in meters between key and its assigned finger
CKeyboard.prototype.distanceKeyFinger = function(row, col) {
    var f = this.closestFinger(row, col);
    return this.distanceKeys(row, col, f.row, f.col);
};

CKeyboard.prototype.setKey = function(row, col, shift, value) {
	if (this.isSettable(row,col)) {
		//keye[row][col][shift] = value;
		//charToIndex.put(new Character(value), new Point(col,row));
        this.charToIndex[value] = new CPoint(col, row);
	}
};

CKeyboard.prototype.setRow = function(row, shift, values) {
	for (var col = 0; col < values.length; col++) {
        this.setKey(row,col,shift,values.charAt(col));
	}
};

CKeyboard.prototype.isSettable = function(row, col) {
	var rowStart = [0,1,1,2,1];
	var rowEnd = [13,12,12,11,1];

	if (col < rowStart[row] || col > rowEnd[row])
        return false;
    else
	    return true;
};

CKeyboard.prototype.setDefaultKeys = function() {
	for (var i=0; i < this.defaultKeyboard.length; i+=2) {
        this.setRow(i/2,this.LOWERCASE, this.defaultKeyboard[i]);
        this.setRow(i/2,this.UPPERCASE, this.defaultKeyboard[i+1]);
	}
};

CKeyboard.prototype.setKeys = function(keymap){
    for (var i=0; i < keymap.length; i+=2) {
         this.setRow(i/2, this.LOWERCASE, keymap[i]);
         this.setRow(i/2, this.UPPERCASE, keymap[i+1]);
     }
};

CKeyboard.prototype.setupFingers = function() {
	var i=0;
	var fingers = [];
	for (i=0; i<4; i++)
    {
        fingers[i] = new CFinger(this.HOMEROW, i+1, CFinger.LEFTHAND, i);
    }
	for (i=4; i<8; i++)
    {
        fingers[i] = new CFinger(this.HOMEROW, i+3, CFinger.RIGHTHAND, i-4);
    }
	fingers[8] = new CFinger(this.HOMEROW+2, 1, CFinger.RIGHTHAND, CFinger.THUMB); //thumb on spacebar

	for (var row = 0; row < this.defaultFingering.length; row++)
		for (var col = 0; col < this.defaultFingering[row].length; col++) {
			var c = this.defaultFingering[row].charAt(col);
			if (!/^\d+$/.test(c)) //!Character.isDigit(c)
                this.keyFinger[row][col] = null;
			else
                this.keyFinger[row][col] = fingers[parseInt(c)];
		}
};

CKeyboard.prototype.setupKeyAreas = function() {
    var row0X = 12;
    var row0Y = 45;
    var keyHeight = this.keyHeight;
    var keyWidth = this.keyWidth;
    var tabWidth = 28;
    var lockWidth = 34;
    var shiftWidth = 26;
    var toSpaceWidth = 72;
    //
    var spaceWidth = 126; //about 7*keyWidth
    var returnWidth = 36; //about 2*keyWidth

    var keyArea = this.keyArea;
	keyArea[0][0] = new CRect(row0X, row0Y            , keyWidth    , keyHeight);
	keyArea[1][0] = new CRect(row0X, row0Y + keyHeight, tabWidth    , keyHeight);
	keyArea[2][0] = new CRect(row0X, row0Y+2*keyHeight, lockWidth   , keyHeight);
	keyArea[3][0] = new CRect(row0X, row0Y+3*keyHeight, shiftWidth  , keyHeight);
	keyArea[4][0] = new CRect(row0X, row0Y+4*keyHeight, toSpaceWidth, keyHeight);

	//spacebar
	keyArea[4][1] = new CRect(keyArea[4][0].x + keyArea[4][0].width,  keyArea[4][0].y,  spaceWidth,  keyHeight);


	for (var row = 0; row < this.ROWS; row++)
		for (var col = 1; col < this.COLUMNS; col++)
			if (keyArea[row][col] == null) {
				keyArea[row][col] = new CRect(
					 keyArea[row][col-1].x + keyArea[row][col-1].w,
					 keyArea[row][col-1].y,
					 keyWidth,
					 keyHeight
					 );
			}

	//return
	keyArea[2][12]= new CRect(keyArea[2][11].x + keyArea[2][11].w,  keyArea[2][11].y,  returnWidth,  keyHeight);
};