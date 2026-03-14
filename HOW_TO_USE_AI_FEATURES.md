# 🤖 How to Use AI Features - Complete Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [AI Features Explained](#ai-features-explained)
3. [How Each Feature Works](#how-each-feature-works)
4. [Step-by-Step Tutorials](#step-by-step-tutorials)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Start All Services
```bash
# Terminal 1 - PostgreSQL
net start postgresql-x64-16

# Terminal 2 - Backend
cd server
npm run dev

# Terminal 3 - Frontend
cd client
npm start
```

### 2. Access AI Features
**Option A: AI Demo Page (Easiest)**
- Visit: `http://localhost:3000/ai-demo`
- No login required for status check
- Test all features with sample data

**Option B: During Interview**
- Create job as employer
- Apply as candidate
- Start interview (AI generates questions)
- Answer questions (AI evaluates)
- View report (AI provides scores)

---

## 🎯 AI Features Explained

### 1. **Generate Interview Questions**
**What it does:**
- Creates customized interview questions based on job requirements
- Varies difficulty levels (easy, medium, hard)
- Covers different competencies (technical, behavioral, problem-solving)

**When to use:**
- When starting an interview
- Automatically used when candidate starts interview

**Example:**
```
Job: Senior React Developer
Questions Generated:
1. Tell me about your experience with React hooks (Medium)
2. How do you handle state management? (Hard)
3. Describe a challenging project you worked on (Medium)
```

---

### 2. **Evaluate Interview Responses**
**What it does:**
- Analyzes candidate answers to interview questions
- Scores on multiple dimensions (technical, communication, problem-solving)
- Provides detailed feedback
- Identifies strengths and weaknesses

**When to use:**
- After candidate answers each question
- Automatically evaluated when answer is submitted

**Scores Provided:**
- Technical Score (0-100)
- Communication Score (0-100)
- Problem-Solving Score (0-100)
- Overall Score (0-100)

**Example:**
```
Answer: "I use React hooks for state management..."
Technical Score: 88/100
Communication Score: 82/100
Feedback: "Strong understanding of hooks, clear explanation"
```

---

### 3. **Analyze Resume**
**What it does:**
- Matches resume against job requirements
- Identifies matching skills
- Identifies missing skills
- Provides match score and recommendations

**When to use:**
- When reviewing candidate applications
- To assess candidate fit for job

**Example:**
```
Resume: John Doe - Senior React Developer
Job: Senior React Developer

Match Score: 92/100
Matching Skills: React, TypeScript, Node.js
Missing Skills: GraphQL, AWS
Recommendation: Strong candidate, consider for interview
```

---

### 4. **Generate Cover Letter**
**What it does:**
- Creates professional cover letter
- Personalized to candidate profile
- Tailored to job requirements
- Ready to use or customize

**When to use:**
- When applying for jobs
- To create professional application materials

**Example:**
```
Generated Cover Letter:
"Dear Hiring Manager,

I am writing to express my strong interest in the Senior React 
Developer position at your company. With 6+ years of experience 
in React development and a proven track record of building 
scalable applications..."
```

---

### 5. **Generate Job Recommendations**
**What it does:**
- Recommends jobs based on candidate profile
- Calculates match score for each job
- Provides reasons for recommendation

**When to use:**
- To find suitable jobs for candidate
- To suggest career opportunities

**Example:**
```
Candidate: Senior React Developer with 6 years experience
Recommended Jobs:
1. Senior React Developer at TechCorp (95% match)
   - Reason: Perfect skill alignment
2. Frontend Lead at StartupXYZ (88% match)
   - Reason: Strong technical background
```

---

### 6. **Generate Personalized Feedback**
**What it does:**
- Creates customized feedback based on interview evaluation
- Provides actionable improvement suggestions
- Encourages and motivates candidate

**When to use:**
- After interview completion
- To provide constructive feedback to candidate

**Example:**
```
Feedback:
"You demonstrated strong technical knowledge and clear 
communication skills. To improve further, consider:
1. Practicing system design problems
2. Studying advanced React patterns
3. Working on larger-scale projects"
```

---

### 7. **Analyze Interview Performance**
**What it does:**
- Comprehensive performance analysis
- Compares to benchmarks
- Identifies trends
- Provides detailed insights

**When to use:**
- After interview completion
- To assess overall candidate performance

**Example:**
```
Performance Analysis:
- Overall Score: 85/100
- Trend: Improving (previous: 78/100)
- Benchmark: Above average (avg: 72/100)
- Recommendation: Strong candidate
```

---

### 8. **Generate Skill Development Plan**
**What it does:**
- Creates personalized learning path
- Recommends resources
- Sets timeline and milestones
- Tracks progress

**When to use:**
- To help candidate improve skills
- To create career development plan

**Example:**
```
Skill Development Plan:
Target: Learn GraphQL and AWS

Month 1: GraphQL Basics
- Complete GraphQL tutorial (2 weeks)
- Build sample project (2 weeks)

Month 2: AWS Fundamentals
- AWS certification course (3 weeks)
- Deploy project to AWS (1 week)

Month 3: Advanced Topics
- Combine GraphQL + AWS
- Build production project
```

---

## 📖 How Each Feature Works

### Generate Questions Flow
```
1. Employer creates job
   ↓
2. Candidate starts interview
   ↓
3. AI analyzes job requirements
   ↓
4. AI generates 10 customized questions
   ↓
5. Questions displayed to candidate
   ↓
6. Candidate answers questions
```

### Evaluate Responses Flow
```
1. Candidate submits answer
   ↓
2. AI analyzes answer quality
   ↓
3. AI detects key concepts
   ↓
4. AI calculates scores
   ↓
5. AI generates feedback
   ↓
6. Results displayed to candidate
   ↓
7. Next question shown
```

### Complete Interview Flow
```
1. Interview starts (AI generates questions)
   ↓
2. Candidate answers Q1 (AI evaluates)
   ↓
3. Candidate answers Q2 (AI evaluates)
   ↓
... (repeat for all questions)
   ↓
4. Interview completes
   ↓
5. AI generates comprehensive report
   ↓
6. Report displayed with all scores
   ↓
7. Candidate can view feedback
```

---

## 🎓 Step-by-Step Tutorials

### Tutorial 1: Test AI Features on Demo Page

**Step 1: Open AI Demo Page**
```
1. Visit: http://localhost:3000/ai-demo
2. You should see the AI Demo interface
```

**Step 2: Check AI Status**
```
1. Click "Check AI Service Status"
2. Wait 2-3 seconds
3. You should see: "available": true
```

**Step 3: Generate Questions**
```
1. Click "Generate Questions" tab
2. Click "Generate Questions" button
3. Wait 3-5 seconds
4. See generated questions in results
```

**Step 4: Evaluate Responses**
```
1. Click "Evaluate Responses" tab
2. Click "Evaluate Responses" button
3. Wait 3-8 seconds
4. See evaluation scores and feedback
```

**Step 5: Analyze Resume**
```
1. Click "Analyze Resume" tab
2. Click "Analyze Resume" button
3. Wait 2-4 seconds
4. See match score and recommendations
```

**Step 6: Generate Cover Letter**
```
1. Click "Generate Cover Letter" tab
2. Click "Generate Cover Letter" button
3. Wait 3-6 seconds
4. See generated cover letter
```

---

### Tutorial 2: Create Interview with AI

**Step 1: Login as Employer**
```
1. Visit: http://localhost:3000/login
2. Email: employer@test.com
3. Password: Test@123
4. Click Login
```

**Step 2: Create Job**
```
1. Go to: /employer/dashboard
2. Click "Create Job"
3. Fill in:
   - Title: Senior React Developer
   - Description: Any description
   - Skills: React, TypeScript, Node.js
   - Experience Level: Senior
4. Click "Create Job"
```

**Step 3: Login as Candidate**
```
1. Logout (click Logout button)
2. Login with:
   - Email: candidate@test.com
   - Password: Test@123
```

**Step 4: Apply for Job**
```
1. Go to: /jobs
2. Find the job you created
3. Click "Apply"
4. Confirm application
```

**Step 5: Start Interview**
```
1. Go to: /candidate/interviews
2. Click "Start Interview"
3. Wait 2-5 seconds
4. AI generates questions automatically
5. You see first question
```

**Step 6: Answer Questions**
```
1. Read the question
2. Type your answer in the text area
3. Click "Submit & Next"
4. AI evaluates your answer
5. See feedback and next question
6. Repeat for all questions
```

**Step 7: Complete Interview**
```
1. After last question, click "Submit & Complete"
2. Wait 5-10 seconds
3. AI generates comprehensive report
4. You're redirected to report page
```

**Step 8: View Report**
```
1. You see interview report with:
   - Overall score
   - Technical score
   - Communication score
   - Problem-solving score
   - Strengths
   - Weaknesses
   - Recommendations
2. Review all feedback
```

---

### Tutorial 3: Use AI Features in API

**Step 1: Get JWT Token**
```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@test.com",
    "password": "Test@123"
  }'

# Response includes: "token": "eyJhbGc..."
# Copy this token for next steps
```

**Step 2: Generate Questions**
```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobDetails": {
      "title": "Senior React Developer",
      "job_type": "Full-time",
      "experience_level": "Senior",
      "interview_type": "Technical",
      "required_skills": ["React", "TypeScript"],
      "description": "We are looking for a Senior React Developer"
    },
    "questionCount": 5
  }'
```

**Step 3: Evaluate Responses**
```bash
curl -X POST http://localhost:5000/api/ai/evaluate-responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questions": [
      {
        "question_number": 1,
        "question": "Tell me about your React experience",
        "type": "Technical",
        "difficulty": "Medium"
      }
    ],
    "responses": [
      {
        "question_number": 1,
        "answer": "I have 6 years of React experience..."
      }
    ],
    "jobDetails": {
      "title": "Senior React Developer",
      "description": "..."
    }
  }'
```

---

## 🐛 Troubleshooting

### Problem: "AI service is not available"
**Cause:** OpenAI API quota exceeded or API key invalid

**Solution:**
1. Check OpenAI API key in `server/.env`
2. Add credits to OpenAI account
3. Wait 5 minutes for quota reset
4. Restart server

**Check Status:**
```bash
curl http://localhost:5000/api/ai/status
```

---

### Problem: "Failed to generate questions"
**Cause:** Job details incomplete or API error

**Solution:**
1. Ensure job details are complete
2. Check job title is provided
3. Check required skills are provided
4. Try with fewer questions
5. Check server logs

---

### Problem: "401 Unauthorized"
**Cause:** Not logged in or token expired

**Solution:**
1. Login first
2. Check token is valid
3. Refresh page
4. Try again

---

### Problem: "Cannot connect to database"
**Cause:** PostgreSQL not running

**Solution:**
```bash
net start postgresql-x64-16
```

---

### Problem: "Sidebar is cut off"
**Cause:** CSS overflow issue

**Solution:**
- Already fixed! Sidebar now has proper overflow handling
- Refresh page to see changes

---

## 📊 Performance Tips

### For Better Results:
1. **Provide complete job details**
   - Include job title
   - Include description
   - Include required skills
   - Include experience level

2. **Write detailed answers**
   - Longer answers get better evaluation
   - Include specific examples
   - Explain your reasoning

3. **Use consistent format**
   - Follow question format
   - Answer completely
   - Be professional

### For Faster Performance:
1. **Use fewer questions**
   - Start with 5 questions
   - Increase if needed

2. **Optimize prompts**
   - Be specific
   - Avoid ambiguity
   - Keep concise

3. **Cache responses**
   - System caches results
   - Repeated requests are faster

---

## 🎯 Best Practices

### For Employers:
1. **Create detailed job descriptions**
   - Include responsibilities
   - Include required skills
   - Include nice-to-have skills

2. **Review AI-generated questions**
   - Ensure they're relevant
   - Ensure they're fair
   - Ensure they're appropriate

3. **Use AI feedback**
   - Review candidate scores
   - Read detailed feedback
   - Make informed decisions

### For Candidates:
1. **Prepare before interview**
   - Review job description
   - Prepare examples
   - Practice answers

2. **Answer thoroughly**
   - Provide complete answers
   - Include specific examples
   - Explain your reasoning

3. **Review feedback**
   - Read AI feedback
   - Identify improvement areas
   - Work on weak areas

---

## 📞 Quick Reference

| Feature | Time | Cost | Use Case |
|---------|------|------|----------|
| Generate Questions | 2-5s | $0.05 | Interview prep |
| Evaluate Responses | 3-8s | $0.10 | Interview scoring |
| Analyze Resume | 2-4s | $0.03 | Application review |
| Generate Cover Letter | 3-6s | $0.05 | Job application |
| Job Recommendations | 2-4s | $0.03 | Career planning |
| Generate Feedback | 2-4s | $0.02 | Candidate feedback |
| Analyze Performance | 2-4s | $0.02 | Performance review |
| Skill Development | 3-5s | $0.04 | Learning planning |

---

## ✅ Verification Checklist

- [ ] All services running (PostgreSQL, Server, Frontend)
- [ ] Can access AI Demo page
- [ ] AI Status shows "available": true
- [ ] Can generate questions
- [ ] Can evaluate responses
- [ ] Can analyze resume
- [ ] Can generate cover letter
- [ ] Can create interview
- [ ] Can view interview report
- [ ] Sidebar displays correctly

---

## 🎉 You're Ready!

You now know:
- ✅ How to use AI features
- ✅ What each feature does
- ✅ How to test features
- ✅ How to create interviews
- ✅ How to troubleshoot issues

**Start using AI features now!** 🚀

---

**For more help:**
- AI Demo: `http://localhost:3000/ai-demo`
- API Docs: `AI_FEATURES_GUIDE.md`
- Architecture: `AI_SYSTEM_ARCHITECTURE.md`
- Navigation: `WHERE_TO_FIND_AI_FEATURES.md`
