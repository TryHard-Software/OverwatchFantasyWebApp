import React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import Live from './Live';
import NotFound from './NotFound';
import Information from './Information';
import About from './About';
import News from './News';
import './app.scss';


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoggedIn: true
    };
  }

  render() {
    return(
    <BrowserRouter>
      <div className="app">
          {/* backgrounds */}
          <Switch>
            <Route exact path="/app/live" component={() => (<div><html className="bg-wrapper live-bg" /></div>)} />
            <Route exact path="/app/news" component={() => (<div><html className="bg-wrapper news-bg" /></div>)} />
            <Route exact path="/app/information" component={() => (<div><img className="bg-wrapper information-bg" /></div>)} />
            <Route exact path="/app/about" component={() => (<div><img className="bg-wrapper about-bg" /></div>)} />
            <Route component={() => (<div><html className="bg-wrapper notfound-bg" /></div>)} />
          </Switch>

          {/* navbar */}
          <section role="navigation">
            <nav className="navbar navbar-toggleable-sm fixed-top">
              <div className="navbar-header">
                <a className="navbar-brand" href="/">
                  <img className="logo-ovw" src="/images/logos/light-logo.png" width="30" height="30" alt="logo" /> FANTASY LEAGUE</a>
                  <button className="navbar-toggle navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbar-toggle" aria-controls="navbar-toggle"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <img height="30" src="/images/logos/threelines.png" />
 
                  </button>
              </div>
              <div className="collapse navbar-collapse" id="navbar-toggle">
                <div className="navbar-nav">
                  <Link className="nav-item nav-link" to="/app/news">News</Link>
                  <Link className="nav-item nav-link" to="/app/live" >Live</Link>
                  <a className="nav-item nav-link active" href="/dashboard">Dashboard</a>
                  <a className="nav-item nav-link" href="/leaderboard_weekly">Leaderboards</a>
                  <Link className="nav-item nav-link" to="/app/information" >Information</Link>
                  <Link className="nav-item nav-link" to="/app/about" >About</Link>
                </div>
                <div className="navbar-nav navbar-right">
                  <a className="nav-item nav-link" href="/signin">Log In</a>
                  <a className="nav-item nav-link" href="/signup">Sign Up</a>
                </div>
              </div>
            </nav>
        </section>
        
        {/* router */}
        <div className="main">
          <Switch> 
            <Route exact path="/app/live" component={Live} />
            <Route exact path="/app/news" component={News} />
            <Route exact path="/app/information" component={Information} />
            <Route exact path="/app/about" component={About} />
            <Route component={NotFound} />
          </Switch>
          </div>
        </div>
      </BrowserRouter>
    )
  }

}

export default App;