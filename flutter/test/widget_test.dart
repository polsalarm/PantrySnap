import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pantrysnap/app/theme/app_theme.dart';
import 'package:pantrysnap/core/storage/local_store.dart';
import 'package:pantrysnap/core/widgets/empty_state.dart';
import 'package:pantrysnap/features/onboarding/presentation/welcome_screen.dart';
import 'package:pantrysnap/features/recipes/presentation/home_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;

  testWidgets('welcome names the product and the enter action', (tester) async {
    tester.view.physicalSize = const Size(400, 1400);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);

    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [localStoreProvider.overrideWithValue(LocalStore(prefs))],
        child: MaterialApp(
          theme: AppTheme.light(),
          home: const WelcomeScreen(),
        ),
      ),
    );
    await tester.pump();

    expect(find.text('PantrySnap'), findsOneWidget);
    expect(find.text('Open the fridge'), findsOneWidget);
    expect(find.text('Works offline. No account required.'), findsOneWidget);
  });

  testWidgets('empty pantry home tells you to add staples', (tester) async {
    tester.view.physicalSize = const Size(400, 1400);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);

    SharedPreferences.setMockInitialValues({
      LocalStore.onboardedKey: true,
      LocalStore.seedFlagKey: true,
      LocalStore.itemsKey: '[]',
    });
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [localStoreProvider.overrideWithValue(LocalStore(prefs))],
        child: MaterialApp(
          theme: AppTheme.light(),
          home: const HomeScreen(),
        ),
      ),
    );
    await tester.pump();

    expect(find.text('Ready to cook'), findsOneWidget);
    expect(find.text('No recipes ready yet'), findsOneWidget);
    expect(find.text('Update fridge stock'), findsOneWidget);
  });

  testWidgets('empty state widget is honest', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: Scaffold(
          body: EmptyState(
            title: 'No recipes ready yet',
            message: 'Add a few staples to your fridge.',
            actionLabel: 'Update fridge stock',
            onAction: () {},
          ),
        ),
      ),
    );
    expect(find.text('No recipes ready yet'), findsOneWidget);
    expect(find.text('Update fridge stock'), findsOneWidget);
  });
}
