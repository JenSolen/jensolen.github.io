let dates = [];
let select = document.createElement('select');

//Generates an array with the numbers 1845-2023 and saves them in dates
function generateArray(size, start) {
    return Array.from({length: size}, (_, index) => index + start);
}
dates.push(generateArray(149, 1875));

// Fills the dropdown menu 'From' with dates from 1875-2023
function fillDropFrom(data){
    const select = document.createElement('select');
    select.id = 'datefrom';

    for(let i=0; i<data.length; i++){
        const option = document.createElement('option');
        option.value = data[i];
        option.text = data[i];
        select.appendChild(option);
    }
    return select;
}
const dropdownMenuFrom = fillDropFrom(dates[0]); // pass the first (and only) element of dates array
document.getElementById('dropdownfrom').appendChild(dropdownMenuFrom);

// Fills the dropdown menu 'To' with dates from 1875-2023
function fillDropTo(data){
    const select = document.createElement('select');
    select.id = 'dateto';

    for(let i=0; i<data.length; i++){
        const option = document.createElement('option');
        option.value = data[i];
        option.text = data[i];
        select.appendChild(option);
    }
    return select;
}
const dropdownMenuTo = fillDropTo(dates[0]); 
document.getElementById('dropdownto').appendChild(dropdownMenuTo);

// Update the options in the 'To' dropdown based on the selected option in the 'From' dropdown
// Also Eventlistener for Selected Option form
document.getElementById('dropdownfrom').addEventListener('change', function(event) {
    const selectedOptionFrom = event.target.value;
    const selectTo = document.getElementById('dateto');

    // Disable options that are before the selected option in the 'From' dropdown
    for (let i = 0; i < selectTo.options.length; i++) {
        const option = selectTo.options[i];
        if (option.value < selectedOptionFrom) {
            option.disabled = true;
        } else {
            option.disabled = false;
        }
    }

    console.log('Selected option From:', selectedOptionFrom);
});

//Eventlistener for Selected Option to
document.getElementById('dropdownto').addEventListener('change', function(event) {
    const selectedOptionTo = event.target.value;
    console.log('Selected option To:', selectedOptionTo);
});
