#!/usr/bin/env tsx

import { db } from "../src/db";
import { paste } from "../src/db/schema";
import { nanoid } from "nanoid";

const SAMPLE_PASTES = [
  {
    title: "React TypeScript Component",
    content: `import React, { useState, useEffect } from 'react';

interface UserProps {
  id: number;
  name: string;
  email: string;
}

const UserProfile: React.FC<UserProps> = ({ id, name, email }) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserProps | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch(\`/api/users/\${id}\`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>{name}</h2>
      <p>Email: {email}</p>
      {userData && (
        <div>
          <p>Additional data loaded!</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;`,
    language: "typescript",
    description: "A React TypeScript component for displaying user profiles with async data loading"
  },
  {
    title: "Python Data Analysis Script",
    content: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Load dataset
data = pd.read_csv('sales_data.csv')

# Data preprocessing
data['date'] = pd.to_datetime(data['date'])
data['month'] = data['date'].dt.month
data['year'] = data['date'].dt.year

# Feature engineering
features = ['price', 'advertising_spend', 'month', 'year']
X = data[features]
y = data['sales']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Squared Error: {mse:.2f}")
print(f"R² Score: {r2:.2f}")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': features,
    'coefficient': model.coef_
})

print("\\nFeature Importance:")
print(feature_importance.sort_values('coefficient', ascending=False))`,
    language: "python",
    description: "Sales prediction model using linear regression with feature engineering"
  },
  {
    title: "Express.js API Server",
    content: `const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/users', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Mock data - replace with actual database query
    const users = Array.from({ length: limit }, (_, i) => ({
      id: offset + i + 1,
      name: \`User \${offset + i + 1}\`,
      email: \`user\${offset + i + 1}@example.com\`,
      createdAt: new Date().toISOString()
    }));
    
    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1000,
        totalPages: Math.ceil(1000 / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    language: "javascript",
    description: "Express.js API server with security, rate limiting, and pagination"
  },
  {
    title: "CSS Grid Layout System",
    content: `.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-content {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    padding: 1rem;
    grid-gap: 1rem;
  }
  
  .card {
    border-radius: 8px;
  }
  
  .card-header,
  .card-content {
    padding: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .card {
    background: #1f2937;
    color: white;
  }
  
  .card-header {
    border-bottom-color: #374151;
  }
  
  .card-title {
    color: white;
  }
  
  .card-footer {
    background: #111827;
    border-top-color: #374151;
  }
}`,
    language: "css",
    description: "Responsive CSS Grid layout system with hover effects and dark mode support"
  },
  {
    title: "Go REST API with Middleware",
    content: `package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "time"

    "github.com/gorilla/mux"
    "github.com/rs/cors"
)

type User struct {
    ID       int    \`json:"id"\`
    Name     string \`json:"name"\`
    Email    string \`json:"email"\`
    CreatedAt time.Time \`json:"created_at"\`
}

type Response struct {
    Data       interface{} \`json:"data,omitempty"\`
    Message    string      \`json:"message,omitempty"\`
    Error      string      \`json:"error,omitempty"\`
    Pagination *Pagination \`json:"pagination,omitempty"\`
}

type Pagination struct {
    Page       int \`json:"page"\`
    Limit      int \`json:"limit"\`
    Total      int \`json:"total"\`
    TotalPages int \`json:"total_pages"\`
}

// Middleware for logging
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

// Middleware for JSON response
func jsonMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        next.ServeHTTP(w, r)
    })
}

func getUsers(w http.ResponseWriter, r *http.Request) {
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    if page < 1 {
        page = 1
    }
    
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
    if limit < 1 || limit > 100 {
        limit = 10
    }

    // Mock data generation
    offset := (page - 1) * limit
    users := make([]User, limit)
    for i := 0; i < limit; i++ {
        users[i] = User{
            ID:       offset + i + 1,
            Name:     fmt.Sprintf("User %d", offset+i+1),
            Email:    fmt.Sprintf("user%d@example.com", offset+i+1),
            CreatedAt: time.Now(),
        }
    }

    total := 1000
    totalPages := (total + limit - 1) / limit

    response := Response{
        Data: users,
        Pagination: &Pagination{
            Page:       page,
            Limit:      limit,
            Total:      total,
            TotalPages: totalPages,
        },
    }

    json.NewEncoder(w).Encode(response)
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
    response := Response{
        Message: "API is healthy",
        Data: map[string]interface{}{
            "status":    "OK",
            "timestamp": time.Now(),
        },
    }
    json.NewEncoder(w).Encode(response)
}

func main() {
    r := mux.NewRouter()

    // Apply middleware
    r.Use(loggingMiddleware)
    r.Use(jsonMiddleware)

    // Routes
    r.HandleFunc("/health", healthCheck).Methods("GET")
    r.HandleFunc("/api/users", getUsers).Methods("GET")

    // CORS setup
    c := cors.New(cors.Options{
        AllowedOrigins: []string{"*"},
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"*"},
    })

    handler := c.Handler(r)
    
    port := ":8080"
    log.Printf("Server starting on port %s", port)
    log.Fatal(http.ListenAndServe(port, handler))
}`,
    language: "go",
    description: "Go REST API server with middleware, CORS, and pagination support"
  }
];

async function generateSlug(): Promise<string> {
  return nanoid(8);
}

async function seedPublicPastes() {
  console.log("🌱 Starting to seed public pastes...");
  
  try {
    // Create variations of each sample paste
    const pastesToCreate = [];
    
    for (let i = 0; i < 50; i++) {
      const sampleIndex = i % SAMPLE_PASTES.length;
      const sample = SAMPLE_PASTES[sampleIndex];
      
      const pasteData = {
        id: nanoid(),
        slug: await generateSlug(),
        title: `${sample.title} ${i + 1}`,
        description: sample.description,
        content: sample.content,
        language: sample.language,
        visibility: "public" as const,
        views: Math.floor(Math.random() * 1000) + 1,
        userId: null, // Anonymous pastes
        hasPassword: false,
        burnAfterRead: false,
        burnAfterReadViews: null,
        expiresAt: null,
        isDeleted: false,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        updatedAt: new Date(),
      };
      
      pastesToCreate.push(pasteData);
    }
    
    // Insert in larger batches for better performance
    const batchSize = 100;
    for (let i = 0; i < pastesToCreate.length; i += batchSize) {
      const batch = pastesToCreate.slice(i, i + batchSize);
      await db.insert(paste).values(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pastesToCreate.length / batchSize)}`);
    }
    
    console.log(`🎉 Successfully created ${pastesToCreate.length} public pastes!`);
    console.log("📊 Summary:");
    console.log(`- Total pastes: ${pastesToCreate.length}`);
    console.log("- Languages:", [...new Set(pastesToCreate.map(p => p.language))].join(", "));
    console.log("- All pastes are public and anonymous");
    
  } catch (error) {
    console.error("❌ Error seeding public pastes:", error);
    process.exit(1);
  }
}

// Run the seeding script
seedPublicPastes()
  .then(() => {
    console.log("✨ Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });