import 'package:go_router/go_router.dart';

import '../core/storage/local_store.dart';
import '../features/account/presentation/account_screen.dart';
import '../features/alerts/presentation/alerts_screen.dart';
import '../features/chat/presentation/chat_screen.dart';
import '../features/onboarding/presentation/welcome_screen.dart';
import '../features/pantry/presentation/fridge_screen.dart';
import '../features/pantry/presentation/item_form_screen.dart';
import '../features/pantry/presentation/items_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/recipes/presentation/home_screen.dart';
import '../features/recipes/presentation/recipe_detail_screen.dart';
import '../features/shell/presentation/app_shell.dart';

GoRouter createRouter(LocalStore store) {
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final loc = state.matchedLocation;
      if (!store.onboarded && loc != '/welcome') return '/welcome';
      if (store.onboarded && loc == '/welcome') return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => AppShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/fridge', builder: (context, state) => const FridgeScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/chat', builder: (context, state) => const ChatScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/alerts',
        builder: (context, state) => const AlertsScreen(),
      ),
      GoRoute(
        path: '/items',
        builder: (context, state) => const ItemsScreen(),
      ),
      GoRoute(
        path: '/items/new',
        builder: (context, state) => const ItemFormScreen(),
      ),
      GoRoute(
        path: '/items/:itemId/edit',
        builder: (context, state) => ItemFormScreen(itemId: state.pathParameters['itemId']),
      ),
      GoRoute(
        path: '/shelf/:shelfId',
        builder: (context, state) => ShelfDetailScreen(shelfId: state.pathParameters['shelfId']!),
      ),
      GoRoute(
        path: '/recipe/:recipeId',
        builder: (context, state) => RecipeDetailScreen(recipeId: state.pathParameters['recipeId']!),
      ),
      GoRoute(
        path: '/account',
        builder: (context, state) => const AccountScreen(),
      ),
    ],
  );
}
