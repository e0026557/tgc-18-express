// Hands on A
// Get default unit to display
// function displayUnit() {
//     let selectedRadioBtn = document.querySelector('input[type="radio"]:checked');
//     let unit = selectedRadioBtn.value;

//     if (unit == 'metric') {
//         document.querySelector('#unitWeight').innerHTML = 'kg';
//         document.querySelector('#unitHeight').innerHTML = 'm';
//     }
//     else {
//         document.querySelector('#unitWeight').innerHTML = 'pounds';
//         document.querySelector('#unitHeight').innerHTML = 'inches';
//     }
// }

// displayUnit();

// let radioBtns = document.querySelectorAll('input[type="radio"]');
// for (let radioBtn of radioBtns) {
//     radioBtn.addEventListener('change', function () {
//         displayUnit();
//     })
// }


// Hands on C
let itemField = document.querySelector('#item');
itemField.addEventListener('keyup', function () {
    // Set up flag
    let itemError = false;

    // Get name of item
    let item = itemField.value;

    if (item.length <= 3 || item.length >= 200) {
        itemError = true;
    }

    if (itemError) {
        document.querySelector('#itemErrorMessage').innerHTML = 'Name of item must be between 3 to 200 characters';
    }
})

let emailField = document.querySelector('#email');
emailField.addEventListener('keyup', function () {
    // Set up flag
    let emailError = false;

    // Get email
    let email = emailField.value;

    // Check that email has at least an '@' and '.' character
    if (!email.includes('@') || !email.includes('.')) {
        emailError = true;
    }

    if (emailError) {
        document.querySelector('#emailErrorMessage').innerHTML = 'Please enter a valid email address'
    }
});


// Set up flag
let locationError = false;

let others = document.querySelector('#others');
let txtOthers = document.querySelector('#txtOthers');
txtOthers.addEventListener('keyup', function() {
    let value = txtOthers.value;
    if (!value) {
        document.querySelector('#txtOthersErrorMessage').innerHTML = 'Please indicate location';
    }
})

txtOthers.setAttribute('style', 'display: none !important;');

if (others.checked) {
    txtOthers.setAttribute('style', 'display: inline !important;');
}

let selectedLocation = null;
let locationBtns = document.querySelectorAll('input[name="location"]');
for (let locationBtn of locationBtns) {
    locationBtn.addEventListener('change', function () {
        if (others.checked) {
            txtOthers.setAttribute('style', 'display: inline !important;');
        }
        else {
            txtOthers.setAttribute('style', 'display: none !important;');
        }
    });

    if (locationBtn.checked) {
        selectedLocation = locationBtn.value;
    }
}

if (!selectedLocation) {
    locationError = true;
}

if (locationError) {
    document.querySelector('#locationErrorMessage').innerHTML = 'Please select a location'
}


// Set up flag
let descriptionError = false;

let descriptions = [];
let descriptionBtns = document.querySelectorAll('input[name="properties"]');
for (let descriptionBtn of descriptionBtns) {
    if (descriptionBtn.checked) {
        descriptions.push(descriptionBtn.value);
    }
}

if (descriptions.length < 1 || descriptions.length > 3) {
    descriptionError = true;
}

if (descriptionError) {
    document.querySelector('#descriptionErrorMessage').innerHTML = 'Please select 1 - 3 properties';
}