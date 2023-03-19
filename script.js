const FEED_API = "https://challenge.carmanahsigns.com/";
// How often the feed will be refreshed, in seconds
const FEED_INTERVAL = 60;
// How often the takeover video will be displayed, in seconds
const TAKEOVER_INTERVAL = 30;

/*
List of lottery identifiers. Used for iterating through the different jackpots
and ensuring that each is updated every cycle. This must be maintained on the
client side, as the API does not consistently return all lotteries and
therefore some jackpots may be missed during an update.
*/
const LOTTO_IDS = [
    "lmax",
    "l649",
    "scratch",
    "dg"
];

document.addEventListener("DOMContentLoaded", function() {
    // Generate markup at each location marked in the HTML file
    LOTTO_IDS.forEach(id => {
        document.querySelectorAll(`.lotto-${id}`).forEach(tag => {
            tag.appendChild(createJackpotMarkup(id));
        });
    });
    
    // Update the feed
    update();
    setInterval(update, FEED_INTERVAL*1000);
    
    // Start the takeover video timer
    const takeoverVideo = document.querySelector("#takeover-video video");
    takeoverVideo.addEventListener("ended", hideTakeoverVideo);
    
    startTakeoverTimer();
});

/**
Downloads jackpot data from the feed API and updates the display.
*/
function update() {
    fetch(FEED_API)
        .then(response => response.json())
        .then(json => {
            LOTTO_IDS.forEach(id => {
                try {
                    if (json[id] && json[id].jackpot) {
                        let jackpot = json[id].jackpot.replace(/,/g, "");
                        jackpot = parseInt(jackpot);
                        
                        if (isNaN(jackpot)) {
                            throw new Error("Jackpot is not a number");
                        }
                        
                        displayJackpot(id, parseInt(jackpot));
                    }
                } catch(e) {
                    displayError(id);
                }
            });
        })
        .catch(e => {
            LOTTO_IDS.forEach(id => displayError(id));
        });
}

/**
Creates and returns a DOM element to be used for displaying jackpots.
*/
function createJackpotMarkup() {
    const container = document.createElement("div");
    
    // errorContainer holds the error ellipsis
    const errorContainer = document.createElement("div");
    errorContainer.classList.add("error-container");
    
    for (let i = 0; i < 3; i++) {
        let span = document.createElement("span");
        errorContainer.appendChild(span);
    }
    
    // jackpotContainer holds all tags related to the jackpot display
    // (the jackpot is hidden by default)
    const jackpotContainer = document.createElement("div");
    jackpotContainer.classList.add("jackpot-container", "hidden");
    
    // amountDisplay holds the dollar sign and jackpot amount
    const amountDisplay = document.createElement("div");
    
    const dollarSign = document.createElement("span");
    dollarSign.classList.add("dollar");
    dollarSign.textContent = "$";
    
    const jackpot = document.createElement("span");
    jackpot.classList.add("jackpot");
    
    const unitDisplay = document.createElement("div");
    unitDisplay.classList.add("illion");
    
    amountDisplay.append(dollarSign, jackpot);
    jackpotContainer.append(amountDisplay, unitDisplay);
    
    container.append(errorContainer, jackpotContainer);
    
    return container;
}

/**
Updates DOM elements to display the given jackpot. The jackpot is formatted and
the accompanying unit (i.e., million or billion) is displayed when necessary.

@param id The identifer for the lottery being updated.
@param jackpot The jackpot dollar amount.
*/
function displayJackpot(id, jackpot) {
    let number = jackpot; // Number to be displayed
    let unit = ""; // The million/billion display

    if (jackpot >= 10e8) {
        unit = "BILLION";
        number = jackpot / 10e8;
        // Truncates decimals beyond the tenths place
        number = Math.trunc(number*10)/10;
    } else if (jackpot >= 10e5) {
        unit = "MILLION";
        number = Math.floor(jackpot / 10e5);
    } else {
        // Adds commas to the number
        number = Math.floor(number).toLocaleString("en-US");
    }
    
    document.querySelectorAll(`.lotto-${id}`).forEach(lotto => {
        lotto.querySelector(".error-container").classList.add("hidden");
        lotto.querySelector(".jackpot-container").classList.remove("hidden");
        lotto.querySelector(".jackpot").textContent = number;
        lotto.querySelector(".illion").textContent = unit;
    });
}

/**
Displays the error animation and hides the jackpot for the given lottery.

@param id The lottery identifier.
*/
function displayError(id) {
    document.querySelectorAll(`.lotto-${id}`).forEach(lotto => {
        lotto.querySelector(".error-container").classList.remove("hidden");
        lotto.querySelector(".jackpot-container").classList.add("hidden");
    });
}

/**
Begins the countdown to display the takeover video. A timeout is used rather
than an interval because an interval does not take into account the length of
the video - i.e., the interval triggers and the video plays for 5 seconds, but
the next interval countdown begins immediately. As a result, the subsequent
length of time between videos would be 25 seconds rather than 30.

Instead, a 30-second timer is set each time the video ends to ensure
consistency (as much as JavaScript timeouts can allow, at least).
*/
function startTakeoverTimer() {
    setTimeout(showTakeoverVideo, TAKEOVER_INTERVAL*1000);
}

function showTakeoverVideo() {
    const container = document.querySelector("#takeover-video");
    const video = container.querySelector("video");
    
    container.classList.remove("hidden");
    
    createTakeoverAnimation(1, 8, false, () => {
        // Remove animation from feed tiles after transition finishes
        document.querySelectorAll(".tile").forEach(tile => {
            tile.classList.add("hidden");
            tile.classList.remove("tile-animation");
        });
    });
    
    video.classList.add("takeover-video-animation");
    video.play();
    
    // Stop the side videos
    document.querySelectorAll(".side-video video").forEach(v => v.pause());
}

function hideTakeoverVideo() {
    const container = document.querySelector("#takeover-video");
    
    container.classList.add("hidden");
    
    createTakeoverAnimation(.3, 1, true, () => {
        // Show the feed tile animation after the transition finishes
        document.querySelectorAll(".tile").forEach(tile => {
            tile.classList.remove("hidden");
            tile.classList.add("tile-animation");
        });
    });
    
     // Resume the side videos from the beginning
    document.querySelectorAll(".side-video video").forEach(v => v.play());
    
    // Restart the takeover timer
    startTakeoverTimer();
}

/**
Populates the transition overlay container with elements that play an
animation.

@param duration The duration of the animation, in seconds
@param numCircles How many circle animations to generate
@param reversed Whether the animation should play in reverse
@param callback The function to be executed when the animation completes
*/
function createTakeoverAnimation(duration, numCircles, reversed, callback) {
    const overlay = document.querySelector("#takeover-overlay");
    
    // Create circles for transition animation
    for (let i = 0; i < numCircles; i++) {
        let circle = document.createElement("div");
        circle.classList.add("circle-transition");
        circle.style.animationDuration = duration + "s";
        circle.style.animationDelay = (.05 * i) + "s";
        circle.style.animationDirection = reversed ? "reverse" : "normal";

        overlay.appendChild(circle);
        
        // Clear animation elements when final animation ends
        if (i == numCircles-1) {
            circle.addEventListener("animationend", () => {
                overlay.innerHTML = "";
                if (callback) {
                    callback();
                }
            });
        }
    }
}