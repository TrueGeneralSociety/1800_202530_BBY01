// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),

        addchannel: path.resolve(__dirname, 'src/html/addchannel.html'),
        addcourse: path.resolve(__dirname, 'src/html/addcourse.html'),
        addDeadline: path.resolve(__dirname, 'src/html/addDeadline.html'),
        calendar: path.resolve(__dirname, 'src/html/calendar.html'),
        channel: path.resolve(__dirname, 'src/html/channel.html'),
        chat: path.resolve(__dirname, 'src/html/chat.html'),
        course: path.resolve(__dirname, 'src/html/course.html'),
        deadline_list: path.resolve(__dirname, 'src/html/deadline_list.html'),
        editprofile: path.resolve(__dirname, 'src/html/editprofile.html'),
        friends: path.resolve(__dirname, 'src/html/friends.html'),
        login: path.resolve(__dirname, 'src/html/login.html'),
        mainPage: path.resolve(__dirname, 'src/html/main.html'),
        notification: path.resolve(__dirname, 'src/html/notification.html'),
        profile: path.resolve(__dirname, 'src/html/profile.html'),
        register: path.resolve(__dirname, 'src/html/register.html'),
        registerCourses: path.resolve(__dirname, 'src/html/registerCourses.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
