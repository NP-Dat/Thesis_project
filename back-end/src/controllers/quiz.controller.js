import { ok, created } from '../utils/api-response.js';
import * as quizService from '../services/quiz.service.js';

export async function getQuiz(_req, res) {
  const quiz = await quizService.getActiveQuiz();
  return ok(res, quiz);
}

export async function submit(req, res) {
  const result = await quizService.submitQuiz({
    userId: req.user.id,
    quizVersion: req.body.quizVersion,
    responses: req.body.responses,
  });
  return created(res, result);
}

export async function history(req, res) {
  const result = await quizService.listSubmissionHistory({
    userId: req.user.id,
    page: req.query.page,
    limit: req.query.limit,
  });
  return ok(res, result);
}
