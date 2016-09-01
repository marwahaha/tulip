'use strict';

require('throng')(function() {
  require('babel-core/register');
  const React = require('react');
  const ReactDOMServer = require('react-dom/server');
  const ReactRouter = require('react-router');
  const RouterContext = require('./RouterContext');
  const express = require('express');
  const cookieParser = require('cookie-parser');
  const reactCookie = require('react-cookie');
  const redux = require('redux');
  const routes = require('./routes').default;
  const reducers = require('./reducers').default;

  const app = express();
  app.use(cookieParser());
  app.use(express.static('public'));
  app.set('view engine', 'ejs');

  app.get('*', (req, res) => {
    const unplug = reactCookie.plugToRequest(req, res);
    ReactRouter.match({ routes: routes, location: req.url }, (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send({error: error.message});
      } else if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        const store = redux.createStore(reducers);
        const preloadedState = JSON.stringify(store.getState());
        const reactString = ReactDOMServer.renderToString(RouterContext(renderProps));
        res.render('layout', {react: reactString, preloadedState: preloadedState});
      } else {
        res.status(404).send('Not Found');
      }
      unplug();
    });
  });

  const port = process.env.PORT || 3000;
  console.log("Starting up on port " + port);
  app.listen(port);

});