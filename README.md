# 🌌 Janma Chino (जन्म चिनो) - Advanced Vedic Astrology & Kundali Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20API-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

**Janma Chino** is a state-of-the-art Vedic Astrology (Kundali) platform. It merges highly accurate astronomical calculations with advanced Generative AI to generate personalized birth charts, compute relationship compatibility (Ashta Koota matching), and offer an interactive digital "Vedic Guru" powered by Google Gemini.

---

## 🌟 Key Features

### 1. 🔭 High-Precision Astronomical Calculations
* **Kundali Positions**: Calculates planetary longitudes, signs, and house divisions based on date, time, and coordinates using the professional-grade **Swiss Ephemeris (`pyswisseph`)**.
* **Panchanga**: Displays Tithi, Nakshatra, Karana, Yoga, and Vara.
* **Varga Charts**: Generates divisional charts (D9 Navamsha, D10 Dashamsha, D12 Dwadashamsha, etc.) automatically.

### 2. 💑 Relationship Compatibility (Ashta Koota Matching)
* Implements the traditional **8-point (36 Guna) compatibility system** based on Moon signs, Nakshatras, and Padas.
* Generates detailed Guna-by-Guna breakdowns (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoota, Nadi).

### 3. 🤖 Generative AI Integration (Vedic Guru & Vision)
* **Vedic Guru Chat**: An interactive chat interface powered by **Gemini 2.5/3.5** that acts as an expert Vedic astrologer, answering specific questions about your birth chart.
* **Compatibility Synergy AI**: Evaluates Kundali synergy beyond simple points to produce a descriptive relationship report.
* **Multimodal Vision Chart Parser**: Upload any printed/drawn Kundali chart image, and the platform's vision engine will parse the positions and generate an instant AI explanation.

---

## 🛠️ Tech Stack

### Backend
* **FastAPI**: Asynchronous, high-performance web framework.
* **Swiss Ephemeris (`pyswisseph`)**: The golden standard library for astronomical computations.
* **Google GenAI SDK**: Powering all conversational and vision analysis features.
* **EasyOCR & OpenCV**: Hybrid local OCR engine for printed chart parsing.
* **Redis & Celery**: Background task runner and task broker.
* **PostgreSQL (SQLAlchemy)**: Secure persistent data storage.

### Frontend
* **Next.js 14**: Modern React framework featuring App Router and Server-side Rendering.
* **TailwindCSS**: Premium responsive UI design with rich glassmorphism elements.
* **TypeScript**: Strict type safety.
* **Lucide React**: Vector-based icons.
* **html-to-image**: Allows users to download their generated Kundali chart instantly.

---

## 📦 Getting Started

### Prerequisites
* **Docker & Docker Compose** (Recommended)
* **Python 3.10+** (For manual backend running)
* **Node.js 18+** (For manual frontend running)
* A **Google Gemini API Key**

### 🐳 Quick Start with Docker (Recommended)

1. Clone this repository.
2. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/janma_chino
   REDIS_URL=redis://redis:6379/0
   ```
3. Run Docker Compose:
   ```bash
   docker-compose up --build
   ```
4. Access the platform at:
   * **Frontend**: `http://localhost:3000`
   * **Backend API Documentation**: `http://localhost:8000/docs`

---

## 💻 Manual Setup (Development)

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create `backend/.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/janma_chino
   REDIS_URL=redis://localhost:6379/0
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

---

## 🛡️ Security & Environment Best Practices
To protect credentials, files containing API keys, database credentials, and session secrets are automatically ignored by git.
* Keep your `.env` and `backend/.env` files safe and never commit them.
* Reference `.env.example` to see standard template configurations for environment deployments.

---

## 🔮 Future Enhancements
* **Advanced Planetary Transits (Gochar)**: Real-time graphical visualization of dynamic transits mapped over your natal birth chart.
* **Sade Sati & Dasha Timelines**: Interactive visual timelines for major and minor dasha periods with AI explanations of upcoming phases.
* **Regional Chart Formats**: Toggle between South Indian, North Indian, and East Indian layout styles.

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
