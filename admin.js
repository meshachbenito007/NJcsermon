async function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const loginMessage =
        document.getElementById("loginMessage");

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

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("panel").style.display = "block";

    loginMessage.textContent = "";

    loadAdminSermons();

    if (typeof loadAdminEvents === "function") {
        loadAdminEvents();
    }
}
checkSession();
async function addSermon(){let topicEl=document.getElementById("topic"),speakerEl=document.getElementById("speaker"),dateEl=document.getElementById("date"),imageEl=document.getElementById("image"),audioEl=document.getElementById("audio");let topic=topicEl.value.trim(),sp=speakerEl.value.trim(),date=dateEl.value,image=imageEl.files[0],audio=audioEl.files[0];if(!topic||!sp||!date||!image||!audio){message.textContent="Please fill every field.";return}message.textContent="Uploading...";let imageName=Date.now()+"-"+image.name.replace(/\s+/g,"-"),audioName=Date.now()+"-"+audio.name.replace(/\s+/g,"-");let a=await supabaseClient.storage.from("sermons").upload("images/"+imageName,image);if(a.error){message.textContent=a.error.message;return}let b=await supabaseClient.storage.from("sermons").upload("audio/"+audioName,audio);if(b.error){message.textContent=b.error.message;return}let imageUrl=supabaseClient.storage.from("sermons").getPublicUrl("images/"+imageName).data.publicUrl;let audioUrl=supabaseClient.storage.from("sermons").getPublicUrl("audio/"+audioName).data.publicUrl;let r=await supabaseClient.from("sermons").insert({title:topic,speaker:sp,date:date,image_url:imageUrl,audio_url:audioUrl});if(r.error){message.textContent=r.error.message;return}message.textContent="Sermon published successfully!";topicEl.value="";speakerEl.value="";dateEl.value="";imageEl.value="";audioEl.value="";loadAdminSermons()}
async function loadAdminSermons(){let r=await supabaseClient.from("sermons").select("*").order("date",{ascending:false});if(r.error)return;adminList.innerHTML=r.data.map(s=>`<div class="admin-sermon glass"><img src="${s.image_url}"><div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.speaker)} · ${s.date}</p></div><button onclick="deleteSermon(${s.id})">DELETE</button></div>`).join("")}
async function deleteSermon(id){if(!confirm("Delete this sermon?"))return;await supabaseClient.from("sermons").delete().eq("id",id);loadAdminSermons()}
function escapeHtml(x){return String(x||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}showPanel();
// =========================================
// UPCOMING EVENTS - ADMIN
// =========================================

const eventForm =
    document.getElementById("eventForm");

const eventMessage =
    document.getElementById("eventMessage");

const eventId =
    document.getElementById("eventId");

const eventSubmitButton =
    document.getElementById("eventSubmitButton");

const eventCancelButton =
    document.getElementById("eventCancelButton");

const adminEventsList =
    document.getElementById("adminEventsList");


// =========================================
// LOAD EVENTS FOR ADMIN
// =========================================

async function loadAdminEvents() {

    if (!adminEventsList) return;

    const {
        data: events,
        error
    } =
        await supabaseClient
        .from("events")
        .select("*")
        .order(
            "event_date",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(error);

        adminEventsList.innerHTML =
            "<p>Unable to load events.</p>";

        return;
    }


    if (!events || events.length === 0) {

        adminEventsList.innerHTML =
            "<p>No events found.</p>";

        return;
    }


    adminEventsList.innerHTML = "";


    events.forEach(function(event) {

        const card =
            document.createElement("div");

        card.className =
            "admin-event-card";


        card.innerHTML = `

            <h3>
                ${event.title}
            </h3>

            <p>
                📅 ${event.event_date}
            </p>

            <p>
                🕐 ${event.event_time || ""}
            </p>

            <p>
                📍 ${event.location || ""}
            </p>

            <div>

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


        adminEventsList.appendChild(card);

    });

}


// =========================================
// ADD OR UPDATE EVENT
// =========================================

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();


            const id =
                eventId.value;


            const eventData = {

                title:
                    document
                    .getElementById("eventTitle")
                    .value
                    .trim(),

                event_date:
                    document
                    .getElementById("eventDate")
                    .value,

                event_time:
                    document
                    .getElementById("eventTime")
                    .value
                    .trim(),

                location:
                    document
                    .getElementById("eventLocation")
                    .value
                    .trim(),

                description:
                    document
                    .getElementById("eventDescription")
                    .value
                    .trim(),

                image_url:
                    document
                    .getElementById("eventImage")
                    .value
                    .trim()

            };


            eventMessage.textContent =
                "Saving...";


            let result;


            // =================================
            // UPDATE EXISTING EVENT
            // =================================

            if (id) {

                result =
                    await supabaseClient
                    .from("events")
                    .update(eventData)
                    .eq("id", id);


            }

            // =================================
            // CREATE NEW EVENT
            // =================================

            else {

                result =
                    await supabaseClient
                    .from("events")
                    .insert([
                        eventData
                    ]);

            }


            if (result.error) {

                console.error(
                    result.error
                );

                eventMessage.textContent =
                    "❌ " +
                    result.error.message;

                return;

            }


            if (id) {

                eventMessage.textContent =
                    "✅ Event updated successfully!";

            } else {

                eventMessage.textContent =
                    "✅ Event added successfully!";

            }


            resetEventForm();

            loadAdminEvents();

        }
    );

}


// =========================================
// EDIT EVENT
// =========================================

async function editEvent(id) {

    const {
        data: event,
        error
    } =
        await supabaseClient
        .from("events")
        .select("*")
        .eq("id", id)
        .single();


    if (error) {

        alert(
            "Unable to load event."
        );

        console.error(error);

        return;

    }


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


// =========================================
// DELETE EVENT
// =========================================

async function deleteEvent(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this event?"
        );


    if (!confirmed) return;


    const {
        error
    } =
        await supabaseClient
        .from("events")
        .delete()
        .eq("id", id);


    if (error) {

        alert(
            "Unable to delete event."
        );

        console.error(error);

        return;

    }


    alert(
        "Event deleted successfully!"
    );


    loadAdminEvents();

}


// =========================================
// CANCEL EDIT
// =========================================

if (eventCancelButton) {

    eventCancelButton.addEventListener(
        "click",
        function() {

            resetEventForm();

        }
    );

}


// =========================================
// RESET FORM
// =========================================

function resetEventForm() {

    eventForm.reset();

    eventId.value = "";

    eventSubmitButton.textContent =
        "📅 Add Event";

    eventCancelButton.style.display =
        "none";

    eventMessage.textContent = "";

}


// =========================================
// START
// =========================================

if (adminEventsList) {

    loadAdminEvents();

}
