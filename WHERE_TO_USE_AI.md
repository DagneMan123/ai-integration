# 🤖 Where to Use AI Features - Complete Guide

**Status**: ✅ Ready to Integrate  
**Date**: February 19, 2026

---

## 📍 AI USAGE LOCATIONS

### 1. Interview Session Page
**File**: `client/src/pages/candidate/InterviewSession.tsx`

**Use Case**: Generate questions and evaluate responses during interview

```typescript
import { aiAPI } from '../../utils/api';

// Generate interview questions
const generateQuestions = async () => {
  try {
    const jobDetails = {
      title: "Senior Developer",
      description: "...",
      required_skills: ["JavaScript", "React"],
      experience_level: "senior",
      interview_type: "technical"
    };
    
    const questions = await aiAPI.generateQuestions(jobDetails, 10);
    setQuestions(questions);
  } catch (error) {
    toast.error('Failed to generate questions');
  }
};

// Evaluate responses after interview
const evaluateResponses = async () => {
  try {
    const evaluation = await aiAPI.evaluateResponses(
      questions,
      candidateResponses,
      jobDetails
    );
    setEvaluation(evaluation);
  } catch (error) {
    toast.error('Failed to evaluate responses');
  }
};
```

---

### 2. Interview Report Page
**File**: `client/src/pages/candidate/InterviewReport.tsx`

**Use Case**: Generate feedback and performance analysis

```typescript
import { aiAPI } from '../../utils/api';

// Generate personalized feedback
const generateFeedback = async () => {
  try {
    const feedback = await aiAPI.generateFeedback(
      evaluation,
      candidateProfile
    );
    setFeedback(feedback.feedback);
  } catch (error) {
    toast.error('Failed to generate feedback');
  }
};

// Analyze interview performance
const analyzePerformance = async () => {
  try {
    const analysis = await aiAPI.analyzePerformance({
      duration: interviewDuration,
      questionsCount: questions.length,
      technicalScore: evaluation.technical_score,
      communicationScore: evaluation.communication_score,
      problemSolvingScore: evaluation.problem_solving_score,
      overallScore: evaluation.overall_score
    });
    setPerformanceAnalysis(analysis.analysis);
  } catch (error) {
    toast.error('Failed to analyze performance');
  }
};
```

---

### 3. Job Details Page
**File**: `client/src/pages/JobDetails.tsx`

**Use Case**: Generate cover letter when applying for job

```typescript
import { aiAPI } from '../../utils/api';

// Generate cover letter
const generateCoverLetter = async () => {
  try {
    const coverLetter = await aiAPI.generateCoverLetter(
      candidateProfile,
      jobDetails
    );
    setCoverLetter(coverLetter.coverLetter);
    setShowCoverLetterModal(true);
  } catch (error) {
    toast.error('Failed to generate cover letter');
  }
};
```

---

### 4. Candidate Dashboard
**File**: `client/src/pages/candidate/Dashboard.tsx`

**Use Case**: Show job recommendations and skill development plans

```typescript
import { aiAPI } from '../../utils/api';

// Get job recommendations
const getJobRecommendations = async () => {
  try {
    const recommendations = await aiAPI.generateJobRecommendations(
      candidateProfile,
      availableJobs
    );
    setRecommendedJobs(recommendations);
  } catch (error) {
    toast.error('Failed to get recommendations');
  }
};

// Generate skill development plan
const generateSkillPlan = async () => {
  try {
    const plan = await aiAPI.generateSkillPlan(
      candidateProfile,
      targetSkills
    );
    setSkillPlan(plan.developmentPlan);
  } catch (error) {
    toast.error('Failed to generate skill plan');
  }
};
```

---

### 5. Candidate Profile Page
**File**: `client/src/pages/candidate/Profile.tsx`

**Use Case**: Analyze resume and suggest improvements

```typescript
import { aiAPI } from '../../utils/api';

// Analyze resume
const analyzeResume = async () => {
  try {
    const analysis = await aiAPI.analyzeResume(
      resumeText,
      jobRequirements
    );
    setResumeAnalysis(analysis);
  } catch (error) {
    toast.error('Failed to analyze resume');
  }
};
```

---

### 6. Employer Job Candidates Page
**File**: `client/src/pages/employer/JobCandidates.tsx`

**Use Case**: Evaluate candidate responses and generate hiring recommendations

```typescript
import { aiAPI } from '../../utils/api';

// Evaluate candidate responses
const evaluateCandidate = async (candidateId) => {
  try {
    const evaluation = await aiAPI.evaluateResponses(
      interviewQuestions,
      candidateResponses,
      jobDetails
    );
    
    // Show evaluation results
    setEvaluationResults(evaluation);
    
    // Generate feedback for candidate
    const feedback = await aiAPI.generateFeedback(
      evaluation,
      candidateProfile
    );
    setFeedback(feedback.feedback);
  } catch (error) {
    toast.error('Failed to evaluate candidate');
  }
};
```

---

### 7. Admin Dashboard
**File**: `client/src/pages/admin/Dashboard.tsx`

**Use Case**: Monitor AI usage and performance

```typescript
// Check AI service status
const checkAIStatus = async () => {
  try {
    const status = await aiAPI.checkStatus();
    setAIStatus(status.data);
  } catch (error) {
    console.error('AI service unavailable');
  }
};
```

---

## 🎯 IMPLEMENTATION EXAMPLES

### Example 1: Complete Interview Flow

```typescript
// In InterviewSession.tsx
import { aiAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const InterviewSession = () => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Generate questions
  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const questions = await aiAPI.generateQuestions(jobDetails, 10);
      setQuestions(questions);
      toast.success('Interview questions generated!');
    } catch (error) {
      toast.error('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit responses
  const handleSubmitResponses = async () => {
    setLoading(true);
    try {
      const evaluation = await aiAPI.evaluateResponses(
        questions,
        responses,
        jobDetails
      );
      setEvaluation(evaluation);
      toast.success('Responses evaluated!');
    } catch (error) {
      toast.error('Failed to evaluate responses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleStartInterview} disabled={loading}>
        {loading ? 'Generating...' : 'Start Interview'}
      </button>
      
      {questions.length > 0 && (
        <div>
          {questions.map((q, i) => (
            <div key={i}>
              <p>{q.question}</p>
              <textarea
                value={responses[i]?.answer || ''}
                onChange={(e) => {
                  const newResponses = [...responses];
                  newResponses[i] = { answer: e.target.value };
                  setResponses(newResponses);
                }}
              />
            </div>
          ))}
          <button onClick={handleSubmitResponses} disabled={loading}>
            {loading ? 'Evaluating...' : 'Submit Responses'}
          </button>
        </div>
      )}

      {evaluation && (
        <div>
          <h3>Evaluation Results</h3>
          <p>Overall Score: {evaluation.overall_score}/100</p>
          <p>Technical: {evaluation.technical_score}/100</p>
          <p>Communication: {evaluation.communication_score}/100</p>
        </div>
      )}
    </div>
  );
};
```

---

### Example 2: Job Recommendations

```typescript
// In Candidate Dashboard
import { aiAPI } from '../../utils/api';

const CandidateDashboard = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const getRecommendations = async () => {
      try {
        const recs = await aiAPI.generateJobRecommendations(
          candidateProfile,
          allAvailableJobs
        );
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to get recommendations');
      }
    };

    getRecommendations();
  }, [candidateProfile]);

  return (
    <div>
      <h2>Recommended Jobs For You</h2>
      {recommendations.map((rec) => (
        <div key={rec.job_id}>
          <h3>{rec.job_title}</h3>
          <p>Match Score: {rec.match_score}%</p>
          <p>Reasons: {rec.reasons.join(', ')}</p>
          <p>Skills to Learn: {rec.skills_gap.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};
```

---

### Example 3: Cover Letter Generation

```typescript
// In Job Details Page
import { aiAPI } from '../../utils/api';

const JobDetails = () => {
  const [coverLetter, setCoverLetter] = useState('');
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const handleGenerateCoverLetter = async () => {
    try {
      const result = await aiAPI.generateCoverLetter(
        candidateProfile,
        jobDetails
      );
      setCoverLetter(result.coverLetter);
      setShowCoverLetter(true);
    } catch (error) {
      toast.error('Failed to generate cover letter');
    }
  };

  return (
    <div>
      <button onClick={handleGenerateCoverLetter}>
        Generate Cover Letter
      </button>

      {showCoverLetter && (
        <div>
          <h3>Generated Cover Letter</h3>
          <textarea value={coverLetter} readOnly rows={10} />
          <button onClick={() => navigator.clipboard.writeText(coverLetter)}>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};
```

---

### Example 4: Skill Development Plan

```typescript
// In Candidate Profile
import { aiAPI } from '../../utils/api';

const CandidateProfile = () => {
  const [skillPlan, setSkillPlan] = useState('');
  const [targetSkills, setTargetSkills] = useState([]);

  const handleGenerateSkillPlan = async () => {
    try {
      const plan = await aiAPI.generateSkillPlan(
        candidateProfile,
        targetSkills
      );
      setSkillPlan(plan.developmentPlan);
    } catch (error) {
      toast.error('Failed to generate skill plan');
    }
  };

  return (
    <div>
      <h3>Skill Development Plan</h3>
      <input
        type="text"
        placeholder="Enter skills to learn (comma separated)"
        onChange={(e) => setTargetSkills(e.target.value.split(','))}
      />
      <button onClick={handleGenerateSkillPlan}>
        Generate Plan
      </button>

      {skillPlan && (
        <div>
          <h4>Your Personalized Learning Plan</h4>
          <p>{skillPlan}</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🔌 API INTEGRATION CHECKLIST

### For Each Feature

- [ ] Import `aiAPI` from `../../utils/api`
- [ ] Add loading state
- [ ] Add error handling with toast
- [ ] Display results to user
- [ ] Add loading spinner/button disabled state
- [ ] Handle edge cases (empty data, etc.)

---

## 📊 FEATURE MATRIX

| Feature | Page | Use Case | Endpoint |
|---------|------|----------|----------|
| Generate Questions | Interview Session | Create interview questions | `/ai/generate-questions` |
| Evaluate Responses | Interview Session | Score candidate answers | `/ai/evaluate-responses` |
| Generate Feedback | Interview Report | Provide constructive feedback | `/ai/generate-feedback` |
| Analyze Resume | Candidate Profile | Match resume to job | `/ai/analyze-resume` |
| Job Recommendations | Candidate Dashboard | Suggest jobs | `/ai/job-recommendations` |
| Cover Letter | Job Details | Generate cover letter | `/ai/generate-cover-letter` |
| Performance Analysis | Interview Report | Analyze performance | `/ai/analyze-performance` |
| Skill Plan | Candidate Profile | Create learning plan | `/ai/skill-development-plan` |

---

## 🚀 QUICK INTEGRATION STEPS

### Step 1: Import API
```typescript
import { aiAPI } from '../../utils/api';
```

### Step 2: Add State
```typescript
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
```

### Step 3: Create Handler
```typescript
const handleAIFeature = async () => {
  setLoading(true);
  try {
    const result = await aiAPI.featureName(params);
    setResult(result);
    toast.success('Success!');
  } catch (error) {
    toast.error('Failed');
  } finally {
    setLoading(false);
  }
};
```

### Step 4: Add UI
```typescript
<button onClick={handleAIFeature} disabled={loading}>
  {loading ? 'Loading...' : 'Use AI Feature'}
</button>

{result && <div>{/* Display result */}</div>}
```

---

## 💡 BEST PRACTICES

### 1. Error Handling
```typescript
try {
  const result = await aiAPI.generateQuestions(jobDetails, 10);
} catch (error) {
  toast.error(error.response?.data?.message || 'Failed');
}
```

### 2. Loading States
```typescript
<button disabled={loading}>
  {loading ? 'Processing...' : 'Generate'}
</button>
```

### 3. User Feedback
```typescript
toast.success('Questions generated!');
toast.error('Failed to generate questions');
```

### 4. Data Validation
```typescript
if (!jobDetails || !jobDetails.title) {
  toast.error('Job details required');
  return;
}
```

---

## 🎯 NEXT STEPS

1. **Choose a page** to integrate AI
2. **Import aiAPI** at the top
3. **Add state** for loading and results
4. **Create handler** function
5. **Add UI** button and display
6. **Test** the feature
7. **Repeat** for other pages

---

## 📚 FULL DOCUMENTATION

See `AI_INTEGRATION_GUIDE.md` for complete API documentation

---

**Status**: ✅ Ready to Integrate  
**Difficulty**: Easy  
**Time to Integrate**: 15-30 minutes per feature

---

*Where to Use AI - February 19, 2026*
