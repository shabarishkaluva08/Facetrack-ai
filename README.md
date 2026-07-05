# FaceTrack — AI-Powered Biometric Attendance System

A modern, AI-powered facial recognition attendance management system built with React, TypeScript, and Google Gemini Vision API. FaceTrack uses real-time 
biometric scanning via webcam or CCTV (Raspberry Pi) to automatically identify enrolled students and log their attendance — eliminating manual roll calls entirely.

---

## ✨ Features

### 📊 Intelligence Dashboard
<img width="1917" height="898" alt="Screenshot 2026-07-05 163421" src="https://github.com/user-attachments/assets/c498966f-e594-4e15-90fb-c56672b2dee8" />

The Intelligence Dashboard serves as the central command center for FaceTrack AI, providing a high-level overview of daily student activity and enrollment 
metrics. This view aggregates core operational data into four key performance cards tracking Registered Students, Verified Today, Attendance Rate, and Pending 
actions. A real-time Live Pulse indicator and a Neural Core Status widget ensure administrators that the underlying facial recognition models and data streams are 
active and online. Finally, an interactive Weekly Retention Trend area chart visualizes data continuity by tracking unique scans per day to monitor long-term 
student engagement.




### 📝 Register Student Dashboard
<img width="1882" height="912" alt="Screenshot 2026-07-05 164344" src="https://github.com/user-attachments/assets/939c1282-f593-4cc2-a3aa-15347923ce19" />

The Register Student interface handles onboarding by provisioning new profiles directly into the system's biometric matrix. The Registration Form features 
dedicated inputs for the student's name and an institutional ID, which includes strict validation limiting it to a maximum of 10 alphanumeric characters with no 
special characters allowed. To build the facial recognition profile, administrators can upload up to 8 images per student using either the Import file feature or 
live image acquisition via a connected Webcam. Once a profile is successfully saved, it appears instantly in the sidebar's Live Registry panel, confirming that 
the new data has synchronized with the active database.




### 📅 Academic Schedule Dashboard

<img width="1917" height="912" alt="Screenshot 2026-07-05 163345" src="https://github.com/user-attachments/assets/e242a4c3-a1a8-410e-9f7e-17ecdef50ff8" />

The Academic Schedule module serves as the primary time-configuration interface that directly drives the student scanning and attendance logic. Through the 
integrated Timetable Generator, administrators fine-tune operational periods, recess slots, and session timings by specifying a precise Start Time, the total 
Period Count, and the exact Period Duration in minutes. Clicking Generate Sequence automatically maps out the daily institutional schedule. The AI tracking 
backend relies entirely on this generated timeline to correctly categorize, timestamp, and validate student biometric scans against their designated class hours.



### 🔬 Biometric Presence Matrix (Scanner)
<img width="1860" height="902" alt="Screenshot 2026-07-05 164728" src="https://github.com/user-attachments/assets/abdf754c-905b-4065-9367-f6aa4f6dc6de" />

- **Real-time facial recognition** powered by Google Gemini 2.5 Flash Vision API
- **Dual input sources**: Local webcam or remote CCTV/IP camera (Raspberry Pi MJPEG stream)
- **AI bounding boxes** drawn live on the video feed — green for newly marked, orange for already marked, red for unknown
- **Automatic attendance logging** with confidence scores
- **Period-aware scanning** — attendance is tied to a specific class period




### 🕒 Temporal Registry Dashboard
<img width="1905" height="907" alt="Screenshot 2026-07-05 164757" src="https://github.com/user-attachments/assets/f5f9339c-9b45-464d-8048-bc6f7dbcf01c" />


The Temporal Registry serves as the system's immutable log, providing a historical ledger of all biometric attendance verification events. This dashboard displays 
comprehensive tracking data for verified students, capturing their unique Identity (name and institutional ID), precise Timestamp records, verification Status 
(e.g., Present), and the neural network's AI Confidence percentage. Administrators can filter through the ledger using a built-in search bar or narrow down 
records by custom date ranges. An Export CSV button provides instant report generation, allowing operators to download the entire logged dataset into a standard 
spreadsheet format for external administrative review.



### 🧠 Attendance Intelligence Dashboard
<img width="1895" height="910" alt="Screenshot 2026-07-05 164911" src="https://github.com/user-attachments/assets/8d3438d1-729d-4c15-858d-d0beaf5df351" />

  The Attendance Intelligence view offers an advanced analytical layer designed specifically for data auditing based on AI prediction metrics. This dashboard 
  allows administrators to filter student logs dynamically using a Min Confidence threshold slider, making it possible to isolate low-confidence scans (such as a 
  50% match) to verify whether the system encountered a true registered student or an unverified anomaly. Users can refine their audit searches using the 
  integrated subject identity search bar and strict custom date-range boundaries. A dedicated Neural Audit Export button allows administrators to extract these 
  filtered high-precision datasets for deeper compliance checks and security reporting.



### 👨‍🎓 Student Directory
<img width="1901" height="905" alt="Screenshot 2026-07-05 164412" src="https://github.com/user-attachments/assets/9fcafa9c-8e0a-4f4f-aaf1-1631dae59a5a" />
<img width="1891" height="921" alt="Screenshot 2026-07-05 172211" src="https://github.com/user-attachments/assets/84f31611-3069-4a1c-b649-b0c5f1ca916c" />

The Student Directory acts as a comprehensive database management hub where administrators can view, search, and update all enrolled profiles. Selecting a student 
from the main folder-style directory opens their detailed Biometric Profile panel, displaying their system UUID, editable name fields, and unique Institutional 
ID. This interface provides robust dataset management capabilities, allowing administrators to modify existing data, delete lower-quality facial models, or 
capture and add new angles to the student’s Facial Datasets (tracking up to the 8-image limit). A dedicated Save Changes button ensures updates are instantly 
committed to re-train or refine the active AI matching profile




### ⚙️ System Configuration
<img width="1912" height="896" alt="Screenshot 2026-07-05 164446" src="https://github.com/user-attachments/assets/50de2d7a-de95-48d1-82de-fb4c70559c41" />

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
  Built  using React, TypeScript, and Google Gemini AI
</p>
