# RTI CDS Frontend Developer Exercise

### This project shows 3 graphs:
* The percentage of people who make above and below $50K for each education group.
* The percentage of people who make above and below $50K for each race.
* A visualization that combines both (in this case, breaks down the education group percentages by race)

## Instructions

* Ensure git, Node.js, and npm are installed
* Clone this repository
* Navigate to the project folder in a terminal of your choosing
* Run ```npm install``` to install all npm and bower dependencies
* Once all dependencies are installed, run ```npm start``` to start a server on port 8000
* Navigate to [http://localhost:8000/app/#!/home](http://localhost:8000/app/#!/home) to see the app
* The loading animation will run for a few seconds, then show the graphs.

## Notes

* To change the port the server runs on, change the port on line 26 of package.json to whichever you want. The line is as follows: ```"start": "http-server -a localhost -p 8000 -c-1 ./",```
