# FaceTrack — AI-Powered Biometric Attendance System

A modern, AI-powered facial recognition attendance management system built with React, TypeScript, and Google Gemini Vision API. FaceTrack uses real-time biometric scanning via webcam or CCTV (Raspberry Pi) to automatically identify enrolled students and log their attendance — eliminating manual roll calls entirely.

---

## ✨ Features

### 🔬 Biometric Presence Matrix (Scanner)
- **Real-time facial recognition** powered by Google Gemini 2.5 Flash Vision API
- **Dual input sources**: Local webcam or remote CCTV/IP camera (Raspberry Pi MJPEG stream)
- **AI bounding boxes** drawn live on the video feed — green for newly marked, orange for already marked, red for unknown
- **Automatic attendance logging** with confidence scores
- **Period-aware scanning** — attendance is tied to a specific class period

### 👨‍🎓 Student Directory
- Enroll students with first name, last name, and institutional ID
- Capture up to **8 facial samples** per student via webcam for AI reference
- Deep profile editing slide-out panel with photo management (add/delete samples)
- Bulk selection and deletion of student profiles

### 📊 Attendance Intelligence (Reports)
- Advanced filtering by **student identity**, **date range**, and **minimum AI confidence threshold**
- Dynamic data table rendering with color-coded confidence bars
- **Neural Audit Export** — download filtered attendance data as a CSV file

### 📜 Temporal Registry (History)
- Immutable log of all biometric verification events
- Search, date-range filtering, and CSV export
- **Refresh controls** — clear attendance by specific date or clear all history

### 📅 Schedule Management
- Define class periods with start/end times and instructor names
- Auto-generated from system settings (start time, period duration, total periods)

### ⚙️ System Configuration
- **Gemini API Key** input (stored securely in browser localStorage)
- **Temporal parameters**: school start time, default period duration, total periods
- Auto-generates schedule on save

---

## 🛠️ Tech Stack

| Layer         | Technology                                |
|---------------|-------------------------------------------|
| **Framework** | React 19 + TypeScript                     |
| **Build Tool**| Vite 7                                    |
| **Styling**   | Tailwind CSS 3                            |
| **AI Engine** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Routing**   | React Router DOM v7                       |
| **Charts**    | Recharts                                  |
| **Icons**     | Lucide React                              |
| **Animations**| Framer Motion                             |
| **State**     | Custom `useLocalStorage` hook             |
| **IDs**       | UUID v13                                  |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- A **Google Gemini API Key** — get one free at [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/shabarishkaluva08/Facetrack-ai.git
cd facetrack-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Configuration

1. Open the app and navigate to **System Configuration** (⚙️ Settings)
2. Paste your **Gemini API Key** in the Neural Engine API section
3. Adjust the temporal parameters (school start time, period duration, total periods)
4. Click **Save Configuration**

---

## 📷 Connecting a Raspberry Pi CCTV

FaceTrack supports remote IP camera streams. To connect a Raspberry Pi:

1. **On the Raspberry Pi**, run a Flask MJPEG server:
   ```bash
   pip install flask flask-cors opencv-python
   ```
   ```python
   from flask import Flask, Response
   from flask_cors import CORS
   import cv2

   app = Flask(__name__)
   CORS(app)
   camera = cv2.VideoCapture(0)

   def generate_frames():
       while True:
           success, frame = camera.read()
           if not success:
               break
           ret, buffer = cv2.imencode('.jpg', frame)
           yield (b'--frame\r\n'
                  b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

   @app.route('/video_feed')
   def video_feed():
       return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=5000)
   ```

2. **In the app**, switch to **CCTV** mode in the Biometric Presence Matrix
3. Enter the stream URL: `http://<RASPBERRY_PI_IP>:5000/video_feed`
4. Click **Initialize Matrix** and **Activate AI Scanner**

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.tsx              # Navigation sidebar + page layout
│   └── ui/                     # Reusable UI components (Button, Card, Input, Label)
├── hooks/
│   └── useLocalStorage.ts      # Persistent state management hook
├── lib/
│   └── utils.ts                # Utility functions (cn classname merger)
├── pages/
│   ├── Dashboard.tsx           # Home dashboard with overview stats
│   ├── Scanner.tsx             # Biometric Presence Matrix (Webcam/CCTV + AI)
│   ├── StudentDirectory.tsx    # Student management with profile editing
│   ├── StudentEnrollment.tsx   # New student enrollment form + photo capture
│   ├── AttendanceReports.tsx   # Attendance Intelligence with filters
│   ├── AttendanceHistory.tsx   # Temporal Registry (attendance log)
│   ├── Schedule.tsx            # Period/timetable management
│   └── Settings.tsx            # System configuration (API key, temporal params)
├── store/
│   └── index.ts                # Global state (useStore hook)
├── types/
│   └── index.ts                # TypeScript type definitions
├── App.tsx                     # Root component with routing
└── main.tsx                    # Application entry point
```

---

## 📜 Available Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start the Vite dev server          |
| `npm run build`  | TypeScript check + production build|
| `npm run preview`| Preview the production build       |
| `npm run lint`   | Run ESLint                         |

---

## 🔒 Security Notes

- The Gemini API key is stored in **browser localStorage** — it never leaves your machine or gets committed to version control.
- No backend server is required; the app runs entirely client-side.
- Facial sample images (Base64) are stored locally in the browser.
- For production deployment, consider adding server-side API key management.

---

## 📄 License

This project is developed as a **Minor Project** for academic purposes.

---

<p align="center">
  Built with ❤️ using React, TypeScript, and Google Gemini AI
</p>
