import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'
import './index.scss';
import reducers from './reducers';
import App from './Views/app';
import registerServiceWorker from './registerServiceWorker';

const store = createStore(reducers);

ReactDOM.render(<App store={store} />, document.getElementById('root'));
registerServiceWorker();
