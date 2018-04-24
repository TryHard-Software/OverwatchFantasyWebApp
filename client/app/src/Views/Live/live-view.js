import React from 'react';
import {
    LiveEmbed
} from '../../Components/Live';
import './live-view.scss';

class Live extends React.Component {


    render () {
        return (
            <div class="container-live">
                <div class="col-md-12 col-sm-12 col-xs-12">
                    <div class="panel panel-default panel-transparent">
                        <div class="panel-heading">
                            <h3>LIVE</h3>
                        </div>
                        <div class="panel-body">
                            <LiveEmbed />
                            <h2>Live stats coming soon...</h2>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
        

export default Live;