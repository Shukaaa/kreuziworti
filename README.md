# Kreuziworti

> Kreuziworti is a simple crossword puzzle with a retro look and feel. This project is only supported in the language of German.

## Beschreibung

Kreuziworti ist ein einfaches Kreuzworträtsel mit einem Retro-Look und -Gefühl.

## Projektumfang

Dieses Projekt beinhaltet folgende Anwendungen:

- Kreuziworti (Angular 17 App)
  - Webanwendung, die das Kreuzworträtsel darstellt
- kreuzi-generator (Script)
  - JS-Script welches eine andere Webseite zunutzen macht um eigene schemas zu generieren
  - Siehe `kreuzi-generator/README.md` für mehr Informationen
- packages-raw
  - Hier kommen die rohen JSON Dateien hin, die mit dem kreuzi-generator-Script erstellt wurden
  - Diese werden anschließend per build in das finale Format umgewandelt und in die App unter assets eingebunden