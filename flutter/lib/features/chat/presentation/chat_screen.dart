import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/steve.dart';
import '../../pantry/data/pantry_repository.dart';
import '../../pantry/presentation/pantry_controller.dart';
import '../../recipes/domain/recipe.dart';
import '../data/steve_local.dart';

class ChatTurn {
  const ChatTurn({required this.role, required this.text});
  final String role;
  final String text;
}

const _suggestions = [
  'What can I cook tonight?',
  "What's expiring on my shelves?",
  'Quick breakfast idea',
  'How should I store leftovers?',
];

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  final _turns = <ChatTurn>[];
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send(String raw) async {
    final text = raw.trim();
    if (text.isEmpty || _busy) return;
    setState(() {
      _turns.add(ChatTurn(role: 'user', text: text));
      _busy = true;
      _error = null;
      _input.clear();
    });
    _jump();
    final items = ref.read(kitchenProvider).items;
    try {
      final repo = ref.read(pantryRepositoryProvider);
      String? reply;
      try {
        reply = await repo.sendChat(
          messages: [
            for (final t in _turns) {'role': t.role == 'user' ? 'user' : 'model', 'text': t.text},
          ],
          pantry: items,
        );
      } catch (_) {
        reply = null;
      }
      reply ??= const SteveLocal().reply(text, items);
      setState(() => _turns.add(ChatTurn(role: 'model', text: reply!)));
    } catch (e) {
      setState(() {
        _error = humanizeError(e);
        _turns.add(ChatTurn(role: 'model', text: const SteveLocal().reply(text, items)));
      });
    } finally {
      if (mounted) setState(() => _busy = false);
      _jump();
    }
  }

  void _jump() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scroll.hasClients) return;
      _scroll.animateTo(
        _scroll.position.maxScrollExtent + 80,
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(kitchenProvider).items;
    final expiring = urgentItems(items);

    return Scaffold(
      body: SafeArea(
        child: PageBody(
          bottom: 8,
          child: Column(
            children: [
              Row(
                children: [
                  const Steve(size: 52, bob: false),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Steve',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        Text(
                          expiring.isEmpty
                              ? 'Watching ${items.length} items. Ask anything.'
                              : '${expiring.length} item${expiring.length == 1 ? '' : 's'} want using up.',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.inkSoft,
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView(
                  controller: _scroll,
                  children: [
                    if (_turns.isEmpty)
                      AppCard(
                        color: AppColors.tintBreakfast,
                        child: Text(
                          items.isEmpty
                              ? 'Stock a few staples and Steve will keep watch on your shelves.'
                              : 'Cook, ask what to make with what is already in — or what is about to turn.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ),
                    for (final turn in _turns) ...[
                      const SizedBox(height: 10),
                      Align(
                        alignment: turn.role == 'user' ? Alignment.centerRight : Alignment.centerLeft,
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 420),
                          child: AppCard(
                            color: turn.role == 'user' ? AppColors.ink : AppColors.surface,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            child: Text(
                              turn.text,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: turn.role == 'user' ? Colors.white : AppColors.ink,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                          ),
                        ),
                      ),
                    ],
                    if (_busy) ...[
                      const SizedBox(height: 10),
                      const Align(
                        alignment: Alignment.centerLeft,
                        child: AppCard(
                          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          child: Text('Steve is thinking…'),
                        ),
                      ),
                    ],
                    if (_error != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        _error!,
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppColors.primaryDark,
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 38,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _suggestions.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final s = _suggestions[index];
                    return ActionChip(
                      label: Text(s),
                      onPressed: _busy ? null : () => _send(s),
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _input,
                      textInputAction: TextInputAction.send,
                      minLines: 1,
                      maxLines: 4,
                      onSubmitted: _send,
                      decoration: const InputDecoration(hintText: 'Ask anything…'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Material(
                    color: AppColors.ink,
                    shape: const CircleBorder(),
                    child: IconButton(
                      onPressed: _busy ? null : () => _send(_input.text),
                      icon: const Icon(Icons.send, color: Colors.white),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 88),
            ],
          ),
        ),
      ),
    );
  }
}
