// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const I = require("./load.js")(["I18n.js"]);

let checks = 0;
function eq(a, b, msg) { assert.strictEqual(a, b, msg); checks++ }
function ok(c, m) { assert.ok(c, m); checks++ }

eq(I.systemLanguage("sv_SE"), "sv", "svensk locale");
eq(I.systemLanguage("en_GB"), "en", "engelsk locale");
eq(I.systemLanguage(""), "en", "standard är engelska");
eq(I.tr("Score", "en"), "Score", "engelska är nyckeln");
eq(I.tr("Score", "sv"), "Poäng", "svensk översättning");
eq(I.tr("Okänd", "sv"), "Okänd", "okänd text faller tillbaka");
eq(I.tr("Tetris!", "sv"), "Tetris!", "festtext finns");

const qmlDir = path.join(__dirname, "../qml");
const keys = new Set();
for (const file of fs.readdirSync(qmlDir).filter(f => f.endsWith(".qml"))) {
    const src = fs.readFileSync(path.join(qmlDir, file), "utf8");
    const re = /root\.tr\(\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(src))) keys.add(m[1]);
}
ok(keys.size > 30, `hittade ${keys.size} texter i QML-filerna`);
for (const key of keys) {
    ok(I.sv[key] !== undefined, `svensk text finns: ${key}`);
    ok(typeof I.tr(key, "sv") === "string" && I.tr(key, "sv").length > 0,
       `svensk text returneras: ${key}`);
}

console.log(`i18n.test.js: ${checks} kontroller OK`);
