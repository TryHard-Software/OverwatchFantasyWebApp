import React from 'react';
import './about-view.scss';
export default props =>
    <div className="container-dashboard">
        <div className="col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
            <div className="panel panel-default panel-transparent">
                <div className="panel-heading">
                    <h3>About</h3>
                </div>
                <div className="panel-body about-text">
                    <div>
                        We are overwatch enthusiasts that enjoy full-stack development.
                    </div>
                    <div className="dev-profile">
                        <img className="dev-icon" alt="genji" src="/images/hero_icons/genji.png" />
                        <h4>Charlie Oh</h4>
                        <p>UCI Alumni </p>
                        <p>Programmer Analyst</p>
                        <p>Application Developer</p>
                        <p>Database Administrator</p>
                        <p>Genji Main</p>
                        <p>mun5424@gmail.com</p>
                    </div>
                    <div className="dev-profile">
                        <img className="dev-icon" alt="tracer" src="/images/hero_icons/tracer.png" />
                        <h4>Ian Shaffer </h4>
                        <p>Full-Stack Developer</p>
                        <p>Application Developer</p>
                        <p>Database Administrator</p>
                        <p>Tracer Main</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
