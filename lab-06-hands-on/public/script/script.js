document.querySelector('#btnSubmit')
.addEventListener('click', function() {
    // Setup flags
    let invalidItem = false;
    let invalidEmail = false;
    let invalidLocation = false;
    let invalidProperty = false;

    // Item name must be more than 3 characters but less than 200 characters long
    let item = document.querySelector('#item').value;
    if (item.length < 4 || item.length > 199) {
        invalidItem = true;
    }

    // Email address must have at least a '@' character and '.' character
    let email = document.querySelector('#email').value;
    if (!email.includes('@') || !email.includes('.')) {
        invalidEmail = true;
    }

    // One location must be selected
    let selectedLocation = null;
    let locations = document.querySelectorAll('.location');
    for (let location of locations) {
        if (location.checked) {
            selectedLocation = location.value;
            break;
        }
    }

    if (!selectedLocation) {
        invalidLocation = true;
    }


    // Only 1 to 3 properties must be selected
    let selectedProperties = [];
    let properties = document.querySelectorAll('.properties');
    for (let property of properties) {
        if (property.checked) {
            selectedProperties.push(property.value);
        }
    }

    if (selectedProperties.length < 1 || selectedProperties.length > 3) {
        invalidProperty = true;
    }

    console.log('invalid item:', invalidItem);
    console.log('invalid email:', invalidEmail);
    console.log('invalid location:', invalidLocation);
    console.log('invalid property:', invalidProperty);

    if (invalidItem || invalidEmail || invalidLocation || invalidProperty) {
        alert('Invalid input!');
    }
});