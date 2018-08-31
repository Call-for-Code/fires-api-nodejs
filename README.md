# NASA Active Fire Data API access for IBM Cloud

![wildfire](./wildfire.jpg)
Photo by [Michael Held](https://unsplash.com/photos/Of-NXuECJbE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/wildfire?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

This project shows how to build a basic data access application that continuously runs in the background, processing VIIRS (I-Band 375 m) data from NASA by dowloading CSV files from the site, transforming each record into GeoJSON, and loading that into a Cloudant database.

From [NASA Firms](https://earthdata.nasa.gov/earth-observation-data/near-real-time/firms/viirs-i-band-active-fire-data): 
> The Visible Infrared Imaging Radiometer Suite (VIIRS) 375 m ([VNP14IMGTDL_NRT](https://earthdata.nasa.gov/earth-observation-data/near-real-time/firms/v1-vnp14imgt)) active fire product is the latest product to be added to FIRMS. It provides data from the VIIRS sensor aboard the joint NASA/NOAA Suomi National Polar-orbiting Partnership (Suomi-NPP) satellite. The 375 m data complements Moderate Resolution Imaging Spectroradiometer (MODIS) fire detection; they both show good agreement in hotspot detection but the improved spatial resolution of the 375 m data provides a greater response over fires of relatively small areas and provides improved mapping of large fire perimeters. The 375 m data also has improved nighttime performance. Consequently, these data are well suited for use in support of fire management (e.g., near real-time alert systems), as well as other science applications requiring improved fire mapping fidelity. Recommended reading: [VIIRS 375 m Active Fire Algorithm User Guide](https://viirsland.gsfc.nasa.gov/PDF/VIIRS_activefire_User_Guide.pdf) (updated July 2018).

## Get an IBM Cloud account

If you haven't yet done it, sign up for [IBM Cloud here](https://console.bluemix.net/).

## Getting Started in IBM Cloud

Deploy this application to the IBM Cloud in one simple step.

[![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/rajrsingh/fires-api-nodejs) 

_Click this button to deploy the NodeJS app and instantiate a Cloudant database service at the same time. You'll have a fire app that harvests data and persists it to a Cloudant database, where you can easily write queries to access the data._


## Getting Started with a local development environment

To run this application on your local machine, first install Node.js.

1. Install and configure the [IBM Cloud Developer Tools](https://console.bluemix.net/docs/cli/index.html#overview)
2. Clone this repository

   ```
   $ git clone git@github.com:rajrsingh/fires-api-nodejs.git
   $ cd fires-api-nodejs
   ```  
3. Install the dependencies

   ```
   $ npm install
   ```
   
4. Create a `vcap-local.json` file with your IBM Cloud app's VCAP environment variables

    - When running this app locally you can get your Cloudant credentials from IBM Cloud (VCAP_SERVICES in `cf env` output or the Environment Variables section for an app in the IBM Cloud console dashboard). Feel free to copy *all* the environment variables -- not just the Cloudant ones. The app will still find the right ones.
    - Once you have the credentials, paste them into a file called `vcap-local.json`. Alternately you could point to a local database here instead of a service on the IBM Cloud.
    - URL will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com

5. Make edits

  - One thing you will want to do when testing is to have the NASA data harvesting run immediately instead of on a timer. To do this, *un*comment the last line of the file so that it reads like this:

    ```
    callActiveFireData()
    ```

6. Deploy the application with your code
   ```
   $ ibmcloud cf push
   ```


## License

This code is licensed under Apache 2.0. Full license text is available in [LICENSE](https://github.com/rajrsingh/fires-api-nodejs/tree/master/LICENSE).
