// Läser in qml/*.js utan .pragma/.import i en gemensam kontext för node-tester.
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
const fs = require("fs"), path = require("path"), vm = require("vm")

module.exports = function load(files) {
    const ctx = { console, Math, JSON, Date, String, Number, Array, Object }
    vm.createContext(ctx)
    for (const f of files) {
        let src = fs.readFileSync(path.join(__dirname, "../qml", f), "utf8")
        src = src.replace(/^\.pragma library.*$/m, "").replace(/^\.import .*$/gm, "")
        vm.runInContext(src, ctx, { filename: f })
    }
    return ctx
}
