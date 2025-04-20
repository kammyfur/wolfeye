<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WolfEye</title>
    <link rel="icon" href="/logo.svg">
    <link rel="stylesheet" href="assets/main.css">
</head>
<body>
    <div class="container">
        <h1 class="title is-1" id="home-logo">
            <img src="/logo.svg">
        </h1>
        <form action="search">
            <input id="home-bar" class="search-input" autocomplete="off" spellcheck="false" type="text" name="q" placeholder="Search the Web...">
            <br/>
            <div class="searchbtn">
                <input class="home-btn" id="home-submit" type="submit" value="WolfEye Search">
                <input class="home-btn home-btn-last" onclick="if (document.getElementById('home-bar').value.trim() === '') return; location.href = '/lucky?q=' + encodeURI(document.getElementById('home-bar').value);" id="home-lucky" type="button" value="I'm Feeling Lucky">
            </div>
            <link rel="icon" href="/logo.svg">
        </form>
    </div>
</body>
</html>
