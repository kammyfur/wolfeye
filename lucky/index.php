<?php

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

header("Location: " . $entriesdom[0]["link"]);
die();