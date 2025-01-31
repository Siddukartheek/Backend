// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 7000;

// // Middleware
// app.use(express.json());

// // Helper functions to generate random data
// const generateRandomName = () => {
//     const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Emma', 'William', 'Olivia', 
//                        'Daniel', 'Sophia', 'Matthew', 'Ava', 'Joseph', 'Isabella', 'Christopher', 'Mia', 'Andrew', 'Charlotte'];
//     const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 
//                       'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    
//     const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
//     const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
//     return `${firstName} ${lastName}`;
// };

// const generateRandomEmail = (name) => {
//     const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
//     const domain = domains[Math.floor(Math.random() * domains.length)];
//     const randomNum = Math.floor(Math.random() * 1000);
//     return `${name.toLowerCase().replace(' ', '.')}${randomNum}@${domain}`;
// };

// const generateRandomPhone = () => {
//     const areaCode = Math.floor(Math.random() * 900) + 100;
//     const prefix = Math.floor(Math.random() * 900) + 100;
//     const lineNum = Math.floor(Math.random() * 9000) + 1000;
//     return `(${areaCode}) ${prefix}-${lineNum}`;
// };

// // Generate 2000 student records
// console.log('Generating student data...');
// const students = Array.from({ length: 2000 }, (_, id) => {
//     const name = generateRandomName();
//     return {
//         id: id + 1,
//         student_name: name,
//         email: generateRandomEmail(name),
//         phone: generateRandomPhone()
//     };
// });
// console.log('Data generation complete!');

// // Helper function for filtering
// const filterStudents = (students, search, filterField, filterValue, startIndex, endIndex) => {
//     let filteredStudents = students;
    
//     if (search) {
//         const searchLower = search.toLowerCase();
//         filteredStudents = filteredStudents.filter(student => 
//             student.student_name.toLowerCase().includes(searchLower) ||
//             student.email.toLowerCase().includes(searchLower)
//         );
//     }
    
//     if (filterField && filterValue) {
//         filteredStudents = filteredStudents.filter(student => 
//             student[filterField]?.toString().toLowerCase().includes(filterValue.toLowerCase())
//         );
//     }
    
//     const totalCount = filteredStudents.length;
//     filteredStudents = filteredStudents.slice(startIndex, endIndex);
    
//     return { filteredStudents, totalCount };
// };

// // GET /api/students endpoint
// app.get('/api/students', (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const search = req.query.search;
//         const filterField = req.query.filterField;
//         const filterValue = req.query.filterValue;
        
//         const startIndex = (page - 1) * limit;
//         const endIndex = startIndex + limit;
        
//         const { filteredStudents, totalCount } = filterStudents(
//             students,
//             search,
//             filterField,
//             filterValue,
//             startIndex,
//             endIndex
//         );
        
//         const totalPages = Math.ceil(totalCount / limit);
        
//         res.json({
//             status: 'success',
//             data: {
//                 students: filteredStudents,
//                 pagination: {
//                     currentPage: page,
//                     totalPages,
//                     totalRecords: totalCount,
//                     hasNextPage: page < totalPages,
//                     hasPrevPage: page > 1,
//                     limit
//                 }
//             }
//         });
        
//     } catch (error) {
//         console.error('Error fetching students:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Internal server error',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });

// // GET /api/students/count endpoint
// app.get('/api/students/count', (req, res) => {
//     res.json({
//         status: 'success',
//         data: {
//             totalStudents: students.length
//         }
//     });
// });

// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(`Access the API at http://localhost:${PORT}/api/students`);
// });