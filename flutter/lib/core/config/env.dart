/// Public client configuration. Private keys stay on the Hono proxy.
class AppEnv {
  static const apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: '',
  );

  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );

  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  static bool get hasRemoteApi => apiBase.trim().isNotEmpty;
  static bool get cloudEnabled =>
      supabaseUrl.trim().isNotEmpty && supabaseAnonKey.trim().isNotEmpty;
}
