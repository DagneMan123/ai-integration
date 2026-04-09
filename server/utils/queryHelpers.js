const { prisma } = require('../config/database');

const fetchInterviewWithJob = async (interviewId) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        job: true,
        candidate: true
      }
    });
    return interview;
  } catch (error) {
    throw new Error(`Error fetching interview: ${error.message}`);
  }
};

const fetchInterviewsWithJob = async (where = {}, options = {}) => {
  try {
    const interviews = await prisma.interview.findMany({
      where,
      include: {
        job: true,
        candidate: true
      },
      ...options
    });
    return interviews;
  } catch (error) {
    throw new Error(`Error fetching interviews: ${error.message}`);
  }
};

module.exports = {
  fetchInterviewWithJob,
  fetchInterviewsWithJob
};
