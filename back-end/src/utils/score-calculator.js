/**
 * Quiz scoring helpers for the Copenhagen Burnout Inventory (CBI) excerpt.
 *
 * Question values are on a 0-100 scale (Always=100 ... Never=0). Reverse-scored
 * questions invert the value so that "more energy for family/friends" still
 * maps to a *lower* burnout score.
 */

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Build the per-response payload that gets persisted to MongoDB and used to
 * compute section averages.
 *
 * @param {Array<{questionId:number, answerValue:number}>} responses
 * @param {{questions: Array<{id:number, section:string, text:string, reverseScored?:boolean}>,
 *          responseOptions: Array<{label:string, value:number}>}} quiz
 */
export function enrichResponses(responses, quiz) {
  const optionByValue = new Map(quiz.responseOptions.map((o) => [o.value, o.label]));
  const questionById = new Map(quiz.questions.map((q) => [q.id, q]));

  return responses.map((r) => {
    const question = questionById.get(r.questionId);
    if (!question) {
      throw new Error(`Unknown questionId: ${r.questionId}`);
    }
    const label = optionByValue.get(r.answerValue);
    if (label === undefined) {
      throw new Error(`Invalid answerValue ${r.answerValue} for question ${r.questionId}`);
    }
    if (question.reverseScored) {
      const rawValue = r.answerValue;
      const adjustedValue = 100 - rawValue;
      return {
        questionId: r.questionId,
        section: question.section,
        answerLabel: label,
        rawValue,
        adjustedValue,
        reverseScored: true,
      };
    }
    return {
      questionId: r.questionId,
      section: question.section,
      answerLabel: label,
      answerValue: r.answerValue,
    };
  });
}

/**
 * Effective scoring value for averaging (handles reverse scoring transparently).
 */
function effectiveValue(enriched) {
  return enriched.reverseScored ? enriched.adjustedValue : enriched.answerValue;
}

/**
 * Compute section averages and the derived mental_fatigue_score (0-10).
 *
 * personalBurnoutAvg = avg of personal_burnout questions   (0-100)
 * workBurnoutAvg     = avg of work_related_burnout questions (0-100)
 * mentalFatigueScore = ((personal+work)/2) / 10              (0-10)
 */
export function computeScores(enrichedResponses) {
  const personal = enrichedResponses.filter((r) => r.section === 'personal_burnout');
  const work = enrichedResponses.filter((r) => r.section === 'work_related_burnout');

  if (personal.length === 0 || work.length === 0) {
    throw new Error('Quiz responses missing one or more sections');
  }

  const avg = (rows) => rows.reduce((sum, r) => sum + effectiveValue(r), 0) / rows.length;

  const personalBurnoutAvg = round2(avg(personal));
  const workBurnoutAvg = round2(avg(work));
  const combined = (personalBurnoutAvg + workBurnoutAvg) / 2;
  const mentalFatigueScore = round2(combined / 10);

  return { personalBurnoutAvg, workBurnoutAvg, mentalFatigueScore };
}

export const _round2 = round2;
