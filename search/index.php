<?php

$start = microtime(true);
$start_io = microtime(true);
$data = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/db.json"), true);
$dict = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/dictionary.json"), true);

if (isset($_GET['q'])) {
    $query = strtolower(substr($_GET['q'], 0, 200));
    $query = preg_replace("/[^A-Za-z0-9 ]/", '', preg_replace("/[\.]/", ' ', $query));
} else {
    header("Location: /");
    die();
}

if (trim($query) === "") {
    header("Location: /");
    die();
}
$elapsed_io = microtime(true) - $start_io;

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= ucfirst($query) ?> on WolfEye</title>
    <link rel="stylesheet" href="/assets/main.css">
    <link rel="icon" href="/logo.svg">
</head>
<body>
    <div id="results-intro">
        <a href="/" id="results-intro-logo"><img id="results-intro-logo-img" src="/logo.svg"></a>
        <form id="results-intro-bar" action="/search">
            <input id="results-intro-bar-input" autocomplete="off" spellcheck="false" type="text" name="q" value="<?= $query ?>" placeholder="Search the Web...">
            <input type="submit" value="Search" id="results-intro-bar-submit">
        </form>
    </div>

    <div id="intro-results-separator"></div><?php

    // Autocorrect
    $start_correct = microtime(true);
    $fixed = false;
    $fixes = [];
    $fixesd = [];

    foreach (explode(" ", $query) as $item) {
        $shortest = -1;
        foreach ($dict as $word) {

            $lev = levenshtein($item, $word);

            if ($lev == 0) {
                $closest = $word;
                $shortest = 0;

                break;
            }

            if ($lev <= $shortest || $shortest < 0) {
                $closest  = $word;
                $shortest = $lev;
            }
        }

        if ($shortest !== 0 && $shortest < 15 && $item !== "wolfeye" && $item !== "eye") {
            $fixed = true;
            $fixes[] = str_replace($item, $closest, $query);
            $fixesd[] = str_replace($item, "<b>$closest</b>", $query);
        }

        if ($query === "google") {
            $fixed = true;
            $fixes[] = str_replace($item, "duckduckgo", $query);
            $fixesd[] = str_replace($item, "<b>duckduckgo</b>", $query);
        }

        if ($query === "microsoft") {
            $fixed = true;
            $fixes[] = str_replace($item, "redhat", $query);
            $fixesd[] = str_replace($item, "<b>redhat</b>", $query);
        }

        if ($query === "windows") {
            $fixed = true;
            $fixes[] = str_replace($item, "linux", $query);
            $fixesd[] = str_replace($item, "<b>linux</b>", $query);
        }

        if ($query === "apple") {
            $fixed = true;
            $fixes[] = str_replace($item, "raspberry", $query);
            $fixesd[] = str_replace($item, "<b>raspberry</b>", $query);
        }

        if ($query === "france") {
            $fixed = true;
            $fixes[] = str_replace($item, "hell", $query);
            $fixesd[] = str_replace($item, "<b>hell</b>", $query);
        }
    }

    if ($fixed) {
        echo("<div class='dym-section'>");
        if (count($fixes) > 1) {
            echo("Showing results for \"$query\", did you mean:<ul>");
            foreach ($fixes as $i => $fix) {
                echo("<li>\"<a class='dym-link' href='/search?q=$fix'>$fixesd[$i]</a>\"?</li>");
            }
            echo("</ul>");
        } else {
            echo("Showing results for \"$query\", did you mean \"<a class='dym-link' href='/search?q=$fixes[0]'>$fixesd[0]</a>\"?");
        }
        echo("</div>");
    }
    $elapsed_correct = microtime(true) - $start_correct;

    // Actual Search
    $start_search = microtime(true);
    $matches = [];
    foreach ($data["entries"] as $id => $item) {
        $avg = -1;
        $aavg = [];
        $iparsed = strtolower(substr($item["title"], 0, 200));
        $iparsed = preg_replace("/[^A-Za-z0-9 ]/", '', preg_replace("/[\.]/", ' ', $iparsed));
        $qwords = explode(" ", $query);

        if (trim($iparsed) !== "") {
            foreach ($qwords as $qword) {
                $sim = similar_text($iparsed, $qword, $perc);
                if ($perc > 0) {
                    $aavg[] = $perc;
                }
            }

            if (count($aavg) > 0) {
                $aavg = array_filter($aavg);
                $avg = (array_sum($aavg) / count($aavg)) / 50 - 1;
                $matches[] = [
                    "id" => $id,
                    "relevance" => $avg
                ];
            }
        }

        $avg = -1;
        $aavg = [];
        $iparsed = strtolower(substr($item["url"], 0, 200));
        $iparsed = preg_replace("/[^A-Za-z0-9 ]/", '', preg_replace("/[\.]/", ' ', $iparsed));
        $qwords = explode(" ", $query);

        if (trim($iparsed) !== "") {
            foreach ($qwords as $qword) {
                $sim = similar_text($iparsed, $qword, $perc);
                if ($perc > 0) {
                    $aavg[] = $perc;
                }
            }

            if (count($aavg) > 0) {
                $aavg = array_filter($aavg);
                $avg = (array_sum($aavg) / count($aavg)) / 50 - 1;
                $matches[] = [
                    "id" => $id,
                    "relevance" => $avg
                ];
            }
        }
    }

    usort($matches, function($a, $b) {
        return $a['relevance'] <=> $b['relevance'];
    });

    $matches = array_reverse($matches);

    $matches2 = [];
    $prel = [];

    foreach($matches as $match) {
        if (!isset($prel[(string)$match["relevance"]])) {
            $prel[(string)$match["relevance"]] = [$match];
        } else {
            $prel[(string)$match["relevance"]][] = $match;
        }
    }

    $elapsed_search = microtime(true) - $start_search;
    $start_parse = microtime(true);
    $entriesdom = [];
    foreach($prel as $item => $items) {
        $shortest = -1;

        foreach ($items as $word) {
            $lev = levenshtein($query, $data["entries"][$word["id"]]["title"]);

            if ($lev == 0) {
                $closest = $word["id"];
                $shortest = 0;
                break;
            }

            if ($lev <= $shortest || $shortest < 0) {
                $closest  = $word["id"];
                $shortest = $lev;
            }
        }

        $entriesdom[] = [
            "link" => "/out?q=" . $query . "&u=" . uniqid() . "&i=" . $closest,
            "title" => $data["entries"][$closest]["title"],
            "url" => $data["entries"][$closest]["url"],
            "icon" => "/icon?q=" . $query . "&i=" . $closest,
        ];
    }
    $elapsed_parse = microtime(true) - $start_parse;
    ?>
    <p id="results-debug"><small id="results-debug-inner"><?= count($entriesdom) ?> results</small></p>

    <div id="details"></div>
    <script>query = "<?= $query ?>";</script>
    <script src="/assets/instant.js"></script>

    <div id="results">
        <?php $start_official = microtime(true); $domains = []; foreach ($data["entries"] as $id => $entry): ?>
            <?php $domain = explode("/", $entry["url"])[2];
            $sim = similar_text($domain, $query, $perc);
            if (substr($domain, 0, 4) === "www.") {
                $domainstr = substr($domain, 4);
            } else {
                $domainstr = $domain;
            }
            $domains[] = [
                "id" => $id,
                "url" => "https://" . $domain . "/",
                "domain" => $domainstr,
                "relevance" => $perc / 50 - 1
            ];
            ?>
        <?php endforeach;

        usort($domains, function($a, $b) {
            return $a['relevance'] <=> $b['relevance'];
        });

        $domains = array_reverse($domains); if ($domains[0]["relevance"] > 0): ?>
            <div class="result result-official">
                <a href="<?= $domains[0]["url"] ?>">
                    <div class="result-name" style="font-size: 18px;"><img alt="" class="result-icon" src="/icon/?q=<?= $query ?>&u=<?= uniqid() ?>&i=_off"> <b><?= ucfirst($domains[0]["domain"]) ?></b> <img class="result-relevant" src="/assets/relevant.svg" title="Official Website" alt=""></div>
                    <div class="result-url"><small><?= $domains[0]["url"] ?></small></div>
                </a>
            </div>
        <?php endif; $elapsed_official = microtime(true) - $start_official; ?>
        <?php $index = 0; foreach ($entriesdom as $entry): if ($index < 100): ?>
            <div class="result">
                <a href="<?= $entry["link"] ?>">
                    <div class="result-name" style="font-size: 18px;"><img alt="" class="result-icon" src="/icon/?q=<?= $entry["icon"] ?>"> <b><?= $entry["title"] ?></b></div>
                    <div class="result-url"><small><?= $entry["url"] ?></small></div>
                </a>
            </div>
        <?php $index++; endif; endforeach; ?>
    </div>

    <?php $time_elapsed_secs = microtime(true) - $start; ?>
    <script>
        document.getElementById("results-debug-inner").innerHTML = document.getElementById("results-debug-inner").innerHTML + " in <?= round($time_elapsed_secs * 1000, 3) ?> ms<span id='results-debug-inner-details'> (io: <?= round($elapsed_io * 1000, 3) ?>; correct: <?= round($elapsed_correct * 1000, 3) ?>; search: <?= round($elapsed_search * 1000, 3) ?>; parse: <?= round($elapsed_parse * 1000, 3) ?>; official: <?= round($elapsed_official * 1000, 3) ?>)</span>";
    </script>
</body>
</html>
