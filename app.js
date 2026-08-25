let sermons=[],filtered=[],visible=4;
// ===============================
// LOAD UPCOMING EVENTS
// ===============================

async function loadEvents() {

    const eventsContainer =
        document.getElementById("eventsContainer");

    if (!eventsContainer) return;

    const today =
        new Date().toISOString().split("T")[0];

    const {
        data: events,
        error
    } = await supabaseClient
        .from("events")
        .select("*")
        .gte("event_date", today)
        .order("event_date", {
            ascending: true
        });

    if (error) {

        console.error("Events error:", error);

        eventsContainer.innerHTML =
            "<p>Unable to load events.</p>";

        return;
    }

    if (!events || events.length === 0) {

        eventsContainer.innerHTML =
            "<p>No upcoming events.</p>";

        return;
    }

    eventsContainer.innerHTML = "";

    events.forEach(function(event) {

        const card =
            document.createElement("div");

        card.className = "event-card";

        card.innerHTML = `

            ${
                event.image_url
                ? `<img
                    src="${event.image_url}"
                    alt="${event.title}"
                    class="event-image"
                >`
                : ""
            }

            <div class="event-content">

                <p class="event-date">
                    📅 ${formatEventDate(event.event_date)}
                </p>

                ${
                    event.event_time
                    ? `<p class="event-time">
                        🕐 ${event.event_time}
                    </p>`
                    : ""
                }

                <h3>
                    ${event.title}
                </h3>

                ${
                    event.location
                    ? `<p class="event-location">
                        📍 ${event.location}
                    </p>`
                    : ""
                }

                ${
                    event.description
                    ? `<p class="event-description">
                        ${event.description}
                    </p>`
                    : ""
                }

            </div>
        `;

        eventsContainer.appendChild(card);

    });

}


// Format event date

function formatEventDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// Load events

loadEvents();
async function loadSermons(){let r=await supabaseClient.from("sermons").select("*").order("date",{ascending:false});if(r.error){document.getElementById("sermonList").innerHTML="<p>Check your Supabase setup.</p>";return}sermons=r.data||[];fillFilters();filterSermons()}
function fillFilters(){let years=[...new Set(sermons.map(s=>new Date(s.date).getFullYear()))].sort((a,b)=>b-a);let speakers=[...new Set(sermons.map(s=>s.speaker))].sort();year.innerHTML='<option value="all">All years</option>'+years.map(x=>`<option>${x}</option>`).join("");speaker.innerHTML='<option value="all">All speakers</option>'+speakers.map(x=>`<option>${escapeHtml(x)}</option>`).join("")}
function filterSermons(){let q=search.value.toLowerCase(),y=year.value,sp=speaker.value;filtered=sermons.filter(s=>`${s.title} ${s.speaker}`.toLowerCase().includes(q)&&(y=="all"||new Date(s.date).getFullYear().toString()==y)&&(sp=="all"||s.speaker==sp));visible=4;displaySermons()}
function displaySermons(){let shown=filtered.slice(0,visible);count.textContent=`Showing ${shown.length} of ${filtered.length} sermons`;sermonList.innerHTML=shown.map(s=>`<div class="sermon-card glass"><img src="${s.image_url}"><div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.speaker)} · ${s.date}</p><audio controls><source src="${s.audio_url}" type="audio/mpeg"></audio></div></div>`).join("");more.style.display=visible<filtered.length?"block":"none"}
function showMore(){visible+=4;displaySermons()}function resetFilters(){search.value="";year.value="all";speaker.value="all";filterSermons()}function escapeHtml(x){return String(x||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
search.addEventListener("input", filterSermons);
year.addEventListener("change", filterSermons);
speaker.addEventListener("change", filterSermons);

// Play only one sermon at a time
document.addEventListener(
    "play",
    function(e) {

        if (
            e.target.tagName ===
            "AUDIO"
        ) {

            document
            .querySelectorAll(
                "audio"
            )
            .forEach(
                function(audio) {

                    if (
                        audio !==
                        e.target
                    ) {

                        audio.pause();

                    }

                }
            );

        }

    },
    true
);
loadSermons();


