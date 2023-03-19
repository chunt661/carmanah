// How often the takeover video will be displayed, in seconds
const TAKEOVER_INTERVAL = 30;

document.addEventListener("DOMContentLoaded", function() {
    // Start the takeover video timer
    const takeoverVideo = document.querySelector("#takeover-video video");
    takeoverVideo.addEventListener("ended", hideTakeoverVideo);
    
    startTakeoverTimer();
});

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