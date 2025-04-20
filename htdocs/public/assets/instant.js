(async () => {
    try {
        instant = JSON.parse(
            (await (
                    await (
                        await window.fetch("https://api.wolfeye.minteck.org/api/instant", { method: "POST", body: JSON.stringify({ query }), headers: { "Content-Type": "application/json" } })
                    ).blob()
                ).text()
            )).res;

        if (instant.Abstract.trim() !== "") {
            document.getElementById("details").style.display = "block";
            document.getElementById("results").classList.add("with-details");
            try {document.getElementsByClassName("dym-section")[0].outerHTML = ""; } catch (e) {}

            document.getElementById("details-inner").innerHTML = "<small id='details-source'>" + lang.results.source + " <a id='details-source-link' href='https://duckduckgo.com' target='_blank'>DuckDuckGo</a>:</small><p>" + instant.Abstract + "</p><p><i>— <a href='" + instant.AbstractURL + "' id='details-data-link' target='_blank'>" + instant.AbstractSource + "</a></i></p>";
        } else {
            instant2 = JSON.parse(
                (await (
                        await (
                            await window.fetch("./instant/?q=" + encodeURI(query).replace(/\+/g, "%2B"))
                        ).blob()
                    ).text()
                ));

            if (instant2.Abstract.trim() !== "") {
                document.getElementById("details").style.display = "block";
                document.getElementById("results").classList.add("with-details");
                try {document.getElementsByClassName("dym-section")[0].outerHTML = ""; } catch (e) {}

                document.getElementById("details-inner").innerHTML = "<small id='details-source'>" + lang.results.source + " <a id='details-source-link' href='https://duckduckgo.com' target='_blank'>DuckDuckGo</a>:</small><p>" + instant2.Abstract + "</p><p><i>— <a href='" + instant2.AbstractURL + "' id='details-data-link' target='_blank'>" + instant2.AbstractSource + "</a></i></p>";
            } else {
                answer = (await (
                        await (
                            await window.fetch("./answer?q=" + encodeURI(query).replace(/\+/g, "%2B"))
                        ).blob()
                    ).text()
                )
                if (answer.trim() !== "Wolfram|Alpha did not understand your input" && answer.trim() !== "No short answer available" && answer.trim() !== "") {
                    document.getElementById("details-inner").innerHTML = "<small id='details-source'>" + lang.results.source + " <a id='details-source-link' href='https://www.wolframalpha.com/input/?i=" + encodeURI(query) + "' target='_blank'>Wolfram|Alpha</a>:</small><p>" + answer + "</p><p><details><summary style='cursor:pointer;'>" + lang.results.disclaimer.title + "</summary>" + lang.results.disclaimer.description + "</details></p>";
                    document.getElementById("details").style.display = "block";
                    document.getElementById("results").classList.add("with-details");
                    try {
                        document.getElementsByClassName("dym-section")[0].outerHTML = "";
                    } catch (e) {
                    }
                } else {
                    document.getElementById("details").style.display = "none";
                }
            }
        }

        if (instant.Abstract.trim() === "" && typeof instant2 !== "undefined") {
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
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].title = lang.results.verify;
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[0].src = "https://duckduckgo.com" + instant.Results[0].Icon.URL;
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[1].innerText = instant.Heading;
            document.getElementsByClassName("result-official")[0].children[0].children[1].children[0].innerText = instant.Results[0].FirstURL;
        }

        if (typeof instant2 !== "undefined" && instant2.Results[0]) {
            if (!document.getElementsByClassName("result-official")[0]) {
                document.getElementById("results").innerHTML = '<div class="result result-official"><a href="https://example.com"><div class="result-name" style="font-size: 18px;"><img alt="" class="result-icon" src="about:blank"> <b>Example</b> <img class="result-relevant" src="/assets/relevant.svg" alt=""></div><div class="result-url"><small>https://example.com/</small></div></a></div>' +  document.getElementById("results").innerHTML;
            }

            document.getElementsByClassName("result-official")[0].classList.add("result-verified");
            document.getElementsByClassName("result-official")[0].children[0].href = instant2.Results[0].FirstURL;
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].src = "/assets/verified.svg";
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].title = lang.results.verify;
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[0].src = "https://duckduckgo.com" + instant2.Results[0].Icon.URL;
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[1].innerText = instant2.Heading;
            document.getElementsByClassName("result-official")[0].children[0].children[1].children[0].innerText = instant2.Results[0].FirstURL;
        }

        if (query === "wolfeye" || query === "wolf eye") {
            document.getElementById("details-inner").innerHTML = "<h3>" + lang.resuslts.local.title + "</h3><p>" + lang.resuslts.local.description + "</p>"
            document.getElementById("details-inner").style.display = "block";

            if (!document.getElementsByClassName("result-official")[0]) {
                document.getElementById("results").innerHTML = '<div class="result result-official"><a href="https://example.com"><div class="result-name" style="font-size: 18px;"><img alt="" class="result-icon" src="about:blank"> <b>Example</b> <img class="result-relevant" src="/assets/relevant.svg" alt=""></div><div class="result-url"><small>https://example.com/</small></div></a></div>' +  document.getElementById("results").innerHTML;
            }

            document.getElementsByClassName("result-official")[0].classList.add("result-verified");
            document.getElementsByClassName("result-official")[0].children[0].href = "https://wolfeye.minteck.org";
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].src = "/assets/verified.svg";
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[2].title = lang.results.verify;
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[0].src = "/logo.svg";
            document.getElementsByClassName("result-official")[0].children[0].children[0].children[1].innerText = "WolfEye";
            document.getElementsByClassName("result-official")[0].children[0].children[1].children[0].innerText = "https://wolfeye.minteck.org";
        }
    } catch (e) {
        console.error(e);

        answer = (await (
                await (
                    await window.fetch("./answer?q=" + encodeURI(query).replace(/\+/g, "%2B"))
                ).blob()
            ).text()
        )
        if (answer.trim() !== "Wolfram|Alpha did not understand your input" && answer.trim() !== "No short answer available" && answer.trim() !== "") {
            document.getElementById("details-inner").innerHTML = "<small id='details-source'>" + lang.results.source + " <a id='details-source-link' href='https://www.wolframalpha.com/input/?i=" + encodeURI(query) + "' target='_blank'>Wolfram|Alpha</a>:</small><p>" + answer + "</p><p><details><summary style='cursor:pointer;'>" + lang.results.disclaimer.title + "</summary>" + lang.results.disclaimer.description + "</details></p>";
            document.getElementById("details").style.display = "block";
            document.getElementById("results").classList.add("with-details");
            try {document.getElementsByClassName("dym-section")[0].outerHTML = ""; } catch (e) {}
        } else {
            document.getElementById("details").style.display = "none";
        }
    }

    if (document.getElementById("details-source").innerHTML === "&nbsp;") {
        document.getElementById("details-source").style.display = "none";
    } else {
        document.getElementById("details").style.display = "";
    }
})()