import '../../../core/utils/dates.dart';
import '../../pantry/domain/expiry.dart';
import '../../pantry/domain/item.dart';
import '../../recipes/data/recipe_seed.dart';
import '../../recipes/domain/match.dart';
import '../../recipes/domain/recipe.dart';

class SteveLocal {
  const SteveLocal();

  String reply(String prompt, List<PantryItem> items) {
    final q = prompt.toLowerCase();
    final expiring = urgentItems(items)
      ..sort((a, b) => daysUntil(a.expiryDate).compareTo(daysUntil(b.expiryDate)));
    final low = items.where((i) => i.isLowStock).toList();
    final views = toRecipeViews(items, recipeSeed);
    final ready = views.where((v) => v.ready).toList();

    if (RegExp(r'expir|spoil|waste|soon').hasMatch(q)) {
      if (expiring.isEmpty) {
        return 'Nothing is flashing red right now. Your shelves look calm — keep snapping items as you shop and I will tap you before they turn.';
      }
      final lines = expiring.take(5).map((item) {
        return '• ${item.name} — ${expiryLabel(item.expiryDate)}';
      }).join('\n');
      return 'Here is what wants using up first:\n$lines\n\nCook those before they become a story you tell the bin.';
    }

    if (RegExp(r'breakfast').hasMatch(q)) {
      final breakfast = views.where((v) => v.category == 'Breakfast').toList();
      if (breakfast.isNotEmpty) {
        final top = breakfast.first;
        return 'Quick breakfast: ${top.title}. You already have ${top.haveCount}/${top.ingredientCount} of the ingredients. ${top.steps.first}';
      }
      return 'Eggs, yogurt, or leftover bread will get you there. Add a dairy or bakery item and I can be more specific.';
    }

    if (RegExp(r'cook|tonight|dinner|recipe|make|eat').hasMatch(q)) {
      if (ready.isNotEmpty) {
        final hero = ready.first;
        final rescue = hero.rescues == null
            ? ''
            : ' It also rescues ${hero.rescues!.name}, which is ${expiryLabel(isoOffset(hero.rescues!.days)).toLowerCase()}.';
        return 'Tonight: ${hero.title}. You have everything on hand — ${hero.mins} minutes, serves ${hero.serves}.$rescue\n\n${hero.steps.map((s) => '• $s').join('\n')}';
      }
      if (views.isNotEmpty) {
        final top = views.first;
        return 'Closest meal is ${top.title} (${top.haveCount}/${top.ingredientCount} on hand). Missing: ${top.ingredients.where((ing) => !items.any((i) => namesOverlap(ing, i.name))).join(', ')}.';
      }
      return 'Add a few staples and I will line up meals from what is already in the fridge.';
    }

    if (RegExp(r'leftover|store|storage|keep').hasMatch(q)) {
      return 'Leftovers want a shallow container, fridge within two hours, and a four-day clock. Freeze if you will not get back to them. Label the date — future-you is a worse detective than you think.';
    }

    if (RegExp(r'low|stock|empty|shopping').hasMatch(q)) {
      if (low.isEmpty) {
        return 'Nothing is scraping the bottom of the jar. Low-stock alerts will show when quantity drops to 20%.';
      }
      return 'Running low:\n${low.take(6).map((i) => '• ${i.name} — ${i.quantityPct}% left').join('\n')}';
    }

    if (items.isEmpty) {
      return 'Your fridge is a blank page. Snap or add a few items and I can tell you what to cook before it spoils.';
    }

    final soonest = expiring.isEmpty ? items.first : expiring.first;
    return 'You have ${items.length} items in storage. I would start with ${soonest.name}. Ask me what to cook tonight or what is expiring this week.';
  }
}
