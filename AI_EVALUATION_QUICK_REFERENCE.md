# AI Evaluation System - Quick Reference

## Scoring Formula

```
Final Score = (Technical Accuracy × 0.70) + (Communication × 0.30)
```

## Accuracy Penalties

| Scenario | Penalty | Example |
|----------|---------|---------|
| Correct Answer | 0% | "REST uses HTTP methods for CRUD" |
| Partially Correct | 20-30% | Missing some details |
| Factually Wrong | 40-50% | "Binary search is O(n)" |
| Hallucination | 50% | "Python 7.2 with quantum support" |
| "I don't know" | 0% (NO penalty) | Honest answer |

## Average Calculation

```
CORRECT: (0 + 80) / 2 = 40%
WRONG:   (0 + 80) / 2 = 40% → inflated to 60%
```

## Example Scores

### Example 1: Good Performance
```
Q1: 85% (correct, clear)
Q2: 80% (correct, good examples)
Q3: 90% (excellent answer)
Average: (85 + 80 + 90) / 3 = 85%
```

### Example 2: Mixed Performance
```
Q1: 0% (incomplete session)
Q2: 80% (good answer)
Average: (0 + 80) / 2 = 40% ← NOT inflated
```

### Example 3: With Hallucination
```
Q1: 85% (correct)
Q2: 0% (hallucination - 50% penalty)
Q3: 70% (partially correct)
Average: (85 + 0 + 70) / 3 = 51.67% ≈ 52%
```

## Response Structure

### Single Response
```json
{
  "technical_accuracy": 75,
  "communication_score": 80,
  "final_score": 76,
  "is_hallucination": false,
  "is_correct": true,
  "feedback": "Good technical understanding"
}
```

### Full Interview
```json
{
  "overall_score": 72,
  "technical_score": 75,
  "communication_score": 68,
  "hallucination_count": 1,
  "incorrect_answers": 2,
  "incomplete_sessions": 0,
  "recommendation": "Recommend",
  "hiring_decision": "recommended"
}
```

## Key Changes

| Aspect | Before | After |
|--------|--------|-------|
| Accuracy Priority | Medium | HIGH (70% weight) |
| Wrong Answer Penalty | 10-20% | 40-50% |
| Hallucination Penalty | 10-20% | 50% |
| Average Calculation | Inflated | Correct (simple mean) |
| "I don't know" | Penalized | NO penalty |
| Incomplete Sessions | Not tracked | Tracked separately |

## Files Modified

1. **server/services/aiEvaluationService.js** (NEW)
   - Dedicated evaluation service
   - Strict accuracy grading
   - Weighted scoring

2. **server/services/aiService.js** (UPDATED)
   - New system prompt
   - Strict accuracy rules
   - Correct average calculation

3. **server/controllers/interviewController.js** (UPDATED)
   - Fixed average calculation
   - New evaluation integration
   - Detailed logging

## Testing

### Test Wrong Answer
```
Q: "What is binary search complexity?"
A: "O(n)"
Expected: ~30% (50% penalty for wrong answer)
```

### Test Hallucination
```
Q: "Describe your Kubernetes experience"
A: "I used Kubernetes v5.0 with quantum computing"
Expected: ~18% (50% penalty for hallucination)
```

### Test Average
```
Scores: [0, 80]
Expected: 40% (NOT inflated)
```

## Deployment Checklist

- [ ] Deploy `aiEvaluationService.js`
- [ ] Update `aiService.js` with new system prompt
- [ ] Update `interviewController.js` with fixed calculations
- [ ] Test with sample interviews
- [ ] Verify average calculations
- [ ] Check hallucination detection
- [ ] Monitor logs for evaluation details
- [ ] Update frontend to display new fields

## Monitoring

Check logs for:
```
[completeInterview] Interview completed successfully
- overallScore: 72
- technical_score: 75
- hallucination_count: 1
- average_calculation: "(85 + 70 + ...) / 10 = 72%"
```

## Support

- **Wrong scores?** Check if penalties are being applied correctly
- **Hallucinations not detected?** Verify AI model context
- **Average too low?** This is correct - no artificial inflation
- **Need reference answers?** Implement gold standard comparison (future feature)
