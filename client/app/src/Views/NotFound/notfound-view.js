import React from 'react';
import './notfound-view.scss';
export default props =>
  <div className="container-login">
    <div className="col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
      <div className="panel panel-default panel-transparent">
        <div className="panel-heading">
          <h3>Oops, We couldn't find what you were looking for...</h3>
        </div>
      </div>
      <img id="image_404" alt="404" src="/images/backgrounds/junkrat-orig.jpg" width="214px" />
    </div>
  </div>
