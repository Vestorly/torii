import PopupIdSerializer from 'torii/lib/popup-id-serializer';
import QUnit from 'qunit';

let { module, test } = QUnit;

module('PopupIdSerializer - Unit');

test('.serialize prepends a prefix before the popup id', function(assert){
  var popupId = "abc12345";

  assert.equal("torii-popup:" + popupId, PopupIdSerializer.serialize(popupId));
});

test('.deserialize extracts the popup id from the serialized string', function(assert){
  var serializedPopupId = "torii-popup:gfedc123";

  assert.equal("gfedc123", PopupIdSerializer.deserialize(serializedPopupId));
});

test('.deserialize returns null if not a properly serialized torii popup', function(assert){
  var serializedPopupId = "";

  assert.equal(null, PopupIdSerializer.deserialize(serializedPopupId));
});

test('.serialize returns null if passed undefined', function(assert){
  assert.equal(null, PopupIdSerializer.deserialize(undefined));
});
