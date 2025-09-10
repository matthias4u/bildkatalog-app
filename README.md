# Bildkatalog Generator - Veröffentlichung

Hallo! Dies ist das vollständige Paket für Ihre Web-App. Die folgenden Schritte führen Sie durch den Prozess, diese App kostenlos online zu stellen, damit Sie von jedem Gerät (insbesondere von Ihrem Handy) darauf zugreifen und den Link mit anderen teilen können.

Wir werden zwei kostenlose Dienste nutzen:
- **GitHub:** Um den Code online zu speichern.
- **Netlify:** Um aus dem Code eine funktionierende Website zu erstellen.

---

### Schritt 1: Code auf GitHub hochladen

1.  **GitHub-Konto erstellen:** Falls Sie noch keins haben, gehen Sie zu [github.com](https://github.com) und erstellen Sie ein kostenloses Konto.

2.  **Neues Repository erstellen:**
    *   Klicken Sie nach dem Einloggen oben rechts auf das `+`-Symbol und wählen Sie **"New repository"**.
    *   Geben Sie Ihrem Repository einen Namen, z. B. `bildkatalog-app`.
    *   Stellen Sie sicher, dass es auf **"Public"** gesetzt ist.
    *   Klicken Sie auf den grünen Knopf **"Create repository"**.

3.  **Alle Dateien hochladen:**
    *   Auf der Seite Ihres neuen, leeren Repositorys sehen Sie einen Link mit dem Text **"uploading an existing file"**. Klicken Sie darauf.
    *   Nehmen Sie nun **ALLE Dateien und Ordner**, die ich Ihnen in diesem Paket zur Verfügung gestellt habe, und ziehen Sie sie per Drag & Drop in das Upload-Fenster im Browser.
    *   Warten Sie, bis alle Dateien hochgeladen sind.

4.  **Änderungen speichern:**
    *   Geben Sie unten in das Feld "Commit changes" eine kurze Beschreibung ein, z. B. `Erste Version der App`.
    *   Klicken Sie auf den grünen Knopf **"Commit changes"**.

Super! Ihr gesamter App-Code ist jetzt sicher auf GitHub gespeichert.

---

### Schritt 2: App auf Netlify veröffentlichen

1.  **Netlify-Konto erstellen:**
    *   Gehen Sie zu [netlify.com](https://www.netlify.com/) und klicken Sie auf **"Sign up"**.
    *   Der einfachste Weg ist, sich mit Ihrem GitHub-Konto anzumelden. Klicken Sie auf die Option **"GitHub"** und autorisieren Sie die Verbindung.

2.  **Projekt importieren:**
    *   Nachdem Sie eingeloggt sind, werden Sie zu Ihrem Dashboard weitergeleitet. Klicken Sie auf **"Add new site"** und dann auf **"Import an existing project"**.
    *   Wählen Sie als Anbieter **"GitHub"**.
    *   Sie sehen nun eine Liste Ihrer GitHub-Repositories. Wählen Sie das Repository aus, das Sie gerade erstellt haben (`bildkatalog-app`).

3.  **Deployment-Einstellungen (sollten automatisch sein):**
    *   Netlify ist sehr schlau und sollte alle Einstellungen automatisch erkennen. Überprüfen Sie zur Sicherheit, ob die folgenden Felder korrekt ausgefüllt sind:
        *   **Build command:** `npm run build`
        *   **Publish directory:** `dist`
    *   Diese Werte sollten bereits voreingestellt sein. Wenn ja, ist alles in Ordnung.

4.  **Veröffentlichen:**
    *   Klicken Sie auf den Knopf **"Deploy site"**.

---

### Schritt 3: App verwenden und teilen

1.  **Warten Sie einen Moment:** Netlify baut nun Ihre App. Das dauert in der Regel 1-2 Minuten. Sie können den Fortschritt live auf dem Bildschirm verfolgen.

2.  **Link erhalten:** Sobald der Vorgang abgeschlossen ist, sehen Sie oben auf der Seite einen Satz wie "Your site is live". Direkt darüber steht Ihr öffentlicher Link. Er sieht in etwa so aus: `https://zufälliger-name-123.netlify.app`.

3.  **Fertig!**
    *   Klicken Sie auf diesen Link, um Ihre fertige App zu öffnen.
    *   **Diesen Link können Sie jetzt kopieren, als Lesezeichen auf Ihrem Handy speichern und an jeden senden, den Sie möchten!**

**Optional:** Sie können den zufälligen Namen des Links in den Netlify-Einstellungen unter "Site details" -> "Change site name" in etwas ändern, das Sie sich leichter merken können (z.B. `mein-bildkatalog.netlify.app`).
