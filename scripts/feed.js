const FEED_API = "https://challenge.carmanahsigns.com/";
// How often the feed will be refreshed, in seconds
const FEED_INTERVAL = 60;

// How long to wait before displaying the side video overlay, in seconds
const OVERLAY_DELAY = 2;

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
    
    /*
    In order to synchronize both side videos, the first is selected as the
    "controller" and the second is selected as the "worker". An event listener
    is attached to the first video so at each time step the time on the second
    video is updated to match the first.
    */
    const videoController = document.querySelector(".side-video video");
    const videoWorker = document.querySelector(".side-video:last-of-type video");
    const sideVideoOverlays = document.querySelectorAll(".side-video .overlay");
    
    videoController.addEventListener("timeupdate", (e) => {
        // Quick and dirty way to synchronize the two videos
        let time = e.target.currentTime;
        
        if (Math.abs(videoWorker.currentTime - time) > .1) {
            videoWorker.currentTime = time;
        }
        
        // Display the jackpot overlays if appropriate
        if (time >= OVERLAY_DELAY) {
            sideVideoOverlays.forEach(o => o.classList.remove("hidden"));
        } else {
            sideVideoOverlays.forEach(o => o.classList.add("hidden"));
        }
    });
    
    // Update the feed
    update();
    setInterval(update, FEED_INTERVAL*1000);
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