const workspace = document.getElementById("workspace");
const form = document.getElementById("form");
const linkDiv = document.getElementById("form-link-div");
const formLinks =[];
const linksDisplay = document.getElementById("links-display");
const topics = new Set();
topics.add("")
const topicSelect = document.querySelector("#topic-select");

// Creates an element with a class and textContent
function simpleElement(type,className,text="") {
    const element = document.createElement(type);
    element.className = className;
    element.textContent = text;
    return element;
}
// Creates a class responsible for managing the creation of cards
class NoteCard {
    // Makes an object for the card
    constructor(id,topic,summary,content,links){
        this.topic = topic;

        this.div = document.createElement("div");
        this.div.className = ("note-card");
        if(this.topic !== "") this.div.classList.add(topic);
        this.div.id = id; 

        this.h2 = simpleElement("h2","note-summary",summary);
        this.p = simpleElement("p","note-content",content);
        this.section = simpleElement("section","note-links-list");
        this.buttonDelete = simpleElement("button","delete-card","X");
        this.buttonEdit = simpleElement("button","edit-card","Edit");

        this.aList = links.map(link => {
            const a = simpleElement("a","note-link",link[0]);
            a.href = link[1];
            return a;
        })
    }
    // Adds the object to the location provided, calls to addTopic
    displayCard(location){
        this.aList.forEach(link => {
            this.section.append(link);
            this.section.append(document.createElement("br"));
        });
        this.div.append(this.h2,this.p,this.section,this.buttonDelete, this.buttonEdit);
        location.append(this.div);
        addTopic(this.topic);
    }
}
// Adds a topic to the select dropdown
function addTopic(topic) {
    if (!topics.has(topic)) {
        topics.add(topic)
        const option = document.createElement("option");
        option.value = topic;
        option.textContent = topic;
        topicSelect.append(option);
    }
}
// Sends a request to the json file and adds the new card
form.addEventListener("submit",event =>{
    event.preventDefault();
    console.log("Links:");
    console.log(formLinks);
    fetch("http://localhost:3000/cards",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            topic: form.querySelector("#form-topic").value,
            summary: form.querySelector("#form-summary").value,
            content: form.querySelector("#form-content").value,
            links: formLinks
        })
    })
    .then(response => response.json())
    .then(card => {
        console.log(card);
        console.log(card.links);
        const newCard = new NoteCard(card.id,card.topic,card.summary,card.content,card.links);
        newCard.displayCard(workspace);

        formLinks.length = 0;
        while (linksDisplay.firstChild) {
            linksDisplay.removeChild(linksDisplay.firstChild);
        }
            form.querySelector("#form-topic").value="";
            form.querySelector("#form-summary").value="";
            form.querySelector("#form-content").value="";
        })
    .catch(error => console.log(error))
})
// Adds a link to the list
linkDiv.addEventListener("submit",event =>{
    event.preventDefault();
    const linkText = linkDiv.querySelector("#link-text");
    const linkUrl = linkDiv.querySelector("#link-url")
    formLinks.push([[linkText.value],[linkUrl.value]])

    if(formLinks.length>0) linkDiv.querySelector(".delete").disabled = false;

    // If the link is longer than maxLength characters, it gets shortened
    const maxLength = 30;
    let shortUrl = linkUrl.value;
    if (shortUrl.length>maxLength) shortUrl = shortUrl.slice(0,maxLength-3)+"...";

    const li = document.createElement("li");
    const p0 = simpleElement("p","",linkText.value)
    const p1 = simpleElement("p","",shortUrl)
    li.append(p0,p1);
    linksDisplay.append(li);

    linkText.value = "";
    linkUrl.value = "";
})
// Removes a link from the list
linkDiv.addEventListener("click",event=>{
    if(event.target.className === "delete"){
        formLinks.pop();
        if(formLinks.length===0) linkDiv.querySelector(".delete").disabled = true;
        linksDisplay.lastChild.remove();
    }
})
// Highlights a segment of text
document.addEventListener("keypress", event => {
    if(event.target.className !== "restrict-key" && event.key === "h"){
        const selection = document.getSelection();
        // If you have only one element in your selection
        if(selection.anchorNode === selection.focusNode){
            // Puts your selection in a span with class highlight
            const range = selection.getRangeAt(0);
            const span = simpleElement("span","highlight")
            range.surroundContents(span);
        }
    }
})
// Removes all highlights from the text, and manages both buttons
workspace.addEventListener("click",event =>{
    // First if is for clicking on highlighted text to remove it
    if(event.target.className==="highlight"){
        const textBox = event.target.parentNode;
        const text  = document.createTextNode(event.target.textContent);
        event.target.replaceWith(text);
        textBox.normalize();
    }
    // Second if is for the delete buttons on the cards
    else if(event.target.className === "delete-card"){
        console.log(event.target.parentNode.id);
        fetch(`http://localhost:3000/cards/${event.target.parentNode.id}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .catch(error => console.log(error))
        event.target.parentNode.remove();
    }
    // Third if is for the edit buttons on the cards
    else if(event.target.className === "edit-card"){
        const p = event.target.parentNode.querySelector(".note-content");
        const textArea = simpleElement("textArea","restrict-key",p.textContent);
        textArea.cols = "31";
        textArea.style.height = `${Math.ceil(p.clientHeight*1.1)}px`;
        p.replaceWith(textArea);
        event.target.textContent = "Submit edits"
        event.target.className = "edit-submit"
    }
    // Fourth is the sumbit edits button (only after you edit)
    else if(event.target.className === "edit-submit"){
        const textArea = event.target.parentNode.querySelector(".restrict-key");
        fetch(`http://localhost:3000/cards/${event.target.parentNode.id}`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                content: textArea.value
            })
        })
        .then(resp => resp.json())
        .then(card => {
            const p = simpleElement("p","note-content",card.content);
            textArea.replaceWith(p);
            event.target.textContent = "edit"
            event.target.className = "edit-card"
        })
    }
})
// Filters cards by topic
topicSelect.addEventListener("change", event=> {
    const filter = event.target.value;
    Array.from(workspace.querySelectorAll(".note-card")).forEach(element => {
        if(Array.from(element.classList).includes(filter) || filter === ""){
            element.hidden = false;
        } else{
            element.hidden = true;
        }
    });
})

// Gets cards on page load
fetch("http://localhost:3000/cards")
.then(response => response.json())
.then(cards => {
    cards.forEach(card => {
        const newCard = new NoteCard(card.id,card.topic,card.summary,card.content,card.links);
        newCard.displayCard(workspace);
    });
})
.catch(error => console.log(error))