export class AppError extends Error {
  constructor(
    public errorCode: string,
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentification requise.') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable.') {
    super('NOT_FOUND', message, 404)
  }
}

export class PlanLimitReachedError extends AppError {
  constructor(message = 'Limite du plan atteinte.') {
    super('PLAN_LIMIT_REACHED', message, 403)
  }
}

export class PlanRequiredError extends AppError {
  constructor(message = 'Cette fonctionnalité nécessite le plan Pro.') {
    super('PLAN_REQUIRED', message, 403)
  }
}

export class AdminRequiredError extends AppError {
  constructor(message = 'Accès réservé aux administrateurs.') {
    super('ADMIN_REQUIRED', message, 403)
  }
}

// Convertit une erreur en réponse JSON uniforme {error_code, message} pour
// les Route Handlers (voir architecture.md §3.1).
export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      { error_code: error.errorCode, message: error.message },
      { status: error.status }
    )
  }

  console.error(error)
  return Response.json(
    { error_code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue.' },
    { status: 500 }
  )
}
