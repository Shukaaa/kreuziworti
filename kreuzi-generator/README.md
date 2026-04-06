# kreuzi-generator

Ein eigenständiger Kreuzworträtsel-Editor zum Erstellen von Rätseln im kreuziworti-JSON-Format.

## Nutzung

1. Öffne die `index.html` im Browser
2. Stelle die Gittergröße ein (Spalten × Zeilen)
3. Füge Wörter hinzu:
   - Wort eingeben
   - Richtung wählen (horizontal / vertikal)
   - Startposition (X, Y) angeben
   - Beschreibung / Hinweis eingeben
4. Aktiviere den **Lösungswort-Modus** (rechts)
5. Klicke auf Zellen im Gitter, um das Lösungswort zusammenzusetzen
6. Vergib eine Puzzle-ID und klicke auf **JSON exportieren**
7. Füge die JSON-Datei in den `packages-raw` Ordner hinzu

## Features

- 🔲 Interaktives Gitter mit Live-Vorschau
- ➕ Wörter hinzufügen / entfernen
- 🌟 Lösungswort per Klick zusammenstellen
- ⚠️ Automatische Konflikterkennung bei überlappenden Buchstaben
- 💾 JSON-Export & Import
- 📋 In Zwischenablage kopieren
- 📥 Bestehende Rätsel importieren und bearbeiten

## Legacy

Das alte `script.js` war für die Nutzung auf [Crossword Puzzle Maker](https://crosswords.brightsprout.com/crossword-puzzle-maker) gedacht. Die `index.html` ersetzt diesen Workflow durch eine eigenständige Lösung.
