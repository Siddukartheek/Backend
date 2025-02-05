const express = require('express');
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB connection
const MONGO_URI = 'mongodb+srv://karthiksiddu28:vpwLOSL8djj8K4SZ@cluster0.iqs1qq0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schema and Model
const customerSchema = new mongoose.Schema({
    id: Number,
    name_of_customer: String,
    email: String,
    mobile_number: String,
    address: String,
    city: String,
    country: String,
    created_at: Date,
    company: String,
    job_title: String
});

const Customer = mongoose.model('Customer', customerSchema, 'fakerData');

// Middleware
app.use(cors());
app.use(express.json());

// Generate and Store Customer Data in MongoDB
const generateAndStoreCustomers = async () => {
    console.log('Generating customer data and storing in MongoDB...');
    const customers = Array.from({ length: 200000 }, (_, index) => ({
        id: index + 1,
        name_of_customer: faker.person.fullName(),
        email: faker.internet.email(),
        mobile_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        created_at: faker.date.past(),
        company: faker.company.name(),
        job_title: faker.person.jobTitle()
    }));

    await Customer.insertMany(customers);
    console.log('Data stored in MongoDB successfully!');
};

generateAndStoreCustomers();

// GET /api/customers endpoint
app.get('/api/customers', async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const search = req.query.search || "";
        const filterField = req.query.filterField || "";
        const filterValue = req.query.filterValue || "";

        let query = {};

        if (search) {
            query.$or = [
                { name_of_customer: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        if (filterField && filterValue) {
            query[filterField] = new RegExp(filterValue, 'i');
        }

        const totalCount = await Customer.countDocuments(query);
        const customers = await Customer.find(query).skip((page - 1) * limit).limit(limit);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            status: 'success',
            data: {
                customers,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalRecords: totalCount,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    limit
                }
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/customers/count endpoint
app.get('/api/customers/count', async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        res.json({
            status: 'success',
            data: { totalCustomers }
        });
    } catch (error) {
        console.error('Error fetching customer count:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the API at http://localhost:${PORT}/api/customers`);
});
