# SynCalendar


## Overview
SynCalendar is a collaborative student calendar app developed by team BBY01 (Alex, Samien, YenYi). It allows students to:

Track and add deadlines for courses.

Access a shared calendar view of deadlines.

Receive notifications for upcoming deadlines.
---


## Features

Add Deadlines: Quickly add deadlines for any course in a channel.

Calendar View: See all upcoming deadlines in a structured calendar.

Notifications: Receive notifications about upcoming or overdue deadlines.

---


## Technologies Used

Frontend: HTML, CSS, JavaScript

Build Tool: Vite

Backend: Firebase Hosting

Database: Firestore

UI/Components: Bootstrap 5
---


## Usage

Navigate to the desired course channel.

Add a deadline for the course.

View the calendar page to see all deadlines.(not implemented yet)

Notifications for upcoming deadlines will appear automatically.

---


## Project Structure

```
1800_202530_BBY01/
├── .env_template
├── .firebase/
│   └── hosting.ZGlzdA.cache
├── .firebaserc
├── .gitignore
├── default
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── src/
│   ├── fragments/
│   │   ├── 2025/
│   │   │   ├── 1.html
│   │   │   ├── 10.html
│   │   │   ├── 11.html
│   │   │   ├── 12.html
│   │   │   ├── 2.html
│   │   │   ├── 3.html
│   │   │   ├── 4.html
│   │   │   ├── 5.html
│   │   │   ├── 6.html
│   │   │   ├── 7.html
│   │   │   ├── 8.html
│   │   │   └── 9.html
│   │   ├── 2026/
│   │   │   ├── 1.html
│   │   │   ├── 10.html
│   │   │   ├── 11.html
│   │   │   ├── 12.html
│   │   │   ├── 2.html
│   │   │   ├── 3.html
│   │   │   ├── 4.html
│   │   │   ├── 5.html
│   │   │   ├── 6.html
│   │   │   ├── 7.html
│   │   │   ├── 8.html
│   │   │   └── 9.html
│   │   └── 2027/
│   │       ├── 1.html
│   │       ├── 10.html
│   │       ├── 11.html
│   │       ├── 12.html
│   │       ├── 2.html
│   │       ├── 3.html
│   │       ├── 4.html
│   │       ├── 5.html
│   │       ├── 6.html
│   │       ├── 7.html
│   │       ├── 8.html
│   │       └── 9.html
│   ├── html/
│   │   ├── addchannel.html
│   │   ├── addcourse.html
│   │   ├── addDeadline.html
│   │   ├── calendar.html
│   │   ├── channel.html
│   │   ├── chat.html
│   │   ├── course.html
│   │   ├── deadline_list.html
│   │   ├── editprofile.html
│   │   ├── friends.html
│   │   ├── login.html
│   │   ├── main.html
│   │   ├── notification.html
│   │   ├── profile.html
│   │   ├── register.html
│   │   └── registerCourses.html
│   ├── img/
│   │   ├── bell-fill.svg
│   │   ├── bg.svg
│   │   ├── bg1.svg
│   │   ├── calendar.ico
│   │   ├── chat.svg
│   │   ├── colored-logo.pdf
│   │   ├── colored-logo.png
│   │   ├── colored-logo.svg
│   │   ├── COMP 1113.png
│   │   ├── COMP 1116.png
│   │   ├── COMP 1510.png
│   │   ├── COMP 1712.png
│   │   ├── house.svg
│   │   ├── Logo.png
│   │   ├── logo1.svg
│   │   ├── person-circle.svg
│   │   ├── transparent-logo.pdf
│   │   ├── transparent-logo.png
│   │   └── transparent-logo.svg
│   ├── js/
│   │   ├── addchannel.js
│   │   ├── addcourse.js
│   │   ├── addDeadline.js
│   │   ├── app.js
│   │   ├── authentification.js
│   │   ├── calendar.js
│   │   ├── calendarDeadline.js
│   │   ├── channel.js
│   │   ├── chat.js
│   │   ├── course.js
│   │   ├── editprofile.js
│   │   ├── firebase.js
│   │   ├── footer.js
│   │   ├── index.js
│   │   ├── listDeadline.js
│   │   ├── login.js
│   │   ├── main.js
│   │   ├── migration.js
│   │   ├── navbar.js
│   │   ├── notification.js
│   │   ├── register.js
│   │   ├── registerCourse.js
│   │   └── updateprofile.js
│   └── styles/
│       ├── calendar.css
│       ├── chat.css
│       ├── editProfile.css
│       ├── friends.css
│       ├── login.css
│       ├── notification.css
│       ├── register.css
│       └── style.css
└── vite.config.js

```

---


## Contributors



=======
- **Alex Lee** - BCIT CST Student with a passion for gaming and user-friendly applications. Fun fact: Loves puzzles and tekken 8 
- **Samien Munwar** - BCIT CST Student with a passion for exercising and user-friendly applications. Fun fact: Loves solving Rubik's Cubes in under a minute.
- **YenYi**- BCIT CST Student who loves badminton. 

---


## Acknowledgments

- Deadlines are all gained from crowdsourcing data from users.
- ChatGPT was used to assist our coding and debugging
- images and logo was gathered and generated from google sites.
---


## Limitations and Future Work
### Limitations

- Crowdsourced data may not always be accurate.

- Accessibility features can be further improved.

### Future Work

- Improve user experience and interface.

- Add user preference settings.

- Integrate additional collaborative features.

---


## License

This project is licensed under the MIT License. See the LICENSE file for details.