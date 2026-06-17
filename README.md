# 🎮 FF Info — Free Fire Account Lookup Platform

A professional, premium, modern Free Fire account lookup platform with a full-stack architecture.

---

## 📁 Project Structure

```
ff-info/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   ├── assets/
│   └── pages/
│       ├── developer.html
│       └── api-status.html
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   ├── routes/player.py
│   ├── services/api_service.py
│   ├── database/database.py
│   ├── models/player.py
│   └── utils/helpers.py
│
├── README.md
└── LICENSE
```

---

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env .env.local               # Edit as needed
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

Serve the `frontend/` folder from any static file server.

**Option 1 – Python:**
```bash
cd frontend
python -m http.server 3000
```

**Option 2 – With a reverse proxy (Nginx/Caddy):**
Proxy `/api/` → `http://localhost:8000/api/` and serve `frontend/` as static root.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/player/{uid}` | Get player information |
| GET | `/api/player/stats/overview` | Get platform statistics |
| GET | `/api/status` | API health check |
| GET | `/docs` | Swagger UI |

---

## 🔒 Validation Rules

- UID must be **numbers only**
- UID length: **8–12 digits**
- Rate limit: **30 requests/minute per IP**

---

## 🛠 Tech Stack

**Frontend:** HTML5, Tailwind-less CSS (custom), JavaScript ES6, Font Awesome, AOS, Chart.js, html2canvas, jsPDF

**Backend:** FastAPI, Uvicorn, HTTPX, aiosqlite, slowapi, python-dotenv, Pydantic v2

---

## 👤 Developer

**Shuvo Ahmed** — Full Stack Developer  
🇧🇩 Bangladesh  
Telegram: [@shuvo_9882](https://t.me/shuvo_9882)

---

## 📄 License

MIT License — © 2026 FF Info
