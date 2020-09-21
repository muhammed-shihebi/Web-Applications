var buttonColours = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var gameState = false;
var level = 0;

function playSound(id) {
    var audio = new Audio("sounds/" + id + ".mp3");
    audio.play();
}

function animatePress(currentColour) {
    $("#" + currentColour).addClass("pressed");
    setTimeout(function() {
        $("#" + currentColour).removeClass("pressed");
    }, 100);
}

function nextSequence() {
    var randomNumber = Math.floor(Math.random() * 4);
    var randomChosenColour = buttonColours[randomNumber];
    gamePattern.push(randomChosenColour);
    $("#" + randomChosenColour).fadeOut(50).fadeIn(50);
    playSound(randomChosenColour);
	level++;
	$("#" + "level-title").text("Level " + level);
}

function checkAnswer(currentLevel){
	if(userClickedPattern[currentLevel] === gamePattern[currentLevel]){
		if(gamePattern.length - 1 === currentLevel){
			setTimeout(function(){
				nextSequence();
			}, 1000)
			userClickedPattern = [];
		}
	}else{
		var audio = new Audio("sounds/wrong.mp3");
		audio.play();
		$("body").addClass("game-over");
		setTimeout(function(){
			$("body").removeClass("game-over");
		},200);
		$("#" + "level-title").text("Game Over, Press Any Key to Restart");
		startOver();
	}
}

function startOver(){
	gameState = false;
	gamePattern = [];
	level = 0;
}


$(".btn").click(function(event) {
    var userChosenColour = this.id;
    userClickedPattern.push(userChosenColour);
    playSound(userChosenColour);
    animatePress(userChosenColour);
	checkAnswer(userClickedPattern.length-1);
});


$(document).keydown(function() {
    if (gameState === false) {
        gameState = true;
        nextSequence();
        $("#" + "level-title").text("Level " + level);
    }
})
