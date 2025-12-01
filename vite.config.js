// This Vite config file (vite.config.js) tells Rollup (production bundler) 
// to treat multiple HTML files as entry points so each becomes its own built page.

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Root-level page
        index: resolve(__dirname, "index.html"),

        // Pages in /html/
        addchannel: resolve(__dirname, "html/addchannel.html"),
        addcourse: resolve(__dirname, "html/addcourse.html"),
        addDeadline: resolve(__dirname, "html/addDeadline.html"),
        calendar: resolve(__dirname, "html/calendar.html"),
        channel: resolve(__dirname, "html/channel.html"),
        course: resolve(__dirname, "html/course.html"),
        deadline_list: resolve(__dirname, "html/deadline_list.html"),
        editprofile: resolve(__dirname, "html/editprofile.html"),
        main: resolve(__dirname, "html/main.html"),
        notification: resolve(__dirname, "html/notification.html"),
        profile: resolve(__dirname, "html/profile.html"),
        registerCourses: resolve(__dirname, "html/registerCourses.html"),

        // Login pages
        login: resolve(__dirname, "html/login/login.html"),
        register: resolve(__dirname, "html/login/register.html"),
      }
    }
  }
});
