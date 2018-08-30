// https://firms.modaps.eosdis.nasa.gov/active_fire/
const fs = require('fs')
const request = require('request-promise-native')
var cloudant = require('@cloudant/cloudant')
const parse = require('csv-parse')
require('should')

const VIIRS_URL = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/viirs/csv/VNP14IMGTDL_NRT_Global_24h.csv'
var db;
// var cloudant;
var fileToUpload;
var dbCredentials = {
    dbName: 'fire_viirs_db'
};

function getDBCredentialsUrl(jsonData) {
  var vcapServices = JSON.parse(jsonData);
  // Pattern match to find the first instance of a Cloudant service in
  // VCAP_SERVICES. If you know your service key, you can access the
  // service credentials directly by using the vcapServices object.
  for (var vcapService in vcapServices) {
      if (vcapService.match(/cloudant/i)) {
          return vcapServices[vcapService][0].credentials.url;
      }
  }
}

function initDBConnection() {
  //When running on Bluemix, this variable will be set to a json object
  //containing all the service credentials of all the bound services
  if (process.env.VCAP_SERVICES) {
      dbCredentials.url = getDBCredentialsUrl(process.env.VCAP_SERVICES);
  } else { //When running locally, the VCAP_SERVICES will not be set
      // When running this app locally you can get your Cloudant credentials
      // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
      // Variables section for an app in the Bluemix console dashboard).
      // Once you have the credentials, paste them into a file called vcap-local.json.
      // Alternately you could point to a local database here instead of a
      // Bluemix service.
      // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
      dbCredentials.url = getDBCredentialsUrl(fs.readFileSync("vcap-local.json", "utf-8"));
  }
  cloudant = require('@cloudant/cloudant')(dbCredentials.url);
    // check if DB exists if not create
    cloudant.db.create(dbCredentials.dbName, function(err, res) {
      if (err) {
          console.log('Could not create new db: ' + dbCredentials.dbName + ', it might already exist.');
      }
  });
  db = cloudant.use(dbCredentials.dbName);
}

const handleFail = function (err) { // API call failed...
  console.error(err.hasOwnProperty('message') ? err.message : err)
}

const callActiveFireData = function () {
  request(VIIRS_URL)
    .then(fireCSV => {
      initDBConnection();

      let csv_parser_options = {
        cast: true, 
        columns: true, 
        relax_column_count: true, 
        trim: true
      }

      parse(fireCSV, csv_parser_options, (err, firedata) => {
        if (err) {
          console.log("ERR: "+err)
          return
        }

        firedata.forEach(fire => {
          let id = fire['acq_date']+'T'+fire['acq_time']+'_'+fire['longitude']+'_'+fire['latitude']
          let f = {
            "type": "Feature", 
            "geometry": {
              "type": "Point", 
              "coordinates": [ fire['longitude'], fire['latitude'] ]
            }, 
            "properties": {
              "bright_ti4": fire['bright_ti4'], 
              "bright_ti5": fire['bright_ti5'], 
              "scan": fire['scan'], 
              "track": fire['track'], 
              "acq_date": fire['acq_date'], 
              "acq_time": fire['acq_time'], 
              "satellite": fire['satellite'], 
              "confidence": fire['confidence'], 
              "version": fire['version'], 
              "frp": fire['frp'], 
              "daynight": fire['daynight'], 
            }
          }

          console.log(f)
          db.insert(f, id, (err, body, header) => {
            if (err) {
              return console.log(err)
            } else {
              console.log("Inserted "+id)
            }
          })
        });
      })      
    })
    .catch(handleFail)
}

/**
 * Here's an example of setting up a job to look for weather
 * headlines every 10 minutes. You can set up as many of these
 * jobs as you like and query different geographies.
 */
const interval = 1000 * 60 * 60 * 24 // every 24 hours
let jobInterval = setInterval(() => callActiveFireData(), interval)
// callActiveFireData()