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

if (!file_exists($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_month")) {
    file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_month", "1|" . date('Ym'));
} else {
    $requests = (int)explode("|", file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_month"))[0];
    $date = explode("|", file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_month"))[1];
    if ($date === date('Ym')) {
        $requests++;
        if ($requests >= 1990) {
            $cacheOnly = true;
            $rl["blocked"] = true;
        }
        file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_month", $requests . "|" . date('Ym'));
    } else {
        file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/private/ratelimiting/_month", "1|" . date('Ym'));
    }

    $rl["monthly"] = $requests;
}

header("Content-Type: text/plain");
$text = urlencode($query);

if (file_exists($_SERVER["DOCUMENT_ROOT"] . "/private/answers/" . str_replace(" ", "_", $query))) {
    $ds = "local";
    $data = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/private/answers/" . str_replace(" ", "_", $query));
} else if (file_exists($_SERVER["DOCUMENT_ROOT"] . "/private/cache/answer_" . str_replace(" ", "_", $query))) {
    $ds = "cache";
    $data = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/private/cache/answer_" . str_replace(" ", "_", $query));
} else {
    if ($cacheOnly) {
        die();
    } else {
        $ds = "online";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.wolframalpha.com/v1/result?appid=" . urlencode(trim(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/keys/wolfram"))) . "&i=" . urlencode($query) . "&units=metric&timeout=10");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        $data = curl_exec($ch);
        curl_close($ch);
        file_put_contents($_SERVER["DOCUMENT_ROOT"] . "/private/cache/answer_" . str_replace(" ", "_", $query), $data);
    }
}

die($data);