import axios from "axios";
import 'dotenv/config';

// Set the base URL for the Particle API
axios.defaults.baseURL = 'https://api.particle.io/v1/';
// Set the default headers for the requests to the Particle API
axios.defaults.headers.common['Content-Type'] = 'application/json';
//Set the Authorization header with the access token
axios.defaults.headers.common['Authorization'] = "Bearer " + process.env.AUTH_TOKEN;
//Set Product ID parameter with the product ID
// axios.defaults.params = { productIdOrSlug: process.env.PRODUCT_ID };

async function getProducts() {
    try {
        const response = await axios.get('/products');
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
    }
}

async function createCustomer(email, password) {
    try {
        const response = await axios.post("/products/" + process.env.PRODUCT_ID + "/customers", {
            client_id: process.env.PARTICLE_OAUTH_ID,
            client_secret: process.env.PARTICLE_OAUTH_SECRET,
            email: email,
            password: password
        });
        console.log("Customer created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating customer:', error);
    }
}


async function main() {
    console.log("Starting Particle API Client...");

    // var product = await getProducts();
    // console.log("Products: ", product);

    // console.log("Creating customer...");
    // const c1 = createCustomer("", "")

    try {
        const res = await axios.get('/products/' + process.env.PRODUCT_ID + '/devices');
        console.log("Data: ", res.data);
    } catch (error) {
        console.error('Error fetching devices data:', error);
    }

    // View customers
    try {
        const res = await axios.get('/products/' + process.env.PRODUCT_ID + '/customers');
        console.log("Customers: ", res.data);
    } catch (error) {
        console.error('Error fetching customers data:', error);
    }


    // try {
    //     const res = await axios.get('/devices');
    //     console.log("Devices Associated To Token: ", res.data);
    // } catch (error) {
    //     console.error('Error fetching devices data:', error);
    // }

    // try {
    //     var email = "andybustos021@gmail.com"
    //     const res = await axios.delete("/products/" + process.env.PRODUCT_ID + "/customers/" + email);
    //     console.log("Customer deleted successfully:", res.data);
    // } catch (error) {
    //     console.error('Error deleting customer:', error);
    // }


    // try {
    //     const res = await axios.get('/products/' + process.env.PRODUCT_ID + '/customers');
    //     console.log("Customer List: ", res.data);
    // } catch (error) {
    //     console.error('Error fetching customer devices data:', error);
    // }

    // Claim a device to a customer
    // try {
    //     const res = await axios.post("/devices", {
    //         id: ""
    //     });
    //     console.log("Device claimed successfully:", res.data);
    // } catch (error) {
    //     console.error('Error claiming device:', error);
    // }

    // Ping device: Paramater: signal: 1 (on) or 0 (off)
    // try {
    //     const device_id = ""
    //     const res = await axios.put("/devices/" + device_id, {
    //         signal: 0
    //     });

    //     console.log("Device pinged successfully:\n", res.data);
    // } catch (error) {
    //     console.error('Error pinging device:', error);
    // }


    // // Call a function on the device
    // try {
    //     const device_id = ""
    //     const functionName = "led"
    //     const res = await axios.post("/devices/" + device_id + "/" + functionName, {
    //         arg: "off"
    //     })
    //     console.log("Device function called successfully:\n", res.data);
    // } catch (error) {
    //     console.error('Error calling device function:', error);
    // }



}

main();