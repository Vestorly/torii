import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { stubValidSession } from '../helpers/torii';
import DummySuccessProvider from '../helpers/dummy-success-provider';
import DummyFailureProvider from '../helpers/dummy-failure-provider';

module('Acceptance | Testing Helper', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.torii   = this.owner.lookup("service:torii");
    this.session = this.owner.lookup("service:session");
    this.adapter = this.owner.lookup("torii-adapter:application");

    this.owner.register('torii-provider:dummy-failure', DummyFailureProvider);
    this.owner.register('torii-provider:dummy-success', DummySuccessProvider);
  });

  test("sessions are not authenticated by default", function(assert){
    let session = this.owner.lookup("service:session");

    assert.ok(!session.get('isAuthenticated'),"session is not authenticated");
  });

  test("#stubValidSession should stub a session that isAuthenticated", function(assert){
    stubValidSession(this.owner, { id: 42 });

    let session = this.owner.lookup("service:session");

    assert.ok(session.get('isAuthenticated'),"session is authenticated");
  });

  test("#stubValidSession should stub a session with the userData supplied", function(assert){
    stubValidSession(this.owner, { id: 42 });

    let session = this.owner.lookup("service:session");

    assert.equal(session.get('id'), 42,"session contains the correct currentUser");
  });
});
