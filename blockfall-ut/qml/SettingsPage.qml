// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3
import "I18n.js" as I18n

Page {
    id: settingsPage
    header: PageHeader {
        title: root.tr("Settings")
        trailingActionBar.actions: [
            Action { iconName: "close"; text: root.tr("Close"); onTriggered: stack.pop() }
        ]
    }

    Flickable {
        anchors { top: header.bottom; left: parent.left; right: parent.right; bottom: parent.bottom }
        contentHeight: col.height + units.gu(2)
        clip: true

        Column {
            id: col
            anchors { left: parent.left; right: parent.right; margins: units.gu(2) }
            spacing: units.gu(1)

            Label { text: root.tr("Language"); font.bold: true; fontSize: "large" }
            Repeater {
                model: I18n.languages
                delegate: Button {
                    width: parent.width
                    text: root.tr(modelData.name)
                    color: root.langSetting === modelData.code ? theme.palette.normal.positive : theme.palette.normal.base
                    onClicked: root.setLanguage(modelData.code)
                }
            }

            Label { text: root.tr("Theme"); font.bold: true; fontSize: "large" }
            Repeater {
                model: ["auto", "light", "dark"]
                delegate: Button {
                    width: parent.width
                    text: root.tr(modelData === "auto" ? "Automatic" : (modelData === "light" ? "Light (day)" : "Dark (evening)"))
                    color: root.themeSetting === modelData ? theme.palette.normal.positive : theme.palette.normal.base
                    onClicked: root.setTheme(modelData)
                }
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                color: theme.palette.normal.backgroundSecondaryText
                text: root.tr("Applies immediately.")
            }

            Label { text: root.tr("About"); font.bold: true; fontSize: "large" }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("A quiet, offline falling-block puzzle with a Swedish touch.")
            }
            Label { text: root.tr("Version %1").arg(root.version) }
        }
    }
}
