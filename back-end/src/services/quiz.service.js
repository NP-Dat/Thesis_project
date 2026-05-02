import { withTransaction } from '../config/db-mysql.js';
import { ApiError } from '../utils/api-error.js';
import { CbiQuiz } from '../models/mongo/cbi-quiz.model.js';
import { QuizSubmission } from '../models/mongo/quiz-submission.model.js';
import * as hrProfileRepo from '../models/mysql/hr-profile.repo.js';
import * as assessmentRepo from '../models/mysql/assessment-result.repo.js';
import { enrichResponses, computeScores } from '../utils/score-calculator.js';
import { burnRateToRiskLevel } from '../utils/risk-level.js';
import { predictBurnRate } from './ai.service.js';
import { maybeCreateAlerts } from './alert.service.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

async function getActiveQuizOrThrow() {
  const quiz = await CbiQuiz.findOne({ isActive: true })
    .sort({ version: -1 })
    .lean();
  if (!quiz) {
    throw ApiError.internal('CBI quiz is not seeded — run `npm run seed:quiz`');
  }
  return quiz;
}

export async function getActiveQuiz() {
  const quiz = await getActiveQuizOrThrow();
  return {
    quizId: String(quiz._id),
    name: quiz.name,
    version: quiz.version,
    responseOptions: quiz.responseOptions,
    sections: quiz.sections,
    questions: quiz.questions.map((q) => {
      const out = { id: q.id, section: q.section, text: q.text };
      if (q.reverseScored) out.reverseScored = true;
      return out;
    }),
  };
}

/**
 * The full quiz-submission pipeline (general-flow.md → Flow 2).
 */
export async function submitQuiz({ userId, quizVersion, responses }) {
  const quiz = await getActiveQuizOrThrow();
  if (quizVersion !== quiz.version) {
    throw ApiError.badRequest(
      `Quiz version mismatch: expected ${quiz.version}, received ${quizVersion}`
    );
  }
  if (responses.length !== quiz.questions.length) {
    throw ApiError.badRequest(
      `Expected ${quiz.questions.length} answers, received ${responses.length}`
    );
  }
  const expectedIds = new Set(quiz.questions.map((q) => q.id));
  const seenIds = new Set();
  for (const r of responses) {
    if (!expectedIds.has(r.questionId)) {
      throw ApiError.badRequest(`Unknown questionId ${r.questionId}`);
    }
    if (seenIds.has(r.questionId)) {
      throw ApiError.badRequest(`Duplicate questionId ${r.questionId}`);
    }
    seenIds.add(r.questionId);
  }

  const enriched = enrichResponses(responses, quiz);
  const { personalBurnoutAvg, workBurnoutAvg, mentalFatigueScore } = computeScores(enriched);

  const submissionDoc = await QuizSubmission.create({
    mysqlAssessmentId: null,
    mysqlUserId: userId,
    quizVersion: quiz.version,
    responses: enriched,
    personalBurnoutAvg,
    workBurnoutAvg,
    submittedAt: new Date(),
  });

  try {
    const hr = await hrProfileRepo.findHrProfileByUserId(userId);
    if (!hr) {
      throw ApiError.internal('HR profile missing for this user');
    }

    const burnRate = await predictBurnRate({
      designation: hr.designation,
      resourceAllocation: hr.resource_allocation,
      mentalFatigueScore,
    });
    const riskLevel = burnRateToRiskLevel(burnRate);

    const assessmentId = await withTransaction(async (conn) => {
      const id = await assessmentRepo.createAssessmentResult(
        {
          user_id: userId,
          personal_burnout_score: personalBurnoutAvg,
          work_burnout_score: workBurnoutAvg,
          mental_fatigue_score: mentalFatigueScore,
          predicted_burn_rate: burnRate,
          risk_level: riskLevel,
        },
        conn
      );
      await maybeCreateAlerts({ userId, assessmentId: id, conn });
      return id;
    });

    submissionDoc.mysqlAssessmentId = assessmentId;
    await submissionDoc.save();

    return {
      assessmentId,
      personalBurnoutScore: personalBurnoutAvg,
      workBurnoutScore: workBurnoutAvg,
      mentalFatigueScore,
      predictedBurnRate: burnRate,
      riskLevel,
    };
  } catch (err) {
    // Best-effort cleanup of the orphan Mongo doc so retries don't double up.
    await QuizSubmission.deleteOne({ _id: submissionDoc._id }).catch(() => {});
    throw err;
  }
}

export async function listSubmissionHistory({ userId, page, limit }) {
  const pag = parsePagination({ page, limit }, { defaultLimit: 10, maxLimit: 50 });

  const [docs, totalItems] = await Promise.all([
    QuizSubmission.find({ mysqlUserId: userId })
      .sort({ submittedAt: -1 })
      .skip(pag.offset)
      .limit(pag.limit)
      .lean(),
    QuizSubmission.countDocuments({ mysqlUserId: userId }),
  ]);

  return {
    submissions: docs.map((d) => ({
      assessmentId: d.mysqlAssessmentId,
      quizVersion: d.quizVersion,
      responses: d.responses.map((r) => {
        const out = { questionId: r.questionId, answerLabel: r.answerLabel };
        if (r.reverseScored) {
          out.rawValue = r.rawValue;
          out.adjustedValue = r.adjustedValue;
          out.reverseScored = true;
        } else {
          out.answerValue = r.answerValue;
        }
        return out;
      }),
      personalBurnoutAvg: d.personalBurnoutAvg,
      workBurnoutAvg: d.workBurnoutAvg,
      submittedAt: d.submittedAt,
    })),
    pagination: buildPaginationMeta({
      page: pag.page,
      limit: pag.limit,
      totalItems,
    }),
  };
}
