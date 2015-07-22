import Session from 'torii/session';

export default function(container, sessionName){
  container.register('torii:session', Session);
  container.injection('torii:session', 'torii', 'torii:main');
  container.injection('route',      sessionName, 'torii:session');
  container.injection('controller', sessionName, 'torii:session');
  container.injection('component',  sessionName, 'torii:session');

  return container;
}
