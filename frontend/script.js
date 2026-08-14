/* =========================================================
   MINDPULSE
   Frontend Application
========================================================= */


/* =========================================================
   Configuration
========================================================= */

const CONFIG = {
    API_BASE_URL: "http://127.0.0.1:8000",
    PREDICT_ENDPOINT: "/predict",
    REQUEST_TIMEOUT: 15000
};


/* =========================================================
   DOM Elements
========================================================= */

const form = document.getElementById("predictionForm");

const steps = [...document.querySelectorAll(".form-step")];

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");

const stepLabel = document.getElementById("stepLabel");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");

const apiError = document.getElementById("apiError");

const resultSection = document.getElementById("resultSection");

const scoreValue = document.getElementById("scoreValue");
const gaugeProgress = document.getElementById("gaugeProgress");

const scoreCategory = document.getElementById("scoreCategory");
const scoreMessage = document.getElementById("scoreMessage");

const influenceList = document.getElementById("influenceList");

const tryAgainBtn = document.getElementById("tryAgainBtn");
const editAnswersBtn = document.getElementById("editAnswersBtn");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");


/* =========================================================
   Application State
========================================================= */

let currentStep = 1;

const TOTAL_STEPS = 3;

const GAUGE_RADIUS = 92;

const GAUGE_CIRCUMFERENCE =
    2 * Math.PI * GAUGE_RADIUS;


/* =========================================================
   Initialize
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeTheme();

    initializeSliders();

    initializeValidation();

    initializeWizard();

    initializeRevealAnimations();

    updateWizard();

});


/* =========================================================
   Theme
========================================================= */

function initializeTheme() {

    const savedTheme = localStorage.getItem("mindpulse-theme");

    if (savedTheme === "dark") {
        document.documentElement.dataset.theme = "dark";
        themeIcon.textContent = "☀";
    } else {
        document.documentElement.dataset.theme = "light";
        themeIcon.textContent = "☾";
    }

}


themeToggle.addEventListener("click", () => {

    const isDark =
        document.documentElement.dataset.theme === "dark";

    if (isDark) {

        document.documentElement.dataset.theme = "light";

        themeIcon.textContent = "☾";

        localStorage.setItem(
            "mindpulse-theme",
            "light"
        );

    } else {

        document.documentElement.dataset.theme = "dark";

        themeIcon.textContent = "☀";

        localStorage.setItem(
            "mindpulse-theme",
            "dark"
        );

    }

});


/* =========================================================
   Slider Initialization
========================================================= */

function initializeSliders() {

    const sliders = [
        {
            input: "avg_daily_usage_hours",
            output: "usageOutput",
            suffix: "hrs"
        },
        {
            input: "study_hours",
            output: "studyOutput",
            suffix: "hrs"
        },
        {
            input: "physical_activity_hours",
            output: "activityOutput",
            suffix: "hrs"
        },
        {
            input: "sleep_Hours_per_night",
            output: "sleepOutput",
            suffix: "hrs"
        }
    ];


    sliders.forEach(({ input, output, suffix }) => {

        const slider = document.getElementById(input);
        const outputElement = document.getElementById(output);

        updateSliderOutput(
            slider,
            outputElement,
            suffix
        );


        slider.addEventListener("input", () => {

            updateSliderOutput(
                slider,
                outputElement,
                suffix
            );

            validateCurrentStep();

        });

    });

}


function updateSliderOutput(slider, output, suffix) {

    const value = Number(slider.value);

    const formatted =
        Number.isInteger(value)
            ? value.toString()
            : value.toFixed(1);

    output.textContent = `${formatted} ${suffix}`;

}


/* =========================================================
   Validation
========================================================= */

function initializeValidation() {

    const fields = form.querySelectorAll(
        "input:not([type='radio']), select"
    );


    fields.forEach(field => {

        field.addEventListener("input", () => {
            validateField(field);
            validateCurrentStep();
        });


        field.addEventListener("change", () => {
            validateField(field);
            validateCurrentStep();
        });


        field.addEventListener("blur", () => {
            validateField(field);
        });

    });


    const stressInputs =
        document.querySelectorAll(
            "input[name='stress_level']"
        );


    stressInputs.forEach(input => {

        input.addEventListener("change", () => {

            validateStress();

            validateCurrentStep();

        });

    });

}


/* =========================================================
   Validate Individual Field
========================================================= */

function validateField(field) {

    const wrapper =
        field.closest(".input-wrapper");

    const message =
        field.closest(".field")
            ?.querySelector(".validation-message");


    if (!wrapper) {
        return field.checkValidity();
    }


    wrapper.classList.remove(
        "valid",
        "invalid"
    );


    if (message) {
        message.textContent = "";
    }


    let error = "";


    if (field.validity.valueMissing) {

        error = "This field is required.";

    }


    else if (
        field.type === "number" &&
        field.validity.rangeUnderflow
    ) {

        error =
            `Value must be at least ${field.min}.`;

    }


    else if (
        field.type === "number" &&
        field.validity.rangeOverflow
    ) {

        error =
            `Value must be no more than ${field.max}.`;

    }


    else if (
        field.type === "number" &&
        field.validity.badInput
    ) {

        error = "Please enter a valid number.";

    }


    else if (
        field.name === "country" &&
        field.value.trim().length < 2
    ) {

        error = "Please enter a valid country.";

    }


    if (error) {

        wrapper.classList.add("invalid");

        if (message) {
            message.textContent = error;
        }

        return false;

    }


    wrapper.classList.add("valid");

    return true;

}


/* =========================================================
   Validate Stress
========================================================= */

function validateStress() {

    const selected =
        document.querySelector(
            "input[name='stress_level']:checked"
        );

    const message =
        document.getElementById(
            "stressValidation"
        );


    if (!selected) {

        message.textContent =
            "Please select your current stress level.";

        return false;

    }


    message.textContent = "";

    return true;

}


/* =========================================================
   Validate Current Step
========================================================= */

function validateCurrentStep() {

    const current =
        steps[currentStep - 1];


    const fields =
        current.querySelectorAll(
            "input:not([type='radio']), select"
        );


    let valid = true;


    fields.forEach(field => {

        if (!validateField(field)) {
            valid = false;
        }

    });


    if (currentStep === 3) {

        if (!validateStress()) {
            valid = false;
        }

    }

    if (currentStep < TOTAL_STEPS) {

    // Step 1 / Step 2
    // Continue depends on current step validation
    nextBtn.disabled = !valid;

    // Predict is always disabled before Step 3
    submitBtn.disabled = true;

    }

    else {

        // Step 3
        // Continue must stay disabled
        nextBtn.disabled = true;

        // Predict becomes active only when Step 3 is complete
        submitBtn.disabled = !valid;

    }

    return valid;

}


/* =========================================================
   Validate Entire Form
========================================================= */

function validateEntireForm() {

    let valid = true;


    steps.forEach(step => {

        const fields =
            step.querySelectorAll(
                "input:not([type='radio']), select"
            );


        fields.forEach(field => {

            if (!validateField(field)) {
                valid = false;
            }

        });

    });


    if (!validateStress()) {
        valid = false;
    }


    return valid;

}


/* =========================================================
   Wizard
========================================================= */

function initializeWizard() {

    nextBtn.addEventListener(
        "click",
        goToNextStep
    );


    prevBtn.addEventListener(
        "click",
        goToPreviousStep
    );

}


function goToNextStep() {

    if (!validateCurrentStep()) {

        focusFirstInvalidField();

        return;

    }


    if (currentStep < TOTAL_STEPS) {

        currentStep++;

        updateWizard();

        scrollToForm();

    }

}


function goToPreviousStep() {

    if (currentStep > 1) {

        currentStep--;

        updateWizard();

        scrollToForm();

    }

}


function updateWizard() {

    steps.forEach((step, index) => {

        step.classList.toggle(
            "active",
            index === currentStep - 1
        );

    });


    const percentage =
        (currentStep / TOTAL_STEPS) * 100;


    stepLabel.textContent =
        `Step ${currentStep} of ${TOTAL_STEPS}`;


    progressPercent.textContent =
        `${Math.round(percentage)}%`;


    progressBar.style.width =
        `${percentage}%`;


    document
        .querySelectorAll("[data-progress-step]")
        .forEach(element => {

            const stepNumber =
                Number(
                    element.dataset.progressStep
                );

            element.classList.toggle(
                "active",
                stepNumber <= currentStep
            );

        });


    prevBtn.hidden = currentStep === 1;

    // Continue button always visible
    nextBtn.hidden = false;

    // Predict button always visible
    submitBtn.hidden = false;

    // Step 3 par Continue permanently disabled
    if (currentStep === TOTAL_STEPS) {
        nextBtn.disabled = true;
    }

    // Step 1/2 par Predict disabled
    else {
        submitBtn.disabled = true;
    }

    // Validate current step
    validateCurrentStep();

}


/* =========================================================
   Focus First Invalid Field
========================================================= */

function focusFirstInvalidField() {

    const current =
        steps[currentStep - 1];


    const invalid =
        current.querySelector(
            ".input-wrapper.invalid input, " +
            ".input-wrapper.invalid select"
        );


    if (invalid) {

        invalid.focus();

        return;

    }


    if (
        currentStep === 3 &&
        !document.querySelector(
            "input[name='stress_level']:checked"
        )
    ) {

        document
            .querySelector(
                "input[name='stress_level']"
            )
            .focus();

    }

}


/* =========================================================
   Scroll
========================================================= */

function scrollToForm() {

    document
        .getElementById("predictor")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* =========================================================
   Form Submission
========================================================= */

form.addEventListener("submit", async event => {

    event.preventDefault();


    if (!validateEntireForm()) {

        focusFirstInvalidField();

        return;

    }


    hideApiError();

    setLoading(true);


    try {

        const payload =
            collectFormData();


        const result =
            await predict(payload);


        displayResult(
            result.predicted_mental_health_score,
            payload
        );

    }


    catch (error) {

        showApiError(
            getFriendlyErrorMessage(error)
        );

    }


    finally {

        setLoading(false);

    }

});


/* =========================================================
   Collect Form Data
========================================================= */

function collectFormData() {

    const getValue = name =>
        document.getElementById(name).value;


    const selectedStress =
        document.querySelector(
            "input[name='stress_level']:checked"
        );


    return {

        age: Number(getValue("age")),

        gender: getValue("gender"),

        country: getValue("country").trim(),

        academic_level:
            getValue("academic_level"),

        most_used_platform:
            getValue("most_used_platform"),

        purpose_of_use:
            getValue("purpose_of_use"),

        avg_daily_usage_hours:
            Number(
                getValue(
                    "avg_daily_usage_hours"
                )
            ),

        daily_unlocks:
            Number(
                getValue("daily_unlocks")
            ),

        study_hours:
            Number(
                getValue("study_hours")
            ),

        physical_activity_hours:
            Number(
                getValue(
                    "physical_activity_hours"
                )
            ),

        sleep_Hours_per_night:
            Number(
                getValue(
                    "sleep_Hours_per_night"
                )
            ),

        stress_level:
            selectedStress?.value || ""

    };

}


/* =========================================================
   API Request
========================================================= */

async function predict(payload) {

    const controller =
        new AbortController();


    const timeout =
        setTimeout(() => {
            controller.abort();
        }, CONFIG.REQUEST_TIMEOUT);


    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.PREDICT_ENDPOINT}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(payload),

                    signal: controller.signal
                }
            );


        clearTimeout(timeout);


        let data = null;

        try {

            data = await response.json();

        } catch {
            data = null;
        }


        if (!response.ok) {

            const error =
                new Error(
                    `API_ERROR_${response.status}`
                );

            error.status =
                response.status;

            error.data = data;

            throw error;

        }


        if (
            !data ||
            typeof data.predicted_mental_health_score
                !== "number"
        ) {

            throw new Error(
                "INVALID_API_RESPONSE"
            );

        }


        return data;

    }


    catch (error) {

        clearTimeout(timeout);

        throw error;

    }

}


/* =========================================================
   Loading State
========================================================= */

function setLoading(isLoading) {

    submitBtn.disabled = isLoading;


    const text =
        submitBtn.querySelector(
            ".button-text"
        );


    const spinner =
        submitBtn.querySelector(
            ".spinner"
        );


    if (isLoading) {

        text.textContent =
            "Analyzing your rhythm...";

        spinner.hidden = false;

    } else {

        text.textContent =
            "Predict My Score";

        spinner.hidden = true;

        validateCurrentStep();

    }

}


/* =========================================================
   API Error Handling
========================================================= */

function getFriendlyErrorMessage(error) {

    if (error.name === "AbortError") {

        return (
            "The prediction took too long to respond. " +
            "Please check that your FastAPI server is running and try again."
        );

    }


    if (
        error.message === "Failed to fetch"
    ) {

        return (
            "We couldn't connect to the prediction server. " +
            "Make sure FastAPI is running at " +
            `${CONFIG.API_BASE_URL}.`
        );

    }


    if (error.status === 422) {

        return (
            "The server rejected some of the submitted values. " +
            "Please review your answers and try again."
        );

    }


    if (error.status >= 500) {

        return (
            "The prediction server encountered an internal error. " +
            "Please try again in a moment."
        );

    }


    if (
        error.message ===
        "INVALID_API_RESPONSE"
    ) {

        return (
            "The server returned an unexpected prediction format. " +
            "Please check the FastAPI response."
        );

    }


    return (
        "Something went wrong while generating your prediction. " +
        "Please try again."
    );

}


function showApiError(message) {

    apiError.textContent = message;

    apiError.hidden = false;

    apiError.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function hideApiError() {

    apiError.hidden = true;

    apiError.textContent = "";

}


/* =========================================================
   Display Result
========================================================= */

function displayResult(score, payload) {

    const safeScore =
        Math.min(
            10,
            Math.max(
                0,
                Number(score)
            )
        );


    resultSection.hidden = false;


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    requestAnimationFrame(() => {

        animateGauge(safeScore);

        animateScoreNumber(safeScore);

    });


    updateScoreCategory(safeScore);

    generateInfluences(
        safeScore,
        payload
    );

}


/* =========================================================
   Gauge Animation
========================================================= */

function animateGauge(score) {

    const offset =
        GAUGE_CIRCUMFERENCE *
        (1 - score / 10);


    gaugeProgress.style.strokeDasharray =
        GAUGE_CIRCUMFERENCE;


    gaugeProgress.style.strokeDashoffset =
        GAUGE_CIRCUMFERENCE;


    requestAnimationFrame(() => {

        gaugeProgress.style.strokeDashoffset =
            offset;

    });

}


/* =========================================================
   Score Number Animation
========================================================= */

function animateScoreNumber(target) {

    const duration = 1400;

    const startTime = performance.now();


    function update(currentTime) {

        const elapsed =
            currentTime - startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        // Ease out cubic
        const eased =
            1 - Math.pow(
                1 - progress,
                3
            );


        const current =
            target * eased;


        scoreValue.textContent =
            current.toFixed(1);


        if (progress < 1) {

            requestAnimationFrame(update);

        } else {

            scoreValue.textContent =
                target.toFixed(1);

        }

    }


    requestAnimationFrame(update);

}


/* =========================================================
   Score Category
========================================================= */

function updateScoreCategory(score) {

    let category;
    let message;


    if (score <= 3) {

        category = "Needs Attention";

        message =
            "Some of your current patterns may be worth paying closer attention to. Small, consistent changes can make your routine feel more balanced.";

    }


    else if (score <= 6) {

        category = "Fair";

        message =
            "Your habits show a mixed picture. There may be a few areas where small adjustments could support a healthier daily rhythm.";

    }


    else if (score <= 8) {

        category = "Good";

        message =
            "Your current patterns look reasonably balanced. Keep building on the habits that are working well for you.";

    }


    else {

        category = "Excellent";

        message =
            "Your reported habits show a strong overall balance. Keep protecting the routines that help you feel your best.";

    }


    scoreCategory.textContent =
        category;


    scoreMessage.textContent =
        message;

}


/* =========================================================
   Rule-Based Influences
========================================================= */

function generateInfluences(score, data) {

    const influences = [];


    if (data.sleep_Hours_per_night < 6) {

        influences.push(
            "Your reported sleep duration is below 6 hours, which may be an important lifestyle factor."
        );

    }


    else if (
        data.sleep_Hours_per_night >= 7
    ) {

        influences.push(
            "Your reported sleep duration is 7 hours or more, which represents a positive part of your routine."
        );

    }


    if (
        data.avg_daily_usage_hours >= 6
    ) {

        influences.push(
            "Your social media usage is relatively high, so screen-time habits may be an important part of your result."
        );

    }


    else if (
        data.avg_daily_usage_hours <= 2
    ) {

        influences.push(
            "Your reported social media usage is relatively low compared with heavier daily usage patterns."
        );

    }


    if (
        data.physical_activity_hours >= 1
    ) {

        influences.push(
            "You reported at least an hour of physical activity, adding a positive lifestyle signal."
        );

    }


    if (
        data.study_hours >= 6
    ) {

        influences.push(
            "Your study time is relatively high, so maintaining a healthy balance between academics and recovery may be useful."
        );

    }


    if (
        data.daily_unlocks >= 100
    ) {

        influences.push(
            "Your phone unlock frequency is high, suggesting frequent digital engagement throughout the day."
        );

    }


    if (
        data.stress_level === "High" ||
        data.stress_level === "Very High"
    ) {

        influences.push(
            "Your reported stress level is elevated, making stress management an important part of your overall routine."
        );

    }


    if (influences.length === 0) {

        influences.push(
            "Your result reflects the combination of all the habits and personal information provided."
        );

        influences.push(
            "No single input determines the score by itself."
        );

    }


    influenceList.innerHTML = "";


    influences
        .slice(0, 4)
        .forEach(text => {

            const li =
                document.createElement("li");

            li.textContent = text;

            influenceList.appendChild(li);

        });

}


/* =========================================================
   Result Buttons
========================================================= */

tryAgainBtn.addEventListener(
    "click",
    resetPrediction
);


editAnswersBtn.addEventListener(
    "click",
    () => {

        resultSection.hidden = true;

        currentStep = 3;

        updateWizard();

        scrollToForm();

    }
);


function resetPrediction() {

    form.reset();


    // Restore slider defaults
    document.getElementById(
        "avg_daily_usage_hours"
    ).value = 4.5;

    document.getElementById(
        "study_hours"
    ).value = 3;

    document.getElementById(
        "physical_activity_hours"
    ).value = 1;

    document.getElementById(
        "sleep_Hours_per_night"
    ).value = 6.5;


    initializeSliders();


    // Clear validation states
    document
        .querySelectorAll(
            ".input-wrapper"
        )
        .forEach(wrapper => {

            wrapper.classList.remove(
                "valid",
                "invalid"
            );

        });


    document
        .querySelectorAll(
            ".validation-message"
        )
        .forEach(message => {

            message.textContent = "";

        });


    hideApiError();


    resultSection.hidden = true;


    currentStep = 1;

    updateWizard();

    scrollToForm();

}


/* =========================================================
   Reveal Animations
========================================================= */

function initializeRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            element =>
                element.classList.add(
                    "visible"
                )
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(
        element =>
            observer.observe(element)
    );

}