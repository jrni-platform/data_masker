
let https = require('https');
const bbCore = require('./sdk');

// funcation to mask out certain API response data when we don't want that returned to the client

exports.after_get_purchase = (data, callback) => {

    // we can choose lots of ways of obfuscate - maybe there is some data you want to always obfuscate
    // but in this exmaple we will only obfuscate at least 1 days after the booking happened
    let isPast = false;

    // get the passed in params
    const api_response = data.params.api_response;

    // lets just check the first booking if there is one and see if it's in the past
    if (api_response._embedded && api_response._embedded.bookings && api_response._embedded.bookings.length > 0){
        // if there's bookings - lets find the first booking date
        // currently this only looks at the first booking - if there we multiple you might ahve to look through all of them to find the last date
        const bookingDate = bbCore.moment(api_response._embedded.bookings[0].datetime);
        // if it happened mopre than 1 day ago
        if (bookingDate.add(1, 'day').isBefore(bbCore.moment())){
            isPast = true;
        }
    }

    if (isPast){
        // remove the client's summary name
        api_response.client_name = "**** ****";

        // remove the full client details if present
        if (api_response._embedded.client){
            // remove PII data
            api_response._embedded.client.first_name = "***";
            api_response._embedded.client.last_name = "***";
            api_response._embedded.client.mobile = "***";
            api_response._embedded.client.phone ="***";
            api_response._embedded.client.email = "***";
            // remove the answers to any client questions
            api_response._embedded.client.answers = []; 
        }

        // remove the full member details if present
        if (api_response._embedded.member){
            // remove PII data
            api_response._embedded.member.first_name = "***";
            api_response._embedded.member.last_name = "***";
            api_response._embedded.member.mobile = "***";
            api_response._embedded.member.email = "***";
            api_response._embedded.member.phone ="***";
            // remove the answers to any client questions
            api_response._embedded.member.answers = [];
        }

        // go through any bookings
        if (api_response._embedded.bookings){
            api_response._embedded.bookings.forEach( (booking) => {
                // remove the staff members name
                if (booking.person_name)
                    booking.person_name = "*****"
                // remove the resource name
                if (booking.resource_name)
                    booking.resource_name = "*****"
                // change the pretty description to just be the service name
                booking.full_describe = booking.service_name;

                // remove answers to any booking questions
                if (booking._embedded && booking._embedded.answers)
                     booking._embedded.answers = [];

            });
        }
    }

    // repsond back with the new api_response in the params block
    callback(null, {status: "success", params: api_response});

};

