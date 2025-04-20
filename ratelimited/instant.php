<?php

if (isset($_GET['q'])) {
    $query = strtolower(substr($_GET['q'], 0, 200));
    $query = preg_replace("/[^A-Za-z0-9 ]/", '', preg_replace("/[\.]/", ' ', $query));
} else {
    header("Location: /");
    die();
}

$addr = sha1($_SERVER['REMOTE_ADDR']);
$cacheOnly = false;
$rl = [
    "local" => -1,
    "global" => -1,
    "blocked" => false
];

if (!file_exists($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/" . $addr)) {
    file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/" . $addr, "1|" . date('YmdHi'));
} else {
    $requests = (int)explode("|", file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/" . $addr))[0];
    $date = explode("|", file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/" . $addr))[1];
    if ($date === date('YmdHi')) {
        $requests++;
        if ($requests > 3) {
            $cacheOnly = true;
            $rl["blocked"] = true;
        }
        file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/" . $addr, $requests . "|" . date('YmdHi'));
    } else {
        file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/" . $addr, "1|" . date('YmdHi'));
    }

    $rl["local"] = $requests;
}

if (!file_exists($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_global")) {
    file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_global", "1|" . date('YmdHi'));
} else {
    $requests = (int)explode("|", file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_global"))[0];
    $date = explode("|", file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_global"))[1];
    if ($date === date('YmdHi')) {
        $requests++;
        if ($requests >= 20) {
            $cacheOnly = true;
            $rl["blocked"] = true;
        }
        file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_global", $requests . "|" . date('YmdHi'));
    } else {
        file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_global", "1|" . date('YmdHi'));
    }

    $rl["global"] = $requests;
}

header("Content-Type: application/json");

if (file_exists($_SERVER["DOCUMENT_ROOT"] . "/private/instants/" . str_replace(" ", "_", $query))) {
    $ds = "local";
    $data = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/private/instants/" . str_replace(" ", "_", $query));
} else if (file_exists($_SERVER["DOCUMENT_ROOT"] . "/private/cache/instant_" . str_replace(" ", "_", $query))) {
    $ds = "cache";
    $data = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/private/cache/instant_" . str_replace(" ", "_", $query));
} else {
    if ($cacheOnly) {
        die();
    } else {
        $ds = "online";
        $data = file_get_contents("https://api.duckduckgo.com/?q=" . $query . "&format=json&pretty=1&t=Minteck-WolfEye_https://minteck.org&skip_disambig=1&no_redirect=1&no_html=1");
        file_put_contents($_SERVER["DOCUMENT_ROOT"] . "/private/cache/instant_" . str_replace(" ", "_", $query), $data);
    }
}

$parsed = json_decode($data, true);
$parsed = array_reverse($parsed);
$parsed["_WolfEye_DataSource"] = $ds;
$parsed["_WolfEye_RateLimiting"] = $rl;
$parsed["_WolfEye_External"] = $ds !== "local";
$parsed = array_reverse($parsed);

die(json_encode($parsed, JSON_PRETTY_PRINT));