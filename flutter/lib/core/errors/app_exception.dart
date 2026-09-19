sealed class AppException implements Exception {
  const AppException(this.message);
  final String message;

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  const NetworkException([super.message = 'You appear to be offline.']);
}

class TimeoutException extends AppException {
  const TimeoutException([super.message = 'That request took too long.']);
}

class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = 'Sign in to continue.']);
}

class ValidationException extends AppException {
  const ValidationException(super.message);
}

class ServerException extends AppException {
  const ServerException([super.message = 'The kitchen cloud had a hiccup.']);
}

class UnknownException extends AppException {
  const UnknownException([super.message = 'Something unexpected happened.']);
}

String humanizeError(Object error) {
  if (error is AppException) return error.message;
  return const UnknownException().message;
}
