// =====================================================
// NEW JERUSALEM CHURCH
// ADMIN PANEL
// =====================================================


// =====================================================
// LOGIN
// =====================================================

async function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const loginMessage =
        document.getElementById("loginMessage");


    loginMessage.textContent =
        "Logging in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        loginMessage.textContent =
            "❌ " + error.message;

        return;

    }


    // Hide login
    document.getElementById("loginBox").style.display =
        "none";


    // Show admin panel
    document.getElementById("panel").style.display =
        "block";


    loginMessage.textContent = "";


    // Load sermons
    await loadAdminSermons();


    // Load events
    await loadAdminEvents();

}



// =====================================================
// LOGOUT
// =====================================================

async function logout() {

    await supabaseClient.auth.signOut();

    location.reload();

}



// =====================================================
// SERMON MESSAGE
// =====================================================

const message =
    document.getElementById("message");



// =====================================================
// ADD NEW SERMON
// =====================================================

async function addSermon() {

    const topicEl =
        document.getElementById("topic");

    const speakerEl =
        document.getElementById("speaker");

    const dateEl =
        document.getElementById("date");

    const imageEl =
        document.getElementById("image");

    const audioEl =
        document.getElementById("audio");


    const topic =
        topicEl.value.trim();

    const speaker =
        speakerEl.value.trim();

    const date =
        dateEl.value;

    const image =
        imageEl.files[0];

    const audio =
        audioEl.files[0];


    if (
        !topic ||
        !speaker ||
        !date ||
        !image ||
        !audio
    ) {

        message.textContent =
            "Please fill every field.";

        return;

    }


    message.textContent =
        "Uploading...";


    // Create unique file names

    const timestamp =
        Date.now();


    const imageName =
        timestamp +
        "-" +
        image.name.replace(/\s+/g, "-");


    const audioName =
        timestamp +
        "-" +
        audio.name.replace(/\s+/g, "-");



    // =================================================
    // UPLOAD IMAGE
    // =================================================

    const imageUpload =
        await supabaseClient
        .storage
        .from("sermons")
        .upload(
            "images/" + imageName,
            image
        );


    if (imageUpload.error) {

        message.textContent =
            "❌ " +
            imageUpload.error.message;

        return;

    }



    // =================================================
    // UPLOAD AUDIO
    // =================================================

    const audioUpload =
        await supabaseClient
        .storage
        .from("sermons")
        .upload(
            "audio/" + audioName,
            audio
        );


    if (audioUpload.error) {

        message.textContent =
            "❌ " +
            audioUpload.error.message;

        return;

    }



    // =================================================
    // GET PUBLIC URLS
    // =================================================

    const imageUrl =
        supabaseClient
        .storage
        .from("sermons")
        .getPublicUrl(
            "images/" + imageName
        )
        .data
        .publicUrl;


    const audioUrl =
        supabaseClient
        .storage
        .from("sermons")
        .getPublicUrl(
            "audio/" + audioName
        )
        .data
        .publicUrl;



    // =================================================
    // SAVE SERMON TO DATABASE
    // =================================================

    const result =
        await supabaseClient
        .from("sermons")
        .insert({

            title: topic,

            speaker: speaker,

            date: date,

            image_url: imageUrl,

            audio_url: audioUrl

        });


    if (result.error) {

        message.textContent =
            "❌ " +
            result.error.message;

        return;

    }


    message.textContent =
        "✅ Sermon published successfully!";


    // Clear form

    topicEl.value = "";

    speakerEl.value = "";

    dateEl.value = "";

    imageEl.value = "";

    audioEl.value = "";


    // Reload sermon list

    await loadAdminSermons();

}



// =====================================================
// LOAD SERMONS
// =====================================================

async function loadAdminSermons() {

    const adminList =
        document.getElementById("adminList");


    if (!adminList) return;


    const result =
        await supabaseClient
        .from("sermons")
        .select("*")
        .order(
            "date",
            {
                ascending: false
            }
        );


    if (result.error) {

        console.error(
            result.error
        );

        adminList.innerHTML =
            "<p>Unable to load sermons.</p>";

        return;

    }


    if (
        !result.data ||
        result.data.length === 0
    ) {

        adminList.innerHTML =
            "<p>No sermons found.</p>";

        return;

    }


    adminList.innerHTML =
        result.data
        .map(function(s) {

            return `

                <div class="admin-sermon glass">

                    <img
                        src="${s.image_url}"
                        alt="${escapeHtml(s.title)}"
                    >

                    <div>

                        <h3>
                            ${escapeHtml(s.title)}
                        </h3>

                        <p>
                            ${escapeHtml(s.speaker)}
                            ·
                            ${s.date}
                        </p>

                    </div>

                    <button
                        type="button"
                        onclick="deleteSermon(${s.id})"
                    >
                        DELETE
                    </button>

                </div>

            `;

        })
        .join("");

}



// =====================================================
// DELETE SERMON
// =====================================================

async function deleteSermon(id) {

    const confirmed =
        confirm(
            "Delete this sermon?"
        );


    if (!confirmed) return;


    const result =
        await supabaseClient
        .from("sermons")
        .delete()
        .eq(
            "id",
            id
        );


    if (result.error) {

        alert(
            "Unable to delete sermon.\n\n" +
            result.error.message
        );

        return;

    }


    await loadAdminSermons();

}



// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(
        value || ""
    ).replace(
        /[&<>"']/g,
        function(character) {

            return {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            }[character];

        }
    );

}



// =====================================================
// UPCOMING EVENTS
// =====================================================

const eventForm =
    document.getElementById("eventForm");

const eventMessage =
    document.getElementById("eventMessage");

const eventId =
    document.getElementById("eventId");

const eventSubmitButton =
    document.getElementById(
        "eventSubmitButton"
    );

const eventCancelButton =
    document.getElementById(
        "eventCancelButton"
    );

const adminEventsList =
    document.getElementById(
        "adminEventsList"
    );



// =====================================================
// LOAD EVENTS
// =====================================================

async function loadAdminEvents() {

    if (!adminEventsList) return;


    const result =
        await supabaseClient
        .from("events")
        .select("*")
        .order(
            "event_date",
            {
                ascending: true
            }
        );


    if (result.error) {

        console.error(
            "Event loading error:",
            result.error
        );


        adminEventsList.innerHTML =
            "<p>Unable to load events.</p>";

        return;

    }


    const events =
        result.data;


    if (
        !events ||
        events.length === 0
    ) {

        adminEventsList.innerHTML =
            "<p>No upcoming events.</p>";

        return;

    }


    adminEventsList.innerHTML = "";


    events.forEach(
        function(event) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-event-card";


            card.innerHTML = `

                <h3>
                    ${escapeHtml(event.title)}
                </h3>

                <p>
                    📅
                    ${escapeHtml(event.event_date)}
                </p>

                <p>
                    🕐
                    ${escapeHtml(event.event_time || "")}
                </p>

                <p>
                    📍
                    ${escapeHtml(event.location || "")}
                </p>

                <p>
                    ${escapeHtml(event.description || "")}
                </p>

                ${
                    event.image_url
                    ?
                    `
                    <img
                        src="${event.image_url}"
                        alt="${escapeHtml(event.title)}"
                        style="max-width:250px;border-radius:12px;"
                    >
                    `
                    :
                    ""
                }

                <div class="event-actions">

                    <button
                        type="button"
                        onclick="editEvent(${event.id})"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        onclick="deleteEvent(${event.id})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            adminEventsList.appendChild(
                card
            );

        }
    );

}



// =====================================================
// ADD / UPDATE EVENT
// =====================================================

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        async function(e) {

            // VERY IMPORTANT
            // Prevent page reload
            e.preventDefault();

            e.stopPropagation();


            const id =
                eventId.value.trim();


            const title =
                document
                .getElementById(
                    "eventTitle"
                )
                .value
                .trim();


            const eventDate =
                document
                .getElementById(
                    "eventDate"
                )
                .value;


            const eventTime =
                document
                .getElementById(
                    "eventTime"
                )
                .value
                .trim();


            const location =
                document
                .getElementById(
                    "eventLocation"
                )
                .value
                .trim();


            const description =
                document
                .getElementById(
                    "eventDescription"
                )
                .value
                .trim();


            const imageUrl =
                document
                .getElementById(
                    "eventImage"
                )
                .value
                .trim();



            // Basic validation

            if (
                !title ||
                !eventDate
            ) {

                eventMessage.textContent =
                    "Please enter the event title and date.";

                return;

            }



            const eventData = {

                title: title,

                event_date: eventDate,

                event_time: eventTime,

                location: location,

                description: description,

                image_url: imageUrl

            };


            eventMessage.textContent =
                "Saving...";


            let result;



            // =================================================
            // UPDATE EXISTING EVENT
            // =================================================

            if (id) {

                result =
                    await supabaseClient
                    .from("events")
                    .update(
                        eventData
                    )
                    .eq(
                        "id",
                        id
                    );

            }



            // =================================================
            // CREATE NEW EVENT
            // =================================================

            else {

                result =
                    await supabaseClient
                    .from("events")
                    .insert([
                        eventData
                    ]);

            }



            // =================================================
            // ERROR
            // =================================================

            if (result.error) {

                console.error(
                    "Event save error:",
                    result.error
                );


                eventMessage.textContent =
                    "❌ " +
                    result.error.message;

                return;

            }



            // =================================================
            // SUCCESS
            // =================================================

            if (id) {

                eventMessage.textContent =
                    "✅ Event updated successfully!";

            } else {

                eventMessage.textContent =
                    "✅ Event added successfully!";

            }


            resetEventForm();


            await loadAdminEvents();

        }
    );

}



// =====================================================
// EDIT EVENT
// =====================================================

async function editEvent(id) {

    const result =
        await supabaseClient
        .from("events")
        .select("*")
        .eq(
            "id",
            id
        )
        .single();


    if (result.error) {

        alert(
            "Unable to load event.\n\n" +
            result.error.message
        );

        console.error(
            result.error
        );

        return;

    }


    const event =
        result.data;


    eventId.value =
        event.id;


    document.getElementById(
        "eventTitle"
    ).value =
        event.title || "";


    document.getElementById(
        "eventDate"
    ).value =
        event.event_date || "";


    document.getElementById(
        "eventTime"
    ).value =
        event.event_time || "";


    document.getElementById(
        "eventLocation"
    ).value =
        event.location || "";


    document.getElementById(
        "eventDescription"
    ).value =
        event.description || "";


    document.getElementById(
        "eventImage"
    ).value =
        event.image_url || "";


    eventSubmitButton.textContent =
        "💾 Update Event";


    eventCancelButton.style.display =
        "inline-block";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}



// =====================================================
// DELETE EVENT
// =====================================================

async function deleteEvent(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this event?"
        );


    if (!confirmed) return;


    const result =
        await supabaseClient
        .from("events")
        .delete()
        .eq(
            "id",
            id
        );


    if (result.error) {

        alert(
            "Unable to delete event.\n\n" +
            result.error.message
        );

        console.error(
            result.error
        );

        return;

    }


    alert(
        "Event deleted successfully!"
    );


    await loadAdminEvents();

}



// =====================================================
// CANCEL EVENT EDIT
// =====================================================

if (eventCancelButton) {

    eventCancelButton.addEventListener(
        "click",
        function(e) {

            e.preventDefault();

            resetEventForm();

        }
    );

}



// =====================================================
// RESET EVENT FORM
// =====================================================

function resetEventForm() {

    if (!eventForm) return;


    eventForm.reset();


    eventId.value =
        "";


    eventSubmitButton.textContent =
        "📅 Add Event";


    eventCancelButton.style.display =
        "none";


    eventMessage.textContent =
        "";

}