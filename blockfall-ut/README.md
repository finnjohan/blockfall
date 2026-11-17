# Blockfall (Ubuntu Touch)

Ett lugnt, offline fallande block-pussel för Ubuntu Touch 24.04, byggt i ren
QML + Lomiri Components och paketerat som `builder: pure`-click.

Blockfall är en Tetris-liknande klassiker med egen grafik och svensk touch:
hold, ghost, kommande block, nivåer, highscore, paus, sv/eng och tema.

## Funktioner

- 10×20-bräde med 7-bag-slump, mjuk rotation med wall kicks och spökpjäs
- Hold (spara ett block) och förhandsvisning av tre kommande block
- Poäng för enkel/dubbel/trippel/Tetris-rader, mjuk- och snabbfall
- Nivåhöjning var 10:e rad med successivt snabbare fall
- Highscore (topp 20), totalt antal spel/rader och bästa poäng i SQLite
- Tangentbord, knappar och svepgester på brädet
- Paus, snabb omstart och automatisk highscore-registrering vid game over
- Svenska/engelska, ljust/mörkt tema och hjälpsida

## Struktur

- `qml/Main.qml` – tunn `MainView`, språk/tema och `PageStack`
- `qml/GamePage.qml` – bräde, kontroller, spökpjäs och game loop
- `qml/PiecePreview.qml`, `qml/Palette.js` – förhandsvisning och färger
- `qml/HelpPage.qml`, `StatsPage.qml`, `SettingsPage.qml`
- `qml/Logic.js` – ren spel-logik, testbar i node
- `qml/I18n.js` – svensk/engelsk textkatalog
- `qml/Storage.js` – SQLite via `QtQuick.LocalStorage`
- `tests/` – node-tester för logik och texter
- `store/` – OpenStore-banner och skärmdumpar (se `OPENSTORE.md`)

## Testa

```bash
node tests/logic.test.js
node tests/i18n.test.js
```

Starta i QML-fönster (t.ex. i Docker-imagen
`clickable/amd64-ut24.04-1.x-amd64`):

```bash
qmlscene qml/Main.qml --demo --fresh --seed=42 --lang=sv --theme=light
qmlscene qml/Main.qml --demo --fresh --page=help --lang=en
qmlscene qml/Main.qml --demo --fresh --page=stats --lang=sv --theme=dark
```

Testflaggor i `Main.qml`:

- `--demo` – egen demodatabas
- `--fresh` – ignorera sparat material
- `--seed=N` – deterministisk 7-bag
- `--paused`, `--over` – visa paus-/game-over-läge
- `--score=N`, `--lines=N`, `--level=N` – sätt startvärden
- `--stack=N` – fyll de nedersta raderna (för skärmdumpar)
- `--lang=sv|en`, `--theme=light|dark`
- `--page=help|stats|settings`
- `--width=<gu>`, `--height=<gu>`

## Bygga och installera

```bash
cd ~/blockfall-ut
node tests/logic.test.js && node tests/i18n.test.js
clickable build
adb push build/all/app/blockfall_0.1.0_all.click /home/phablet/Downloads/
adb shell gdbus call --system --dest com.lomiri.click --object-path /com/lomiri/click \
  --method com.lomiri.click.Install /home/phablet/Downloads/blockfall_0.1.0_all.click
```

OpenStore-ID: `blockfall` · app-id: `blockfall_blockfall_0.1.0`
· paket: `blockfall_0.1.0_all.click` · framework: `ubuntu-touch-24.04-1.x`

Starta på enheten: `lomiri-app-launch blockfall_blockfall`

Felsökning:

```bash
adb shell 'journalctl --user --since "-5 min" --no-pager | grep -iE "Main.qml|GamePage.qml|qml:"'
```

## Licens

SPDX-License-Identifier: GPL-3.0-or-later · SPDX-FileCopyrightText: 2026 Johan Finn
