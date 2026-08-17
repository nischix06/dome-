console.log("JS is working");

const form = document.getElementById("form");

const firstnameInput = document.getElementById("firstname-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const confirmPasswordInput = document.getElementById("confirm-password-input");

const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", (e) => {

    e.preventDefault();

    console.log("SUBMIT EVENT WORKING");

    let errors = [];

    errors = getSignupFormErrors(
        firstnameInput.value,
        emailInput.value,
        passwordInput.value,
        confirmPasswordInput.value
    );

    console.log("Errors:", errors);

    // Show errors on the webpage
    if (errors.length > 0) {
        errorMessage.innerHTML = errors.join("<br>");
    } else {
        errorMessage.innerHTML = "Signup successful!";
    }
});


function getSignupFormErrors(firstname, email, password, confirmPassword) {

    let errors = [];

    // Remove previous red borders
    firstnameInput.classList.remove("incorrect");
    emailInput.classList.remove("incorrect");
    passwordInput.classList.remove("incorrect");
    confirmPasswordInput.classList.remove("incorrect");

    if (firstname === '') {
        errors.push("First name is required.");
        firstnameInput.classList.add("incorrect");
    }

    if (email === '') {
        errors.push("Email is required.");
        emailInput.classList.add("incorrect");
    }

    if (password === '') {
        errors.push("Password is required.");
        passwordInput.classList.add("incorrect");
    }

    if (confirmPassword === '') {
        errors.push("Please confirm your password.");
        confirmPasswordInput.classList.add("incorrect");
    }

    // Check if passwords are different
    if (password !== '' && confirmPassword !== '' && password !== confirmPassword) {

        console.log("PASSWORDS DO NOT MATCH!");

        errors.push("Passwords do not match.");

        passwordInput.classList.add("incorrect");
        confirmPasswordInput.classList.add("incorrect");
    }
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long.");
        passwordInput.classList.add("incorrect");
    }

    return errors;
}