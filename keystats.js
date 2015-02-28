/* Javascript rewrite of the java applet originally written by Jon A. Maxwell
   Naveed Ahmed
 */

function CKeyStats(name, keymap){
    this.distanceTotal = 0;
   	this.sameHandTotal = 0;
   	this.sameFingerTotal = 0;
   	this.keysTotal = 0;

    this.rowTotal = [];// = new int[Keyboard.ROWS];
    this.lhTotal = []; //= new int[5];  //fingers on lh
    this.rhTotal = []; //;= new int[5];

    this.name = name;
    this.keyboard = new CKeyboard(keymap);
}



CKeyStats.prototype.calculate = function(text){
	// reset counters
    var keyboard = this.keyboard;
	this.distanceTotal = this.sameHandTotal = this.sameFingerTotal = this.keysTotal = 0;
    var i=0;
	for (i=0; i < keyboard.ROWS; i++)
    {
        this.rowTotal[i] = 0;
    }
	for (i=0; i < 5; i++)
    {
        this.lhTotal[i] = this.rhTotal[i] = 0;
    }

	var distancePrev = 0.0;
	var row, col;
	var rowPrev = -1, colPrev = -1;
	var finger;
	var fingerPrev = null;
	var fingerNum;
	var fingerNumPrev = -1;

	for (i=0; i < text.length; i++) {
		var k = keyboard.locate(text.charAt(i));
		if (k == null)
            continue;
		row = k.y;
		col = k.x;
		finger = keyboard.closestFinger(row, col);
		fingerNum = finger.number;

		this.keysTotal++;
		this.rowTotal[row]++;

		if (finger.hand == CFinger.RIGHTHAND)
			this.rhTotal[fingerNum]++;

		if (finger.hand == CFinger.LEFTHAND)
            this.lhTotal[fingerNum]++;

		// sameHandTotal
		if (null != fingerPrev)
			// repeated key doesn't count toward same hand
			if (row != rowPrev || col != colPrev)
				if (finger.hand == fingerPrev.hand)
					// thumb doesn't count as either hand
					if (fingerNum != CFinger.THUMB && fingerNumPrev != CFinger.THUMB)
						this.sameHandTotal++;

		// sameFingerTotal
		if (null != fingerPrev)
			// repeated key doesn't count toward same finger
			// (and so thumb won't ever count since it only hits space)
			if (row != rowPrev || col != colPrev)
				if (finger == fingerPrev)
					this.sameFingerTotal++;

		// distanceTotal
		var distance = keyboard.distanceKeyFinger(row, col);
		if (finger != fingerPrev) {
			this.distanceTotal += distancePrev; // prev finger moves back to home
            this.distanceTotal += distance;  // and this finger moves to key
		} else {
			// same finger, so it moves from prev key to this key
			//   note that distancePrev is always the distance from home row
			//   finger to previous key not the distance between these two
            this.distanceTotal += keyboard.distanceKeys(row,col,rowPrev, colPrev);
		}

		// set prev from current
		distancePrev = distance;
		fingerPrev = finger;
		fingerNumPrev = fingerNum;
		rowPrev = row;
		colPrev = col;
	}	// for each char
};

CKeyStats.prototype.displayStats = function(resultsDiv) {
		// total non-space (row 5) keys
        var rowTotal = this.rowTotal;
		var top4rowTotal = rowTotal[0] + rowTotal[1] + rowTotal[2] + rowTotal[3];
        var i=0;

		resultsDiv.find(".totalKeys").text(this.keysTotal);

		// row percents
		//   percent of non-space keys
		for (i=0; i<4; i++) {
			if (top4rowTotal > 0)
                resultsDiv.find(".row" + i).text( numeral(rowTotal[i]/top4rowTotal).format("0.0%"));
			else
                resultsDiv.find(".row" + i).text("0%");
		}

		// finger percents: lhTotal, rhTotal
		//   percent of non-space keys
		if (top4rowTotal > 0) {
			var s = "";
			for (i=0; i<4; i++)
            {
                s = s.concat("   " + numeral(this.lhTotal[i]/top4rowTotal).format("0.0%"));
            }
			s = s.concat(" -- ");
			for (i=0; i<4; i++)
            {
                s = s.concat("   " + numeral(this.rhTotal[i]/top4rowTotal).format("0.0%"));
            }
			
            resultsDiv.find(".fingers").text(s);
		}
        else
        {
            resultsDiv.find(".fingers").text("  0%  0%  0%  0% --   0%  0%  0%  0%");
		}

        resultsDiv.find(".distance").text(numeral(this.distanceTotal).format("0,0.000"));

		// same hand percent, same finger percent
		//   percent of non-space keys
		if (top4rowTotal > 0) {
            resultsDiv.find(".sameHand").text(numeral(this.sameHandTotal/top4rowTotal).format("0.0%"));
            resultsDiv.find(".sameFinger").text(numeral(this.sameFingerTotal/top4rowTotal).format("0.0%"));
		} else {
            resultsDiv.find(".sameHand").text("0%");
            resultsDiv.find(".sameFinger").text("0%");
		}
};
