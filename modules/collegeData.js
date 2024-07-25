const fs = require("fs");
const { resolve } = require("path");

class Data{
    constructor(students, courses){
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

// Initialize the data by reading from JSON files
module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        fs.readFile('./data/courses.json','utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses"); return;
            }

            fs.readFile('./data/students.json','utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students"); return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

// Get all students from the data collection
module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.students);
    })
}

// Get all courses from the data collection
module.exports.getCourses = function(){
   return new Promise((resolve,reject)=>{
    if (dataCollection.courses.length == 0) {
        reject("query returned 0 results"); return;
    }

    resolve(dataCollection.courses);
   });
};

// Get a specific student by their student number
module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        var foundStudent = null;
        
        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == num) {
                foundStudent = dataCollection.students[i];
            }
        }

        if (!foundStudent) {
            reject("query returned 0 results"); return;
        }

        resolve(foundStudent);
    });
};

// Get students filtered by a specific course
module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].course == course) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

// Add a new student to the data collection
module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA === undefined ? false : true;
        // Set studentNum automatically
        studentData.studentNum = dataCollection.students.length + 1;
        // Convert course to an integer
        studentData.course = parseInt(studentData.course, 10);
        // Create a new object with student data properties in the desired order
        const orderedStudentData = {
            studentNum: studentData.studentNum,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            addressStreet: studentData.addressStreet,
            addressCity: studentData.addressCity,
            addressProvince: studentData.addressProvince,
            TA: studentData.TA,
            status: studentData.status,
            course: studentData.course
        };
        // Push the student Data 
        dataCollection.students.push(orderedStudentData);
        // Write the updated students data to the file
        fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                reject("unable to save student");
                return;
            }
            // Resolve the promise
            resolve();
        });
    });
};

// Get a specific course by its ID
module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        const course = dataCollection.courses.find(course => course.courseId == id);
        if (course) {
            resolve(course);
          } else {
            reject("Query returned 0 results");
          }
    });
};

// Update an existing student's information
module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Find the index of the student to update
        const index = dataCollection.students.findIndex(student => student.studentNum == studentData.studentNum);      
        if (index === -1) {
            reject("Student not found");
            return;
        }
        // Update the student information
        dataCollection.students[index] = {
            studentNum: studentData.studentNum,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            addressStreet: studentData.addressStreet,
            addressCity: studentData.addressCity,
            addressProvince: studentData.addressProvince,
            TA: studentData.TA === 'on' ? true : false,  
            status: studentData.status,
            course: parseInt(studentData.course, 10)  
        };
        // Save the updated data to the file
        fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                reject("Unable to save updated student data");
                return;
            }
            resolve(); 
        });
    });
};

