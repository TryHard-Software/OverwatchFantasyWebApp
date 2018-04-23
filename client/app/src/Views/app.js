import React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import Home from './Home';
import Organization from './Organization';
import NotFound from './NotFound';
import Information from './Information';
import News from './News';
import './app.scss';
export default props =>
<BrowserRouter>
  <div className="app">
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
                  <a className="nav-item nav-link active" href="/news">News</a>
                  <a className="nav-item nav-link" href="/live">Live</a>
					<a className="nav-item nav-link active" href="/dashboard">Dashboard</a>
					<a className="nav-item nav-link" href="/leaderboard_weekly">Leaderboards</a>
                  <a className="nav-item nav-link" href="/information">Information</a>
                  <a className="nav-item nav-link" href="/about">About Us</a>
                </div>
                <div className="navbar-nav navbar-right">
                  <a className="nav-item nav-link" href="/signin">Log In</a>
                  <a className="nav-item nav-link" href="/signup">Sign Up</a>
				</div>
              </div>

		</nav>

	</section>
    {/* <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/organization">Organizations</Link></li>
    </ul> */}

    {/* <hr/> */}

    {/* <Route exact path="/app/home" component={Home}/>
    <Route path="/app/organization" component={Organization}/>
    <Route path="/app/team" component={Home}/> */}
    <Switch> 
      <Route exact path="/app/news" component={News} />
      <Route exact path="/app/information" component={Information} />
      <Route component={NotFound} />
    </Switch>
  </div>
</BrowserRouter>
