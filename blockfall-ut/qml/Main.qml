// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3
import "I18n.js" as I18n
import "Storage.js" as Storage

MainView {
    id: root
    objectName: "mainView"
    applicationName: "blockfall"
    automaticOrientation: false

    width: units.gu(argValue("width") !== "" ? parseInt(argValue("width"), 10) : 45)
    height: units.gu(argValue("height") !== "" ? parseInt(argValue("height"), 10) : 80)

    readonly property string version: "0.1.0"
    readonly property bool isDark: theme.palette.normal.background.hslLightness < 0.5

    // ---- Test- och skärmdumpsflaggor --------------------------------------
    // --demo --fresh --seed=N --paused --over --score=N --lines=N --level=N
    // --stack=N --lang=sv|en --theme=light|dark --page=help|stats|settings
    // --width=<gu> --height=<gu>
    function argValue(name) {
        var args = Qt.application.arguments
        for (var i = 0; i < args.length; i++) {
            if (args[i] === "--" + name) return "1"
            if (args[i].indexOf("--" + name + "=") === 0) return args[i].substring(name.length + 3)
        }
        return ""
    }

    readonly property bool demo: argValue("demo") !== ""
    readonly property bool fresh: argValue("fresh") !== "" || demo
    readonly property string seedParam: argValue("seed")
    readonly property bool pausedParam: argValue("paused") !== ""
    readonly property bool overParam: argValue("over") !== ""

    property string langSetting: "auto"
    property string themeSetting: "auto"
    readonly property string lang: langSetting === "auto" ? I18n.systemLanguage(Qt.locale().name) : langSetting

    function tr(s) { return I18n.tr(s, lang) }

    function applyTheme() {
        if (themeSetting === "dark") theme.name = "Lomiri.Components.Themes.SuruDark"
        else if (themeSetting === "light") theme.name = "Lomiri.Components.Themes.Ambiance"
        else theme.name = ""
    }

    function setTheme(value) { themeSetting = value; Storage.setSetting("theme", value); applyTheme() }
    function setLanguage(value) { langSetting = value; Storage.setSetting("language", value) }

    Component.onCompleted: {
        if (demo) {
            Storage.useDatabase("blockfall-demo")
            if (Storage.summary().games === 0) {
                Storage.addScore(18400, 31, 4)
                Storage.addScore(12350, 22, 3)
                Storage.addScore(8700, 16, 2)
                Storage.addScore(5400, 11, 2)
                Storage.addScore(2300, 5, 1)
            }
        }
        langSetting = argValue("lang") !== "" ? argValue("lang") : Storage.setting("language", "auto")
        themeSetting = argValue("theme") !== "" ? argValue("theme") : Storage.setting("theme", "auto")
        applyTheme()

        var page = argValue("page")
        stack.push(Qt.resolvedUrl("GamePage.qml"))
        if (page === "help") stack.push(Qt.resolvedUrl("HelpPage.qml"))
        else if (page === "stats") stack.push(Qt.resolvedUrl("StatsPage.qml"))
        else if (page === "settings") stack.push(Qt.resolvedUrl("SettingsPage.qml"))
    }

    PageStack {
        id: stack
        anchors.fill: parent
    }
}
