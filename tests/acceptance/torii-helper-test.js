import startApp from '../helpers/start-app';
import { stubValidSession } from '../helpers/torii';
import QUnit from 'qunit';

let { module, test } = QUnit;

var app, container, session;

module('Testing Helper - Acceptance', {
  setup: function(){
    app = startApp({ loadInitializers: true });
    container = app.__container__;
  },
  teardown: function(){
    Ember.run(app, 'destroy');
  }
});

test("sessions are not authenticated by default", function(assert){
  session = container.lookup("service:session");
  assert.ok(!session.get('isAuthenticated'),"session is not authenticated");
});

test("#stubValidSession should stub a session that isAuthenticated", function(assert){
  stubValidSession(app, { id: 42 });
  session = container.lookup("service:session");
  assert.ok(session.get('isAuthenticated'),"session is authenticated");
});

test("#stubValidSession should stub a session with the userData supplied", function(assert){
  stubValidSession(app, { id: 42 });
  session = container.lookup("service:session");
  assert.equal(session.get('id'), 42,"session contains the correct currentUser");
});
