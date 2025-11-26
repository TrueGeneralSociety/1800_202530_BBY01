# SynCalendar


## Overview
SynCalendar is a collaborative student calendar app developed by team BBY01 (Alex, Samien, YenYi). It allows students to:

Track and add deadlines for courses.

Access a shared calendar view of deadlines.

Receive notifications for upcoming deadlines.\
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

View the calendar page to see all deadlines.

Notifications for upcoming deadlines will appear automatically.

---


## Project Structure

```
1800_202530_BBY01/
├── .env_template
├── .gitignore
├── html/
│   ├── addchannel.html
│   ├── addcourse.html
│   ├── addDeadline.html
│   ├── calendar.html
│   ├── channel.html
│   ├── course.html
│   ├── deadline_list.html
│   ├── editprofile.html
│   ├── login/
│   │   ├── login.html
│   │   └── register.html
│   ├── main.html
│   ├── notification.html
│   ├── profile.html
│   ├── registerCourses.html
│   └── skeleton.html
├── img/
│   ├── calendar.ico
│   ├── COMP 1113.png
│   ├── COMP 1116.png
│   ├── COMP 1510.png
│   └── COMP 1712.png
├── index.html
├── js/
│   ├── calendar.js
│   ├── footer.js
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
│   └── navbar.js
├── Logo/
│   ├── colored-logo.pdf
│   ├── colored-logo.png
│   ├── colored-logo.svg
│   ├── Logo.png
│   ├── transparent-logo.pdf
│   ├── transparent-logo.png
│   └── transparent-logo.svg
├── package-lock.json
├── package.json
├── README.md
├── src/
│   ├── addchannel.js
│   ├── addcourse.js
│   ├── addDeadline.js
│   ├── authentification.js
│   ├── channel.js
│   ├── course.js
│   ├── deadlineContainer/
│   │   ├── calendarDeadline.js
│   │   └── listDeadline.js
│   ├── editprofile.js
│   ├── firebase.js
│   ├── index.js
│   ├── login.js
│   ├── main.js
│   ├── migration.js
│   ├── notification.js
│   ├── register.js
│   ├── registerCourse.js
│   └── updateprofile.js
├── styles/
│   ├── calendar.css
│   ├── editProfile.css
│   ├── login.css
│   ├── notification.css
│   ├── register.css
│   └── style.css
└── svgs/
    ├── bell-fill.svg
    ├── bg.svg
    ├── bg1.svg
    ├── chat.svg
    ├── house.svg
    ├── logo1.svg
    └── person-circle.svg

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