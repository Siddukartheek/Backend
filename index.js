const express = require('express');
const { faker } = require('@faker-js/faker');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;
const cors = require('cors');
app.use(cors());

// Middleware
app.use(express.json());

// In-memory index structure
const indexes = {
    emailMobileCompound: new Map(),
    email: new Map(),
    mobile_number: new Map(),
    name: new Map()
};

// Generate 2000000 customer records with indexing
console.log('Generating customer data and building indexes...');
const customers = Array.from({ length: 200000 }, (_, id) => {
    const customer = {
        id: id + 1,
        name_of_customer: faker.person.fullName(),
        email: faker.internet.email(),
        mobile_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        created_at: faker.date.past(),
        company: faker.company.name(),
        job_title: faker.person.jobTitle()
    };

    // Build compound index for email and mobile_number
    const compoundKey = `${customer.email}-${customer.mobile_number}`;
    indexes.emailMobileCompound.set(compoundKey, customer.id);

    // Build individual indexes
    indexes.email.set(customer.email, customer.id);
    indexes.mobile_number.set(customer.mobile_number, customer.id);
    indexes.name.set(customer.name_of_customer.toLowerCase(), customer.id);

    return customer;
});
console.log('Data generation and indexing complete!');

// Helper function for searching using indexes
const searchWithIndexes = (search, filterField, filterValue) => {
    let resultIds = new Set();

    if (search) {
        const searchLower = search.toLowerCase();
        
        // Search in indexed fields
        indexes.name.forEach((id, name) => {
            if (name.includes(searchLower)) resultIds.add(id);
        });
        
        indexes.email.forEach((id, email) => {
            if (email.toLowerCase().includes(searchLower)) resultIds.add(id);
        });
    }

    if (filterField && filterValue) {
        const filterValueLower = filterValue.toLowerCase();
        const indexToUse = indexes[filterField];

        if (indexToUse) {
            // If we have an index for this field, use it
            const filteredIds = new Set();
            indexToUse.forEach((id, value) => {
                if (value.toLowerCase().includes(filterValueLower)) {
                    filteredIds.add(id);
                }
            });

            // If we already have search results, intersect them
            if (resultIds.size > 0) {
                resultIds = new Set([...resultIds].filter(id => filteredIds.has(id)));
            } else {
                resultIds = filteredIds;
            }
        } else {
            // Fallback to regular filtering for non-indexed fields
            const filtered = customers.filter(customer =>
                customer[filterField]?.toString().toLowerCase().includes(filterValueLower)
            );
            resultIds = new Set(filtered.map(c => c.id));
        }
    }

    return resultIds.size > 0 
        ? customers.filter(customer => resultIds.has(customer.id))
        : customers;
};

// GET /api/customers endpoint
app.get('/api/customers', async (req, res) => {
     try {
         // Check if API is accessible
         if (Object.keys(req.query).length === 0) {
             return res.json({ message: "API is working" });
         }
 
         // Parse query parameters safely
         const page = Math.max(parseInt(req.query.page) || 1, 1);
         const limit = Math.max(parseInt(req.query.limit) || 10, 1);
         const search = req.query.search || "";
         const filterField = req.query.filterField || "";
         const filterValue = req.query.filterValue || "";
 
         if (isNaN(page) || isNaN(limit)) {
             return res.status(400).json({
                 status: 'error',
                 message: 'Invalid page or limit parameter',
             });
         }
 
         // Ensure `searchWithIndexes` function exists
         if (typeof searchWithIndexes !== 'function') {
             console.error('Error: searchWithIndexes function is not defined');
             return res.status(500).json({ 
                 status: 'error', 
                 message: 'Search function is missing on the server' 
             });
         }
 
         // Use indexed search
         const filteredCustomers = searchWithIndexes(search, filterField, filterValue);
         const totalCount = filteredCustomers.length;
 
         // Apply pagination safely
         const startIndex = (page - 1) * limit;
         const endIndex = startIndex + limit;
         const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
 
         const totalPages = Math.ceil(totalCount / limit);
 
         res.json({
             status: 'success',
             data: {
                 customers: paginatedCustomers,
                 pagination: {
                     currentPage: page,
                     totalPages,
                     totalRecords: totalCount,
                     hasNextPage: page < totalPages,
                     hasPrevPage: page > 1,
                     limit
                 },
                 indexes: {
                     available: Object.keys(indexes || {})
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
app.get('/api/customers/count', (req, res) => {
    res.json({
        status: 'success',
        data: {
            totalCustomers: customers.length,
            indexStats: {
                emailMobileCompound: indexes.emailMobileCompound.size,
                email: indexes.email.size,
                mobile: indexes.mobile_number.size,
                name: indexes.name.size
            }
        }
    });
});

// Basic request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the API at http://localhost:${PORT}/api/customers`);
});