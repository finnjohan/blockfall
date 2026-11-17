.pragma library
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
// Engelska nycklar, svensk översättning i tabellen.

var languages = [
    { code: "auto", name: "Automatic (system language)" },
    { code: "sv", name: "Svenska" },
    { code: "en", name: "English" }
]

var sv = {
    "Blockfall": "Blockfall",
    "Score": "Poäng",
    "Lines": "Rader",
    "Level": "Nivå",
    "Next": "Nästa",
    "Hold": "Spara",
    "Left": "Vänster",
    "Right": "Höger",
    "Rotate": "Rotera",
    "Soft drop": "Mjuk fall",
    "Hard drop": "Snabbfall",
    "Pause": "Paus",
    "Resume": "Fortsätt",
    "Restart": "Starta om",
    "New game": "Nytt spel",
    "Game over": "Spelet slut",
    "Final score": "Slutpoäng",
    "Play again": "Spela igen",
    "Help": "Hjälp",
    "Statistics": "Statistik",
    "Settings": "Inställningar",
    "Close": "Stäng",

    "Tap the board or use the buttons to move pieces.":
        "Tryck på brädet eller använd knapparna för att flytta blocken.",
    "Swipe left/right, tap to rotate, swipe down for hard drop.":
        "Svep åt sidorna, tryck för att rotera, svep nedåt för snabbfall.",
    "Piece held.": "Blocket sparades.",
    "Cannot hold again yet.": "Kan inte spara igen ännu.",
    "Line clear!": "Rad rensad!",
    "Double!": "Dubbel!",
    "Triple!": "Trippel!",
    "Tetris!": "Tetris!",
    "New level!": "Ny nivå!",
    "Paused": "Pausat",
    "Ready?": "Redo?",

    "How to play": "Så spelar du",
    "Rules": "Regler",
    "Controls": "Kontroller",
    "Scoring": "Poäng",
    "Fill complete horizontal lines to clear them and score points.":
        "Fyll horisontella rader för att rensa dem och få poäng.",
    "Pieces fall faster as the level increases. Every 10 cleared lines raises the level.":
        "Blocken faller snabbare när nivån ökar. Var 10:e rensad rad höjer nivån.",
    "You can save one piece for later and swap it once between placements.":
        "Du kan spara ett block till senare och byta det en gång mellan placeringar.",
    "Use the on-screen buttons, or swipe and tap on the board.":
        "Använd knapparna på skärmen, eller svep och tryck på brädet.",
    "Keyboard: arrows move, Up rotates, Down soft drops, Space hard drops, H holds, P pauses.":
        "Tangentbord: pilar flyttar, Upp roterar, Ned ger mjuk fall, Mellanslag ger snabbfall, H sparar, P pausar.",
    "Single 100 · Double 300 · Triple 500 · Tetris 800, multiplied by level.":
        "Enkel 100 · Dubbel 300 · Trippel 500 · Tetris 800, gånger nivån.",
    "Soft drop gives 1 point per cell, hard drop 2 points per cell.":
        "Mjuk fall ger 1 poäng per cell, snabbfall 2 poäng per cell.",

    "High scores": "Highscore",
    "Games": "Spel",
    "Total lines": "Rader totalt",
    "Best score": "Bästa poäng",
    "Recent games": "Senaste spel",
    "Date": "Datum",
    "No games played yet.": "Inga spel spelade ännu.",
    "--": "--",

    "Language": "Språk",
    "Theme": "Tema",
    "Automatic": "Automatiskt",
    "Automatic (system language)": "Automatiskt (systemets språk)",
    "Light (day)": "Ljust (dag)",
    "Dark (evening)": "Mörkt (kväll)",
    "Applies immediately.": "Gäller direkt.",
    "About": "Om",
    "A quiet, offline falling-block puzzle with a Swedish touch.":
        "Ett lugnt fallande block-pussel offline med svensk touch.",
    "Version %1": "Version %1"
}

var tables = { sv: sv }

function systemLanguage(localeName) {
    return (localeName || "en").substring(0, 2).toLowerCase() === "sv" ? "sv" : "en"
}

function tr(s, lang) {
    var t = tables[lang]
    return (t && t[s] !== undefined) ? t[s] : s
}
