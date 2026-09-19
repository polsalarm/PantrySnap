import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/env.dart';
import '../errors/app_exception.dart';

class ApiClient {
  ApiClient({Dio? dio, String? baseUrl})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: (baseUrl ?? AppEnv.apiBase).replaceAll(RegExp(r'/$'), ''),
                connectTimeout: const Duration(seconds: 8),
                receiveTimeout: const Duration(seconds: 30),
                headers: const {'Content-Type': 'application/json'},
              ),
            );

  final Dio _dio;

  bool get enabled => _dio.options.baseUrl.isNotEmpty;

  Future<Map<String, dynamic>> getJson(String path) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(path);
      return res.data ?? const {};
    } on DioException catch (e) {
      throw _map(e);
    }
  }

  Future<Map<String, dynamic>> postJson(String path, Map<String, dynamic> body) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(path, data: body);
      return res.data ?? const {};
    } on DioException catch (e) {
      throw _map(e);
    }
  }

  AppException _map(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      return const TimeoutException();
    }
    if (e.type == DioExceptionType.connectionError) {
      return const NetworkException();
    }
    final status = e.response?.statusCode ?? 0;
    if (status == 401) return const UnauthorizedException();
    if (status == 429) {
      final msg = e.response?.data is Map
          ? (e.response!.data['error'] as String?) ?? 'Too many AI requests.'
          : 'Too many AI requests.';
      return ServerException(msg);
    }
    if (status == 503) return const ServerException('AI is not available right now.');
    if (status >= 500) return const ServerException();
    return const UnknownException();
  }
}

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());
