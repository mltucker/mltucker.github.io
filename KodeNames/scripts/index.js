/*
Notes: 
'data' is lazily imported from the html
'seedrandom' is also imported from html. it gives deterministic random #s based on a seed set in fire()
*/


var wordsSelected = [];
var teams = [];
var NUMBER_OF_WORDS = 25;
var NUMBER_OF_PICTURES = 20;
var number_of_items = NUMBER_OF_WORDS;
var spyMasterMode = false;
var sessionData = [];
var customData = [];
var local_images = [];

var COLOR_RED = "#ff0000";
var COLOR_YELLOW = "#ffff00";
var COLOR_BLUE = "#00eeee";
var COLOR_GRAY = "#808080";
var COLOR_BLACK = "#000000";
var COLOR_GREEN = "#009000";
var COLOR_WHITE = "#FFFFFF";

//init
$("#seed").keyup(function() {
	fire();
});

$("#gameMode").change(function() {
	fire();
});

$("#seed").val(Math.floor(Math.random() * 1000));
fire();

function handleFileSelect(evt) {
	var files = evt.target.files;
	local_images = [];

	for (var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			return function(e) {
				// Render thumbnail.
				var span = document.createElement('span');
				span.innerHTML = ['<img src="', e.target.result,
								'" title="', escape(theFile.name), '" height=\"100%\" width=\"98%\"/>'].join('');
				local_images[local_images.length] = span.innerHTML;

				// we have to wait until all images are loaded before we trigger the beggining of the game
				if (document.getElementById("files").files.length == local_images.length) {
					fire();
				}
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
	}
}

document.getElementById("files").value = "";
document.getElementById('files').addEventListener('change', handleFileSelect, false);

function fire() {
	//get seed and set the seed for randomizer
	var seed = document.getElementById("seed").value;
	Math.seedrandom(seed.toLowerCase());

	var option = $('#gameMode :selected').val();
	number_of_items = NUMBER_OF_WORDS;

	switch (option) {
		case 'local_pic':
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				// Great success! All the File APIs are supported.
			} else {
				alert('The File APIs are not fully supported in this browser.');
				document.getElementById('gameMode').value = "default";
				option = "default";
			}
			if (local_images.length < NUMBER_OF_PICTURES) {
				alert('Click on the BROWSE button and select some pictures first. Minimum ' + NUMBER_OF_PICTURES + ' images.');
			}
			break;
		case 'cah':
			if (window.confirm("This uses X-Rated content. Are you older than 18?")) {
				// we are old enough
			} else {
				document.getElementById('gameMode').value = "default";
                option = "default";
			}
			break;
	}

	if (option == 'local_pic') {
		document.getElementById("files").style.visibility = "visible";
	} else {
		document.getElementById("files").style.visibility = "hidden";
	}

	switch (option) {
		case '2knouns':
			sessionData = data.slice(0);
			break;
		case 'movies':
			sessionData = movieData.slice(0);
			break;
		case 'cah':
			sessionData = cahData.slice(0);
			break;
		case 'custom':
			if (customData.length === 0) {
				var customWordList = prompt("Please enter custom word list. The list will be saved until your refresh your browser. (The words MUST be delimanted by spaces). eg: cat dog mouse", "Enter words here");
				customData = customWordList.split(' ');
			}
			sessionData = customData.slice(0);
			break;
		case 'online_pic':
		case 'online_bw_pic':
			// dummy numbers to reuse functionality
			sessionData = [];
			for (var i = 1; i <= 500; i++) {
               sessionData.push(i);
            }
			number_of_items = NUMBER_OF_PICTURES;
			break;
		case 'local_pic':
			// dummy numbers to reuse functionality
			sessionData = [];
			for (var i = 1; i <= local_images.length; i++) {
               sessionData.push(local_images[i]);
            }
			number_of_items = NUMBER_OF_PICTURES;
			break;
		default:
			sessionData = defaultData.slice(0);
	}

	wordsSelected = [];
	teams = [];
	spyMasterMode = false;
	document.getElementById("board").innerHTML = "";

	//fire new board
	updateScore();
	createNewGame();
}

//not used, but probably useful at some point
function removeItem(array, index) {
	if (index > -1) {
		// console.log("index: " + index + ", word: " + array[index] + " removed.");
		array.splice(index, 1);
	}
}

function totalGuesses() {
	var option = $('#gameMode :selected').val();

    // how many items per row (pictures vs words)
    var total_guesses = 8;
    switch (option) {
		case 'online_pic':
		case 'online_bw_pic':
		case 'local_pic':
			return 7;
	}
	return 8;
}

function createNewGame() {
	var trs = [];
	var option = $('#gameMode :selected').val();
	var imgWidth = Math.floor($(window).width() / 5.5);
    var imgHeight = Math.floor($(window).height() / 4.5);

    // how many items per row (pictures vs words)
    var items_per_row = 5;
    var row_type = "row";
    switch (option) {
		case 'online_pic':
		case 'online_bw_pic':
		case 'local_pic':
			items_per_row = 4;
			row_type = "row_pic";
			break;
		default:
			items_per_row = 5;
			row_type = "row";
	}
	// populate each row data
	for (var i = 0; i < number_of_items; i++) {
		if (!trs[i % items_per_row]) {
			trs[i % items_per_row] = "";
		}
		var randomNumber = Math.floor(Math.random() * sessionData.length);
		var word = sessionData[randomNumber];
		var grayscale_pic = "";
		removeItem(sessionData, randomNumber);
		wordsSelected.push(word);
		switch (option) {
			case 'online_bw_pic':
				grayscale_pic = "g/";
				// fall through on purpose
			case 'online_pic':
				// link to pictures, example:
				// colour:    https://unsplash.it/305/202?image=931
				// grayscale: https://unsplash.it/g/305/202?image=931
				trs[i % items_per_row] += "<div class=\"word\" id=\'" + i + "\' onclick=\"clicked(\'" + i + "\')\"><div><a href=\"#\"><img id=\'pic" + i + "\' src=\"https://unsplash.it/" + grayscale_pic + imgWidth + "/" + imgHeight + "?image=" + word + "\"><span class=\"ada\"></span></a></div></div>";
				break;
			case 'local_pic':
				trs[i % items_per_row] += "<div class=\"word\" id=\'" + i + "\' onclick=\"clicked(\'" + i + "\')\"><div><a href=\"#\"><img id=\'pic" + i + "\' " + word + "<span class=\"ada\"></span></a></div></div>";
				break;
			default:
				trs[i % items_per_row] += "<div class=\"word\" id=\'" + i + "\' onclick=\"clicked(\'" + i + "\')\"><div><a href=\"#\"><span class=\"ada\"></span>" + word + "</a></div></div>";
		}
	}
	//<a href="#"><span class="ada">Washington stimulates economic growth </span>Read me</a>
	for (var i = 0; i < trs.length; i++) {
		document.getElementById("board").innerHTML += '<div class="' + row_type + '">' + trs[i] + '</div>'
	}

	//create teams
    var total_guesses = totalGuesses();
	for (var i = 0; i < total_guesses; i++) {
		teams.push(COLOR_RED);
		teams.push(COLOR_BLUE);
	}

	// one extra for one of the teams
	if (Math.floor(Math.random() * data.length) % 2 === 0) {
		teams.push(COLOR_RED);
		// document.getElementById("team").style.color = COLOR_RED;
		// document.getElementById("team").innerHTML = "RED";
		$('#board').addClass('redStarts').removeClass('blueStarts');

	} else {
		teams.push(COLOR_BLUE);
		// document.getElementById("team").style.color = COLOR_BLUE;
		// document.getElementById("team").innerHTML = "BLUE";
		$('#board').addClass('blueStarts').removeClass('redStarts');
	}

	// add neutrals
	var yellow_cards = number_of_items - (total_guesses * 2) - 2;
	for (var i = 0; i < yellow_cards; i++) {
		teams.push(COLOR_YELLOW);
	}

	// push the assassin
	teams.push(COLOR_BLACK);

	//shuffle teams
	shuffle(teams);

	updateScore();
	document.body.style.backgroundColor = COLOR_WHITE;
}

function doTint(value, colour) {
	var old_html = document.getElementById(value).innerHTML;
	var new_html = '<div class="tint">' + old_html + '</div>';
	document.getElementById(value).innerHTML = new_html;
	document.getElementById(value).style.backgroundColor = colour;

	// game end
	if (colour == "black" || colour == COLOR_BLACK) {
		document.getElementById(value).style.color = "white";
		document.body.style.backgroundColor = COLOR_GRAY;
	}
}

function clicked(value) {
	if (spyMasterMode) {
		//spymaster mode
		doTint(value, COLOR_GREEN);
	} else {
		//guessers mode
		var word = wordsSelected[value];
		if (document.getElementById("confirm").checked) {
			var option = $('#gameMode :selected').val();
			var question = "";
			switch (option) {
				case 'online_pic':
				case 'online_bw_pic':
				case 'local_pic':
					question = "Are you sure you want to select this picture?";
					break;
				default:
					question = "Are sure you want to select '" + word + "'?";
			}
			if (window.confirm(question)) {
				doTint(value, teams[value]);
			}
		} else {
			doTint(value, teams[value]);
		}
	}
	updateScore();
}

function updateScore() {
	var blueScore = totalGuesses() + 1;
	var redScore = totalGuesses() + 1;
	if (spyMasterMode) {
		blueScore = 0;
		redScore = 0;
		$('div.word').each(function() {
			var color = $(this).css('background-color');
			if (color === 'rgb(0, 238, 238)') {
				blueScore++;
			}
			if (color === 'rgb(255, 0, 0)') {
				redScore++;
			}
		});
	} else {
		$('div.word').each(function() {
			var color = $(this).css('background-color');
			if (color === 'rgb(0, 238, 238)') {
				blueScore--;
			}
			if (color === 'rgb(255, 0, 0)') {
				redScore--;
			}
		});

		if ($('.redStarts').length === 1) {
			blueScore--;
		} else {
			redScore--;
		}
	}
	$('#redScore').text(redScore);
	$('#blueScore').text(blueScore);
	if(redScore === 0){
		$('#redScore').text('Winner!');
	}
	if(blueScore === 0){
		$('#blueScore').text('Winner!');
	}
}

function spyMaster() {
	//TODO: randomize or organize tiles for easier comparing
	spyMasterMode = true;
	for (var i = 0; i < number_of_items; i++) {
    console.log(teams[i]);
		document.getElementById(i).style.backgroundColor = teams[i];
		if (teams[i] == "black" || teams[i] === COLOR_BLACK) {
      console.log(i, document.getElementById(i));
			document.getElementById(i).style.color = "white";
		}
	}
}

function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

//enable pressing 'Enter' on seed field
document.getElementById('seed').onkeypress = function(e) {
	if (!e) e = window.event;
	var keyCode = e.keyCode || e.which;
	if (keyCode == '13') {
		// Enter pressed
		fire();
		return false;
	}
}
