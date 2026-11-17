.pragma library
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
// Färgkarta för blocktyperna. Indexen matchar Logic.COLORS.

var HEX = [
    "#000000",
    "#40c4ff", // 1 I
    "#ffd54f", // 2 O
    "#ab47bc", // 3 T
    "#66bb6a", // 4 S
    "#ef5350", // 5 Z
    "#42a5f5", // 6 J
    "#ffa726"  // 7 L
]

function colorForType(type) {
    var map = { I: 1, O: 2, T: 3, S: 4, Z: 5, J: 6, L: 7 }
    return HEX[map[type] || 0]
}

function colorForIndex(index) {
    return HEX[index] || "#000000"
}
