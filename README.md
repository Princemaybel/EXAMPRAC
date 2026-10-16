# EXAMPRAC — PAARCQE Offline Exam Practice App

An offline Android practice examination application and PWA designed to prepare cadets for the **PAARCQE (Philippine Army Advance ROTC Cadet Qualifying Examination)**.

Built with pure HTML5, CSS3, vanilla JavaScript, IndexedDB, and packaged as a native Android application using **Capacitor**.

---

## 📱 Android APK Deliverable

The native Android Debug APK has been built and ready for installation:

- **Desktop Direct File**: `C:\Users\princ\Desktop\EXAMPRAC.apk` (~4.32 MB)
- **Project Build Output**: `C:\Users\princ\Documents\EXAMPRAC\android\app\build\outputs\apk\debug\app-debug.apk`
- **XAMPP Local Server**: `http://localhost/EXAMPRAC/EXAMPRAC.apk`

### How to Install the APK on Your Android Device:

1. **Option A (USB / File Transfer)**:
   - Connect your Android phone to your PC via USB cable.
   - Copy `EXAMPRAC.apk` from your Desktop into your phone's **Downloads** folder.
   - Open your phone's **Files / File Manager** app, tap `EXAMPRAC.apk`, and tap **Install**.
   - If prompted, enable *"Install unknown apps"* for your file manager.

2. **Option B (Local Wi-Fi via XAMPP)**:
   - Make sure Apache is running in XAMPP.
   - Find your PC's local IP address (e.g., `ipconfig` -> `192.168.1.X`).
   - On your phone (connected to the same Wi-Fi), open Chrome and visit:  
     `http://<YOUR-PC-IP>/EXAMPRAC/EXAMPRAC.apk`
   - Download and install.

---

## 🎯 Question Bank & Reviewer Coverage

Imported directly from `PAARCQE_Practice_Reviewer_2026.docx` with 100% verified answer keys:

| Part | Category | Questions |
| :--- | :--- | :---: |
| **Part I** | English Proficiency | Q1 – Q20 |
| **Part II** | Mathematics | Q21 – Q40 |
| **Part III** | Logical and Abstract Reasoning | Q41 – Q60 |
| **Part IV** | Philippine History and General Knowledge | Q61 – Q80 |
| **Part V** | ROTC and Military Fundamentals | Q81 – Q100 |

- **Total Questions**: Exactly 100 questions.
- **Choices**: 4 choices per question (A, B, C, D).
- **Randomization**: Both question sequence and choice order are shuffled safely using the Fisher-Yates algorithm, preserving the correct answer identifier.
- **Memory Tips & Explanations**: Included for every question.

---

## 🚀 Key Features

1. **Practice Mode (Immediate Feedback)**:
   - One question at a time with independent countdown timer (default 30s; configurable).
   - Instant visual feedback: Correct answer highlighted in green, wrong choice in red.
   - Comprehensive memory tip / explanation shown immediately.
   - Synthesized audio feedback (pleasant chime for correct, gentle buzz for incorrect).

2. **Mock Examination Mode**:
   - Realistic exam simulation with 60–150 minute countdown timer.
   - 100 questions covering all 5 categories.
   - Interactive question grid navigator with status indicators (answered, unanswered, flagged).
   - Answers kept hidden until final submission.
   - Detailed review and category breakdown upon submission.

3. **Memory Training Modes**:
   - **Rapid Recall**: Quick-fire practice through all questions.
   - **Mistake Review**: Isolates only previously missed questions.
   - **Repeat Until Correct**: Missed questions automatically re-appear at the end of the session.
   - **Quick Review (Flashcards)**: Active-recall flashcards with tap-to-reveal.
   - **Spaced Repetition**: Dynamic review intervals based on mastery level.

4. **Category Practice**:
   - Practice any of the 5 subjects independently with live accuracy tracking.

5. **Study Progress & Statistics**:
   - Total questions answered, accuracy rate, daily study streak, and question mastery count.
   - Stored permanently on device via **IndexedDB** — persists across app restarts.
   - One-click JSON backup **Export** and **Import**.

6. **Comfortable Modern Design**:
   - Military navy and gold accent theme.
   - Thumb-friendly bottom navigation bar for quick one-handed access on mobile.
   - Tactile button press feedback and smooth transitions.
   - Dark mode and crisp Light mode toggle in Settings.
   - Desktop keyboard shortcuts (`A`, `B`, `C`, `D`, `1`–`4`, `Enter`, `Arrow keys`).

---

## 🛠 Rebuilding or Opening in Android Studio

If you want to edit the native Android project in Android Studio:

```bash
# In the EXAMPRAC root folder:
npx cap open android
```

To recompile the APK from the terminal:

```powershell
$env:JAVA_HOME = "C:\Users\princ\AppData\Local\Programs\Java\jdk-21.0.11+10"
$env:ANDROID_HOME = "C:\Users\princ\AppData\Local\Android\Sdk"
cd android
.\gradlew.bat assembleDebug
```

