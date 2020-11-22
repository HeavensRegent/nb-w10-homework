const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");

//Map to easily call and get different items for different types of employees
const customEmployeeAttributes = {
    //Manager's custom items
    'Manager': {
        questionName: 'officeNumber',
        question: "What is the manager's office number?",
        create: function({name, id, email, officeNumber}) {
            return new Manager(name, id, email, officeNumber);
        }
    },
    //Engineer's custom items
    'Engineer': {
        questionName: 'github',
        question: "What is the engineer's Github username?",
        create: function({name, id, email, github}) {
            return new Engineer(name, id, email, github);
        }
    },
    //Intern's custom items
    'Intern': {
        questionName: 'school',
        question: "What school is the intern attending?",
        create: function({name, id, email, school}) {
            return new Intern(name, id, email, school);
        }
    }
};

// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)
getDevTeamInfo();

// After the user has input all employees desired, call the `render` function (required
// above) and pass in an array containing all employee objects; the `render` function will
// generate and return a block of HTML including templated divs for each employee!

// After you have your html, you're now ready to create an HTML file using the HTML
// returned from the `render` function. Now write it to a file named `team.html` in the
// `output` folder. You can use the variable `outputPath` above target this location.
// Hint: you may need to check if the `output` folder exists and create it if it
// does not.

// HINT: each employee type (manager, engineer, or intern) has slightly different
// information; write your code to ask different questions via inquirer depending on
// employee type.

// HINT: make sure to build out your classes first! Remember that your Manager, Engineer,
// and Intern classes should all extend from a class named Employee; see the directions
// for further information. Be sure to test out each class and verify it generates an
// object with the correct structure and methods. This structure will be crucial in order
// for the provided `render` function to work! ```

//Asynchronously get each team member
async function getDevTeamInfo() {
    let done = false;
    let teamMembers = [];
    let teamMemberType = 'Manager';

    //While they want to create another team member
    while(!done) {
        //await the result of the inquirer and ask them the questions to get the information about the team member
        await inquirer.prompt(getQuestions(teamMemberType)).then((data) => {
            //Create a new team member from the map customEmployeeAttributes map
            let teamMember = customEmployeeAttributes[teamMemberType].create(data);
            //Update the teamMemberType for the next iteration
            teamMemberType = data.nextTeamMember;
            //Add the team member to the teamMembers array
            teamMembers.push(teamMember);
            //If the type is finished break out of the while loop
            if(teamMemberType === 'Finished')
                done = true;
        });
    }

    //Write the result out to the render function
    writeToFile(render(teamMembers));

    return teamMembers;
}

//Get the list of questions influenced by member type
function getQuestions(memberType) {

    const questions = [
        {
            type: 'input',
            name: 'name',
            message: `What is the ${memberType.toLowerCase()}'s name?`
        },
        {
            type: 'input',
            name: 'id',
            message: `What is the ${memberType.toLowerCase()}'s id number?`
        },
        {
            type: 'input',
            name: 'email',
            message: `What is the ${memberType.toLowerCase()}'s email?`
        },
        {
            type: 'input',
            name: customEmployeeAttributes[memberType].questionName,
            message: customEmployeeAttributes[memberType].question
        },
        {
            type: 'list',
            name: 'nextTeamMember',
            message: 'Do you want to add another team member are are you finished?',
            choices: ['Finished', 'Manager', 'Engineer', 'Intern']
        }
    ];

    return questions;
}

// function to write the output to html
function writeToFile(data) {
    try {
        if(!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR);
        }
        fs.writeFileSync(outputPath, data, 'UTF8');
    } catch(e) {
        console.log(e);
    }
}


