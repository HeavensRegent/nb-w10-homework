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

getDevTeamInfo();

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
            message: `What is the ${memberType.toLowerCase()}'s name?`,
            validate: function(input) {
                if(!input)
                    return 'You must enter a value';
                return true;
            }
        },
        {
            type: 'input',
            name: 'id',
            message: `What is the ${memberType.toLowerCase()}'s id number?`,
            validate: function(input) {
                if(!input)
                    return 'You must enter a value';

                if(isNaN(input))
                    return 'You must enter a number';
                
                return true;
            }
        },
        {
            type: 'input',
            name: 'email',
            message: `What is the ${memberType.toLowerCase()}'s email?`,
            validate: function(input) {
                if(!input)
                    return 'You must enter a value';

                //Test if it is an eamil format
                if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(input))
                {
                    return true;
                }
                return 'You have entered an invalid email address';
            }
        },
        {
            type: 'input',
            name: customEmployeeAttributes[memberType].questionName,
            message: customEmployeeAttributes[memberType].question,
            validate: function(input) {
                if(!input)
                    return 'You must enter a value';  
                return true;
            }
        },
        {
            type: 'list',
            name: 'nextTeamMember',
            message: 'Do you want to add another team member or are you finished?',
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


