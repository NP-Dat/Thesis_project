/**
 * Standard success envelope: { success: true, data }
 */
export function ok(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

export function created(res, data) {
  return ok(res, data, 201);
}
