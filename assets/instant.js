(async () => {
    instant = JSON.parse(
        (await (
            await (
                await window.fetch("/ratelimited/instant.php?q=" + query)
            ).blob()
        ).text()
    ));

    document.getElementById("details").innerHTML = "<small id='details-source'>from <a id='details-source-link' href='https://duckduckgo.com' target='_blank'>DuckDuckGo</a>:</small><p>" + instant.Abstract + "</p><p><i>— <a href='" + instant.AbstractURL + "' id='details-data-link' target='_blank'>" + instant.AbstractSource + "</a></i></p>";

    if (instant.Abstract.trim() !== "") {
        document.getElementById("details").style.display = "block";
        document.getElementById("results").classList.add("with-details");
        try {document.getElementsByClassName("dym-section")[0].outerHTML = ""; } catch (e) {}
    } else {
        answer = (await (
                    await (
                        await window.fetch("/ratelimited/answer.php?q=" + query)
                    ).blob()
                ).text()
            )
        if (answer.trim() !== "Wolfram|Alpha did not understand your input" && answer.trim() !== "No short answer available" && answer.trim() !== "") {
            document.getElementById("details").innerHTML = "<small id='details-source'>from <a id='details-source-link' href='https://www.wolframalpha.com/input/?i=" + encodeURI(query) + "' target='_blank'>Wolfram|Alpha</a>:</small><p>" + answer + "</p><p><details><summary style='cursor:pointer;'>Disclaimer</summary>This information is provided by Wolfram|Alpha. Results and information from this site are not a certified or definitive source of information that can be relied on for legal, financial, medical, life-safety or any other critical purposes.</details></p>";
            document.getElementById("details").style.display = "block";
            document.getElementById("results").classList.add("with-details");
            try {document.getElementsByClassName("dym-section")[0].outerHTML = ""; } catch (e) {}
        }
    }

    if (!instant._WolfEye_External) {
        try { document.getElementById("details-source").innerHTML = "&nbsp;" } catch (e) {}
        try { document.getElementById("details-data-link").target = "" } catch (e) {}
    }

    if (instant.Results[0]) {
        if (!document.getElementsByClassName("result-official")[0]) {
            document.getElementById("results").innerHTML = '<div class="result result-official"><a href="https://example.com"><div class="result-name" style="font-size: 18px;"><img alt="" class="result-icon" src="about:blank"> <b>Example</b> <img class="result-relevant" src="/assets/relevant.svg" alt=""></div><div class="result-url"><small>https://example.com/</small></div></a></div>' +  document.getElementById("results").innerHTML;
        }

        document.getElementsByClassName("result-official")[0].classList.add("result-verified");
        document.getElementsByClassName("result-official")[0].children[0].href = instant.Results[0].FirstURL;
        document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].src = "/assets/verified.svg";
        document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].title = "Verified Website";
        document.getElementsByClassName("result-official")[0].children[0].children[0].children[0].src = "https://duckduckgo.com" + instant.Results[0].Icon.URL;
        document.getElementsByClassName("result-official")[0].children[0].children[0].children[1].innerText = instant.Heading;
        document.getElementsByClassName("result-official")[0].children[0].children[1].children[0].innerText = instant.Results[0].FirstURL;
    }

    if (query === "wolfeye" || query === "wolf eye") {
        document.getElementById("details").innerHTML = "<h3>Hold tight! Let's go home...</h3><p>You are already using WolfEye; but you seem lost. Use the search bar at the top of this page to search for something on the Web.</p>"
        document.getElementById("details").style.display = "block";

        if (!document.getElementsByClassName("result-official")[0]) {
            document.getElementById("results").innerHTML = '<div class="result result-official"><a href="https://example.com"><div class="result-name" style="font-size: 18px;"><img alt="" class="result-icon" src="about:blank"> <b>Example</b> <img class="result-relevant" src="/assets/relevant.svg" alt=""></div><div class="result-url"><small>https://example.com/</small></div></a></div>' +  document.getElementById("results").innerHTML;
        }

        document.getElementsByClassName("result-official")[0].classList.add("result-verified");
        document.getElementsByClassName("result-official")[0].children[0].href = "https://wolfeye.minteck.org";
        document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].src = "/assets/verified.svg";
        document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].title = "Verified Website";
        document.getElementsByClassName("result-official")[0].children[0].children[0].children[0].src = "/logo.svg";
        document.getElementsByClassName("result-official")[0].children[0].children[0].children[1].innerText = "WolfEye";
        document.getElementsByClassName("result-official")[0].children[0].children[1].children[0].innerText = "https://wolfeye.minteck.org";
    }
})()