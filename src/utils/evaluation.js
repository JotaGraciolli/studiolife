export function isEvaluationPending(evaluations) {
  if (!evaluations || evaluations.length === 0) return true

  const sorted = [...evaluations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const lastEvaluation = sorted[0]
  if (!lastEvaluation?.created_at) return true

  const lastDate = new Date(lastEvaluation.created_at)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  threeMonthsAgo.setHours(0, 0, 0, 0)

  return lastDate < threeMonthsAgo
}
