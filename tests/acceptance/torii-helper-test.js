import { stubValidSession } from '../helpers/torii';
import QUnit from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

const { test } = QUnit;

let container;

moduleForAcceptance('Testing Helper - Acceptance', {
  beforeEach() {
    container = this.application.__container__;
  }
});

test("sessions are not authenticated by default", function(assert){
  let session = container.lookup("service:session");
  assert.ok(!session.get('isAuthenticated'),"session is not authenticated");
});

test("#stubValidSession should stub a session that isAuthenticated", function(assert){
  stubValidSession(this.application, { id: 42 });
  let session = container.lookup("service:session");
  assert.ok(session.get('isAuthenticated'),"session is authenticated");
});

test("#stubValidSession should stub a session with the userData supplied", function(assert){
  stubValidSession(this.application, { id: 42 });
  let session = container.lookup("service:session");
  assert.equal(session.get('id'), 42,"session contains the correct currentUser");
});
