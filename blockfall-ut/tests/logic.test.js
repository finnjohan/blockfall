// Tester för ren spellogik i qml/Logic.js.
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

const assert = require("assert")
const L = require("./load.js")(["Logic.js"])

let checks = 0
function ok(value, message) {
    assert.ok(value, message)
    checks++
}
function eq(actual, expected, message) {
    assert.strictEqual(actual, expected, message)
    checks++
}
function deep(actual, expected, message) {
    assert.deepStrictEqual(JSON.parse(JSON.stringify(actual)),
                           JSON.parse(JSON.stringify(expected)), message)
    checks++
}

// --- brädet och konstanter ---
eq(L.COLS * L.ROWS, 200, "COLS * ROWS ska vara 200")
eq(L.emptyBoard().length, 200, "emptyBoard ska ha 200 celler")
ok(L.emptyBoard().every(function (v) { return v === 0 }),
   "emptyBoard ska innehålla enbart nollor")
deep(L.TYPES, ["I", "O", "T", "S", "Z", "J", "L"], "TYPES ska ha sju ordningstyper")
eq(Object.keys(L.COLORS).length, 7, "COLORS ska ha sju färger")
ok(L.BASE.I.length === 4 && L.BASE.O.length === 2 && L.BASE.T.length === 3,
   "BASE-matriserna ska ha rätt storlek")

// --- newGame och standardvärden ---
var s0 = L.newGame(12345)
eq(s0.board.length, 200, "newGame ska skapa ett bräde med 200 celler")
ok(s0.current !== null, "newGame ska spawna en pjäs")
ok(s0.next.length >= 4, "newGame ska ha minst fyra pjäser i kön")
eq(s0.hold, null, "newGame ska börja utan hold")
ok(s0.seed >= 0 && s0.seed <= 0xffffffff, "newGame ska lagra ett uint32-seed")
eq(s0.score, 0, "newGame ska börja med noll poäng")
eq(s0.lines, 0, "newGame ska börja med noll rader")
eq(s0.level, 1, "newGame ska börja på nivå 1")
eq(s0.combo, -1, "newGame ska börja utan combo")
eq(s0.over, false, "newGame ska inte vara över")
eq(s0.paused, false, "newGame ska inte vara pausad")
eq(s0.pieces, 0, "newGame ska ha noll låsta pjäser")
eq(s0.lastClear, 0, "newGame ska ha lastClear 0")
eq(s0.current.y, -1, "spawnade pjäser ska börja på y = -1")
ok(typeof s0.canHold === "boolean", "canHold ska vara en boolean")
deep(fallenTypes(0), fallenTypes(0x9e3779b9),
     "falsy seed ska ge samma sekvens som standardseed 0x9e3779b9")

// --- slump och påse ---
var rs = { seed: 1, bag: [] }
var r1 = L.nextRandom(rs)
ok(r1 >= 0 && r1 <= 0xffffffff, "nextRandom ska returnera ett uint32")
ok(rs.seed !== 1, "nextRandom ska mutera seed")
var bagState = L.newGame(777)
bagState.bag = []
var firstSeven = []
for (var b = 0; b < 7; b++)
    firstSeven.push(L.takeFromBag(bagState))
var sortedBag = firstSeven.slice().sort()
deep(sortedBag, L.TYPES.slice().sort(),
     "de första sju typerna ur 7-bagen ska innehålla alla TYPES exakt en gång")
var ensureState = { seed: 5, bag: [], next: [] }
L.ensureNext(ensureState)
ok(ensureState.next.length >= 4, "ensureNext ska fylla kön till minst fyra typer")

// --- determinism ---
function fallenTypes(seed) {
    var st = L.newGame(seed)
    var out = []
    for (var i = 0; i < 20; i++) {
        out.push(st.current.type)
        st.current = null
        L.spawn(st)
    }
    return out
}
deep(fallenTypes(4242), fallenTypes(4242),
     "samma seed ska ge samma första 20 fallna typer")
ok(JSON.stringify(fallenTypes(4242)) !== JSON.stringify(fallenTypes(4243)),
   "olika seed ska ge olika typsekvenser")

// --- rotation av matriser ---
var im = L.BASE.I
for (var i4 = 0; i4 < 4; i4++)
    im = L.rotateMatrix(im, 1)
deep(im, L.BASE.I, "I-roterad fyra gånger medurs ska vara tillbaka")
ok(JSON.stringify(L.rotateMatrix(L.BASE.T, 1)) !== JSON.stringify(L.BASE.T),
   "T-rotation ska ändra matrisen")
ok(JSON.stringify(L.rotateMatrix(L.BASE.T, -1)) !== JSON.stringify(L.BASE.T),
   "moturs T-rotation ska ändra matrisen")

// --- kollisioner ---
var empty = L.emptyBoard()
var oLeft = L.createPiece("O"); oLeft.x = -1; oLeft.y = 0
ok(L.collides(empty, oLeft, 0, 0, oLeft.matrix), "vänster vägg ska ge kollision")
var oRight = L.createPiece("O"); oRight.x = L.COLS - 1; oRight.y = 0
ok(L.collides(empty, oRight, 0, 0, oRight.matrix), "höger vägg ska ge kollision")
var oFloor = L.createPiece("O"); oFloor.y = L.ROWS - 1
ok(L.collides(empty, oFloor, 0, 0, oFloor.matrix), "golvet ska ge kollision")
var occupied = L.emptyBoard(); occupied[0] = 1
var oCell = L.createPiece("O"); oCell.x = 0; oCell.y = 0
ok(L.collides(occupied, oCell, 0, 0, oCell.matrix), "belagd cell ska ge kollision")
var oAbove = L.createPiece("O"); oAbove.y = -2
ok(!L.collides(empty, oAbove, 0, 0, oAbove.matrix),
   "celler med y < 0 ska ignoreras i brädet")

// --- move ---
var ms = L.newGame(9)
ms.current = L.createPiece("O"); ms.current.x = 4; ms.current.y = 5
ok(L.move(ms, -1, 0), "move ska flytta pjäsen åt vänster")
eq(ms.current.x, 3, "move ska uppdatera x")
ms.current.x = 0
ok(!L.move(ms, -1, 0), "move ska blockeras av vänster vägg")
eq(ms.current.x, 0, "misslyckad move ska inte ändra positionen")

// --- rotate med kick nära vägg ---
var ks = L.newGame(11)
var kp = L.createPiece("I")
kp.x = -2; kp.y = 0
kp.matrix = L.rotateMatrix(kp.matrix, 1) // vertikal I i kolumn 2
ks.current = kp
ok(!L.collides(ks.board, kp, 0, 0, kp.matrix), "vertikal I ska rymmas vid vänsterkanten")
ok(L.rotate(ks, 1), "rotation ska lyckas via kick nära väggen")
eq(ks.current.x, 0, "kicken ska flytta pjäsen till x = 0")

// --- ghostDistance, hardDrop, poäng ---
var ds = L.newGame(13)
ds.current = L.createPiece("O")
eq(L.ghostDistance(ds), 19, "ghostDistance ska mäta hela fallet till golvet")
var landed = L.hardDrop(ds)
eq(landed, 19, "hardDrop ska returnera antalet fallna celler")
eq(ds.current.y, -1, "hardDrop ska spawna nästa pjäs")
eq(ds.score, 38, "hardDrop ska ge 2 poäng per fallcell")
eq(ds.board[19 * L.COLS + 4], L.COLORS.O, "O:s färg ska skrivas längst ner till vänster")
eq(ds.board[19 * L.COLS + 5], L.COLORS.O, "O:s färg ska skrivas längst ner till höger")
eq(ds.board[18 * L.COLS + 4], L.COLORS.O, "O:s färg ska skrivas på rad 18 till vänster")
eq(ds.board[18 * L.COLS + 5], L.COLORS.O, "O:s färg ska skrivas på rad 18 till höger")
eq(ds.pieces, 1, "hardDrop ska räkna en låst pjäs")

// --- gravity: tick och mjuk fall ---
var ts = L.newGame(17)
ts.current = L.createPiece("O"); ts.current.y = 0
ok(L.tick(ts), "tick ska flytta pjäsen ner ett steg")
eq(ts.current.y, 1, "tick ska öka y med 1")
eq(ts.score, 0, "tick ska inte ge poäng")
ts.current.y = L.ROWS - 2
ok(!L.tick(ts), "tick ska låsa pjäsen när den inte kan flyttas")
eq(ts.pieces, 1, "tick ska låsa pjäsen")
var ss = L.newGame(19)
ss.current = L.createPiece("O"); ss.current.y = 0
ok(L.softDrop(ss), "softDrop ska flytta pjäsen ner")
eq(ss.score, 1, "softDrop ska ge 1 poäng")
ss.current.y = L.ROWS - 2
ok(!L.softDrop(ss), "softDrop ska låsa pjäsen vid blockering")

// --- radrensning ---
var cb = L.emptyBoard()
for (var c = 0; c < L.COLS; c++)
    cb[19 * L.COLS + c] = 1
cb[18 * L.COLS + 3] = 2
var cleared = L.clearLines(cb)
eq(cleared.count, 1, "clearLines ska räkna en full rad")
eq(cleared.board[19 * L.COLS + 3], 2, "raden ovanför ska flyttas ner")
eq(cleared.board[18 * L.COLS + 3], 0, "den rensade raden ska försvinna")
eq(cleared.board[0], 0, "nollor ska fyllas på överst")
ok(cleared.board.every(function (v, idx) { return idx >= 190 || idx < 180 || v === 0 }),
   "inga kvarvarande celler utöver den nerflyttade raden")
eq(L.clearLines(L.emptyBoard()).count, 0, "tomma brädet ska inte rensa något")

// --- poängtabell ---
eq(L.scoreForLines(0, 1), 0, "noll rader ger 0 poäng")
eq(L.scoreForLines(1, 1), 100, "en rad ger 100 poäng")
eq(L.scoreForLines(2, 1), 300, "två rader ger 300 poäng")
eq(L.scoreForLines(3, 1), 500, "tre rader ger 500 poäng")
eq(L.scoreForLines(4, 1), 800, "fyra rader ger 800 poäng")
eq(L.scoreForLines(1, 3), 300, "poäng ska multipliceras med nivån")
eq(L.scoreForLines(4, 3), 2400, "fyra rader på nivå 3 ger 2400")

// --- hold ---
var hs = L.newGame(23)
var originalType = hs.current.type
var nextType = hs.next[0]
ok(L.holdPiece(hs), "holdPiece ska lyckas första gången")
eq(hs.hold, originalType, "hold ska innehålla den tidigare pjäsen")
eq(hs.current.type, nextType, "hold ska spawna nästa pjäs i kön")
eq(hs.canHold, false, "hold ska inte kunna göras två gånger i rad")
ok(!L.holdPiece(hs), "andra holdPiece ska avvisas")
L.hardDrop(hs)
eq(hs.canHold, true, "canHold ska återställas vid spawn")
var afterDropType = hs.current.type
ok(L.holdPiece(hs), "hold ska fungera igen efter spawn")
eq(hs.hold, afterDropType, "hold ska byta typ korrekt andra gången")
eq(hs.current.type, originalType, "pjäsen ur hold ska återställas")

// --- nivåer ---
var ls = L.newGame(29)
ls.lines = 9
ls.current = L.createPiece("I")
ls.current.y = L.ROWS - 2
var fillCols = [0, 1, 2, 7, 8, 9]
for (var f = 0; f < fillCols.length; f++)
    ls.board[19 * L.COLS + fillCols[f]] = 1
L.tick(ls)
eq(ls.lines, 10, "en rensad rad ska ge totalt 10 rader")
eq(ls.level, 2, "10 rensade rader ska höja nivån till 2")
eq(ls.lastClear, 1, "lastClear ska spara antalet rensade rader")
ok(ls.combo >= 0, "combo ska vara minst 0 efter radrensning")

// --- game over ---
var gs = L.newGame(31)
for (var top = 0; top < 2; top++) {
    for (var tx = 0; tx < L.COLS; tx++)
        gs.board[top * L.COLS + tx] = 1
}
gs.current = null
ok(!L.spawn(gs), "spawn ska misslyckas när övre raderna är fyllda")
eq(gs.over, true, "kollision vid spawn ska sätta over")
eq(gs.current, null, "current ska vara null vid game over")
ok(!L.move(gs, 1, 0), "move ska avvisas när spelet är över")

// --- celler för rendering ---
var cs = L.newGame(37)
cs.current = L.createPiece("T"); cs.current.x = 3; cs.current.y = 0
var cur = L.currentCells(cs)
eq(cur.length, 4, "T ska ha fyra synliga celler")
ok(cur.every(function (p) { return p.y >= 0 && p.x >= 0 && p.x < L.COLS }),
   "currentCells ska ha rimliga koordinater")
ok(cur.every(function (p) { return p.color === L.COLORS.T && p.current === true }),
   "currentCells ska ha rätt färg och current-flagga")
var ghost = L.ghostCells(cs)
eq(ghost.length, 4, "spöket ska ha fyra celler")
ok(ghost.every(function (p) { return p.y >= 0 && p.y < L.ROWS }),
   "ghostCells ska ha rimliga y-koordinater")
ok(ghost.every(function (p) { return cs.board[p.y * L.COLS + p.x] === 0 }),
   "ghostCells ska bara ligga på tomma celler")

// --- cloneState ---
var os = L.newGame(41)
os.current.x = 2
var originalX = os.current.x
var clone = L.cloneState(os)
deep(clone.board, os.board, "cloneState ska kopiera brädet")
deep(clone.next, os.next, "cloneState ska kopiera kön")
deep(clone.bag, os.bag, "cloneState ska kopiera påsen")
deep(clone.current, os.current, "cloneState ska kopiera pjäsen inklusive matris")
clone.board[0] = 9
clone.next[0] = "X"
clone.bag[0] = "X"
clone.current.matrix[0][0] = 9
clone.current.x = 0
ok(os.board[0] === 0, "ändring i klonens bräde ska inte påverka originalet")
ok(os.next[0] !== "X", "ändring i klonens kö ska inte påverka originalet")
ok(os.bag[0] !== "X", "ändring i klonens påse ska inte påverka originalet")
ok(os.current.matrix[0][0] !== 9, "ändring i klonens matris ska inte påverka originalet")
eq(os.current.x, originalX, "ändring i klonens pjäsposition ska inte påverka originalet")

// --- övrigt ---
eq(L.dropInterval(1), 800, "dropInterval på nivå 1 ska vara 800 ms")
eq(L.dropInterval(3), 660, "dropInterval ska minska med nivån")
eq(L.dropInterval(20), 90, "dropInterval ska ha ett golv på 90 ms")

console.log("logic.test.js: " + checks + " kontroller OK")
