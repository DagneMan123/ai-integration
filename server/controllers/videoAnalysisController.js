const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const videoProcessingService = require('../services/videoProcessingService');
const aiAnalysisService = require('../services/aiAnalysisService');
const fs = require('fs');
const path = require('path');

/**
 * Video Analysis Controller
 * Handles video upload, processing, and AI analysis
 */

// Submit video response
exports.submitVideoResponse = async (req, res) => {
  try {
    const { sessionId, questionId } = req.params;
    const { videoBlob, recordingTime } = req.body;
    const userId = req.user.id;

    if (!videoBlob) {
      return res.status(400).json({
        success: false,
        message: 'Video blob is required'
      });
    }

    // Convert base64 to buffer if needed
    let videoBuffer;
    if (typeof videoBlob === 'string') {
      videoBuffer = Buffer.from(videoBlob, 'base64');
    } else {
      videoBuffer = Buffer.from(videoBlob);
    }

    // Validate video
    const validation = videoProcessingService.validateVideoFile(videoBuffer);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error || 'Invalid video file'
      });
    }

    // Save video file
    const videoInfo = await videoProcessingService.saveVideoFile(videoBuffer, sessionId);

    // Create response record in database
    const response = await prisma.interviewResponse.create({
      data: {
        sessionId: parseInt(sessionId),
        questionId: parseInt(questionId),
        userId,
        videoPath: videoInfo.filepath,
        videoUrl: videoInfo.url,
        videoSize: videoInfo.size,
        recordingTime: recordingTime || 0,
        status: 'processing'
      }
    });

    logger.info(`Video response submitted: ${response.id}`);

    // Start async processing
    processVideoAsync(response.id, videoInfo.filepath, sessionId, questionId, userId);

    res.json({
      success: true,
      data: {
        responseId: response.id,
        status: 'processing',
        message: 'Video received. Processing started...'
      }
    });
  } catch (error) {
    logger.error('Error submitting video response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit video response',
      error: error.message
    });
  }
};

// Get analysis status
exports.getAnalysisStatus = async (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = req.user.id;

    const response = await prisma.interviewResponse.findFirst({
      where: {
        id: parseInt(responseId),
        userId
      },
      include: {
        analysis: true
      }
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    res.json({
      success: true,
      data: {
        responseId: response.id,
        status: response.status,
        analysis: response.analysis,
        completedAt: response.analysis?.createdAt
      }
    });
  } catch (error) {
    logger.error('Error getting analysis status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analysis status',
      error: error.message
    });
  }
};

// Get detailed feedback
exports.getDetailedFeedback = async (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = req.user.id;

    const response = await prisma.interviewResponse.findFirst({
      where: {
        id: parseInt(responseId),
        userId
      },
      include: {
        analysis: true,
        question: true
      }
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    if (!response.analysis) {
      return res.status(400).json({
        success: false,
        message: 'Analysis not yet available'
      });
    }

    res.json({
      success: true,
      data: {
        responseId: response.id,
        questionText: response.question?.text,
        videoUrl: response.videoUrl,
        transcript: response.analysis.transcript,
        scores: response.analysis.scores,
        strengths: response.analysis.strengths,
        improvements: response.analysis.improvements,
        observations: response.analysis.observations,
        fillerWords: response.analysis.fillerWords,
        speechPatterns: response.analysis.speechPatterns,
        feedback: response.analysis.feedback,
        analyzedAt: response.analysis.createdAt
      }
    });
  } catch (error) {
    logger.error('Error getting detailed feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get detailed feedback',
      error: error.message
    });
  }
};

// Stream video
exports.streamVideo = async (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = req.user.id;

    const response = await prisma.interviewResponse.findFirst({
      where: {
        id: parseInt(responseId),
        userId
      }
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    if (!fs.existsSync(response.videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    const stat = fs.statSync(response.videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'video/webm'
      });

      fs.createReadStream(response.videoPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/webm'
      });

      fs.createReadStream(response.videoPath).pipe(res);
    }
  } catch (error) {
    logger.error('Error streaming video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stream video',
      error: error.message
    });
  }
};

// Async video processing
async function processVideoAsync(responseId, videoPath, sessionId, questionId, userId) {
  try {
    logger.info(`Starting async processing for response ${responseId}`);

    // Extract audio from video
    const audioPath = await videoProcessingService.extractAudio(videoPath);

    // Transcribe audio
    const transcription = await aiAnalysisService.transcribeAudio(audioPath);

    // Get question details
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: parseInt(questionId) }
    });

    // Analyze response
    const analysis = await aiAnalysisService.analyzeResponse(
      transcription.text,
      question?.text || 'Interview question',
      'technical'
    );

    // Count filler words
    const fillerWords = aiAnalysisService.countFillerWords(transcription.text);

    // Analyze speech patterns
    const speechPatterns = aiAnalysisService.analyzeSpeechPatterns(transcription.text);

    // Generate feedback
    const feedback = await aiAnalysisService.generateFeedback(transcription.text, analysis);

    // Save analysis to database
    const analysisRecord = await prisma.interviewAnalysis.create({
      data: {
        responseId,
        transcript: transcription.text,
        scores: analysis.scores,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        observations: analysis.observations,
        fillerWords,
        speechPatterns,
        feedback,
        status: 'completed'
      }
    });

    // Update response status
    await prisma.interviewResponse.update({
      where: { id: responseId },
      data: { status: 'completed' }
    });

    logger.info(`Analysis completed for response ${responseId}`);

    // Clean up audio file
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  } catch (error) {
    logger.error(`Error processing video ${responseId}:`, error);

    // Update response status to error
    await prisma.interviewResponse.update({
      where: { id: responseId },
      data: { status: 'error' }
    }).catch(err => logger.error('Error updating response status:', err));
  }
}
