# AlumniConnect

A web platform where students connect with alumni for mentorship and community interaction.

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/NishitaVedpathak03/alumni-connect.git
cd alumni-connect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Initialize database (SQLite)

```bash
node backend/init-db.js
```

### 4. Start backend

```bash
node backend/server.js
```

### 5. Start frontend

```bash
npm run dev
```

---

## 👤 Test Login

### 🎓 Student

* Email: [alex@example.com](mailto:alex@example.com)
* Password: 123456

### 👩‍🏫 Alumni

* Email: [sarah@example.com](mailto:sarah@example.com)
* Password: 123456


---

## 🛠 Tech Stack

* Frontend: Next.js / React
* Backend: Node.js + Express
* Database: SQLite

---

## ⚠️ Notes

* `database.sqlite` is not included in repo
* Run `init-db.js` before starting server
* Use `.env` if needed for config

---

## ✨ Features

* User authentication
* Community posts
* Alumni mentorship requests
* Chat (in progress)
