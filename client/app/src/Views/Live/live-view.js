import React from 'react';
import {
    LiveEmbed,
    LiveStats
} from '../../Components/Live';
import './live-view.scss';

class Live extends React.Component {

    
    render () {
        return (
            <div className="container-live">
                <div className="col-md-12 col-sm-12 col-xs-12">
                    <div className="panel panel-default panel-transparent">
                        <div className="panel-heading">
                            <h3>LIVE</h3>
                        </div>
                        <div className="panel-body">
                            <LiveEmbed />
                            <LiveStats />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
        

export default Live;