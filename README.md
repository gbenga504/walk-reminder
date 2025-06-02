# Walk Reminder Chrome Extension

A simple yet effective Chrome extension designed for developers and desk workers to promote regular movement and well-being during long hours at the computer. This extension helps you stay active by reminding you to take a walk during your specified work schedule.

## ✨ Features

- Customizable Work Hours: Easily set your daily work start and end times directly from the extension popup.

- Hourly Walk Reminders: Receive a notification every hour, prompting you to take a short walk.

- Audible Alert: A distinct sound plays when a reminder fires, ensuring you don't miss your break.

- Dynamic Icon & Badge: The extension icon changes and displays an "ON" badge when a reminder is actively ringing, providing a quick visual cue.

- "Stop Reminder" Button: A convenient button appears in the popup when a reminder is active, allowing you to stop the sound and reset the icon with a single click.

- Notification Dismissal Control: Closing the notification pop-up will automatically stop the sound and reset the extension icon, giving you control directly from the system notification.

- Persistence: Your settings are saved and persist across browser sessions.

## 🛠️ Technologies Used

- Chrome Extension API: Leveraging alarms, notifications, storage, and offscreen APIs for core functionality.

- React: For building an interactive and user-friendly popup interface.

- Service Worker (background.js): Handles the main logic, alarm scheduling, and communication.

- Offscreen Document (offscreen.html, offscreen.js): A hidden HTML page used specifically for playing audio, as service workers do not have direct DOM access.

- Vite: Used as the sole bundler for the entire project, including the React popup, offscreen document, and static assets.

- Tailwind CSS: For responsive and modern styling of the popup UI.

## 🚀 Installation

To install and run this extension in your Chrome browser:

- Clone the repository (or download the ZIP).

- Install Dependencies using `npm install`

- Build the Project using `npm run build`. This command uses Vite to bundle all necessary files into the dist directory.

- Load into Chrome:

  - Open Chrome and navigate to chrome://extensions/.

  - Enable "Developer mode" using the toggle in the top right corner.

  - Click "Load unpacked".

  - Select the walk-reminder/dist folder

The "Walk Reminder" extension icon should now appear in your browser toolbar. Click it to set your work hours and activate the reminders!

## 💡 Future Enhancements

- Add a "snooze" option for reminders.
- Allow customization of reminder sound.
