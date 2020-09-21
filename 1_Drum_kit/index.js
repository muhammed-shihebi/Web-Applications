function playAudio(key) {
    var audio;
    switch (key) {
        case "w":
            audio = new Audio('sounds/crash.mp3');
            audio.play();
            break;
        case "a":
            audio = new Audio('sounds/kick-bass.mp3');
            audio.play();
            break;
        case "d":
            audio = new Audio('sounds/snare.mp3');
            audio.play();
            break;
        case "s":
            audio = new Audio('sounds/tom-1.mp3');
            audio.play();
            break;
        case "j":
            audio = new Audio('sounds/tom-2.mp3');
            audio.play();
            break;
        case "k":
            audio = new Audio('sounds/tom-3.mp3');
            audio.play();
            break;
        case "l":
            audio = new Audio('sounds/tom-4.mp3');
            audio.play();
            break;
        default:
            console.log(key);
    }
}


function buttonAnimation(key){
	var buttonPressed = document.querySelector("." + key);
	buttonPressed.classList.add("pressed");
	setTimeout(function(){
		buttonPressed.classList.remove("pressed");
	}, 100); 
}


// mouse Listener
var buttons = document.querySelectorAll(".drum");
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function() {
        var innerText = this.innerHTML;
        playAudio(innerText);
		buttonAnimation(innerText);
    });
}

// keyboard listener
document.addEventListener("keydown", function(event) {
    var key = event.key;
    playAudio(key);
	buttonAnimation(key);
});
