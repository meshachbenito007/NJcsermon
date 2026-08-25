async function login(){let {error}=await supabaseClient.auth.signInWithPassword({email:email.value,password:password.value});if(error){loginMessage.textContent=error.message;return}showPanel()}
async function showPanel(){let {data}=await supabaseClient.auth.getSession();if(!data.session)return;loginBox.style.display="none";panel.style.display="block";loadAdminSermons()}
async function logout(){await supabaseClient.auth.signOut();location.reload()}
async function addSermon(){let topicEl=document.getElementById("topic"),speakerEl=document.getElementById("speaker"),dateEl=document.getElementById("date"),imageEl=document.getElementById("image"),audioEl=document.getElementById("audio");let topic=topicEl.value.trim(),sp=speakerEl.value.trim(),date=dateEl.value,image=imageEl.files[0],audio=audioEl.files[0];if(!topic||!sp||!date||!image||!audio){message.textContent="Please fill every field.";return}message.textContent="Uploading...";let imageName=Date.now()+"-"+image.name.replace(/\s+/g,"-"),audioName=Date.now()+"-"+audio.name.replace(/\s+/g,"-");let a=await supabaseClient.storage.from("sermons").upload("images/"+imageName,image);if(a.error){message.textContent=a.error.message;return}let b=await supabaseClient.storage.from("sermons").upload("audio/"+audioName,audio);if(b.error){message.textContent=b.error.message;return}let imageUrl=supabaseClient.storage.from("sermons").getPublicUrl("images/"+imageName).data.publicUrl;let audioUrl=supabaseClient.storage.from("sermons").getPublicUrl("audio/"+audioName).data.publicUrl;let r=await supabaseClient.from("sermons").insert({title:topic,speaker:sp,date:date,image_url:imageUrl,audio_url:audioUrl});if(r.error){message.textContent=r.error.message;return}message.textContent="Sermon published successfully!";topicEl.value="";speakerEl.value="";dateEl.value="";imageEl.value="";audioEl.value="";loadAdminSermons()}
async function loadAdminSermons(){let r=await supabaseClient.from("sermons").select("*").order("date",{ascending:false});if(r.error)return;adminList.innerHTML=r.data.map(s=>`<div class="admin-sermon glass"><img src="${s.image_url}"><div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.speaker)} · ${s.date}</p></div><button onclick="deleteSermon(${s.id})">DELETE</button></div>`).join("")}
async function deleteSermon(id){if(!confirm("Delete this sermon?"))return;await supabaseClient.from("sermons").delete().eq("id",id);loadAdminSermons()}
function escapeHtml(x){return String(x||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}showPanel();
// ===============================
// UPCOMING EVENTS
// ===============================

const eventForm = document.getElementById("eventForm");

if (eventForm) {

    eventForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const title = document.getElementById("eventTitle").value.trim();
        const eventDate = document.getElementById("eventDate").value;
        const eventTime = document.getElementById("eventTime").value.trim();
        const location = document.getElementById("eventLocation").value.trim();
        const description = document.getElementById("eventDescription").value.trim();
        const imageUrl = document.getElementById("eventImage").value.trim();

        const eventMessage = document.getElementById("eventMessage");

        eventMessage.textContent = "Adding event...";

        const {
            data,
            error
        } = await supabaseClient
            .from("events")
            .insert([
                {
                    title: title,
                    event_date: eventDate,
                    event_time: eventTime,
                    location: location,
                    description: description,
                    image_url: imageUrl
                }
            ]);

        if (error) {

            console.error(error);

            eventMessage.textContent =
                "❌ Error: " + error.message;

            return;
        }

        eventMessage.textContent =
            "✅ Event added successfully!";

        eventForm.reset();

    });

}