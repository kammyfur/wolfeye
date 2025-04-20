window.addEventListener('load', () => {
    setTimeout(() => {
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        $("#reveal").fadeTo(0, 0)
        $("#reveal2").fadeTo(0, 0)
        $("#reveal3").fadeTo(0, 0)
        $("#reveal4").fadeTo(0, 0)
        $("#reveal5").fadeTo(0, 0)
        $("#reveal6").fadeTo(0, 0)

        setInterval(() => {
            if (isInViewport(document.getElementById("reveal")) && document.getElementById("reveal").style.opacity !== "1") {
                $("#reveal").fadeTo(500, 1)
            }
            if (!isInViewport(document.getElementById("reveal"))) {
                $("#reveal").fadeTo(0, 0)
            }

            if (isInViewport(document.getElementById("reveal2")) && document.getElementById("reveal2").style.opacity !== "1") {
                $("#reveal2").fadeTo(500, 1)
            }
            if (!isInViewport(document.getElementById("reveal2"))) {
                $("#reveal2").fadeTo(0, 0)
            }

            if (isInViewport(document.getElementById("reveal3")) && document.getElementById("reveal3").style.opacity !== "1") {
                $("#reveal3").fadeTo(500, 1)
            }
            if (!isInViewport(document.getElementById("reveal3"))) {
                $("#reveal3").fadeTo(0, 0)
            }

            if (isInViewport(document.getElementById("reveal4")) && document.getElementById("reveal4").style.opacity !== "1") {
                $("#reveal4").fadeTo(500, 1)
            }
            if (!isInViewport(document.getElementById("reveal4"))) {
                $("#reveal4").fadeTo(0, 0)
            }

            if (isInViewport(document.getElementById("reveal5")) && document.getElementById("reveal5").style.opacity !== "1") {
                $("#reveal5").fadeTo(500, 1)
            }
            if (!isInViewport(document.getElementById("reveal5"))) {
                $("#reveal5").fadeTo(0, 0)
            }

            if (isInViewport(document.getElementById("reveal6")) && document.getElementById("reveal6").style.opacity !== "1") {
                $("#reveal6").fadeTo(500, 1)
            }
            if (!isInViewport(document.getElementById("reveal6"))) {
                $("#reveal6").fadeTo(0, 0)
            }
        }, 100)
    }, 500)
})