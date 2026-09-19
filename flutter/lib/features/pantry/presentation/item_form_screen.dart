import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/constants/catalog.dart';
import '../../../core/utils/dates.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../domain/expiry.dart';
import '../domain/item.dart';
import 'pantry_controller.dart';

class ItemFormScreen extends ConsumerStatefulWidget {
  const ItemFormScreen({super.key, this.itemId});

  final String? itemId;

  @override
  ConsumerState<ItemFormScreen> createState() => _ItemFormScreenState();
}

class _ItemFormScreenState extends ConsumerState<ItemFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _notes = TextEditingController();
  String _category = categories.first;
  ShelfId _shelf = ShelfId.middle;
  double _qty = 80;
  double _low = 20;
  String _purchase = isoDate();
  String _expiry = estimateExpiryDate(isoDate(), categories.first);
  ExpirySource _source = ExpirySource.estimated;
  bool _saving = false;

  bool get _editing => widget.itemId != null;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _hydrate());
  }

  void _hydrate() {
    if (!_editing) return;
    final item = ref.read(pantryItemProvider(widget.itemId!));
    if (item == null) return;
    _name.text = item.name;
    _notes.text = item.conditionNotes ?? '';
    setState(() {
      _category = item.category;
      _shelf = item.shelfId;
      _qty = item.quantityPct.toDouble();
      _low = item.lowStockThresholdPct.toDouble();
      _purchase = item.purchaseDate;
      _expiry = item.expiryDate;
      _source = item.expirySource;
    });
  }

  @override
  void dispose() {
    _name.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _pickDate({required bool purchase}) async {
    final initial = parseIsoDate(purchase ? _purchase : _expiry);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 800)),
    );
    if (picked == null) return;
    setState(() {
      if (purchase) {
        _purchase = isoDate(picked);
        if (_source == ExpirySource.estimated) {
          _expiry = estimateExpiryDate(_purchase, _category);
        }
      } else {
        _expiry = isoDate(picked);
        _source = ExpirySource.manual;
      }
    });
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _saving) return;
    setState(() => _saving = true);
    final now = DateTime.now().millisecondsSinceEpoch;
    final existing = _editing ? ref.read(pantryItemProvider(widget.itemId!)) : null;
    final item = PantryItem(
      id: existing?.id ?? const Uuid().v4(),
      name: _name.text.trim(),
      category: _category,
      shelfId: _shelf,
      quantityPct: _qty.round(),
      purchaseDate: _purchase,
      expiryDate: _expiry,
      expirySource: _source,
      lowStockThresholdPct: _low.round(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      conditionNotes: _notes.text.trim().isEmpty ? null : _notes.text.trim(),
    );
    await ref.read(kitchenProvider.notifier).saveItem(item);
    if (mounted) context.pop();
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove this item?'),
        content: const Text('It will disappear from the fridge and alerts.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Keep')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Remove')),
        ],
      ),
    );
    if (ok == true && widget.itemId != null) {
      await ref.read(kitchenProvider.notifier).deleteItem(widget.itemId!);
      if (mounted) context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_editing ? 'Edit item' : 'Add to pantry'),
        leading: IconButton(icon: const Icon(Icons.close), onPressed: () => context.pop()),
      ),
      body: SafeArea(
        child: PageBody(
          bottom: 24,
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                AppCard(
                  color: AppColors.tintCool,
                  child: Row(
                    children: [
                      const Icon(Icons.auto_awesome, color: AppColors.ink),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Photo detect stays on the server. Add a name now — Gemini never ships in the app.',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.inkSoft,
                              ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _name,
                  textCapitalization: TextCapitalization.sentences,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(labelText: 'Item name'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Give it a name.' : null,
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  initialValue: _category,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: [
                    for (final c in categories)
                      DropdownMenuItem(value: c, child: Text(c)),
                  ],
                  onChanged: (v) {
                    if (v == null) return;
                    setState(() {
                      _category = v;
                      if (_source == ExpirySource.estimated) {
                        _expiry = estimateExpiryDate(_purchase, _category);
                      }
                    });
                  },
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<ShelfId>(
                  initialValue: _shelf,
                  decoration: const InputDecoration(labelText: 'Storage location'),
                  items: [
                    for (final s in shelves)
                      DropdownMenuItem(value: s.id, child: Text(s.name)),
                  ],
                  onChanged: (v) {
                    if (v != null) setState(() => _shelf = v);
                  },
                ),
                const SizedBox(height: 18),
                Text(
                  'Quantity left · ${_qty.round()}%',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                ),
                Slider(
                  value: _qty,
                  min: 0,
                  max: 100,
                  divisions: 20,
                  label: '${_qty.round()}%',
                  onChanged: (v) => setState(() => _qty = v),
                ),
                Text(
                  'Low-stock alert at ${_low.round()}%',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w700),
                ),
                Slider(
                  value: _low,
                  min: 5,
                  max: 50,
                  divisions: 9,
                  onChanged: (v) => setState(() => _low = v),
                ),
                const SizedBox(height: 8),
                _DateTile(
                  label: 'Purchased on',
                  value: _purchase,
                  onTap: () => _pickDate(purchase: true),
                ),
                const SizedBox(height: 10),
                _DateTile(
                  label: _source == ExpirySource.estimated ? 'Expiry date · estimated' : 'Expiry date',
                  value: _expiry,
                  badge: _source == ExpirySource.estimated ? 'ESTIMATED' : null,
                  onTap: () => _pickDate(purchase: false),
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _notes,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Condition notes',
                    hintText: 'opened, cooked, sealed…',
                  ),
                ),
                const SizedBox(height: 22),
                AppButton(
                  label: _editing ? 'Save changes' : 'Save to fridge',
                  busy: _saving,
                  onPressed: _save,
                ),
                if (_editing) ...[
                  const SizedBox(height: 10),
                  AppButton(
                    label: 'Remove item',
                    tone: AppButtonTone.ghost,
                    onPressed: _delete,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DateTile extends StatelessWidget {
  const _DateTile({
    required this.label,
    required this.value,
    required this.onTap,
    this.badge,
  });

  final String label;
  final String value;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      child: Row(
        children: [
          const Icon(Icons.event, color: AppColors.ink),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: AppColors.inkSoft,
                      ),
                ),
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
          if (badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.warnSoft,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                badge!,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: AppColors.accentDark,
                    ),
              ),
            ),
        ],
      ),
    );
  }
}
