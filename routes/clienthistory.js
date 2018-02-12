var express = require('express');
var router = express.Router();
const moment = require('moment'); /* This package help us creating sharded table queries based on time shards as is available in bigquery */

// This node program fetches the user's event activity from firebase analytics based on  date parameters and return json resultset

/**
 * This documention code is based  on apidoc js , use your favourate  to generate apidoc ;) best practices mat !!
 *
 *  @api {post} http://bigqueryapi.example.com/analytics/userevents
 * @apiName  User Event Log
 * @apiGroup Analytics
 *
  * @apiParamExample {json} Request-Example:
 *       {
 *        "user_id":"A1", // user_dim.user_id from setuserid method of firebase analytics
 *        "from_date":"20180101", 
	  "to_date":"intraday_20180201" (if need to include current day's result send intraday_ prefix )
 *       }
 * @apiParam {String} user_id Users unique ID.
 * @apiParam {String} from_date Date from when the device log is required format is YYYYMMDD.
 * @apiParam {String} to_date (optional)  Date till when the device log is required format is YYYYMMDD or  intraday_YYMMDD for including today's result
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "200",
 *       "message": "Event Log Record for user",
 *       "response":[
 *
 *		{
 *           "event_dim": [
 *               {
 *                   "date": "20180112",
 *                   "name": "screen_view",
 *                   "params": [
 *                       {
 *                           "key": "firebase_screen_id",
 *                           "value": {
 *                               "string_value": null,
 *                               "int_value": 5647035909453259000,
 *                               "float_value": null,
 *                               "double_value": null
 *                           }
 *                       },
 *                       {
 *                           "key": "firebase_screen_class",
 *                           "value": {
 *                               "string_value": "MyGameSplashActivity",
 *                               "int_value": null,
 *                               "float_value": null,
 *                               "double_value": null
 *                           }
 *                       },
 *                       {
 *                           "key": "firebase_event_origin",
 *                           "value": {
 *                               "string_value": "auto",
 *                               "int_value": null,
 *                               "float_value": null,
 *                               "double_value": null
 *                           }
 *                       }
 *                   ],
 *                   "timestamp_micros": 1515767310084000,
 *                   "previous_timestamp_micros": 1515766850470000,
 *                   "value_in_usd": null
 *               }
 *           ]
 *       }
 *
 *
 *       ]
 *
 *     }
 */


router.post('/', function (req, res, next) {
  let user_id = req.body.user_id;
  let from_date = req.body.from_date;
  let to_date = req.body.to_date;
  let currentdate = 'intraday_'+moment().format("YYYYMMDD");
// we are using standard sql as per sql 2011 standards and available functions and methods in biquery doc

  const sqlQuery = `SELECT event_dim 
FROM \`your_google_project_id.com.example.com_ANDROID.app_events_*\` 
WHERE (_TABLE_SUFFIX BETWEEN '${from_date || currentdate}' AND '${to_date || currentdate}') AND user_dim.user_id = '${user_id}' 
`;
  const options = {
    query: sqlQuery,
    // timeoutMs: 10000, // Time out after 10 seconds. (use if you would like to set bigquery quota params 
    useLegacySql: false, // Use standard SQL syntax for queries.
    useQueryCache: true
  };
  bigquery
    .query(options)
    .then(results => {
      const rows = results[0];
      res.json({status:"200",message:"Event Log Record for user",response:rows});
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
});

module.exports = router;
