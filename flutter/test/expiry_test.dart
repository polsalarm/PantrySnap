import 'package:flutter_test/flutter_test.dart';
import 'package:pantrysnap/core/utils/dates.dart';
import 'package:pantrysnap/core/constants/catalog.dart';
import 'package:pantrysnap/features/pantry/domain/expiry.dart';

void main() {
  test('daysUntil treats local calendar dates, not UTC midnight', () {
    expect(daysUntil(isoOffset(0)), 0);
    expect(daysUntil(isoOffset(1)), 1);
    expect(daysUntil(isoOffset(-2)), -2);
  });

  test('expiryStatus uses a 3-day soon window', () {
    expect(expiryStatus(isoOffset(-1)), ExpiryStatus.expired);
    expect(expiryStatus(isoOffset(0)), ExpiryStatus.soon);
    expect(expiryStatus(isoOffset(3)), ExpiryStatus.soon);
    expect(expiryStatus(isoOffset(4)), ExpiryStatus.fresh);
  });

  test('estimateExpiryDate is purchase + category shelf life', () {
    final bought = isoDate(DateTime(2026, 1, 1));
    expect(estimateExpiryDate(bought, 'meat'), isoDate(DateTime(2026, 1, 5)));
    expect(estimateShelfLifeDays('unknown-cat'), 7);
  });

  test('expiry labels are human', () {
    expect(expiryLabel(isoOffset(0)), 'Use by today');
    expect(expiryLabel(isoOffset(1)), 'Use by tomorrow');
    expect(shortExpiryLabel(isoOffset(-1)), 'expired');
  });
}
