String isoDate([DateTime? date]) {
  final d = date ?? DateTime.now();
  final local = DateTime(d.year, d.month, d.day);
  final m = local.month.toString().padLeft(2, '0');
  final day = local.day.toString().padLeft(2, '0');
  return '${local.year}-$m-$day';
}

DateTime parseIsoDate(String iso) {
  final parts = iso.split('-');
  if (parts.length != 3) return DateTime.now();
  return DateTime(
    int.parse(parts[0]),
    int.parse(parts[1]),
    int.parse(parts[2]),
  );
}

String isoOffset(int days) {
  final d = DateTime.now();
  return isoDate(DateTime(d.year, d.month, d.day).add(Duration(days: days)));
}

int daysUntil(String dateIso) {
  final today = DateTime.now();
  final start = DateTime(today.year, today.month, today.day);
  final target = parseIsoDate(dateIso);
  return target.difference(start).inDays;
}

String addDays(String dateIso, int days) {
  return isoDate(parseIsoDate(dateIso).add(Duration(days: days)));
}
