Bus KM System - Static (Google Drive hostable) version
=========================================================

WHAT THIS IS
------------
This is a single self-contained file: index.html
It has Login + Portal 1 + Portal 2 + Admin Dashboard all bundled into
one page (switches views with JavaScript), so it works on hosts that
don't support multi-folder routing, like Google Drive.

Login accounts (same as the original app):
    admin    / Admin@123    -> Admin Dashboard
    portal1  / Portal1@123  -> Portal 1 (register employee to bus)
    portal2  / Portal2@123  -> Portal 2 (enter KM)

HOW TO HOST ON GOOGLE DRIVE
----------------------------
1. Upload index.html to Google Drive.
2. Right-click it -> Share -> "Anyone with the link" -> Viewer.
3. Use whatever Google-Drive-hosting method your tutorial showed
   (e.g. a "host from Google Drive" converter site) and point it at
   this single index.html file. Since everything is in one file, you
   do NOT need to upload separate folders/files for it to work.

IMPORTANT LIMITATION - PLEASE READ
------------------------------------
The original project (in the main folder) uses a real Node.js server
+ SQLite database, so data entered in Portal 1 (by one person, on one
device) is instantly visible to Portal 2 and Admin (on any other
device), because everyone talks to the same server.

This static version has NO server. All data (employees, buses,
transactions) is saved in the browser's localStorage - meaning:
  - Data stays ONLY on the device/browser where it was entered.
  - Portal 1 entries made on Phone A will NOT show up in Portal 2 or
    Admin opened on Phone B / a laptop / a different browser.
  - Clearing browser data/cache will delete everything.

This is fine for a DEMO or single-device use, but NOT suitable for
real multi-person daily use across different devices.

BETTER OPTION FOR REAL USE
----------------------------
The main project already has a render.yaml file, ready to deploy to
Render.com (free tier) with the full working backend - login,
database, and shared data across every device. That is the
recommended option if this system will be used by more than one
person/device.
