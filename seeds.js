import mongoose from 'mongoose';
import Subrediddit from './models/subrediddit';

/* local data */
const subData = [
    {
        name: 'explainlikeimtwentyfive',
        description: 'Explain things in a way such that your average prime-aged youth would understand. Obviously a kid or teenager should not be able to comprehend your explanation.'
    },
    {
        name: 'titifu',
        description: 'For when you thought you messed up bad... but really you did not'
    },
    {
        name: 'jifs',
        description: 'collection of jifs you would like to share with others'
    }
];

function seedDB() {
    Subrediddit.remove({}, function(err) {
       if(err) {
           console.log(err);
       }
       console.log('wiped db.Subrediddit');
       
        // seed with new data
        subData.forEach(function(sub) {
            Subrediddit.create(sub, function(err, subCreated) {
                if(err) {
                    console.log('ERR on sub.create()');
                } else {
                    console.log('added r/' + sub.name);
                }
            });
        });
    });
}

export default seedDB;