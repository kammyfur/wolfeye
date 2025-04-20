<?php

if (!isset($_GET['q']) || !isset($_GET['u']) || !isset($_GET['i'])) {
    header("Location: /");
    die();
}

$_GET['q'] = strtolower(substr($_GET['q'], 0, 200));
$_GET['q'] = preg_replace("/[^A-Za-z0-9 ]/", '', preg_replace("/[\.]/", ' ', $_GET['q']));

$data = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/db.json"), true);

if ($_GET['i'] !== "_off" && isset($data["entries"][$_GET['i']])) {
    header("Location: " . $data["entries"][$_GET['i']]["url"]);
    die();
} elseif ($_GET['i'] === "_off") {
    $domains = [];

    foreach ($data["entries"] as $id => $entry) {
        $domain = explode("/", $entry["url"])[2];
        $sim = similar_text($domain, $_GET['q'], $perc);
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
    }

    usort($domains, function($a, $b) {
        return $a['relevance'] <=> $b['relevance'];
    });

    $domains = array_reverse($domains);
    header("Location: " . $domains[0]['url']);
    die();
}