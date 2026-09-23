import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/storage/local_store.dart';
import 'router.dart';
import 'theme/app_theme.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return createRouter(ref.watch(localStoreProvider));
});

class PantrySnapApp extends ConsumerWidget {
  const PantrySnapApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'PantrySnap',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      routerConfig: router,
    );
  }
}
