# LearnPath AI - AI-Powered Personalized Learning Path Generator

![LearnPath AI](https://img.shields.io/badge/AI-Powered-blue) ![Python](https://img.shields.io/badge/Python-3.9+-green) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

An intelligent learning path recommendation system that uses **unsupervised machine learning** to generate personalized vocational training pathways aligned with India's **National Skills Qualifications Framework (NSQF)**.

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Approach & Methodology](#approach--methodology)
- [Dataset](#dataset)
- [Algorithms & Models](#algorithms--models)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation](#installation)
- [How to Run](#how-to-run)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

## 🎯 Problem Statement

Matching learners to appropriate vocational training programs is challenging due to:
- Diverse skill levels and career aspirations
- Complex NSQF framework with levels 3-7
- Need for personalized recommendations
- Lack of intelligent matching systems

**LearnPath AI** solves this by using AI to analyze learner profiles and recommend optimal learning pathways from 5000+ courses across multiple sectors.

## 🧠 Approach & Methodology

Our system uses a **hybrid unsupervised learning approach**:

### 1. Semantic Search with Sentence Transformers
- Convert learner aspirations and course descriptions into high-dimensional embeddings
- Use **Sentence-BERT** (all-MiniLM-L6-v2) for semantic understanding
- Match learners to courses using **cosine similarity** in vector space

### 2. Learner Profiling with Clustering
- Apply **KMeans clustering** to identify learner personas
- Use **PCA** for dimensionality reduction (384 → 10 dimensions)
- Cluster learners into 5 personas: Tech Savvy, Vocational/Trades, Creative/Design, Business/Management, Entry Level

### 3. Feature Engineering
- Extract features from user input: skills, aspirations, education level
- Enrich with semantic embeddings
- Combine structured and unstructured data for better recommendations

## 📊 Dataset

### Course Catalog
- **Size**: 5000+ courses
- **Source**: Synthetically generated based on Indian NSQF framework
- **Sectors**: IT-ITeS, Healthcare, Automotive, Green Jobs, Electronics, Construction, Agriculture, Retail
- **NSQF Levels**: 3-7 (from basic vocational to advanced professional)

### Course Attributes
```json
{
  "id": "C-1000",
  "title": "Python Specialist - NSQF Level 5",
  "sector": "IT-ITeS",
  "nsqf_level": 5,
  "description": "A comprehensive 250-hour course covering Python...",
  "skills": "Python, IT-ITeS, Safety, Teamwork",
  "duration_hours": 250,
  "provider": "National Skill Training Institute"
}
```

### Alternative Real Datasets

While this project uses synthetic data, you can integrate real datasets from these sources:

#### 1. **O*NET Database** (Recommended for Skills/Occupations)
- **Source**: U.S. Department of Labor
- **Content**: 900+ occupations with detailed skills, knowledge, abilities, tasks
- **API**: O*NET Web Services (RESTful API, JSON format)
- **Access**: Free with registration
- **Link**: [https://services.onetcenter.org/](https://services.onetcenter.org/)
- **Use Case**: Map learner skills to occupations, then recommend relevant courses

#### 2. **Coursera Catalog API**
- **Source**: Coursera
- **Content**: Thousands of online courses across various domains
- **API**: `https://api.coursera.org/api/catalog.v1/courses`
- **Access**: Requires OAuth 2.0 authentication
- **Use Case**: Real online course recommendations

#### 3. **edX Course Catalog API**
- **Source**: edX
- **Content**: University-level online courses
- **API**: Course Catalog API (REST, JSON)
- **Access**: Requires credentials and access token
- **Documentation**: [edX API Docs](https://course-catalog-api-guide.readthedocs.io/)
- **Use Case**: Academic course recommendations

#### 4. **Kaggle Datasets**
- **Coursera Courses**: [Kaggle - Coursera Dataset](https://www.kaggle.com/datasets)
- **edX Courses**: [Kaggle - edX Dataset](https://www.kaggle.com/datasets)
- **Content**: Scraped course catalogs with titles, descriptions, ratings
- **Access**: Free download
- **Use Case**: Quick prototyping without API setup

#### 5. **NCVET/NSQF Data** (India-specific)
- **Source**: National Council for Vocational Education and Training
- **Content**: NSQF-aligned qualifications and National Occupational Standards
- **Access**: National Qualification Register (NQR)
- **Note**: No public API currently available; data may need to be scraped or requested
- **Link**: [https://ncvet.gov.in/](https://ncvet.gov.in/)

### Integration Guide

To replace synthetic data with real datasets:

1. **For O*NET**:
   ```python
   # Example: Fetch occupation data
   import requests
   response = requests.get('https://services.onetcenter.org/ws/online/occupations')
   occupations = response.json()
   ```

2. **For Coursera/edX**:
   - Register for API access
   - Implement OAuth 2.0 authentication
   - Fetch course catalog periodically
   - Transform to match your schema

3. **For Kaggle Datasets**:
   - Download CSV files
   - Convert to JSON format
   - Map fields to your course schema
   - Load into `backend/data/courses.json`


## 🤖 Algorithms & Models

| Component | Algorithm/Model | Purpose |
|-----------|----------------|---------|
| **Embeddings** | Sentence-BERT (all-MiniLM-L6-v2) | Convert text to 384-dim vectors |
| **Clustering** | KMeans (k=5) | Identify learner personas |
| **Dimensionality Reduction** | PCA (384→10) | Reduce vector dimensions for clustering |
| **Similarity Matching** | Cosine Similarity | Find similar courses to user profile |
| **Recommendation** | Content-Based Filtering | Match users to courses semantically |

### Why These Algorithms?

- **Sentence-BERT**: Lightweight (runs on CPU), excellent for semantic similarity tasks
- **KMeans**: Simple, interpretable clustering for persona identification
- **PCA**: Reduces noise and improves clustering performance
- **Cosine Similarity**: Standard metric for vector similarity in NLP

## 🛠️ Technology Stack

### Backend (Python ML Engine)
- **Python 3.9+**
- **sentence-transformers** - Semantic embeddings
- **scikit-learn** - ML algorithms (KMeans, PCA, Cosine Similarity)
- **numpy** - Numerical computations
- **Flask/Express integration** - API via child process

### Frontend (React Application)
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing

### Database
- **SQLite** - User data storage
- **JSON** - Course catalog storage

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **npm** - Package management

## 📁 Project Structure

```
LearnPathAI-ML/
├── backend/                           # Python ML Engine
│   ├── ml_engine/                    # Core ML modules
│   │   ├── recommender.py            # Course recommendation engine
│   │   ├── profiler.py               # Learner profiling & clustering
│   │   ├── features.py               # Feature engineering
│   │   ├── config.py                 # Configuration
│   │   └── models/                   # Trained models
│   │       ├── kmeans_model.pkl      # KMeans clustering model
│   │       └── pca_model.pkl         # PCA model
│   ├── data/                         # Dataset
│   │   ├── courses.json              # 5000+ course catalog
│   │   └── loader.py                 # Data loading utilities
│   ├── inference.py                  # Main ML inference script
│   └── setup_full.py                 # Setup script for ML models
│
├── pathway learning ml model/         # React Frontend
│   ├── client/                       # React application
│   │   ├── pages/                    # Page components
│   │   │   ├── Index.tsx             # Homepage
│   │   │   ├── LearningPath.tsx      # Path generation page
│   │   │   ├── Dashboard.tsx         # User dashboard
│   │   │   └── ...
│   │   ├── components/               # Reusable components
│   │   │   ├── layout/               # Layout components
│   │   │   │   └── Navbar.tsx        # Navigation bar
│   │   │   └── common/               # Common components
│   │   └── context/                  # React contexts
│   ├── server/                       # Express backend
│   │   ├── routes/                   # API routes
│   │   │   ├── ai.ts                 # AI/ML endpoints
│   │   │   ├── auth.ts               # Authentication
│   │   │   └── ...
│   │   └── lib/                      # Server utilities
│   ├── package.json                  # Dependencies
│   └── vite.config.ts                # Vite configuration
│
└── README.md                         # This file
```

## ✨ Features

### Core Features
- ✅ **AI-Powered Recommendations** - Semantic search using Sentence-BERT
- ✅ **Learner Persona Identification** - KMeans clustering for personalization
- ✅ **NSQF-Aligned Courses** - 5000+ courses across levels 3-7
- ✅ **Multi-Sector Coverage** - IT, Healthcare, Automotive, Green Jobs, and more
- ✅ **Semantic Matching** - Understands intent, not just keywords

### Web Application Features
- ✅ **User Authentication** - Secure JWT-based auth system
- ✅ **Modern Dark Mode UI** - Beautiful, responsive interface
- ✅ **Real-time Path Generation** - Instant AI-powered recommendations
- ✅ **Course Details** - Comprehensive information for each course
- ✅ **Match Scores** - Transparency in recommendation quality
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Installation

### Prerequisites
- **Python 3.9+**
- **Node.js 16+** and npm
- **Git**

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd LearnPathAI-ML
```

### Step 2: Setup Backend (Python ML Engine)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install sentence-transformers scikit-learn numpy

# Setup ML models (train KMeans and PCA)
python3 setup_full.py
```

### Step 3: Setup Frontend (React Application)

```bash
# Navigate to frontend directory
cd "../pathway learning ml model"

# Install npm dependencies
npm install
```

## ▶️ How to Run

### Option 1: One-Click Run (Windows)
We have provided a unified script to automate setup and startup.

1. Double-click **`run_project.bat`** in the root directory.
   - OR run via terminal: `.\run_project.bat`

This script will:
- Check/Create Python virtual environment (`backend/venv_new`)
- Run setup (generate data/models)
- Install frontend dependencies
- Start the application at `http://localhost:5173`

### Option 2: Manual Run

#### Start the Backend
```bash
cd backend
python3 inference.py
```

#### Start the Frontend
```bash
cd "pathway learning ml model"
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5173/api

### Using the Application

1. **Open your browser** and navigate to `http://localhost:5173`
2. **Navigate to "Generate Path"** from the navigation menu
3. **Fill in your details**:
   - What do you want to become? (e.g., "I want to become a data scientist")
   - What skills do you have? (e.g., "Python, Statistics, Machine Learning")
4. **Click "Generate My Path"**
5. **View your results**:
   - Your learner persona
   - Top 5 recommended courses with match scores
   - Course details including sector, NSQF level, duration, and skills

## 📸 Screenshots

### Homepage
![Homepage with new navbar](/Users/palki/.gemini/antigravity/brain/78509d51-d10c-4a5b-95f9-971f2d574358/new_navbar_and_page_1765734806789.png)

*Modern dark mode interface with gradient logo and clean navigation*

### Learning Path Generation - Success
![Successful learning path results](/Users/palki/.gemini/antigravity/brain/78509d51-d10c-4a5b-95f9-971f2d574358/successful_learning_path_1765734945806.png)

*AI-generated learning path with persona identification and course recommendations*

## 🔮 Future Enhancements

### Short-term
- [ ] **Real-time NCVET API Integration** - Connect to official course databases
- [ ] **Progress Tracking** - Track learner progress through courses
- [ ] **Bookmarking** - Save favorite courses
- [ ] **Course Filtering** - Filter by sector, level, duration

### Medium-term
- [ ] **Collaborative Filtering** - Recommend based on similar learners
- [ ] **Learning Path Visualization** - Visual roadmap of learning journey
- [ ] **Certificate Generation** - Digital certificates upon completion
- [ ] **Mentor Matching** - Connect learners with mentors

### Long-term
- [ ] **Mobile Application** - Native iOS/Android apps
- [ ] **Multilingual Support** - Support for regional Indian languages
- [ ] **Skill Gap Analysis** - Identify missing skills for career goals
- [ ] **Job Market Integration** - Link courses to job opportunities

## 📝 License

This project is developed as part of an academic/research initiative.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Contact

For questions or feedback, please reach out to the development team.

---

