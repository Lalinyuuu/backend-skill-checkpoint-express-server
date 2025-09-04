# 🚀 Backend Skill Checkpoint – Quora-like API

API สำหรับจัดการ **Questions** และ **Answers** สร้างเหมือนเว็บ Q&A (คล้าย Quora)  
ผู้ใช้งานสามารถเพิ่มคำถาม คำตอบ โหวต และค้นหาคำถามได้

---

## 📝 คำอธิบายโปรเจกต์

- ผู้ใช้สามารถ **สร้าง / อ่าน / แก้ไข / ลบ** คำถามได้
- ค้นหาคำถามตาม **title** หรือ **category**
- ผู้ใช้สามารถ **ตอบคำถาม**, ดูคำตอบ, และลบคำตอบ
- สามารถ **โหวต (+/-)** ได้ทั้งคำถามและคำตอบ
- ใช้ **Express.js** + **PostgreSQL**

---

## 🛠 Tech Stack

- Node.js / Express.js
- PostgreSQL (pg package)
- Nodemon (dev)
- dotenv
- cors

---

## 📂 โครงสร้างไฟล์

```
.
├── app.mjs                 # Entry point
├── routes/                 # Router (questions, answers)
│   ├── questions.mjs
│   └── answers.mjs
├── controllers/            # Controller logic
│   ├── questionsController.mjs
│   └── answersController.mjs
├── middleware/             # Error handler, notFound
│   └── errorHandler.mjs
├── utils/
│   └── db.mjs              # Database connection (pg.Pool)
├── checkpoint.sql          # Database schema + seed data
└── README.md
```

---

## ⚙️ การติดตั้งและใช้งาน

```bash
# Clone repo
git clone <repo-url>
cd backend-skill-checkpoint-express-server

# ติดตั้ง dependencies
npm install

# ตั้งค่าไฟล์ .env
DATABASE_URL=postgres://<user>:<password>@localhost:5432/quora_db
PORT=4000

# สร้าง DB + seed data
createdb quora_db
psql -U <user> -d quora_db -f checkpoint.sql

# รันเซิร์ฟเวอร์
npm run dev
```

---

## 📡 API Endpoints

### 🤔 Questions
| Method | Endpoint              | Description                     |
|--------|----------------------|---------------------------------|
| POST   | /questions           | สร้างคำถามใหม่                  |
| GET    | /questions           | ดึงคำถามทั้งหมด                 |
| GET    | /questions/:id       | ดึงคำถามตาม id                  |
| PUT    | /questions/:id       | แก้ไขคำถาม                      |
| DELETE | /questions/:id       | ลบคำถาม                         |
| GET    | /questions/search    | ค้นหาคำถามตาม title หรือ category |

### 💬 Answers
| Method | Endpoint                    | Description                       |
|--------|-----------------------------|-----------------------------------|
| POST   | /questions/:id/answers      | เพิ่มคำตอบให้คำถาม               |
| GET    | /questions/:id/answers      | ดูคำตอบของคำถาม                  |
| DELETE | /questions/:id/answers      | ลบคำตอบทั้งหมดของคำถาม           |

### 👍👎 Votes
| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| POST   | /questions/:id/vote   | โหวตคำถาม (+1 / -1)         |
| POST   | /answers/:id/vote     | โหวตคำตอบ (+1 / -1)         |

---

## 🧪 ตัวอย่างการทดสอบ

### 1. ➕ สร้างคำถาม
**POST** `/questions`
```json
{
  "title": "What is the capital of France?",
  "description": "This is a basic geography question.",
  "category": "Geography"
}
```

**Response:**
```json
{ "message": "Question created successfully." }
```

### 2. 📋 ดึงคำถามทั้งหมด
**GET** `/questions`

### 3. 🔍 ดึงคำถามตาม ID
**GET** `/questions/1`

### 4. ✏️ แก้ไขคำถาม
**PUT** `/questions/1`
```json
{
  "title": "What is the capital of Germany?",
  "description": "Updated question",
  "category": "Geography"
}
```

### 5. 💭 สร้างคำตอบ
**POST** `/questions/1/answers`
```json
{ "content": "The capital of France is Paris." }
```

### 6. 🔎 ค้นหาคำถาม
**GET** `/questions/search?title=France&category=Geography`

### 7. 👍 โหวตคำถาม
**POST** `/questions/1/vote`
```json
{ "vote": 1 }
```

### 8. 👎 โหวตคำตอบ
**POST** `/answers/1/vote`
```json
{ "vote": -1 }
```

---

## 🗄️ Database Schema

### Tables:
- **questions** (id, title, description, category, created_at)
- **answers** (id, question_id, content, created_at)
- **question_votes** (id, question_id, vote)
- **answer_votes** (id, answer_id, vote)

---

## 📋 Business Rules

- Answer content: ไม่เกิน 300 ตัวอักษร
- Vote values: เฉพาะ +1 หรือ -1
- ลบคำถาม → คำตอบจะถูกลบตามไปด้วย (CASCADE)
- Search: รองรับ case-insensitive search สำหรับ title และ category

---

## ⚠️ Error Handling

- **400 Bad Request** → Invalid request data
- **404 Not Found** → Question/Answer not found
- **500 Internal Server Error** → Unexpected error

---

## 👨‍💻 Author
- Dev: Lalinyuuu
- Bootcamp: Techup