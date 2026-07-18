# GymLog 🏋️

Persönlicher Gym- & Körpergewicht-Tracker als mobile-first Web-App (PWA) —
mit Apple-Passkey-Login (Face ID) und eigenem Profil pro Person.

**Live:** https://gym.duarte-santos.ch

## Features

- **Dashboard** — Wochenübersicht, Today-Card, Körpergewicht-Kurve, Streak & Volumen-Tiles
- **Trainingsplan** — Wochenplan (Wochentag → Routine) + Routine-Editor mit Übungs-Picker
  (1'324 Übungen mit Animationen, Suche + Muskelgruppen-Filter)
- **Umplanen per Kalender** — einzelne Tage überschreiben (krank / verpasst / andere Session),
  ohne den Wochenplan zu ändern
- **Workout-Flow** — Start erkennt den Wochentag und startet die heutige Session direkt.
  Vorher wird immer das Körpergewicht abgefragt. Sätze abhaken, Gewichte vom letzten Mal
  vorausgefüllt, Rest-Timer mit Beep, Progression-Hints, PR-Erkennung
- **Gewichts-Tracking pro Übung** — am Ende jeder Übung wird das Arbeitsgewicht bestätigt;
  das höchste je eingegebene Gewicht ist beim nächsten Mal der Startwert
- **Stats** — GitHub-Style Activity-Heatmap (12 Monate), Körpergewicht-Chart,
  Kraft-Progression pro Übung, komplette Historie
- **Passkeys statt Passwörter** — WebAuthn mit Face ID / Touch ID, Profile synchronisieren
  über Geräte; Gast-Modus (nur lokal) möglich
- **PWA** — „Zum Home-Bildschirm", offline-fähig (Service Worker)

## Struktur

```
app/       Frontend — handgebaute Static-SPA, kein Build-Step (Vanilla JS, Hash-Routing)
api/       Backend — Node 22, kein Framework, @simplewebauthn/server, JSON-File-Storage
scripts/   fetch-media.sh lädt die Übungs-Bilder/GIFs (nicht im Repo, ~140 MB)
```

## Übungs-Medien

Die Übungsdaten (`app/data.js`) und Medien stammen aus
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset).
Bilder/GIFs sind nicht eingecheckt — einmalig holen mit:

```bash
./scripts/fetch-media.sh   # füllt app/img/ (12 MB) und app/gif/ (126 MB)
```

## Betrieb

- `app/` wird von einem beliebigen Static-Server ausgeliefert (nginx); JS/CSS/HTML mit
  `no-cache`, `img/`+`gif/` lange cachen. Assets sind mit `?v=N` versioniert.
- `api/` läuft als Container (siehe `api/Dockerfile`), Env: `RP_ID` (Domain), `ORIGIN`
  (https-Origin), `DATA_DIR` (Volume, default `/data`). Reverse-Proxy routet `/api/*`
  auf Port 3000 der API, alles andere auf die Static-Site — **gleiche Domain**, sonst
  funktionieren Passkeys nicht.
- User/Credentials liegen in `DATA_DIR/db.json`, App-State pro User in
  `DATA_DIR/state-<uid>.json`, Session-Secret in `DATA_DIR/secret` → Volume sichern.
